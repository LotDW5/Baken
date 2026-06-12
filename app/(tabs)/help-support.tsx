import { COLORS } from '@/constants/colors';
import useAppTheme from '@/hooks/use-app-theme';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';

export default function HelpSupportScreen() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 24, gap: 16, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backArrow: { fontSize: 20, color: COLORS.foreground, marginRight: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.foreground },
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
});
