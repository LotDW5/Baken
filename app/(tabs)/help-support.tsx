import { COLORS } from '@/constants/colors';
import themeConstants from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Platform } from 'react-native';

export default function HelpSupportScreen() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();

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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Image source={require('../../assets/icons/Terug.png')} style={[styles.arrowIcon, { tintColor: theme.color }]} />
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Help & Support</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Heb je een vraag of probleem? We helpen je graag verder.</Text>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <Image source={require('../../assets/icons/Mail.png')} style={[styles.icon, { tintColor: theme.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Contact opnemen</Text>
              <Text style={styles.cardText}>Heb je een probleem met de app, een vraag of wil je feedback geven? Stuur ons een e-mail en we antwoorden zo snel mogelijk.</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.color }]} onPress={() => Linking.openURL('mailto:dewulflof@gmail.com')}>
            <Text style={styles.buttonText}>dewulflof@gmail.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <Image source={require('../../assets/icons/Melden.png')} style={[styles.icon, { tintColor: theme.color }]} />
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

      <View style={styles.bottomNav} pointerEvents="box-none">
        <View style={styles.bottomInner}>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'Check-in' })} style={styles.bottomItem}>
            <Image source={require('../../assets/icons/Check-in.png')} style={[styles.bottomIcon, { tintColor: COLORS.mutedForeground }]} />
            <Text style={styles.bottomLabel}>Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'Contacten' })} style={styles.bottomItem}>
            <Image source={require('../../assets/icons/Contacten.png')} style={[styles.bottomIcon, { tintColor: COLORS.mutedForeground }]} />
            <Text style={styles.bottomLabel}>Contacten</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'Agenda' })} style={styles.bottomItem}>
            <Image source={require('../../assets/icons/Agenda.png')} style={[styles.bottomIcon, { tintColor: COLORS.mutedForeground }]} />
            <Text style={styles.bottomLabel}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'Statistieken' })} style={styles.bottomItem}>
            <Image source={require('../../assets/icons/Statistieken.png')} style={[styles.bottomIcon, { tintColor: COLORS.mutedForeground }]} />
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
  pageHeader: { marginTop: 144, marginBottom: 8, paddingHorizontal: 0, zIndex: 20, flexDirection: 'row', alignItems: 'center' },
  titleWrap: { flex: 1, alignItems: 'flex-start' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.foreground },
  arrowIcon: { width: 22, height: 22, resizeMode: 'contain' },
  subtitle: { marginTop: 12, color: COLORS.mutedForeground, fontSize: 14 },
  card: { marginTop: 20, backgroundColor: COLORS.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  leftRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 28, height: 28, resizeMode: 'contain' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.foreground, marginBottom: 6 },
  cardText: { fontSize: 14, color: COLORS.mutedForeground },
  button: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, alignSelf: 'flex-start' },
  buttonText: { color: '#fff', fontWeight: '700' },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 6 },
  bullet: { color: COLORS.mutedForeground, marginRight: 6 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
  bottomInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 16 : 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottomIcon: { width: 22, height: 22, resizeMode: 'contain' },
  bottomLabel: { marginTop: 2, fontSize: 11, color: COLORS.mutedForeground },
});
