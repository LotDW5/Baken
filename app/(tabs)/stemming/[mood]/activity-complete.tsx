import { COLORS, MOOD_OPTIONS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import SavedAvatar from '../../../components/SavedAvatar';

export default function ActivityComplete() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  let router: any = null;
  let activityParam: string | undefined;
  try {
    const xr = require('expo-router');
    router = xr.useRouter();
    const params = xr.useSearchParams();
    activityParam = params?.activity;
  } catch (e) {
    // ignore
  }

  const route = useRoute<any>();
  if (!activityParam) {
    activityParam = route?.params?.activity;
  }
  const activity = activityParam ? decodeURIComponent(String(activityParam)) : 'activiteit';

  // determine mood color for the filling bar
  let moodColor = '#4CAF93';
  let moodBgColor = '#E8F5F1';
  try {
    const moodParam = route?.params?.mood || undefined;
    const moodObj = MOOD_OPTIONS.find((m) => m.id === moodParam);
    if (moodObj) moodColor = moodObj.color;
    if (moodObj) moodBgColor = moodObj.bgColor || moodBgColor;
  } catch (e) { /* ignore */ }

  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const [showButton, setShowButton] = useState(true);
  const fillAnim = useRef(new Animated.Value(0)).current; // 0..1
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as any);
    };
  }, []);

  useEffect(() => {
    // auto-start fill immediately on mount; animation lasts 10s
    setRunning(true);
    fillAnim.setValue(0);
    Animated.timing(fillAnim, { toValue: 1, duration: 10000, useNativeDriver: false }).start(() => {
      setProgress(1);
      setRunning(false);
    });
    return () => {};
  }, []);

  const startProgress = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    // start animated fill over 10s
    Animated.timing(fillAnim, { toValue: 1, duration: 10000, useNativeDriver: false }).start(() => {
      setProgress(1);
      setRunning(false);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
          <View style={styles.iconCircle}>
            <SavedAvatar style={styles.iconImage as any} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.bubbleWrap}>
            <View style={[styles.bubble, { width: Math.max(0, screenWidth - 48) }]}>
              <Text style={styles.title}>Veel plezier!</Text>
              <Text style={styles.subtitle}>Ik hoop dat het {String(activity).toLowerCase()} je een goed gevoel geeft</Text>
              <View style={styles.bubbleTail} />
            </View>
            <SavedAvatar style={styles.avatar as any} />
          </View>

      <View style={styles.footer}> 
        {showButton && (
          <View style={styles.fillButtonWrap}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={async () => {
                if (progress >= 1) {
                  try {
                    await AsyncStorage.setItem('recentCompletion', JSON.stringify({ activity: activity, timestamp: new Date().toISOString() }));
                    try { (await import('@/utils/data-events')).emitDataChange(); } catch (e) { /* ignore */ }
                  } catch (e) {
                    console.error('Failed to persist recentCompletion', e);
                  }
                  try {
                    const parent = (navigation as any).getParent?.();
                    const grandParent = parent && typeof (parent.getParent) === 'function' ? parent.getParent() : null;
                    if (grandParent && typeof grandParent.navigate === 'function') {
                      grandParent.navigate('Check-in', { screen: 'Home' });
                    } else if (parent && typeof parent.navigate === 'function') {
                      parent.navigate('Check-in', { screen: 'Home' });
                    } else if ((navigation as any).navigate) {
                      (navigation as any).navigate('Check-in', { screen: 'Home' });
                    } else if ((navigation as any).goBack) {
                      (navigation as any).goBack();
                    }
                  } catch (navErr) {
                    console.error('Navigation fallback failed', navErr);
                    try { (navigation as any).goBack?.(); } catch (e) { /* ignore */ }
                  }
                } else {
                  startProgress();
                }
              }}
              style={{ width: '100%' }}
            >
              <View style={[styles.fillButtonBg, { backgroundColor: moodBgColor, shadowColor: '#6B5CE7' }]} onLayout={(e) => setButtonWidth(e.nativeEvent.layout.width)}>
                <Animated.View
                  style={[
                    styles.fillButtonFill,
                    { backgroundColor: moodColor, width: buttonWidth ? fillAnim.interpolate({ inputRange: [0, 1], outputRange: [0, buttonWidth] }) : 0 },
                  ]}
                />
                {progress < 1 && <Text style={[styles.fillButtonText, { color: 'rgba(0,0,0,0.0)' }]}> </Text>}
                {progress >= 1 && <Text style={styles.fillButtonText}>Ik ben klaar</Text>}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, alignItems: 'center', paddingHorizontal: 24 },
  bubbleWrap: { position: 'absolute', left: 0, right: 0, top: 160, alignItems: 'center', zIndex: 3000 },
  bubble: { backgroundColor: COLORS.white, padding: 18, borderRadius: 18, alignSelf: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 16, marginBottom: 6, zIndex: 3 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', color: COLORS.foreground },
  avatar: { width: 260, height: 380, marginTop: 24, zIndex: 1 },
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
  iconButton: { padding: 4 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#E0E0E0' },
  iconImage: { width: 20, height: 20, resizeMode: 'contain' },
  footer: { position: 'absolute', left: 24, right: 24, bottom: THEME.sizes.tabBarHeight + 48, alignItems: 'center' },
  fillButtonWrap: { width: '100%', alignSelf: 'stretch', alignItems: 'center' },
  fillButtonBg: { width: '100%', height: 56, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 },
  fillButtonFill: { position: 'absolute', left: 0, top: 0, bottom: 0, height: '100%', borderTopLeftRadius: 20, borderBottomLeftRadius: 20, width: '0%' },
  fillButtonText: { position: 'absolute', alignSelf: 'center', color: '#ffffff', fontWeight: '700' },
  bubbleTail: {
    position: 'absolute',
    left: '50%',
    bottom: -11,
    width: 22,
    height: 22,
    backgroundColor: COLORS.white,
    // nudge the tail to the right relative to center (was translateX: -11)
    transform: [{ translateX: 6 }, { rotate: '45deg' }],
    // place behind the bubble
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    zIndex: 0,
  },
});
