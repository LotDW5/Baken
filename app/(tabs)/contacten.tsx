import { COLORS, getTheme } from '@/constants/colors';
import THEME from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  relation?: string;
  favorite?: boolean;
}

export default function ContactsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [theme] = useState(getTheme());
  const scrollRef = useRef<any>(null);
  const [scrollY, setScrollY] = useState(0);
  const [buttonY, setButtonY] = useState<number | null>(null);
  const [buttonHeight, setButtonHeight] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [showFab, setShowFab] = useState(false);
  const hideTimerRef = useRef<any>(null);
  const [layoutTick, setLayoutTick] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    loadContacts();
  }, []);

  // Reload contacts whenever this screen regains focus (so newly saved contacts appear)
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  const loadContacts = async () => {
    try {
      const raw = await AsyncStorage.getItem('contacts');
      const data = raw ? JSON.parse(raw) : [];
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteContact = (id: string) => {
    Alert.alert('Verwijderen', 'Weet je zeker dat je dit contact wilt verwijderen?', [
      { text: 'Annuleer', style: 'cancel' },
      {
        text: 'Verwijder',
        style: 'destructive',
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem('contacts');
            const current: Contact[] = raw ? JSON.parse(raw) : [];
            const next = current.filter((c) => c.id !== id);
            await AsyncStorage.setItem('contacts', JSON.stringify(next));
            setContacts(next);
          } catch (err) {
            console.error(err);
            Alert.alert('Fout', 'Kon contact niet verwijderen');
          }
        },
      },
    ]);
  };

  const handleEdit = (contact: Contact) => {
    navigation.getParent?.().navigate('ContactForm', { contact });
  };

  const handleCreate = () => {
    navigation.getParent?.().navigate('ContactForm');
  };

  useEffect(() => {
    if (buttonY === null || containerHeight === 0) {
      const t = setTimeout(() => setLayoutTick((t) => t + 1), 50);
      setShowFab(false);
      return () => clearTimeout(t);
    }

    const visibleTop = scrollY;
    const visibleBottom = scrollY + containerHeight - (insets.bottom + THEME.sizes.tabBarHeight);
    const buttonTop = buttonY;
    const buttonBottom = buttonY + buttonHeight;

    const outOfView = buttonTop < (visibleTop + 4) || buttonBottom > (visibleBottom - 4);
    const shouldShow = outOfView && contacts.length > 0;

    if (shouldShow) {
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      setShowFab(true);
      return;
    }

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowFab(false);
      hideTimerRef.current = null;
    }, 300);
  }, [scrollY, buttonY, buttonHeight, containerHeight, insets.bottom]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
    };
  }, []);

  const favorites = contacts.filter((c) => c.favorite);
  const others = contacts.filter((c) => !c.favorite);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Profiel.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.pageHeader}>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Mijn Contacten</Text>
        </View>
        {showFab && (
          <TouchableOpacity activeOpacity={0.9} style={styles.fabHeader} onPress={handleCreate}>
            <View style={[styles.fabCircle, { backgroundColor: theme.color }]}>
              <Image source={require('../../assets/icons/Plus.png')} style={styles.fabIcon} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.pageContent} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nog geen contacten toegevoegd</Text>
              <Text style={styles.emptySubtitle}>Klik hieronder om te beginnen</Text>
            </View>

            {!showFab && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.color }]}
                onPress={handleCreate}
                onLayout={(e) => {
                  setButtonY(e.nativeEvent.layout.y);
                  setButtonHeight(e.nativeEvent.layout.height);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Image source={require('../../assets/icons/Plus.png')} style={styles.plusIcon} />
                  <Text style={styles.primaryButtonText}>Nieuw contact</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            ref={scrollRef}
            onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
          >
            {favorites.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Image source={require('../../assets/icons/Gevulde ster.png')} style={styles.starIcon} />
                  <Text style={styles.sectionTitle}>Favorieten</Text>
                </View>

                {favorites.map((item, idx) => (
                  <View key={item.id} style={[styles.contactCard, idx === 0 && { marginTop: 12 }]}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.avatarAndInfo}>
                        <View style={[styles.avatarCircle, { backgroundColor: theme.color }]}>
                          <Image source={require('../../assets/icons/Contact.png')} style={[styles.contactAvatarIcon, { tintColor: '#fff' }]} />
                        </View>
                        <View>
                          <Text style={styles.contactName}>{item.name}</Text>
                          {!!item.relation && <Text style={styles.contactRelation}>{item.relation}</Text>}
                          <Text style={styles.contactPhone}>{item.phone}</Text>
                          <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Text style={[styles.editLink, { color: theme.color }]}>Bewerken</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const raw = item.phone || '';
                          const num = raw.replace(/[^+0-9]/g, '');
                          const url = `tel:${num}`;
                          Linking.openURL(url).catch(() => {
                            Alert.alert('Kan niet bellen', 'Deze telefoon ondersteunt bellen niet.');
                          });
                        }}
                      >
                        <View style={[styles.callCircle, { backgroundColor: theme.color }]}>
                          <Image source={require('../../assets/icons/Bellen.png')} style={styles.callIcon} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {others.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Alle contacten</Text>
                </View>

                {others.map((item, idx) => (
                  <View key={item.id} style={[styles.contactCard, idx === 0 && { marginTop: 12 }]}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.avatarAndInfo}>
                        <View style={[styles.avatarCircle, { backgroundColor: theme.color }]}>
                          <Image source={require('../../assets/icons/Contact.png')} style={[styles.contactAvatarIcon, { tintColor: '#fff' }]} />
                        </View>
                        <View>
                          <Text style={styles.contactName}>{item.name}</Text>
                          {!!item.relation && <Text style={styles.contactRelation}>{item.relation}</Text>}
                          <Text style={styles.contactPhone}>{item.phone}</Text>
                          <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Text style={[styles.editLink, { color: theme.color }]}>Bewerken</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const raw = item.phone || '';
                          const num = raw.replace(/[^+0-9]/g, '');
                          const url = `tel:${num}`;
                          Linking.openURL(url).catch(() => {
                            Alert.alert('Kan niet bellen', 'Deze telefoon ondersteunt bellen niet.');
                          });
                        }}
                      >
                        <View style={[styles.callCircle, { backgroundColor: theme.color }]}>
                          <Image source={require('../../assets/icons/Bellen.png')} style={styles.callIcon} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {!showFab && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.color }]}
                onPress={handleCreate}
                onLayout={(e) => {
                  setButtonY(e.nativeEvent.layout.y);
                  setButtonHeight(e.nativeEvent.layout.height);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Image source={require('../../assets/icons/Plus.png')} style={styles.plusIcon} />
                  <Text style={styles.primaryButtonText}>Nieuw contact</Text>
                </View>
              </TouchableOpacity>
            )}
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
    top: 56,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  pageContent: {
    paddingTop: 0,
    flex: 1,
    paddingBottom: THEME.sizes.tabBarHeight + 48,
  },
  pageHeader: {
    marginTop: 144,
    marginBottom: 24,
    paddingHorizontal: 24,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  titleWrap: { flex: 1, alignItems: 'flex-start' },
  iconButton: { padding: 4 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  iconImage: { width: 20, height: 20, resizeMode: 'contain' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, textAlign: 'left' },
  emptyState: { flex: 1, alignItems: 'center', paddingHorizontal: 24, gap: 16, paddingBottom: THEME.sizes.tabBarHeight + 48 },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderColor: COLORS.border,
    paddingVertical: 44,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.foreground, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.mutedForeground, textAlign: 'center' },
  primaryButton: { width: 160, paddingVertical: 14, borderRadius: 20, alignSelf: 'center' },
  primaryButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 16, textAlign: 'center' },
  listContent: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: THEME.sizes.tabBarHeight + 48 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  starIcon: { width: 20, height: 20, resizeMode: 'contain', marginRight: 8, tintColor: '#FFB84D' },
  contactCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarAndInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  contactAvatarIcon: { width: 22, height: 22, resizeMode: 'contain' },
  contactName: { fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  contactRelation: { fontSize: 14, color: COLORS.mutedForeground },
  contactPhone: { fontSize: 14, color: COLORS.foreground, marginTop: 2 },
  editLink: { marginTop: 4, fontSize: 14, fontWeight: '600' },
  topBar: { position: 'absolute', top: 56, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  plusIcon: { width: 18, height: 18, tintColor: '#fff', resizeMode: 'contain' },
  fabHeader: { marginLeft: 'auto', zIndex: 70, alignSelf: 'center' },
  fabCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
  fabIcon: { width: 20, height: 20, tintColor: '#fff', resizeMode: 'contain' },
  callCircle: { width: 38, height: 38, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  callIcon: { width: 22, height: 22, tintColor: '#fff', resizeMode: 'contain' },
});