import { COLORS } from '@/constants/colors';
import themeConstants from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerShim from './DateTimePickerShim';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeDate, setTimeDate] = useState<Date>(new Date());
  const [dailyTime, setDailyTime] = useState<string>('');
  const [DateTimePickerComponent, setDateTimePickerComponent] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem('notifications_enabled');
    if (saved !== null) {
      setNotificationsEnabled(saved === 'true');
    }
    const savedTime = await AsyncStorage.getItem('daily_reminder_time');
    if (savedTime) setDailyTime(savedTime);
    // If notifications are enabled but no scheduled id exists, schedule it
    if (saved === 'true' && savedTime) {
      const existingId = await AsyncStorage.getItem('daily_reminder_notification_id');
      if (!existingId) {
        await scheduleDailyNotification(savedTime);
      }
    }
  };

  const handleNotificationsChange = async (value: boolean) => {
    // If enabling, ask what time user wants the daily reminder
    if (value) {
      const openPicker = async () => {
        if (Platform.OS === 'web') {
          const defaultValue = dailyTime || '';
          const v = prompt('Om hoelaat wil je elke dag een herinnering krijgen? (GG:MM)', defaultValue);
          if (v) {
            await AsyncStorage.setItem('daily_reminder_time', v);
            await AsyncStorage.setItem('notifications_enabled', 'true');
            setDailyTime(v);
            setNotificationsEnabled(true);
          }
        } else {
          // set initial time for picker from saved value if present
          if (dailyTime && /^\d{1,2}:\d{2}$/.test(dailyTime)) {
            const [hh, mm] = dailyTime.split(':').map(Number);
            const d = new Date();
            d.setHours(hh, mm, 0, 0);
            setTimeDate(d);
          } else {
            setTimeDate(new Date());
          }
          if (!DateTimePickerComponent) setDateTimePickerComponent(() => DateTimePickerShim);
          setShowTimePicker(true);
        }
      };

      // show a popup first
      Alert.alert(
        'Herinnering instellen',
        'Om hoelaat wil je elke dag een herinnering krijgen?',
        [
          { text: 'Annuleer', style: 'cancel', onPress: async () => {
            // do not enable
            await AsyncStorage.setItem('notifications_enabled', 'false');
            setNotificationsEnabled(false);
          }},
          { text: 'Kies tijd', onPress: openPicker },
        ],
        { cancelable: true }
      );
    } else {
      // disabling notifications
      setNotificationsEnabled(false);
      await AsyncStorage.setItem('notifications_enabled', 'false');
      const existingId = await AsyncStorage.getItem('daily_reminder_notification_id');
      if (existingId) {
        try {
          const Notifications = require('expo-notifications');
          await Notifications.cancelScheduledNotificationAsync(existingId);
        } catch (e) {
          // module not available (Expo Go) or cancellation failed
        }
        await AsyncStorage.removeItem('daily_reminder_notification_id');
      }
    }
  };

  const ensurePermissions = async () => {
    try {
      const Notifications = require('expo-notifications');
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const res = await Notifications.requestPermissionsAsync();
        return res.status === 'granted';
      }
      return true;
    } catch (e) {
      // expo-notifications not available in Expo Go; inform caller
      return false;
    }
  };

  const scheduleDailyNotification = async (timeStr: string) => {
    if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return null;
    const ok = await ensurePermissions();
    if (!ok) {
      Alert.alert('Notificaties niet beschikbaar', 'Notificaties zijn niet beschikbaar in deze omgeving. Bouw een development build om notificaties te testen.');
      return null;
    }
    const [hh, mm] = timeStr.split(':').map(Number);
    const content = {
      title: 'Check-in herinnering',
      body: 'Het is tijd om in te checken.',
      data: { screen: 'Home' },
    } as any;
    try {
      const Notifications = require('expo-notifications');
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { hour: hh, minute: mm, repeats: true },
      });
      await AsyncStorage.setItem('daily_reminder_notification_id', id);
      return id;
    } catch (e) {
      Alert.alert('Fout bij notificatie', 'Kon notificatie niet plannen.');
      return null;
    }
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
            <Image source={require('../../assets/personage/langhaarbruin.png')} style={styles.iconImage} />
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
        <TouchableOpacity style={styles.card} onPress={() => { const parent = (navigation as any).getParent && (navigation as any).getParent(); (parent || navigation).navigate('Nonverbaal'); }}>
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
              <Text style={styles.cardSubtitle}>Krijg één keer per dag een herinnering om in te checken</Text>
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
        <TouchableOpacity style={styles.card} onPress={() => (navigation as any).navigate('Onboarding', { step: 'good', fromSettings: true })}>
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
      {showTimePicker && Platform.OS !== 'web' && DateTimePickerComponent && (
        <DateTimePickerComponent
          value={timeDate}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={async (event: any, selectedDate?: Date) => {
            setShowTimePicker(false);
            if (selectedDate) {
              const hh = String(selectedDate.getHours()).padStart(2, '0');
              const mm = String(selectedDate.getMinutes()).padStart(2, '0');
              const v = `${hh}:${mm}`;
              await AsyncStorage.setItem('daily_reminder_time', v);
              await AsyncStorage.setItem('notifications_enabled', 'true');
              setDailyTime(v);
              setNotificationsEnabled(true);
              // schedule local notification
              await scheduleDailyNotification(v);
            } else {
              await AsyncStorage.setItem('notifications_enabled', 'false');
              setNotificationsEnabled(false);
            }
          }}
        />
      )}
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
    marginRight: 68,
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
    flexWrap: 'wrap',
    flex: 1,
  },
  notificationToggle: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
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
