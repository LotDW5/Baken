import { COLORS, getTheme } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  time?: string;
  location?: string;
  notes?: string;
}

const STORAGE_KEY = 'calendar_events';

export default function AgendaScreen() {
  const navigation = useNavigation();
  const theme = useMemo(() => getTheme(), []);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={18} color={theme.color} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
            <View style={styles.iconCircle}>
              <Ionicons name="settings-outline" size={18} color={theme.color} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.subtitle}>Plan en beheer je afspraken</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{editingId ? 'Afspraak bewerken' : 'Nieuwe afspraak'}</Text>

          <Text style={styles.label}>Datum *</Text>
          <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.input} />

          <Text style={styles.label}>Titel *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Wat voor afspraak?" style={styles.input} />

          <Text style={styles.label}>Tijd</Text>
          <TextInput value={time} onChangeText={setTime} placeholder="HH:MM" style={styles.input} />

          <Text style={styles.label}>Locatie</Text>
          <TextInput value={location} onChangeText={setLocation} placeholder="Waar vindt het plaats?" style={styles.input} />

          <Text style={styles.label}>Notities</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Extra informatie..."
            style={[styles.input, styles.multiline]}
            multiline
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.color }]} onPress={handleSave}>
              <Text style={styles.actionButtonText}>Opslaan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
              <Text style={styles.secondaryButtonText}>Wissen</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Afspraken</Text>
          <Text style={styles.listMeta}>{sortedEvents.length} totaal</Text>
        </View>

        {sortedEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nog geen afspraken</Text>
            <Text style={styles.emptyText}>Voeg hierboven een afspraak toe.</Text>
          </View>
        ) : (
          sortedEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {!!event.time && <Text style={styles.eventMeta}>{event.time}</Text>}
                  {!!event.location && <Text style={styles.eventMeta}>{event.location}</Text>}
                  {!!event.notes && <Text style={styles.eventNotes}>{event.notes}</Text>}
                </View>

                <View style={styles.eventActions}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => {
                      setEditingId(event.id);
                      setDate(event.date);
                      setTitle(event.title);
                      setTime(event.time || '');
                      setLocation(event.location || '');
                      setNotes(event.notes || '');
                    }}
                  >
                    <Ionicons name="pencil-outline" size={16} color={theme.color} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.smallButton} onPress={() => handleDelete(event.id)}>
                    <Ionicons name="trash-outline" size={16} color="#E25772" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {Platform.OS === 'web' ? <Text style={styles.webHint}>Web-compatibele agenda actief.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconButton: {
    padding: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.foreground,
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
    borderRadius: 12,
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
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
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
});