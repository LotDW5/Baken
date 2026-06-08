import { COLORS, getTheme } from '@/constants/colors';
import themeConstants from '@/constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NonverbaalScreen() {
  const navigation = useNavigation<any>();
  const theme = useMemo(() => getTheme(), []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIconsRow}>
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
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/icons/Terug.png')} style={[styles.backIconHeader, { tintColor: COLORS.foreground }]} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.pageTitle}>Nonverbale communicatie</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Image source={require('../../assets/icons/Nonverbaal.png')} style={[styles.emptyIcon, { tintColor: theme.color }]} />
          </View>
          <Text style={styles.emptyTitle}>Nog geen berichten</Text>
          <Text style={styles.emptySubtitle}>Voeg berichten toe die je later kunt tonen in geval van nood</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomWrapper}>
        <TouchableOpacity style={[styles.modalPrimaryButton, { backgroundColor: theme.color, marginHorizontal: 24 }]} onPress={() => (navigation as any).navigate('NonverbaalMessage')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../../assets/icons/Plus.png')} style={{ width: 18, height: 18, marginRight: 10, tintColor: COLORS.white }} />
            <Text style={styles.modalPrimaryText}>Nieuw bericht</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => (navigation as any).navigate('Main', { screen: 'Check-in' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('../../assets/icons/Check-in.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => (navigation as any).navigate('Main', { screen: 'Contacten' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('../../assets/icons/Contacten.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Contacten</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => (navigation as any).navigate('Main', { screen: 'Agenda' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('../../assets/icons/Agenda.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => (navigation as any).navigate('Main', { screen: 'Statistieken' } as any)} activeOpacity={0.8}>
            <View style={styles.iconWrap}><Image source={require('../../assets/icons/Statistieken.png')} style={[styles.icon, { tintColor: COLORS.mutedForeground }]} /></View>
            <Text style={[styles.label, { color: COLORS.mutedForeground }]}>Statistieken</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  iconImage: { width: 20, height: 20, resizeMode: 'contain' },
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
  backIconHeader: { width: 20, height: 20, resizeMode: 'contain' },
  titleWrap: { flex: 1, alignItems: 'flex-start' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, textAlign: 'left', flexShrink: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: themeConstants.sizes.tabBarHeight + 48, gap: 16, alignItems: 'stretch' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyIconWrap: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#F7F5FB', alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 34, height: 34, resizeMode: 'contain' },
  emptyTitle: { marginTop: 24, fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  emptySubtitle: { marginTop: 8, fontSize: 13, color: COLORS.mutedForeground, textAlign: 'center', maxWidth: 300 },
  modalPrimaryButton: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 20, backgroundColor: '#6B5CE7', alignSelf: 'stretch', marginTop: 12, marginHorizontal: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#6B5CE7', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  modalPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  bottomWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    paddingTop: 12,
    paddingBottom: 8,
  },
  bottomContainer: {
    width: '100%',
    minHeight: themeConstants.sizes.tabBarHeight,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: themeConstants.spacing.s,
    paddingTop: themeConstants.spacing.s,
    paddingBottom: themeConstants.spacing.m,
    marginTop: 12,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  icon: { width: 22, height: 22, resizeMode: 'contain' },
  label: { marginTop: 0, fontSize: 11, fontWeight: '500' },
});
