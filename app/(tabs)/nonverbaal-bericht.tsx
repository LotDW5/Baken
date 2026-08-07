import { COLORS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import HeadAvatar from '../components/HeadAvatar';

const STORAGE_KEY = 'nonverbal_messages';

export default function NonverbaalMessage() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await AsyncStorage.getItem('profileImage');
        if (p) setProfileImage(p);
      } catch (e) {
        // ignore
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    // Keep bottom tab bar visible on this screen
    return () => {};
  }, [navigation]);

  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const route = useRoute<any>();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const m = (route.params as any)?.message;
    if (m && m.id) {
      setText(m.text || '');
      setEditingId(m.id || null);
    } else {
      // New message: ensure no prefilled text and not in editing mode
      setText('');
      setEditingId(null);
    }
  }, [route.params]);

  const remove = async () => {
    if (!editingId) return;
    if (Platform.OS === 'web') {
      const ok = window.confirm('Weet je zeker dat je dit bericht wilt verwijderen?');
      if (!ok) return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert('Verwijderen', 'Weet je zeker dat je dit bericht wilt verwijderen?', [
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
              try { (await import('@/utils/data-events')).emitDataChange(); } catch (e) { /* ignore */ }
              try {
                const parent = (navigation as any).getParent?.();
                if (parent && typeof parent.navigate === 'function') {
                  parent.navigate('Nonverbaal');
                } else {
                  (navigation as any).navigate('Nonverbaal');
                }
              } catch (e) {
                try { (navigation as any).goBack(); } catch (e2) { /* ignore */ }
              }
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]);
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const next = current.filter((c: any) => c.id !== editingId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      try { (await import('@/utils/data-events')).emitDataChange(); } catch (e) { /* ignore */ }
      try { (navigation as any).navigate('Nonverbaal'); } catch (e) { try { (navigation as any).goBack(); } catch (e2) { /* ignore */ } }
    } catch (err) {
      console.error(err);
    }
  };

  const save = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      let next;
      if (editingId) {
        next = current.map((c: any) => (c.id === editingId ? { ...c, text } : c));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        const updated = next.find((c: any) => c.id === editingId);
        (navigation as any).navigate('Nonverbaal', { previewMessage: updated });
      } else {
        next = [...current, { id: Date.now().toString(), text }];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        (navigation as any).navigate('Nonverbaal', { previewMessage: next[next.length - 1] });
      }
    } catch (err) {
      console.error(err);
      (navigation as any).navigate('Nonverbaal');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIconsRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
            <View style={styles.iconCircle}>
                  {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <HeadAvatar style={styles.avatarImage} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
            <View style={styles.iconCircle}>
              <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage as any, { tintColor: theme.color }]} />
            </View>
          </TouchableOpacity>
      </View>

      <View style={styles.pageHeader}>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Nieuw bericht</Text>
          <Text style={styles.pageSubtitle}>Typ een bericht dat je later kunt tonen</Text>
        </View>
      </View>

        <ScrollView scrollEnabled={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + THEME.sizes.tabBarHeight + 220, flexGrow: 1 }]} keyboardShouldPersistTaps="handled">
          <View style={[styles.textAreaWrap, focused ? { borderColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.12, shadowRadius: 12 } : null, { marginBottom: insets.bottom + THEME.sizes.tabBarHeight + 284 }]}>
          <TextInput
            multiline
            placeholder="Typ hier je bericht..."
            placeholderTextColor="#CFCFE0"
            style={styles.textArea}
            value={text}
            onChangeText={setText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
              scrollEnabled={false}
            />
        </View>
      </ScrollView>

      <View style={[styles.formFooter, { position: 'absolute', left: 0, right: 0, bottom: insets.bottom + THEME.sizes.tabBarHeight - 31 }]}> 
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.modalPrimaryButton, { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, flex: 1 }]} onPress={save}>
            <Text style={styles.modalPrimaryText}>Opslaan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modalSecondaryButton, { flex: 1, marginLeft: 12 }]} onPress={() => (navigation as any).navigate('Nonverbaal')}>
            <Text style={styles.modalSecondaryText}>Annuleren</Text>
          </TouchableOpacity>
        </View>
        {editingId ? (
          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7} onPress={remove}>
            <Text style={styles.deleteButtonText}>Verwijderen</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Bottom tab is provided by the shared BottomTabBar */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  container: { flex: 1, backgroundColor: COLORS.white },
  topIconsRow: {
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  iconImage: { width: 28, height: 28, resizeMode: 'contain' },
  avatarImage: { width: 28, height: 28, borderRadius: 14, resizeMode: 'contain' },
  pageHeader: {
    marginTop: 86,
    marginBottom: 24,
    paddingHorizontal: 24,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  titleWrap: { flex: 1, alignItems: 'flex-start' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, textAlign: 'left', flexShrink: 1 },
  pageSubtitle: { marginTop: 8, color: COLORS.mutedForeground },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  textAreaWrap: { flex: 1, backgroundColor: COLORS.inputBackground, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(107,92,231,0.06)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, overflow: 'hidden' },
  textAreaWrapFocused: { borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  textArea: { flex: 1, minHeight: 320, backgroundColor: COLORS.inputBackground, borderRadius: 20, borderWidth: 0, paddingHorizontal: 8, paddingVertical: 8, textAlignVertical: 'top', fontSize: 16, color: COLORS.foreground,
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineColor: 'transparent',
        outlineStyle: 'none',
        boxShadow: 'none',
        WebkitBoxShadow: 'none',
        WebkitTapHighlightColor: 'transparent',
      },
    }),
  },
  formFooter: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: 'transparent' },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },
  modalPrimaryButton: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 20, backgroundColor: COLORS.card, flex: 1 },
  modalPrimaryButtonFixed: { width: 160 },
  modalPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  modalSecondaryButton: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 0.5, borderColor: '#E0E0E0', flex: 1 },
  modalSecondaryText: { textAlign: 'center', fontWeight: '600', color: '#2D2D3A', fontSize: 16 },
  /* bottomWrapper, separator and fab styles removed - use shared BottomTabBar instead */
  bottomContainer: { width: '100%', minHeight: THEME.sizes.tabBarHeight, backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: THEME.spacing.s, paddingTop: THEME.spacing.s, paddingBottom: THEME.spacing.m },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  icon: { width: 22, height: 22, resizeMode: 'contain' },
  label: { marginTop: 0, fontSize: 11, fontWeight: '500' },
  /* bottomCover removed */
  deleteButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: '#FFE8ED', width: '100%', marginTop: 12 },
  deleteButtonText: { textAlign: 'center', fontWeight: '700', color: '#E85D75', fontSize: 16 },
});
