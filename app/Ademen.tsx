import { getTheme } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform, StyleSheet, View } from 'react-native';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';

export default function Ademen() {
  const navigation = useNavigation<any>();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const inhaleDuration = 5000;
    const exhaleDuration = 5000;

    const sequence = Animated.sequence([
      Animated.timing(scale, { toValue: 1, duration: inhaleDuration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0, duration: exhaleDuration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]);

    // start fade-in and the inhale/exhale sequence
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    sequence.start();

    const timer = setTimeout(async () => {
      if (!mounted) return;
      try {
        const onboarded = await AsyncStorage.getItem('onboarding_completed');
        if (onboarded === 'true') navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        else navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      } catch (e) {
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      }
    }, inhaleDuration + exhaleDuration);

    return () => { mounted = false; clearTimeout(timer); sequence.stop(); };
  }, [navigation, opacity, scale]);

  // responsive sizing and one slow breathing pulse (kept within screen bounds)
  const { width, height } = Dimensions.get('window');
  const themeColor = getTheme('blue').color || '#3B82F6';

    // enlarge logo to occupy more of the screen (overflow is hidden)
    const logoSize = Math.max(width, height) * 1.02;
    // cap the outerSize so it never exceeds the visible screen
    const outerSize = Math.min(logoSize * 0.85, Math.min(width, height) * 0.9);

  // limit the scale so the circle never grows off-screen (single gradient svg)
  // allow a slightly larger breathing amplitude
  const outerScale = scale.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.12] });
  const outerOpacity = scale.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.95, 0.7] });

    // tuned so the circle center aligns with the top of the tower in the logo
    const circleTranslateY = -(logoSize * 0.25);
    const translateYOffset = height * 0.02; // move logo+circle higher (logo up)
    // slightly raise the circle compared to previous; keep a separate offset
    const circleYOffset = translateYOffset + height * 0.12 - 12; // move circle a few pixels higher

    // compute where the circle's center will be on screen and position text just above the top edge
    const circleCenterY = height / 2 + (circleTranslateY + circleYOffset);
    const textTop = circleCenterY - (outerSize / 2) - 120 + 20; // move instruction text 20px down
    const translateXOffset = -width * 0.01 + 4; // nudge logo 4px to the right relative to previous

  return (
    <View style={styles.container}>
        <View style={[styles.logoWrap, { width, height }] }>
        {/* single radial gradient rendered with SVG */}
        <Animated.View
          style={{
            position: 'absolute',
            width: outerSize,
            height: outerSize,
            transform: [{ translateY: circleTranslateY + circleYOffset }, { scale: outerScale }],
            opacity: outerOpacity,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={outerSize} height={outerSize} viewBox={`0 0 ${outerSize} ${outerSize}`}>
            <Defs>
              <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="100%" stopColor={themeColor} stopOpacity="1" />
              </RadialGradient>
            </Defs>
            <Circle cx={outerSize / 2} cy={outerSize / 2} r={outerSize / 2} fill="url(#grad)" />
          </Svg>
        </Animated.View>

        {/* instruction text above the logo */}
        {/* instruction text positioned just above the circle */}
        <Animated.View style={[styles.circleTextWrap, { top: textTop, opacity }]} pointerEvents="none">
          <Animated.Text style={[styles.breathText, { fontSize: 18 } ]}>Haal diep adem</Animated.Text>
        </Animated.View>

          <Animated.Image source={require('../assets/images/Logo 2.png')} style={[styles.logo, { width: logoSize, height: logoSize, opacity, marginTop: 0, transform: [{ translateY: translateYOffset }, { translateX: translateXOffset }] }]} resizeMode="contain" />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logoWrap: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  circle: { position: 'absolute' },
  circleMiddle: { position: 'absolute' },
  circleInner: { position: 'absolute', backgroundColor: '#fff' },
  circleTextWrap: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  textContainer: { paddingHorizontal: 12, alignItems: 'center' },
  logo: {  },
  breathText: { marginTop: 28, fontSize: 16, color: '#222', fontFamily: Platform.select({ web: 'Manrope, system-ui, sans-serif', default: undefined }) },
});
