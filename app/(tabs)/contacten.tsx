import { COLORS, getTheme } from '@/constants/colors';
import THEME from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  favorite: boolean;
}

export default function ContactsScreen() {
  const navigation = useNavigation<any>();
  const [theme] = useState(getTheme());
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const saved = await AsyncStorage.getItem('contacts');
    if (saved) setContacts(JSON.parse(saved));
  };

  const saveContacts = async (newContacts: Contact[]) => {
    await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
    setContacts(newContacts);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelation('');
    setFavorite(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Oeps', 'Naam en telefoonnummer zijn verplicht');
      return;
    }

    // Lees altijd fresh van AsyncStorage
    const saved = await AsyncStorage.getItem('contacts');
    const current: Contact[] = saved ? JSON.parse(saved) : [];

    let updated: Contact[];
    if (editingId) {
      updated = current.map((c) =>
        c.id === editingId ? { ...c, name, phone, relation, favorite } : c
      );
    } else {
      updated = [...current, { id: Date.now().toString(), name, phone, relation, favorite }];
    }

    await saveContacts(updated);
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (contact: Contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setRelation(contact.relation);
    setFavorite(contact.favorite);
    setEditingId(contact.id);
    setShowForm(true);
  };

  const confirmDelete = (idToDelete: string) => {
    doDelete(idToDelete);
    return;
  };

  const doDelete = async (idToDelete: string) => {
    // Lees fresh van AsyncStorage — geen afhankelijkheid van state/closure
    const saved = await AsyncStorage.getItem('contacts');
    const current: Contact[] = saved ? JSON.parse(saved) : [];
    const updated = current.filter((c) => c.id !== idToDelete);
    await AsyncStorage.setItem('contacts', JSON.stringify(updated));
    setContacts(updated);
    resetForm();
    setShowForm(false);
  };

  const favorites = contacts.filter((c) => c.favorite);
  const others = contacts.filter((c) => !c.favorite);

  // ── Form screen ──────────────────────────────────────────────────────────────
  if (showForm) {
    // Capture editingId in a local const so it can't become null mid-render
    const currentEditingId = editingId;

    return (
      <SafeAreaView style={styles.container}>
        {/* Top icons */}
        <View style={styles.formTopBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => (navigation as any).navigate('Profiel')}
          >
            <View style={styles.iconCircle}>
              <Image source={require('../../assets/icons/Profiel.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => (navigation as any).navigate('Instellingen')}
          >
            <View style={styles.iconCircle}>
              <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Header title */}
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={() => { resetForm(); setShowForm(false); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={COLORS.foreground} />
            <Text style={styles.formTitle}>
              {currentEditingId ? 'Contact bewerken' : 'Nieuw contact'}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        {/* Form velden */}
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
            <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Naam *</Text>
            <TextInput
              style={styles.input}
              placeholder="Naam van contact"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefoon</Text>
            <TextInput
              style={styles.input}
              placeholder="Telefoonnummer"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Relatie</Text>
            <TextInput
              style={styles.input}
              placeholder="Bijv. Familie, Vriend, Begeleider…"
              value={relation}
              onChangeText={setRelation}
            />
          </View>

          <View style={styles.favoriteRow}>
            <View style={styles.favoriteLeft}>
              <Ionicons
                name={favorite ? 'star' : 'star-outline'}
                size={20}
                color={favorite ? '#FFD700' : COLORS.mutedForeground}
              />
              <Text style={styles.inputLabel}>Favoriet contact</Text>
            </View>
            <Switch value={favorite} onValueChange={setFavorite} />
          </View>

        </ScrollView>

        {/* Knoppen BUITEN ScrollView — altijd zichtbaar en klikbaar */}
        <View style={styles.formFooter}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.modalPrimaryButton, { backgroundColor: theme.color, flex: 1 }]}
              onPress={handleSave}
            >
              <Text style={styles.modalPrimaryText}>Opslaan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalSecondaryButton, { flex: 1 }]}
              onPress={() => { resetForm(); setShowForm(false); }}
            >
              <Text style={styles.modalSecondaryText}>Annuleren</Text>
            </TouchableOpacity>
          </View>

          {currentEditingId !== null && (
            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.7}
              onPress={() => confirmDelete(currentEditingId)}
            >
              <Text style={styles.deleteButtonText}>Verwijderen</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── Contacts list screen ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('Profiel')}
        >
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Profiel.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('Instellingen')}
        >
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.pageContent}>
        <Text style={styles.pageTitle}>Mijn Contacten</Text>

        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nog geen contacten toegevoegd</Text>
              <Text style={styles.emptySubtitle}>Klik hieronder om te beginnen</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.color }]}
              onPress={() => { resetForm(); setShowForm(true); }}
            >
              <Text style={styles.primaryButtonText}>+ Nieuw contact</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent}>
            {favorites.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Favorieten</Text>
                </View>

                {favorites.map((item) => (
                  <View key={item.id} style={styles.contactCard}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.avatarAndInfo}>
                        <View style={[styles.avatarCircle, { backgroundColor: theme.color }]}>
                          <Ionicons name="person" size={22} color="#fff" />
                        </View>
                        <View>
                          <Text style={styles.contactName}>{item.name}</Text>
                          {!!item.relation && (
                            <Text style={styles.contactRelation}>{item.relation}</Text>
                          )}
                          <Text style={styles.contactPhone}>{item.phone}</Text>
                          <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Text style={[styles.editLink, { color: theme.color }]}>Bewerken</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity>
                        <Ionicons name="call" size={32} color={theme.color} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {others.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alle contacten</Text>

                {others.map((item) => (
                  <View key={item.id} style={styles.contactCard}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.avatarAndInfo}>
                        <View style={[styles.avatarCircle, { backgroundColor: theme.color }]}>
                          <Ionicons name="person" size={22} color="#fff" />
                        </View>
                        <View>
                          <Text style={styles.contactName}>{item.name}</Text>
                          {!!item.relation && (
                            <Text style={styles.contactRelation}>{item.relation}</Text>
                          )}
                          <Text style={styles.contactPhone}>{item.phone}</Text>
                          <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Text style={[styles.editLink, { color: theme.color }]}>Bewerken</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity>
                        <Ionicons name="call" size={32} color={theme.color} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.color }]}
              onPress={() => { resetForm(); setShowForm(true); }}
            >
              <Text style={styles.primaryButtonText}>+ Nieuw contact</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  container: { flex: 1, backgroundColor: COLORS.white },
  formTopBar: {
    position: 'absolute',
  top: THEME.spacing.l,
  left: THEME.spacing.l,
  right: THEME.spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  pageContent: {
    paddingTop: 120,
    flex: 1,
  },
  iconButton: { padding: 4 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.foreground,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Changed to a different value for demonstration
    borderColor: COLORS.border,
    paddingVertical: 40,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.foreground,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  primaryButton: {
    width: '85%',
    paddingVertical: 14,
    borderRadius: 20,
    alignSelf: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 10,
  },
  contactCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarAndInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  contactRelation: {
    fontSize: 14,
    color: COLORS.mutedForeground,
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.foreground,
    marginTop: 2,
  },
  editLink: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  // ── Form ────────────────────────────────────────────────────────────────────
  formHeader: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 18,
  },
  formFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputGroup: { gap: 6 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.foreground,
  },
  favoriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalPrimaryButton: {
    paddingVertical: 14,
    borderRadius: 20,
  },
  modalPrimaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  modalSecondaryButton: {
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSecondaryText: {
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.mutedForeground,
    fontSize: 16,
  },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: COLORS.destructive,
  },
  deleteButtonText: {
    textAlign: 'center',
    fontWeight: '700',
    color: COLORS.white,
    fontSize: 16,
  },
});