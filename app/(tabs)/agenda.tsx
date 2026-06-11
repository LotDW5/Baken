import { COLORS } from '@/constants/colors';
import useAppTheme from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  time?: string;
  location?: string;
  notes?: string;
  addToGoogle?: boolean;
}

const STORAGE_KEY = 'calendar_events';

export default function AgendaScreen() {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const scrollRef = useRef<any>(null);
  const [scrollY, setScrollY] = useState(0);
  const [buttonY, setButtonY] = useState<number | null>(null);
  const [buttonHeight, setButtonHeight] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [showFab, setShowFab] = useState(false);
  const [layoutTick, setLayoutTick] = useState(0);
  const hideTimerRef = useRef<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setEvents(JSON.parse(saved));
      } catch (error) {
        console.error(error);
      }
    };

    load();
    const unsubscribe = (navigation as any).addListener('focus', load);
    return () => unsubscribe();
  }, [navigation]);

  const save = async (nextEvents: CalendarEvent[]) => {
    setEvents(nextEvents);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
  };

  const resetForm = () => {
    setDate('');
    setTitle('');
    setTime('');
    setLocation('');
    setNotes('');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!date.trim() || !title.trim()) {
      Alert.alert('Oeps', 'Datum en titel zijn verplicht');
      return;
    }

    const nextEvent: CalendarEvent = {
      id: editingId ?? Date.now().toString(),
      date: date.trim(),
      title: title.trim(),
      time: time.trim(),
      location: location.trim(),
      notes: notes.trim(),
    };

    const nextEvents = editingId
      ? events.map((event) => (event.id === editingId ? nextEvent : event))
      : [...events, nextEvent];

    await save(nextEvents);
    resetForm();
  };

  const handleDelete = async (eventId: string) => {
    const nextEvents = events.filter((event) => event.id !== eventId);
    await save(nextEvents);
    if (editingId === eventId) resetForm();
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (a.date === b.date) return (a.time || '').localeCompare(b.time || '');
    return a.date.localeCompare(b.date);
  });

  // Calendar state & helpers
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const isoForDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const selectedDateString = () => (selectedDay ? isoForDay(selectedDay) : null);

  const onSelectDay = (d: Date) => {
    setSelectedDay(d);
    setDate(isoForDay(d));
  };

  useEffect(() => {
    setShowFab(events.length > 0);
  }, [events.length]);

  const calendarDays = (month: Date) => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(year, m, 1);
    const last = new Date(year, m + 1, 0);
    // Week starts Monday -> convert JS Sunday(0) to index 6
    const leading = (first.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < leading; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, m, d));
    // pad to full weeks
    while (days.length % 7 !== 0) days.push(null);
    return days;
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.pageTitle}>Mijn Agenda</Text>
        </View>
        {showFab && (
          <TouchableOpacity activeOpacity={0.9} style={styles.fabHeader} onPress={() => (navigation as any).navigate('NieuweAfspraak', { date: selectedDateString() })}>
            <View style={[styles.fabCircle, { backgroundColor: theme.color }]}>
              <Image source={require('../../assets/icons/Plus.png')} style={styles.fabIcon} />
            </View>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flex: 1 }} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
        >

        {/* Calendar card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={styles.chevButton}>
              <Ionicons name="chevron-back" size={20} color={theme.color} />
            </TouchableOpacity>

            <Text style={styles.calendarTitle}>{currentMonth.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}</Text>

            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={styles.chevButton}>
              <Ionicons name="chevron-forward" size={20} color={theme.color} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRow}>
            {['M', 'D', 'W', 'D', 'V', 'Z', 'Z'].map((d, i) => (
              <Text key={`${d}-${i}`} style={styles.weekDayLabel}>{d}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays(currentMonth).map((day, idx) => {
              const isEmpty = day === null;
              const isSelected = day && selectedDateString() === isoForDay(day);
              const hasEvent = !!(day && events.some(e => e.date === isoForDay(day)));

              return (
                <TouchableOpacity
                  key={`${String(day)}-${idx}`}
                  style={styles.dayCell}
                  activeOpacity={day ? 0.8 : 1}
                  onPress={() => day && onSelectDay(day)}
                >
                  {isEmpty ? <View /> : (
                    <View style={[styles.dayNumberWrap, isSelected && { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }]}>
                      <Text style={[styles.dayNumber, isSelected && { color: '#fff' }]}>{day.getDate()}</Text>
                      {hasEvent && !isSelected && (
                        <View style={[styles.eventDot, { backgroundColor: theme.color, left: 16, bottom: -5, position: 'absolute' }]} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected day section: date header + events for that day */}
        <View style={styles.daySection}>
          {selectedDay && (
            <>
              <Text style={styles.daySectionTitle}>{selectedDay.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>

              {(() => {
                const selectedEvents = sortedEvents.filter((e) => e.date === selectedDateString());
                // if there are no events for the selected day, show nothing (matches mock)
                if (selectedEvents.length === 0) return null;

                return selectedEvents.map((event) => (
                  <View key={event.id} style={styles.eventCardLarge}>
                    <View style={styles.eventRowLarge}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle}>{event.title}</Text>

                        {event.time ? (
                          <View style={styles.metaRow}>
                            <Ionicons name="time-outline" size={14} color={theme.color} />
                            <Text style={styles.eventMetaText}>{event.time}</Text>
                          </View>
                        ) : null}

                        {event.location ? (
                          <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={14} color={COLORS.mutedForeground} />
                            <Text style={styles.eventMetaText}>{event.location}</Text>
                          </View>
                        ) : null}

                        {event.notes ? (
                          <Text style={styles.eventNotesText}>{event.notes}</Text>
                        ) : null}
                        {event.addToGoogle ? (
                          <View style={styles.googleRow}>
                            <Ionicons name="calendar-outline" size={14} color={theme.color} />
                            <Text style={[styles.eventMetaText, { color: theme.color, marginLeft: 6 }]}>Toegevoegd aan Google kalender</Text>
                          </View>
                        ) : null}
                      </View>

                      <TouchableOpacity style={styles.editCircle} onPress={() => {
                        setEditingId(event.id);
                        (navigation as any).navigate('NieuweAfspraak', { event });
                      }}>
                        <Image source={require('../../assets/icons/Bewerken.png')} style={[styles.editIcon, { tintColor: theme.color }]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ));
              })()}
            </>
          )}
        </View>

          <View style={styles.centerButtonWrap}>
            <TouchableOpacity
              style={[styles.floatingButton, { backgroundColor: theme.color, position: 'relative' }]}
              onPress={() => (navigation as any).navigate('NieuweAfspraak', { date: selectedDateString() })}
              activeOpacity={0.9}
              onLayout={(e) => {
                setButtonY(e.nativeEvent.layout.y);
                setButtonHeight(e.nativeEvent.layout.height);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={require('../../assets/icons/Plus.png')} style={[styles.plusIcon, { tintColor: '#fff' }]} />
                <Text style={styles.floatingButtonText}>Nieuwe afspraak</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* absolute floating button removed; button now lives inside the content for visual parity with the mock */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
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
  titleWrap: {
    flex: 1,
    alignItems: 'flex-start',
  },
  iconButton: {
    padding: 4,
  },
        fabHeader: { position: 'absolute', right: 24, top: 0, bottom: 0, justifyContent: 'center', zIndex: 70 },
      fabCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
      fabIcon: { width: 18, height: 18, tintColor: '#fff', resizeMode: 'contain' },
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
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.foreground,
    textAlign: 'left',
    marginTop: 0,
    marginBottom: 0,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    color: COLORS.mutedForeground,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.foreground,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.foreground,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEAFB',
  },
  secondaryButtonText: {
    color: '#373743',
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 22,
    marginBottom: 10,
  },
  listMeta: {
    color: COLORS.mutedForeground,
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  emptyText: {
    marginTop: 4,
    color: COLORS.mutedForeground,
  },
  emptyCardSmall: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  daySection: {
    marginTop: 12,
    marginBottom: 12,
  },
  daySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 10,
    textTransform: 'lowercase',
  },
  eventCardLarge: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  eventRowLarge: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FAF9FD', justifyContent: 'center', alignItems: 'center' },
  editIcon: { width: 18, height: 18, resizeMode: 'contain' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  eventMetaText: { marginLeft: 6, color: COLORS.mutedForeground },
  plusIcon: { width: 18, height: 18, resizeMode: 'contain' },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0EDF9',
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.mutedForeground,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  eventNotesText: {
    marginTop: 8,
    color: COLORS.foreground,
  },
  googleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  eventMeta: {
    marginTop: 2,
    color: COLORS.mutedForeground,
  },
  eventNotes: {
    marginTop: 6,
    color: COLORS.foreground,
  },
  eventActions: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  smallButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF9FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webHint: {
    marginTop: 16,
    textAlign: 'center',
    color: COLORS.mutedForeground,
    fontSize: 12,
  },
  floatingButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 200,
    height: 52,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    zIndex: 20,
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
    textTransform: 'capitalize',
  },
  chevButton: {
    padding: 8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  weekDayLabel: {
    width: '14.2857%',
    textAlign: 'center',
    color: COLORS.mutedForeground,
    fontWeight: '700',
    fontSize: 12,
  },
  calendarGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dayNumber: {
    color: COLORS.foreground,
    fontWeight: '700',
    fontSize: 14,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  centerButtonWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});