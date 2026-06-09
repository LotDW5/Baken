import { COLORS } from '@/constants/colors';
import THEME from '@/constants/theme';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ActivityComplete() {
  let router: any = null;
  let params: any = {};
  try {
    const xr = require('expo-router');
    router = xr.useRouter();
    params = xr.useSearchParams();
  } catch (e) {
    // fallback: try react-navigation route params
    params = ({} as any);
  }
  const { activity } = (params || {}) as { activity?: string };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bubbleWrap}>
        <View style={styles.bubble}>
          <Text style={styles.title}>Veel plezier!</Text>
          <Text style={styles.subtitle}>Ik hoop dat het {String(activity).toLowerCase()} je een goed gevoel geeft</Text>
        </View>
        <Image source={require('../../../../assets/personage/Personage.png')} style={styles.avatar} resizeMode="contain" />
      </View>

      <View style={styles.footer}> 
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeText}>Terug</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, alignItems: 'center' },
  bubbleWrap: { marginTop: 36, alignItems: 'center', flex: 1, justifyContent: 'center' },
  bubble: { backgroundColor: COLORS.white, padding: 18, borderRadius: 12, maxWidth: 393, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', color: COLORS.foreground },
  avatar: { width: 220, height: 220, marginTop: 8 },
  footer: { width: '100%', padding: 24, paddingBottom: THEME.sizes.tabBarHeight + 12, alignItems: 'center' },
  closeButton: { backgroundColor: COLORS.card, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 20 },
  closeText: { color: COLORS.foreground, fontWeight: '700' },
});
