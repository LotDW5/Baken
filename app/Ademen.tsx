import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getTheme } from '@/constants/colors';

export default function Ademen() {
  const navigation = useNavigation<any>();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    pulse.start();

    const timer = setTimeout(async () => {
      if (!mounted) return;
      try {
        const onboarded = await AsyncStorage.getItem('onboarding_completed');
        if (onboarded === 'true') navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        else navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      } catch (e) {
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      }
    }, 5000);

    return () => { mounted = false; clearTimeout(timer); pulse.stop(); };
  }, [navigation, opacity, scale]);

  const [themeColor] = (() => {
    try { const t = getTheme(); return [t.color || '#6B5CE7']; } catch (e) { return ['#6B5CE7']; }
  })();

  const circleScale = scale.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] });
  const circleOpacity = scale.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.2, 0.5, 0.15] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale: circleScale }], opacity: circleOpacity, backgroundColor: themeColor }]} />
      <Animated.Image source={require('../assets/images/Logo 2.png')} style={[styles.logo, { opacity }]} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  circle: { position: 'absolute', width: 260, height: 260, borderRadius: 130 },
  logo: { width: 180, height: 180 },
});
