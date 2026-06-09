import { getTheme } from '@/constants/colors';
import { onThemeChange } from '@/utils/theme-events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

export default function useAppTheme() {
  const [theme, setTheme] = useState(getTheme());

  const load = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('appTheme');
      if (saved) setTheme(getTheme(saved));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // subscribe to theme-change events so this hook updates immediately
    const unsub = onThemeChange(() => {
      (async () => {
        try {
          const saved = await AsyncStorage.getItem('appTheme');
          if (saved) setTheme(getTheme(saved));
        } catch (e) {}
      })();
    });
    return unsub;
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const saved = await AsyncStorage.getItem('appTheme');
          if (active && saved) setTheme(getTheme(saved));
        } catch (e) {}
      })();
      return () => { active = false; };
    }, [])
  );

  return theme;
}
