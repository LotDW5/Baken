import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, Platform, Dimensions } from 'react-native';
import { Svg, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getTheme } from '@/constants/colors';

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

  const outerSize = Math.min(width * 0.78, 820);
  const logoSize = Math.min(width * 0.66, 520);

  // limit the scale so the circle never grows off-screen (single gradient svg)
  const outerScale = scale.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1.0] });
  const outerOpacity = scale.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.95, 0.7] });

  const circleTranslateY = -(logoSize * 0.95); // position the center above the tower top

  return (
    <View style={styles.container}>
      <View style={[styles.logoWrap, { width, height: height * 0.65 }] }>
        {/* single radial gradient rendered with SVG */}
        <Animated.View
          style={{
            position: 'absolute',
            width: outerSize,
            height: outerSize,
            transform: [{ translateY: circleTranslateY }, { scale: outerScale }],
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
        <Animated.View style={[styles.circleTextWrap, { transform: [{ translateY: circleTranslateY * 0.95 }], opacity }]} pointerEvents="none">
          <Animated.Text style={[styles.breathText, { fontSize: 18 } ]}>Haal diep adem</Animated.Text>
        </Animated.View>

        <Animated.Image source={require('../assets/images/Logo 2.png')} style={[styles.logo, { width: logoSize, height: logoSize, opacity, marginTop: 8 }]} resizeMode="contain" />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  logoWrap: { justifyContent: 'center', alignItems: 'center', overflow: 'visible' },
  circle: { position: 'absolute' },
  circleMiddle: { position: 'absolute' },
  circleInner: { position: 'absolute', backgroundColor: '#fff' },
  circleTextWrap: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  textContainer: { paddingHorizontal: 12, alignItems: 'center' },
  logo: {  },
  breathText: { marginTop: 28, fontSize: 16, color: '#222', fontFamily: Platform.select({ web: 'Manrope, system-ui, sans-serif', default: undefined }) },
});
