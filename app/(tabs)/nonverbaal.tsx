import { COLORS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeadAvatar from '../components/HeadAvatar';

const STORAGE_KEY = 'nonverbal_messages';

export default function NonverbaalScreen() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return `rgba(99,84,255,${alpha})`;
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c+c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  };
  const [preview, setPreview] = useState<any>(route.params?.previewMessage ?? null);
  const [messages, setMessages] = useState<any[]>([]);

  const loadMessages = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      setMessages(current.reverse());
    } catch (err) {
      console.error('Failed to load nonverbal messages', err);
    }
  };

  useEffect(() => {
    const p = (route.params as any)?.previewMessage;
    setPreview(p ?? null);
    loadMessages();
  }, [route.params]);

  useEffect(() => {
    // Keep bottom tab bar visible on this screen
    return () => {};
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIconsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
          <View style={styles.iconCircle}>
            <HeadAvatar style={styles.iconImage as any} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage as any, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.pageHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <Image source={require('../../assets/icons/Terug.png')} style={[styles.backIconHeader as any, { tintColor: COLORS.foreground }]} />
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.pageTitle}>Nonverbale modus</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Image source={require('../../assets/icons/Nonverbaal.png')} style={[styles.emptyIcon as any, { tintColor: theme.color }]} />
            </View>
            <Text style={styles.emptyTitle}>Nog geen berichten</Text>
            <Text style={styles.emptySubtitle}>Voeg berichten toe die je later kunt tonen in geval van nood</Text>
          </View>
        ) : (
          <View style={styles.messagesList}>
            {messages.map((m: any) => (
              <View key={m.id} style={styles.messageCard}>
                <TouchableOpacity style={styles.messageCardInner} activeOpacity={0.8} onPress={() => setPreview(m)}>
                  <Text numberOfLines={2} ellipsizeMode="tail" style={styles.messageCardText}>{m.text}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: hexToRgba(theme.color, 0.08) }]} onPress={() => (navigation as any).navigate('NonverbaalMessage', { message: m })}>
                  <Image source={require('../../assets/icons/Aanpassen.png')} style={{ width: 20, height: 20, tintColor: theme.color }} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.formFooter, { position: 'absolute', left: 0, right: 0, bottom: insets.bottom + THEME.sizes.tabBarHeight - 31, zIndex: 30 }]}> 
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[{ flex: 1, paddingVertical: 14, borderRadius: 20, backgroundColor: theme.color, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }]} onPress={() => (navigation as any).navigate('NonverbaalMessage')}>
            <Image source={require('../../assets/icons/Plus.png')} style={styles.plusIcon as any} />
            <Text style={[styles.landingButtonText, { marginLeft: 8 }]}>Nieuw bericht</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom tab is provided by the shared BottomTabBar */}
      {preview && (
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={[styles.iconCircle, styles.previewClose, { padding: 12 }]}
            onPress={() => { setPreview(null); (navigation as any).setParams?.({ previewMessage: undefined }); }}
          >
            <Image source={require('../../assets/icons/Kruis.png')} style={{ width: 20, height: 20, tintColor: theme.color }} />
          </TouchableOpacity>

          <View style={styles.previewContainer}>
            <View style={styles.previewContent}>
              <Text style={styles.previewText}>{preview.text}</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
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
    formFooter: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: 'transparent' },
    buttonRow: { flexDirection: 'row', alignItems: 'center' },
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
  },
  iconImage: { width: 28, height: 28, resizeMode: 'contain' },
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
  backButtonHeader: { marginRight: 12, padding: 6 },
  backIconHeader: { width: 22, height: 22, resizeMode: 'contain' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'flex-start' },
  titleWrap: { flex: 1, alignItems: 'flex-start' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, textAlign: 'left', flexShrink: 1 },
  content: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: THEME.sizes.tabBarHeight + 48, gap: 16, alignItems: 'stretch' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyIconWrap: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#F7F5FB', alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 34, height: 34, resizeMode: 'contain' },
  emptyTitle: { marginTop: 24, fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  emptySubtitle: { marginTop: 8, fontSize: 13, color: COLORS.mutedForeground, textAlign: 'center', maxWidth: 300 },
  modalPrimaryButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 20, backgroundColor: COLORS.card, alignSelf: 'stretch', marginTop: 12, marginHorizontal: 0, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8, flexDirection: 'row', justifyContent: 'center' },
  landingButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, backgroundColor: COLORS.card, width: '100%', maxWidth: 520, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  landingButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 16, marginLeft: 8 },
    /* bottomWrapper, separator and fab styles removed - use shared BottomTabBar instead */
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
  buttonWrap: { position: 'absolute', left: 48, right: 48, bottom: THEME.sizes.tabBarHeight + 24, zIndex: 30 },
  plusIcon: { width: 20, height: 20, resizeMode: 'contain', marginRight: 8, tintColor: '#FFF' },
  modalPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  icon: { width: 22, height: 22, resizeMode: 'contain' },
  label: { marginTop: 0, fontSize: 11, fontWeight: '500' },
  previewOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 40, backgroundColor: 'rgba(255,255,255,0.98)' },
  previewContainer: { flex: 1 },
  previewClose: { position: 'absolute', top: 56, right: 24, backgroundColor: '#F7F5FB', zIndex: 999, elevation: 30, padding: 10, borderRadius: 32 },
  previewContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  previewText: { fontSize: 28, fontWeight: '700', color: COLORS.foreground, textAlign: 'center' },
  messagesList: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 8, gap: 12 },
  messageCard: { backgroundColor: COLORS.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16, width: '100%', marginHorizontal: 0, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 4, position: 'relative', boxShadow: Platform.OS === 'web' ? '0px 6px 14px rgba(0,0,0,0.04)' : undefined },
  messageCardText: { color: COLORS.foreground, fontSize: 16, fontWeight: '600' },
  messageCardInner: { flex: 1, paddingRight: 56 },
  editButton: { position: 'absolute', right: 16, top: '50%', marginTop: -6, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F5FB' },
    /* bottomCover removed; fab styles removed */
});
