import { COLORS, MOOD_OPTIONS, getTheme } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MOOD_ICON_SOURCES: Record<string, any> = {
  good: require('../../../../assets/icons/Goed.png'),
  okay: require('../../../../assets/icons/Minder goed.png'),
  bad: require('../../../../assets/icons/Niet goed.png'),
  crisis: require('../../../../assets/icons/Crisis.png'),
};
const DEFAULT_BY_MOOD: Record<string, string[]> = {
  good: ['Dansen', 'Wandelen', 'Muziek maken', 'Een boek lezen'],
  okay: ['Wandelen', 'Ademhalingsoefeningen doen', 'Ontspanningsmuziek luisteren', 'Mediteren'],
  bad: ['Ademhalingsoefeningen doen', 'Mediteren', 'Bellen met vrienden', 'Naar buiten gaan'],
  crisis: ['Bellen met vrienden', 'Huisdier knuffelen', 'Slapen', 'Bidden'],
};

const ACTIVITY_DESCRIPTIONS: Record<string, string> = {
  'Dansen': 'Dans op muziek die je fijn vindt',
  'Wandelen': 'Maak een wandeling in je eigen tempo en adem de frisse lucht in',
  'Muziek maken': 'Speel een instrument of zing om je stemming te verlichten',
  'Een boek lezen': 'Lees een boek om even te ontspannen en je gedachten te verzetten',
  'Ademhalingsoefeningen doen': 'Doe rustige ademhalingsoefeningen om te kalmeren',
  'Ontspanningsmuziek luisteren': 'Luister naar rustige muziek om te ontspannen',
  'Mediteren': 'Neem een paar minuten om te mediteren en je aandacht te herstellen',
  'Bellen met vrienden': 'Bel een vriend(in) of familielid voor een praatje',
  'Naar buiten gaan': 'Ga naar buiten en ervaar de natuur om je heen',
  'Huisdier knuffelen': 'Knuffel of aai je huisdier voor troost',
  'Slapen': 'Ga even liggen om te rusten of te slapen',
  'Bidden': 'Neem even de tijd om te bidden',
};

export default function ActivitiesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { mood } = (route.params || {}) as { mood: string };
  const [theme, setTheme] = useState(getTheme());
  const [activities, setActivities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const selectedMood = MOOD_OPTIONS.find((m) => m.id === mood);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) setTheme(getTheme(savedTheme));
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const saved = await AsyncStorage.getItem('copingActivities');
        const copingActivities = saved ? JSON.parse(saved) : {};
        const moodSuggestions: string[] = (copingActivities && copingActivities[mood as string]) || [];
        // limit suggestions to max 4
        setSuggestions(moodSuggestions.slice(0, 4));
        // default activities left-to-right
        const defaults = DEFAULT_BY_MOOD[mood as string] || [];
        setActivities(defaults);
      } catch (error) {
        console.error(error);
      }
    };
    loadActivities();
  }, [mood]);

  if (!selectedMood) {
    (navigation as any).goBack();
    return null;
  }

  const getMoodIconSource = (moodId: string) => MOOD_ICON_SOURCES[moodId] || MOOD_ICON_SOURCES.good;

  const handleDoActivity = async (activity: string) => {
    try {
      const moodNote = await AsyncStorage.getItem('tempMoodNote');

      const moodData = {
        mood: selectedMood.id,
        activity,
        note: moodNote || '',
        timestamp: new Date().toISOString(),
      };

      const existingMoods = (await AsyncStorage.getItem('moodCheckIns')) || '[]';
      const moods = JSON.parse(existingMoods);
      moods.push(moodData);
      await AsyncStorage.setItem('moodCheckIns', JSON.stringify(moods));

      const today = new Date().toDateString();
      await AsyncStorage.setItem('lastMoodCheckIn', today);

      await AsyncStorage.removeItem('tempMoodNote');

      // Navigate back to main tabs (check-in)
      (navigation as any).navigate('Main');
    } catch (error) {
      console.error(error);
    }
  };

  const handleActivityClick = async (activity: string) => {
    // Store the selected activity
    await AsyncStorage.setItem('selectedActivity', activity);
    
    // Navigate to activity details page
    (navigation as any).navigate('ActivityDetail', { mood: selectedMood.id, activity });
  };

  const handleSkip = async () => {
    try {
      const moodNote = await AsyncStorage.getItem('tempMoodNote');
      
      const moodData = {
        mood: selectedMood.id,
        note: moodNote || '',
        timestamp: new Date().toISOString(),
      };

      const existingMoods = await AsyncStorage.getItem('moodCheckIns') || '[]';
      const moods = JSON.parse(existingMoods);
      moods.push(moodData);
      await AsyncStorage.setItem('moodCheckIns', JSON.stringify(moods));

      const today = new Date().toDateString();
      await AsyncStorage.setItem('lastMoodCheckIn', today);

      // Clean up temp data
      await AsyncStorage.removeItem('tempMoodNote');

      (navigation as any).navigate('Main');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Icons */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../../../assets/icons/Profiel.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hoe voel je je?</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mood Card */}
        <View style={[styles.moodCard, { backgroundColor: selectedMood.bgColor }]}>
          <View style={[styles.moodIconCircle, { borderColor: selectedMood.color }]}>
            <Image
              source={getMoodIconSource(selectedMood.id)}
              style={{ width: 28, height: 28, tintColor: selectedMood.color }}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.moodCardTitle, { color: COLORS.foreground }]}>
            Ik voel me {selectedMood.label.toLowerCase()}
          </Text>
        </View>

        {/* Activities Section */}
        <View style={styles.activitiesSection}>
          <View style={styles.activitiesTitleContainer}>
            <Text style={styles.activitiesSectionTitle}>Dit kan je helpen</Text>
          </View>
          <Text style={styles.activitiesSubtitle}>Klik op een activiteit voor meer informatie</Text>

          {/* Default activities (vertical cards, max 4) */}
          {activities.slice(0, 4).map((activity, idx) => (
            <View key={`def-${idx}`}>
              <TouchableOpacity
                style={[styles.activityCard, selectedActivity === activity ? { borderColor: selectedMood.color, borderWidth: 2 } : {}]}
                onPress={() => setSelectedActivity(activity)}
              >
                <View style={[styles.activityIcon, { backgroundColor: selectedMood.color }]}>
                  <Image
                    source={getMoodIconSource(selectedMood.id)}
                    style={{ width: 24, height: 24, tintColor: COLORS.white }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.activityTitle}>{activity}</Text>
              </TouchableOpacity>

              {selectedActivity === activity && (
                <View style={styles.expandedCardWrapper}>
                  <View style={styles.expandedCard}>
                    <Text style={styles.expandedText}>{ACTIVITY_DESCRIPTIONS[activity] || 'Meer informatie over deze activiteit.'}</Text>
                    <TouchableOpacity style={[styles.primaryAction, { backgroundColor: selectedMood.color }]} onPress={() => handleDoActivity(activity)}>
                      <Text style={styles.primaryActionText}>Ik ga dit doen</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* User suggestions from onboarding */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Suggesties</Text>
              {suggestions.slice(0, 4).map((activity, index) => (
                <TouchableOpacity key={`sug-${index}`} style={[styles.activityCard]} onPress={() => handleDoActivity(activity)}>
                  <View style={[styles.activityIcon, { backgroundColor: selectedMood.color }]}>
                    <Image
                      source={getMoodIconSource(selectedMood.id)}
                      style={{ width: 24, height: 24, tintColor: COLORS.white }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.activityTitle}>{activity}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { borderColor: COLORS.foreground, borderWidth: 2, backgroundColor: 'transparent' }]}
          onPress={handleSkip}
        >
          <Text style={[styles.buttonText, { color: COLORS.foreground }]}>Overslaan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  moodCard: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  moodIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    marginBottom: 12,
  },
  moodCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  activitiesSection: {
    marginBottom: 20,
  },
  activitiesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  activitiesSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  activitiesSubtitle: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginBottom: 16,
  },
  horizontalList: {
    paddingVertical: 6,
    paddingBottom: 12,
    gap: 12,
  },
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityIconSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activityPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  suggestionsSection: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  expandedCardWrapper: {
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  expandedCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  expandedText: {
    fontSize: 14,
    color: COLORS.foreground,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryAction: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
