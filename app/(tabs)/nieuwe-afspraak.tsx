import { COLORS } from '@/constants/colors';
import themeConstants from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
// DateTimePicker is dynamically imported on native platforms to avoid web bundling issues
import useAppTheme from '@/hooks/use-app-theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Image,
    Linking, Platform, SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePickerShim from './DateTimePickerShim';
let Calendar: any = null;

const STORAGE_KEY = 'calendar_events';

export default function NieuweAfspraak() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [addToGoogle, setAddToGoogle] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeDate, setTimeDate] = useState<Date>(new Date());
  const [DateTimePickerComponent, setDateTimePickerComponent] = useState<any>(null);
  const [footerHeight, setFooterHeight] = useState<number>(0);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    // when editing an existing appointment, ensure the form scrolls up above the footer
    if (editingId) {
      // wait for layout to settle (footerHeight may be measured asynchronously)
      const t = setTimeout(() => {
        try {
          scrollRef.current?.scrollToEnd?.({ animated: true });
        } catch {
          // ignore
        }
      }, 120);
      return () => clearTimeout(t);
    }
  }, [editingId, footerHeight]);

  useEffect(() => {
    const params = (route.params as any) || {};
    const incomingDate = params.date || null;
    if (incomingDate) setDate(incomingDate);

    const incomingEvent = params.event || null;
    if (incomingEvent) {
      setEditingId(incomingEvent.id || null);
      setTitle(incomingEvent.title || '');
      setDate(incomingEvent.date || '');
      setTime(incomingEvent.time || '');
      setLocation(incomingEvent.location || '');
      setNotes(incomingEvent.notes || '');
      setAddToGoogle(!!incomingEvent.addToGoogle);
    } else {
      // Ensure when opening without an event we start a fresh new appointment
      setEditingId(null);
      setTitle('');
      // keep incoming date if present
      if (!incomingDate) setDate('');
      setTime('');
      setLocation('');
      setNotes('');
      setAddToGoogle(false);
    }
  }, [route.params]);

  const save = async () => {
    if (!date.trim() || !title.trim()) {
      Alert.alert('Oeps', 'Datum en titel zijn verplicht');
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      if (editingId) {
        const next = current.map((e: any) =>
          e.id === editingId
            ? { ...e, date: date.trim(), title: title.trim(), time: time.trim(), location: location.trim(), notes: notes.trim(), addToGoogle }
            : e
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        const next = [
          ...current,
          { id: Date.now().toString(), date: date.trim(), title: title.trim(), time: time.trim(), location: location.trim(), notes: notes.trim(), addToGoogle },
        ];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      // If user requested adding to calendar, try native calendar on devices, else fallback to Google Calendar URL
      if (addToGoogle) {
        if (Platform.OS !== 'web') {
          try {
            if (!Calendar) {
              Calendar = await import('expo-calendar');
            }
            // request permissions and create event
            const status = await Calendar.requestCalendarPermissionsAsync();
            if (status.granted) {
              // find default calendar
              const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT) || [];
              const defaultCalendar = (calendars.length > 0)
                ? (calendars.find((c: any) => c.allowsModifications) || calendars[0])
                : null;
              if (!defaultCalendar) {
                Alert.alert('Geen kalender', 'Er zijn geen beschikbare kalenders om het evenement aan toe te voegen.');
                return;
              }
              // create start/end
              let start: Date;
              let end: Date;
              if (time && /^(\d{1,2}):(\d{2})$/.test(time) && /\d{4}-\d{2}-\d{2}/.test(date)) {
                const [hh, mm] = time.split(':').map(Number);
                start = new Date(`${date}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`);
                end = new Date(start.getTime() + 60 * 60000);
              } else if (/\d{4}-\d{2}-\d{2}/.test(date)) {
                const parts = date.split('-').map(Number);
                start = new Date(parts[0], parts[1] - 1, parts[2]);
                end = new Date(parts[0], parts[1] - 1, parts[2] + 1);
              } else {
                start = new Date();
                end = new Date(start.getTime() + 60 * 60000);
              }
              await Calendar.createEventAsync(defaultCalendar.id, {
                title: title.trim(),
                startDate: start,
                endDate: end,
                timeZone: 'Europe/Amsterdam',
                location: location || undefined,
                notes: notes || undefined,
              });
            } else {
              // user denied permissions: turn off the toggle and return to the form
              setAddToGoogle(false);
              Alert.alert('Geen permissie', 'Geen permissie om agenda te wijzigen');
              return;
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Fout', 'Kon event niet toevoegen aan de agenda');
          }
        } else {
          const url = buildGoogleCalendarUrl(title.trim(), date.trim(), time || undefined, 60, notes || undefined, location || undefined);
          try {
            await Linking.openURL(url);
          } catch (err) {
            console.error(err);
            Alert.alert('Fout', 'Kon Google Calendar niet openen');
          }
        }
      }
      (navigation as any).navigate('Agenda');
    } catch (e) {
      console.error(e);
      Alert.alert('Fout', 'Kon afspraak niet opslaan');
    }
  };

  const buildGoogleCalendarUrl = (title: string, dateStr: string, timeStr?: string, durationMin = 60, details?: string, location?: string) => {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const text = `&text=${encodeURIComponent(title || '')}`;
    const detailsParam = details ? `&details=${encodeURIComponent(details)}` : '';
    const locationParam = location ? `&location=${encodeURIComponent(location)}` : '';
    let dates = '';
    try {
      if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr) && /\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const [hh, mm] = timeStr.split(':').map(Number);
        const start = new Date(`${dateStr}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`);
        const end = new Date(start.getTime() + durationMin * 60000);
        const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
        dates = `&dates=${fmt(start)}/${fmt(end)}`;
      } else if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        // all-day event: end is next day
        const parts = dateStr.split('-').map(Number);
        const y = parts[0], m = parts[1], d = parts[2];
        const start = `${String(y)}${String(m).padStart(2,'0')}${String(d).padStart(2,'0')}`;
        const next = new Date(y, m-1, d+1);
        const end = `${String(next.getFullYear())}${String(next.getMonth()+1).padStart(2,'0')}${String(next.getDate()).padStart(2,'0')}`;
        dates = `&dates=${start}/${end}`;
      }
    } catch {
      // ignore and leave dates empty
    }
    const ctz = '&ctz=Europe%2FAmsterdam';
    return `${base}${text}${dates}${detailsParam}${locationParam}${ctz}`;
  };

  const handleToggleGoogle = () => {
    setAddToGoogle((s) => !s);
  };

  const remove = async () => {
    if (!editingId) return;
    Alert.alert('Verwijderen', 'Weet je zeker dat je deze afspraak wilt verwijderen?', [
      { text: 'Annuleer', style: 'cancel' },
      {
        text: 'Verwijder',
        style: 'destructive',
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            const current = raw ? JSON.parse(raw) : [];
            const next = current.filter((e: any) => e.id !== editingId);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            (navigation as any).navigate('Agenda');
          } catch (err) {
            console.error(err);
            Alert.alert('Fout', 'Kon afspraak niet verwijderen');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formTopBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('Profiel')}
        >
            <View style={[styles.iconCircle, styles.iconCircleShadow]}>
            <Image source={require('../../assets/icons/Profiel.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (navigation as any).navigate('Instellingen')}
        >
            <View style={[styles.iconCircle, styles.iconCircleShadow]}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => { (navigation as any).goBack(); }} style={styles.backButton}>
          <Image source={require('../../assets/icons/Terug.png')} style={[styles.backIcon, { tintColor: COLORS.foreground }]} />
          <Text style={styles.formTitle}>{editingId ? 'Afspraak bewerken' : 'Nieuwe afspraak'}</Text>
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.formContent,
          { paddingBottom: insets.bottom + themeConstants.sizes.tabBarHeight + footerHeight - 31 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
          <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Titel</Text>
          <View style={[styles.inputWrapper, focusedField === 'title' ? { borderColor: theme.color } : null]}>
            <TextInput
              style={styles.input}
              placeholder="Wat voor afspraak?"
              value={title}
              onChangeText={setTitle}
                placeholderTextColor={'#AFAFC8'}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.rowInline}>
          <View style={[{ flex: 1 }, styles.inputGroup]}>
            <Text style={styles.inputLabel}>Datum</Text>
            <View style={[styles.inputWrapper, focusedField === 'date' ? { borderColor: theme.color } : null]}>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={'#AFAFC8'}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={[{ width: 140 }, styles.inputGroup]}>
            <Text style={styles.inputLabel}>Tijd</Text>
            <View style={[styles.inputWrapper, focusedField === 'time' ? { borderColor: theme.color } : null]}>
              <TouchableOpacity activeOpacity={0.8} onPress={async () => {
                // parse existing time if present
                if (time && /^(\d{1,2}):(\d{2})$/.test(time)) {
                  const [hh, mm] = time.split(':').map(Number);
                  const d = new Date();
                  d.setHours(hh, mm, 0, 0);
                  setTimeDate(d);
                } else {
                  setTimeDate(new Date());
                }
                if (Platform.OS === 'web') {
                  const defaultValue = time || '';
                  const v = prompt('Kies tijd (HH:MM)', defaultValue);
                  if (v) setTime(v);
                } else {
                  if (!DateTimePickerComponent) {
                    setDateTimePickerComponent(() => DateTimePickerShim);
                  }
                  setShowTimePicker(true);
                }
              }}>
                <Text style={styles.input}>{time || 'UU:MM'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {showTimePicker && Platform.OS !== 'web' && DateTimePickerComponent && (
          <DateTimePickerComponent
            value={timeDate}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event: any, selectedDate?: Date) => {
              setShowTimePicker(false);
              if (selectedDate) {
                const hh = String(selectedDate.getHours()).padStart(2, '0');
                const mm = String(selectedDate.getMinutes()).padStart(2, '0');
                setTime(`${hh}:${mm}`);
              }
            }}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Locatie</Text>
          <View style={[styles.inputWrapper, focusedField === 'location' ? { borderColor: theme.color } : null]}>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Waar vindt het plaats?"
              placeholderTextColor={'#AFAFC8'}
              onFocus={() => setFocusedField('location')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notities</Text>
          <View style={[styles.inputWrapper, focusedField === 'notes' ? { borderColor: theme.color } : null]}>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Extra informatie..."
              placeholderTextColor={'#AFAFC8'}
              multiline
              onFocus={() => setFocusedField('notes')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.favoriteRow}>
          <Text style={styles.inputLabel}>Toevoegen aan Google kalender</Text>
            <TouchableOpacity
            onPress={handleToggleGoogle}
            style={[
              styles.webSwitch,
              addToGoogle && {
                backgroundColor: theme.color,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              },
            ]}
          >
            <View style={[styles.webSwitchThumb, addToGoogle && { transform: [{ translateX: 30 }] }]} />
          </TouchableOpacity>
        </View>
      </ScrollView>

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + themeConstants.sizes.tabBarHeight - 31 }} pointerEvents="box-none">
          <View style={styles.formFooter} pointerEvents="auto" onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalPrimaryButton, { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, flex: 1 }]} onPress={save}>
                <Text style={styles.modalPrimaryText}>Opslaan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalSecondaryButton, { marginLeft: 12, flex: 1 }]} onPress={() => (navigation as any).navigate('Agenda')}>
                <Text style={styles.modalSecondaryText}>Annuleren</Text>
              </TouchableOpacity>
            </View>

            {editingId && (
              <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8} onPress={remove}>
                <Text style={styles.deleteButtonText}>Verwijder afspraak</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  container: { flex: 1, backgroundColor: COLORS.white },
  formTopBar: {
    position: 'absolute',
    top: 56,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  iconButton: { padding: 4 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  iconCircleShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconImage: { width: 20, height: 20, resizeMode: 'contain' },
  formHeader: {
    marginTop: 144,
    marginBottom: 24,
    paddingHorizontal: 24,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  /* removed divider to match Contacten spacing */
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'flex-start' },
  backIcon: { width: 20, height: 20, resizeMode: 'contain', marginTop: 2, marginRight: 0 },
  formTitle: { fontSize: 22, fontWeight: '700', color: COLORS.foreground },
  formContent: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 16, gap: 18 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.foreground },
  inputWrapper: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  input: { backgroundColor: 'transparent', borderRadius: 20, borderWidth: 0, paddingHorizontal: 0, paddingVertical: 8, outlineWidth: 0, outlineColor: 'transparent', boxShadow: 'none', fontSize: 16, color: COLORS.foreground },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  rowInline: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  favoriteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  webSwitch: { width: 56, height: 28, borderRadius: 20, backgroundColor: '#E6E6E9', justifyContent: 'center', padding: 4 },
  webSwitchThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  formFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    // ensure footer overlays content and hides it visually
    zIndex: 50,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  buttonRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  modalPrimaryButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  modalPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  modalSecondaryButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 0.5, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  modalSecondaryText: { textAlign: 'center', fontWeight: '600', color: '#2D2D3A', fontSize: 16 },
  deleteButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: '#FFE8ED', width: '100%', marginTop: 12, alignItems: 'center' },
  deleteButtonText: { textAlign: 'center', fontWeight: '700', color: '#E85D75', fontSize: 16 },
});
