import { COLORS, getTheme } from '@/constants/colors';
import applyShadow from '@/utils/shadow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
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
  };

  const handleNotificationsChange = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notifications_enabled', String(value));
  };

  const settingsIcons = {
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

      <View style={styles.titleRow}>
        <Text style={styles.headerTitle}>Instellingen</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* NOTIFICATIES */}
        <View style={styles.card}>
          <View style={styles.left}>
            <Image source={settingsIcons.notifications} style={[styles.rowIcon, { tintColor: theme.color }]} />
            <View>
              <Text style={styles.cardTitle}>Notificaties</Text>
              <Text style={styles.cardSubtitle}>Beheer je meldingen</Text>
            </View>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsChange}
            trackColor={{ false: COLORS.muted, true: theme.bgColor }}
            thumbColor={notificationsEnabled ? theme.color : COLORS.mutedForeground}
          />
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
    paddingTop: 144,
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
    ...applyShadow({ opacity: 0.18, radius: 12, offsetX: 0, offsetY: 4, elevation: 7 }),
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  titleRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
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
});
