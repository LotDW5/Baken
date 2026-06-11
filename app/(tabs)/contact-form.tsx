import { COLORS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import applyShadow from '@/utils/shadow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image, Platform, SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STORAGE_KEY = 'contacts';

export default function ContactForm() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const params = (route.params as any) || {};
    const contact = params.contact || null;
    if (contact) {
      setEditingId(contact.id || null);
      setName(contact.name || '');
      setPhone(contact.phone || '');
      setRelation(contact.relation || '');
      setFavorite(!!contact.favorite);
    }
  }, [route.params]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelation('');
    setFavorite(false);
    setEditingId(null);
  };

  const save = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Oeps', 'Naam en telefoonnummer zijn verplicht');
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      if (editingId) {
        const next = current.map((c: any) => (c.id === editingId ? { ...c, name, phone, relation, favorite } : c));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        const next = [...current, { id: Date.now().toString(), name, phone, relation, favorite }];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      navigation.navigate('Main', { screen: 'Contacten' } as any);
    } catch (err) {
      console.error(err);
      Alert.alert('Fout', 'Kon contact niet opslaan');
    }
  };

  const remove = async () => {
    if (!editingId) return;
    if (Platform.OS === 'web') {
      const ok = window.confirm('Weet je zeker dat je dit contact wilt verwijderen?');
      if (!ok) return;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const current = raw ? JSON.parse(raw) : [];
        const next = current.filter((c: any) => c.id !== editingId);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        navigation.navigate('Main', { screen: 'Contacten' } as any);
      } catch (err) {
        console.error(err);
        Alert.alert('Fout', 'Kon contact niet verwijderen');
      }
      return;
    }

    Alert.alert('Verwijderen', 'Weet je zeker dat je dit contact wilt verwijderen?', [
      { text: 'Annuleer', style: 'cancel' },
      {
        text: 'Verwijder',
        style: 'destructive',
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            const current = raw ? JSON.parse(raw) : [];
            const next = current.filter((c: any) => c.id !== editingId);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            navigation.navigate('Main', { screen: 'Contacten' } as any);
          } catch (err) {
            console.error(err);
            Alert.alert('Fout', 'Kon contact niet verwijderen');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formTopBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profiel')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/personage/langhaarbruin.png')} style={styles.iconImage} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('Contacten')} style={styles.backButton}>
          <Image source={require('../../assets/icons/Terug.png')} style={[styles.backIcon, { tintColor: COLORS.foreground }]} />
          <Text style={styles.formTitle}>{editingId ? 'Contact bewerken' : 'Nieuw contact'}</Text>
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Naam</Text>
          <View style={[styles.inputWrapper, focusedField === 'name' ? { borderColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.08, shadowRadius: 8 } : null]}>
            <TextInput
              style={styles.input}
              placeholder="Naam van contact"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#AFAFC8"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Telefoon</Text>
          <View style={[styles.inputWrapper, focusedField === 'phone' ? { borderColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.08, shadowRadius: 8 } : null]}>
            <TextInput
              style={styles.input}
              placeholder="Telefoonnummer"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#AFAFC8"
              keyboardType="phone-pad"
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Relatie</Text>
          <View style={[styles.inputWrapper, focusedField === 'relation' ? { borderColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.08, shadowRadius: 8 } : null]}>
            <TextInput
              style={styles.input}
              placeholder="Bijv. Familie, Vriend, Begeleider…"
              value={relation}
              onChangeText={setRelation}
              placeholderTextColor="#AFAFC8"
              onFocus={() => setFocusedField('relation')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.favoriteRow}>
          <View style={styles.favoriteLeft}>
            <Image source={ favorite ? require('../../assets/icons/Gevulde ster.png') : require('../../assets/icons/Ster.png') } style={[styles.starFormIcon, { tintColor: favorite ? '#FFB84D' : COLORS.mutedForeground }]} />
            <Text style={styles.favoriteLabel}>Favoriet contact</Text>
          </View>

          <TouchableOpacity onPress={() => setFavorite(!favorite)} activeOpacity={0.9} style={[styles.webSwitch, favorite && { backgroundColor: theme.color }]}>
            <View style={[styles.webSwitchThumb, favorite && { transform: [{ translateX: 26 }] }]} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={[styles.formFooter, { position: 'absolute', left: 0, right: 0, bottom: insets.bottom + THEME.sizes.tabBarHeight - 31 }]}> 
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.modalPrimaryButton, { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, flex: 1 }]} onPress={save}>
            <Text style={styles.modalPrimaryText}>Opslaan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modalSecondaryButton, { flex: 1, marginLeft: 12 }]} onPress={() => navigation.navigate('Main', { screen: 'Contacten' } as any)}>
            <Text style={styles.modalSecondaryText}>Annuleren</Text>
          </TouchableOpacity>
        </View>

        {editingId !== null && (
          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7} onPress={remove}>
            <Text style={styles.deleteButtonText}>Verwijderen</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Render a static bottom nav so it remains visible but no tab is highlighted */}
      <View style={[styles.bottomWrapper, applyShadow({ opacity: 0.12, radius: 14, offsetX: 0, offsetY: -6, elevation: 12 })]} pointerEvents="box-none">
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main', { screen: 'Check-in' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('@/assets/icons/Check-in.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main', { screen: 'Contacten' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('@/assets/icons/Contacten.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Contacten</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main', { screen: 'Agenda' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('@/assets/icons/Agenda.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main', { screen: 'Statistieken' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('@/assets/icons/Statistieken.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Statistieken</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  container: { flex: 1, backgroundColor: COLORS.white },
  formTopBar: {
    position: 'absolute',
    top: 56,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  iconButton: { padding: 4 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  iconImage: { width: 20, height: 20, resizeMode: 'contain' },
  formHeader: {
    marginTop: 144,
    marginBottom: 24,
    paddingHorizontal: 24,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'flex-start' },
  backIcon: { width: 20, height: 20, resizeMode: 'contain', marginTop: 2, marginRight: 0 },
  formTitle: { fontSize: 22, fontWeight: '700', color: COLORS.foreground },
  formContent: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 16, gap: 18 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.foreground },
  input: { backgroundColor: 'transparent', borderRadius: 20, borderWidth: 0, paddingHorizontal: 0, paddingVertical: 8, outlineWidth: 0, outlineColor: 'transparent', boxShadow: 'none', fontSize: 16, color: COLORS.foreground },
  inputWrapper: { backgroundColor: COLORS.inputBackground, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(107,92,231,0.06)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  inputWrapperFocused: { borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  rowInline: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  favoriteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  favoriteLeft: { flexDirection: 'row', alignItems: 'center' },
  favoriteLabel: { fontSize: 16, fontWeight: '600', color: COLORS.foreground },
  webSwitch: { width: 56, height: 28, borderRadius: 20, backgroundColor: '#E6E6E9', justifyContent: 'center', padding: 4 },
  webSwitchThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  formFooter: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: 'transparent' },
  buttonRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  modalPrimaryButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: COLORS.card },
  modalPrimaryButtonFixed: { width: 160 },
  modalPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  modalSecondaryButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 0.5, borderColor: '#E0E0E0' },
  modalSecondaryText: { textAlign: 'center', fontWeight: '600', color: '#2D2D3A', fontSize: 16 },
  deleteButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: '#FFE8ED', width: '100%', marginTop: 12 },
  deleteButtonText: { textAlign: 'center', fontWeight: '700', color: '#E85D75', fontSize: 16 },
  starFormIcon: { width: 20, height: 20, resizeMode: 'contain', marginRight: 8 },
  bottomWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  bottomContainer: {
    width: '100%',
    minHeight: THEME.sizes.tabBarHeight,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.s,
    paddingTop: THEME.spacing.s,
    paddingBottom: THEME.spacing.m,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  label: {
    marginTop: 0,
    fontSize: 11,
    fontWeight: '500',
  },
});
