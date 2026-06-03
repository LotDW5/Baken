import { COLORS, MOOD_OPTIONS, getTheme } from '@/constants/colors';
import THEME from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';

const MOOD_ICON_SOURCES: Record<string, any> = {
  good: require('../../../assets/icons/Goed.png'),
  okay: require('../../../assets/icons/Minder goed.png'),
  bad: require('../../../assets/icons/Niet goed.png'),
  crisis: require('../../../assets/icons/Crisis.png'),
};

// Layout constants to keep Figma spacing consistent across devices
const HEADER_HEIGHT = 160; // total reserved header area (icons + title)
const CARD_MAX_WIDTH = 393; // Figma card width
const FOOTER_BOTTOM = 80; // space reserved above bottom nav for CTA

export default function MoodCheckInScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mood } = (route.params || {}) as { mood: string };
  const [moodNote, setMoodNote] = useState('');
  const [theme, setTheme] = useState(getTheme());

  const selectedMood = MOOD_OPTIONS.find((m) => m.id === mood);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) setTheme(getTheme(savedTheme));
    };
    loadTheme();
  }, []);

  if (!selectedMood) {
    (navigation as any).goBack();
    return null;
  }

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('tempMoodNote', moodNote);
      (navigation as any).navigate('Activiteiten', { mood: selectedMood.id });
    } catch (error) {
      Alert.alert('Error', 'Er is iets misgegaan.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
            <Image
              source={require('../../../assets/icons/Terug.png')}
              style={{ width: 24, height: 24, tintColor: COLORS.foreground }}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Hoe voel je je?</Text>

          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Mood card */}
          <View style={[styles.moodCard, { backgroundColor: selectedMood.bgColor }]}>
            <Image
              source={MOOD_ICON_SOURCES[selectedMood.id]}
              style={{ width: 60, height: 60, tintColor: selectedMood.color }}
              resizeMode="contain"
            />
            <Text style={[styles.moodCardTitle, { color: COLORS.foreground }]}>
              Ik voel me {selectedMood.label.toLowerCase()}
            </Text>
          </View>

          {/* Note section */}
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Wil je er iets over vertellen? (optioneel)</Text>

            <TextInput
              value={moodNote}
              onChangeText={setMoodNote}
              multiline
              placeholder="Wat gebeurt er..."
              placeholderTextColor={COLORS.mutedForeground}
              style={styles.noteInput}
            />
          </View>
        </ScrollView>

        {/* Footer button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.color }]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Ga verder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.m,
    paddingVertical: 12,
    marginTop: THEME.spacing.s,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.foreground,
    flex: 1,
    textAlign: 'center',
  },

  /* CONTENT */
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: THEME.spacing.m,
    paddingTop: 24,
    paddingBottom: 24,
  },

  moodCard: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: THEME.spacing.m,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    width: '100%',
    maxWidth: 393,
  },
  moodCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },

  noteSection: {
    marginBottom: 28,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.foreground,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: THEME.spacing.m,
    minHeight: 100,
    fontSize: 14,
    color: COLORS.foreground,
    textAlignVertical: 'top',
  },

  /* FOOTER */
  footer: {
    paddingHorizontal: THEME.spacing.m,
    paddingBottom: 24,
    paddingTop: 12,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
