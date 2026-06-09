import useAppTheme from '@/hooks/use-app-theme';
// expo-router removed — use App.tsx with react-navigation instead

const TAB_ICON_SIZE = 24;
const TAB_ICON_SOURCES: Record<string, any> = {
  contacten: require('../../assets/icons/Contacten.png'),
  index: require('../../assets/icons/Check-in.png'),
  agenda: require('../../assets/icons/Agenda.png'),
  statistieken: require('../../assets/icons/Statistieken.png'),
};

export default function Layout() {
  const theme = useAppTheme();

  // App now uses App.tsx for navigation. Keep a harmless fallback to avoid build errors.
  return null;
}
