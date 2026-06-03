// expo-router removed. Navigation is handled in App.tsx via react-navigation.
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBar } from 'expo-status-bar';

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      {/* Placeholder layout; App.tsx contains the real navigation */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
