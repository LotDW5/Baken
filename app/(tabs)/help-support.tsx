import { COLORS } from '@/constants/colors';
import themeConstants from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import applyShadow from '@/utils/shadow';
import { useNavigation } from '@react-navigation/native';
import { Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpSupportScreen() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return `rgba(99,84,255,${alpha})`;
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c+c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIconsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/personage/langhaarbruin.png')} style={styles.iconImage} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Image source={require('../../assets/icons/Terug.png')} style={[styles.arrowIcon, { tintColor: COLORS.foreground }]} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Help & Support</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Heb je een vraag of probleem? We helpen je graag verder.</Text>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <View style={[styles.iconCircleSmall, { backgroundColor: hexToRgba(theme.color, 0.08) }] }>
              <Image source={require('../../assets/icons/Mail.png')} style={[styles.icon, { tintColor: theme.color }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Contact opnemen</Text>
              <Text style={styles.cardText}>Heb je een probleem met de app, een vraag of wil je feedback geven? Stuur ons een e-mail en we antwoorden zo snel mogelijk.</Text>
              <View style={{ height: 12 }} />
              <TouchableOpacity style={[styles.pillButton, { backgroundColor: theme.color }]} onPress={() => Linking.openURL('mailto:dewulflof@gmail.com')}>
                <Image source={require('../../assets/icons/Mail.png')} style={[styles.buttonIcon, { tintColor: '#fff' }]} />
                <Text style={styles.buttonText}>dewulflof@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <View style={[styles.iconCircleSmall, { backgroundColor: hexToRgba(theme.color, 0.08) }] }>
              <Image source={require('../../assets/icons/Melden.png')} style={[styles.icon, { tintColor: theme.color }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Wat kan je melden?</Text>
              <View style={{ height: 8 }} />
              <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.cardText}>Technische problemen of bugs</Text></View>
              <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.cardText}>Suggesties voor nieuwe functies</Text></View>
              <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.cardText}>Algemene feedback over de app</Text></View>
              <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.cardText}>Vragen over het gebruik</Text></View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, applyShadow({ opacity: 0.12, radius: 14, offsetX: 0, offsetY: -6, elevation: 12 })]} pointerEvents="box-none">
        <View style={styles.bottomInner}>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'Check-in' })} style={styles.bottomItem}>
            <View style={styles.iconWrap}>
              <Image source={require('../../assets/icons/Check-in.png')} style={[styles.bottomIcon, { tintColor: COLORS.mutedForeground }]} />
            </View>
            <Text style={styles.bottomLabel}>Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'Contacten' })} style={styles.bottomItem}>
            <View style={styles.iconWrap}>
              <Image source={require('../../assets/icons/Contacten.png')} style={[styles.bottomIcon, { tintColor: COLORS.mutedForeground }]} />
            </View>
            <Text style={styles.bottomLabel}>Contacten</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'Agenda' })} style={styles.bottomItem}>
            <View style={styles.iconWrap}>
              <Image source={require('../../assets/icons/Agenda.png')} style={[styles.bottomIcon, { tintColor: COLORS.mutedForeground }]} />
            </View>
            <Text style={styles.bottomLabel}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'Statistieken' })} style={styles.bottomItem}>
            <View style={styles.iconWrap}>
              <Image source={require('../../assets/icons/Statistieken.png')} style={[styles.bottomIcon, { tintColor: COLORS.mutedForeground }]} />
            </View>
            <Text style={styles.bottomLabel}>Statistieken</Text>
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
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#E0E0E0' },
  iconImage: { width: 20, height: 20, resizeMode: 'contain' },
  content: { padding: 24, gap: 16, paddingBottom: themeConstants.sizes.tabBarHeight + 40 },
  pageHeader: { marginTop: 144, marginBottom: 0, paddingHorizontal: 24, zIndex: 20, flexDirection: 'row', alignItems: 'center' },
  titleWrap: { flex: 1, alignItems: 'flex-start' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, textAlign: 'left' },
  arrowIcon: { width: 22, height: 22, resizeMode: 'contain' },
  subtitle: { marginTop: 0, color: COLORS.mutedForeground, fontSize: 14 },
  card: { marginTop: 0, backgroundColor: COLORS.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 20, height: 20, resizeMode: 'contain' },
  iconCircleSmall: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(99, 84, 255, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.foreground, marginBottom: 6 },
  cardText: { fontSize: 14, color: COLORS.mutedForeground },
  pillButton: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 24, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' },
  buttonIcon: { width: 16, height: 16, marginRight: 8, resizeMode: 'contain' },
  buttonText: { color: '#fff', fontWeight: '700' },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 6 },
  bullet: { color: COLORS.mutedForeground, marginRight: 6 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'stretch', backgroundColor: '#FFF' },
  bottomInner: { width: '100%', minHeight: themeConstants.sizes.tabBarHeight, backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: themeConstants.spacing.s, paddingTop: themeConstants.spacing.s, paddingBottom: themeConstants.spacing.m },
  bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', transform: [{ translateY: -4 }] },
  bottomIcon: { width: 22, height: 22, resizeMode: 'contain' },
  bottomLabel: { marginTop: 0, transform: [{ translateY: -4 }], fontSize: 11, fontWeight: '500' },
});
