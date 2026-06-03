import { getTheme } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
// expo-router removed — use App.tsx with react-navigation instead
import { useEffect, useState } from 'react';

const TAB_ICON_SIZE = 24;
const TAB_ICON_SOURCES: Record<string, any> = {
  contacten: require('../../assets/icons/Contacten.png'),
  index: require('../../assets/icons/Check-in.png'),
  agenda: require('../../assets/icons/Agenda.png'),
  statistieken: require('../../assets/icons/Statistieken.png'),
};

export default function Layout() {
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setTheme(getTheme(savedTheme));
      }
    };
    loadTheme();
  }, []);

  // App now uses App.tsx for navigation. Keep a harmless fallback to avoid build errors.
  return null;
}
