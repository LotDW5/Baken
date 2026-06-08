import { COLORS, getTheme } from '@/constants/colors';
import themeConstants from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [theme] = useState(getTheme());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem('notifications_enabled');
    if (saved !== null) {
      setNotificationsEnabled(saved === 'true');
    }
    // nonverbal setting removed
  };

  const handleNotificationsChange = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notifications_enabled', String(value));
  };

  const settingsIcons = {
    nonverbal: require('../../assets/icons/Nonverbaal.png'),
    notifications: require('../../assets/icons/Notificaties.png'),
    help: require('../../assets/icons/Help.png'),
    adjust: require('../../assets/icons/Aanpassen.png'),
    reset: require('../../assets/icons/Reset.png'),
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.topIconsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Profiel.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.pageHeader}>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Instellingen</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* NONVERBAAL */}
        <TouchableOpacity style={styles.card} onPress={() => (navigation as any).navigate('Nonverbaal')}>
          <View style={styles.left}>
            <Image source={settingsIcons.nonverbal} style={[styles.rowIcon, { tintColor: theme.color }]} />
            <View>
              <Text style={styles.cardTitle}>Nonverbale modus</Text>
              <Text style={styles.cardSubtitle}>Communiceer via tekst</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* NOTIFICATIES */}
        <View style={styles.card}>
          <View style={styles.left}>
            <Image source={settingsIcons.notifications} style={[styles.rowIcon, { tintColor: theme.color }]} />
            <View>
              <Text style={styles.cardTitle}>Notificaties</Text>
              <Text style={styles.cardSubtitle}>Beheer je meldingen</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleNotificationsChange(!notificationsEnabled)}
            activeOpacity={0.9}
            style={[styles.webSwitch, notificationsEnabled && { backgroundColor: theme.color }]}
          >
            <View style={[styles.webSwitchThumb, notificationsEnabled && { transform: [{ translateX: 26 }] }]} />
          </TouchableOpacity>
        </View>

        {/* HELP & SUPPORT */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.left}>
            <Image source={settingsIcons.help} style={[styles.rowIcon, { tintColor: theme.color }]} />
            <View>
              <Text style={styles.cardTitle}>Help & Support</Text>
              <Text style={styles.cardSubtitle}>Krijg hulp bij de app</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ACTIVITEITEN AANPASSEN */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.left}>
            <Image source={settingsIcons.adjust} style={[styles.rowIcon, { tintColor: theme.color }]} />
            <View>
              <Text style={styles.cardTitle}>Activiteiten aanpassen</Text>
              <Text style={styles.cardSubtitle}>Pas je gekozen activiteiten per emotie aan</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* RESET APP */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.left}>
            <Image source={settingsIcons.reset} style={[styles.rowIcon, { tintColor: COLORS.destructive }]} />
            <View>
              <Text style={[styles.cardTitle, { color: COLORS.destructive }]}>
                Reset app
              </Text>
              <Text style={styles.cardSubtitle}>Wis alle gegevens en start opnieuw</Text>
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  topIconsRow: {
    position: 'absolute',
    top: 56,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },

  iconButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.foreground,
    textAlign: 'left',
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  pageHeader: {
    marginTop: 144,
    marginBottom: 24,
    paddingHorizontal: 24,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },

  titleWrap: { flex: 1, alignItems: 'flex-start' },

  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, textAlign: 'left' },

  content: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: themeConstants.sizes.tabBarHeight + 32,
    gap: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.foreground,
  },

  cardSubtitle: {
    fontSize: 13,
    color: COLORS.mutedForeground,
  },
  notificationToggle: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B5CE7',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  notificationToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  webSwitch: { width: 56, height: 28, borderRadius: 20, backgroundColor: '#E6E6E9', justifyContent: 'center', padding: 4 },
  webSwitchThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
});
