import { COLORS, MOOD_OPTIONS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity, useWindowDimensions, View
} from 'react-native';

const MOOD_ICON_SOURCES: Record<string, any> = {
  good: require('../../../../assets/icons/Goed.png'),
  okay: require('../../../../assets/icons/Minder goed.png'),
  bad: require('../../../../assets/icons/Niet goed.png'),
  crisis: require('../../../../assets/icons/Crisis.png'),
};
const DEFAULT_BY_MOOD: Record<string, string[]> = {
  good: ['Dansen', 'Wandelen', 'Muziek maken', 'Een boek lezen'],
  okay: ['Wandelen', 'Ademhalingsoefeningen doen', 'Muziek luisteren', 'Mediteren'],
  bad: ['Ademhalingsoefeningen doen', 'Mediteren', 'Bellen met vrienden', 'Naar buiten gaan in de natuur'],

  crisis: ['Bellen met vrienden', 'Huisdier knuffelen', 'Slapen', 'Bidden'],
};

// Layout constants
const CARD_MAX_WIDTH = 393;
const CARD_CONTENT_WIDTH = CARD_MAX_WIDTH - 48;
const FOOTER_BOTTOM = 80;

const ACTIVITY_DESCRIPTIONS: Record<string, string> = {
  'Dansen': 'Dans op muziek die je fijn vindt',
  'Wandelen': 'Maak een wandeling in je eigen tempo en adem de frisse lucht in',
  'Muziek maken': 'Speel een instrument of zing om je stemming te verlichten',
  'Een boek lezen': 'Lees een boek om even te ontspannen en je gedachten te verzetten',
  'Ademhalingsoefeningen doen': 'Doe rustige ademhalingsoefeningen om te kalmeren',
  'Muziek luisteren': 'Luister naar rustige of favoriete muziek om te ontspannen',
  'Mediteren': 'Neem een paar minuten om te mediteren en je aandacht te herstellen',
  'Bellen met vrienden': 'Bel een vriend(in) of familielid voor een praatje',
  'Bellen met een vriend(in)': 'Bel een vriend(in) of familielid voor een praatje',
  'Naar buiten gaan in de natuur': 'Ga naar buiten en ervaar de natuur om je heen',
  'Samen iets drinken': 'Ga even samen iets drinken en praat bij',
  'Grapjes maken': 'Maak een grapje of lach samen om je stemming te verbeteren',
  'Met dieren in contact komen': 'Breng tijd door met dieren om rust en verbinding te ervaren',
  'Social media bekijken': 'Bekijk social media als dat je helpt afleiding te vinden',
  'Een sigaret roken': 'Roken kan ontspanning lijken, maar let op: het is schadelijk voor je gezondheid',
  'Huisdier knuffelen': 'Knuffel of aai je huisdier voor troost',
  'Slapen': 'Ga even liggen om te rusten of te slapen',
  'Bidden': 'Neem even de tijd om te bidden',
};

const ACTIVITY_ICON_SOURCES: Record<string, any> = {
  // From onboarding activity icons
  'Een warme douche/ bad nemen': require('../../../../assets/icons/Water.png'),
  'Iemand knuffelen': require('../../../../assets/icons/Hart.png'),
  'Naar buiten gaan in de natuur': require('../../../../assets/icons/Bos.png'),
  'Muziek luisteren': require('../../../../assets/icons/Muziek.png'),
  'Een sigaret roken': require('../../../../assets/icons/Icon.png'),

  'Een boek lezen': require('../../../../assets/icons/Boek.png'),
  'Serie of film kijken': require('../../../../assets/icons/TV.png'),
  'Podcast luisteren': require('../../../../assets/icons/Muziek-1.png'),
  'Mediteren': require('../../../../assets/icons/Sterren.png'),
  'Ademhalingsoefeningen': require('../../../../assets/icons/Wind.png'),
  'Ademhalingsoefeningen doen': require('../../../../assets/icons/Wind.png'),

  'Tekenen of schilderen': require('../../../../assets/icons/Schilderen.png'),
  'Iets opschrijven': require('../../../../assets/icons/Schrijven.png'),
  'Muziek maken': require('../../../../assets/icons/Muziek.png'),
  'Breien of haken': require('../../../../assets/icons/Breien.png'),
  'Knutselen': require('../../../../assets/icons/Knutselen.png'),

  'Wandelen': require('../../../../assets/icons/Wandelen.png'),
  'Sporten': require('../../../../assets/icons/Sporten.png'),
  'Yoga doen': require('../../../../assets/icons/Yoga.png'),
  'Slapen of een dutje doen': require('../../../../assets/icons/Slapen.png'),
  'Slapen': require('../../../../assets/icons/Slapen.png'),
  'Dansen': require('../../../../assets/icons/Dansen.png'),
  'Tuinieren': require('../../../../assets/icons/Tuinieren.png'),

  'Contact opnemen met vrienden': require('../../../../assets/icons/Contacten.png'),
  'Bellen met een vriend(in)': require('../../../../assets/icons/Bellen.png'),
  'Bellen met vrienden': require('../../../../assets/icons/Bellen.png'),
  'Samen iets drinken': require('../../../../assets/icons/Drinken.png'),
  'Grapjes maken': require('../../../../assets/icons/Grappig.png'),
  'Huisdier knuffelen': require('../../../../assets/icons/Huisdier.png'),
  'Met dieren in contact komen': require('../../../../assets/icons/Dieren.png'),
  'Social media bekijken': require('../../../../assets/icons/Socials.png'),

  'Opruimen of schoonmaken': require('../../../../assets/icons/Schoonmaken.png'),
  'Spelletjes spelen': require('../../../../assets/icons/Spelen.png'),
  'Een buitenactiviteit doen': require('../../../../assets/icons/Buiten.png'),
  'Koken of bakken': require('../../../../assets/icons/Koken.png'),

  'To-do lijst maken': require('../../../../assets/icons/To-do.png'),
  'Planning maken': require('../../../../assets/icons/Planning.png'),
  'Je routine volgen': require('../../../../assets/icons/Routine.png'),
  'Dagboek schrijven': require('../../../../assets/icons/Dagboek.png'),

  'Bidden': require('../../../../assets/icons/Bidden.png'),
  'Naar de kerk gaan': require('../../../../assets/icons/Kerk.png'),
  'In de natuur zijn': require('../../../../assets/icons/Natuur.png'),
};

export default function ActivitiesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { mood } = (route.params || {}) as { mood: string };
  const theme = useAppTheme();
  const [activities, setActivities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const selectedMood = MOOD_OPTIONS.find((m) => m.id === mood);

  // theme handled by useAppTheme
  const { width: screenWidth } = useWindowDimensions();
  const GRID_GAP = 10;
  const cardWidth = Math.min(CARD_MAX_WIDTH, (screenWidth - 48 - GRID_GAP) / 2);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const saved = await AsyncStorage.getItem('copingActivities');
        const copingActivities = saved ? JSON.parse(saved) : {};
        const moodSuggestions: string[] = (copingActivities && copingActivities[mood as string]) || [];
        // pick up to 4 random suggestions from onboarding selections for this mood
        const pickRandom = (arr: string[], n: number) => {
          const a = [...arr];
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a.slice(0, n);
        };

        let chosen: string[] = [];
        if ((moodSuggestions || []).length > 0) {
          chosen = pickRandom(moodSuggestions, 4);
        }
        // fill with defaults if less than 4
        const defaults = DEFAULT_BY_MOOD[mood as string] || [];
        let fillIdx = 0;
        while (chosen.length < 4 && fillIdx < defaults.length) {
          const candidate = defaults[fillIdx++];
          if (!chosen.includes(candidate)) chosen.push(candidate);
        }
        setSuggestions(chosen);
        // default activities left-to-right
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

      // Navigate back to Check-in tab (try parent/tab navigator, then fallbacks)
      try {
        const parent = (navigation as any).getParent?.();
        const grandParent = parent && typeof (parent.getParent) === 'function' ? parent.getParent() : null;
        if (grandParent && typeof grandParent.navigate === 'function') {
          grandParent.navigate('Check-in', { screen: 'Home' });
        } else if (parent && typeof parent.navigate === 'function') {
          parent.navigate('Check-in', { screen: 'Home' });
        } else if ((navigation as any).navigate) {
          (navigation as any).navigate('Check-in', { screen: 'Home' });
        } else if ((navigation as any).goBack) {
          (navigation as any).goBack();
        }
      } catch (navErr) {
        console.error('Navigation fallback failed', navErr);
        try { (navigation as any).goBack?.(); } catch (e) { /* ignore */ }
      }
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

      try {
        const parent = (navigation as any).getParent?.();
        const grandParent = parent && typeof (parent.getParent) === 'function' ? parent.getParent() : null;
        if (grandParent && typeof grandParent.navigate === 'function') {
          grandParent.navigate('Check-in', { screen: 'Home' });
        } else if (parent && typeof parent.navigate === 'function') {
          parent.navigate('Check-in', { screen: 'Home' });
        } else if ((navigation as any).navigate) {
          (navigation as any).navigate('Check-in', { screen: 'Home' });
        } else if ((navigation as any).goBack) {
          (navigation as any).goBack();
        }
      } catch (navErr) {
        console.error('Navigation fallback failed', navErr);
        try { (navigation as any).goBack?.(); } catch (e) { /* ignore */ }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleContinue = async () => {
    if (selectedActivity) {
      await handleDoActivity(selectedActivity);
    } else {
      await handleSkip();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header container with top icons and title below */}
      <View style={styles.headerContainer} pointerEvents="box-none">
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

        <View style={styles.headerInner} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: FOOTER_BOTTOM }]} showsVerticalScrollIndicator={false}>
        {/* mood card sits directly under header (no extra page title) */}

        {/* Mood Card styled like Contacten's empty card */}
        <View style={[styles.moodCard, { backgroundColor: selectedMood.bgColor }]}> 
          <Image
            source={getMoodIconSource(selectedMood.id)}
            style={{ width: 60, height: 60, tintColor: selectedMood.color }}
            resizeMode="contain"
          />
          <Text style={[styles.moodCardTitle, { color: COLORS.foreground }]}>Ik voel me {selectedMood.label.toLowerCase()}</Text>
        </View>

        {/* Activities Section */}
        <View style={styles.activitiesSection}>
          <View style={styles.activitiesTitleContainer}>
            <Text style={styles.activitiesSectionTitle}>Kies een activiteit die je kan helpen</Text>
          </View>

          {/* Show exactly 4 activities chosen from onboarding (or defaults filled) */}
          {suggestions.slice(0, 4).map((activity, idx) => (
            <View key={`sug-${idx}`}>
              <TouchableOpacity
                  style={[styles.activityCard, selectedActivity === activity ? { borderColor: selectedMood.color, borderWidth: 2 } : {}]}
                  onPress={() => setSelectedActivity(activity)}
              >
                  <View style={[styles.activityIcon, { backgroundColor: selectedMood.color }]}> 
                    <Image
                      source={ACTIVITY_ICON_SOURCES[activity] || getMoodIconSource(selectedMood.id)}
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
        </View>
      </ScrollView>

      {/* Footer overlay anchored above the bottom tab bar to match MoodCheckIn (fixed) */}
      <View pointerEvents="box-none" style={styles.fixedFooterWrap}>
        <View style={[styles.footerCard, { backgroundColor: COLORS.white, borderTopWidth: 1, borderColor: '#E0E0E0', paddingTop: 18, paddingBottom: 18, alignItems: 'center' }]}>
          <TouchableOpacity
            style={{ width: '100%', maxWidth: CARD_MAX_WIDTH, paddingVertical: 18, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
            onPress={handleSkip}
          >
            <Text style={{ color: COLORS.foreground, fontWeight: '700', fontSize: 16 }}>Overslaan</Text>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
      );
    }

  const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    paddingTop: 144,
    paddingBottom: THEME.sizes.tabBarHeight + 48,
  },
  moodCard: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 24,
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: THEME.spacing.m,
    paddingTop: THEME.spacing.s,
    zIndex: 20,
  },
  headerInner: {
    position: 'absolute',
    top: 136,
    left: THEME.spacing.m,
    right: THEME.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.foreground,
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
    textAlign: 'left',
  },
  primaryAction: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
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
  overlayFooterWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    zIndex: 999999,
  },
  footerFullWidth: {
    width: '100%',
  },
  fixedFooterWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 10050,
    elevation: 50,
  },
  footerCard: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  modalPrimaryButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: '#6B5CE7', justifyContent: 'center', alignItems: 'center', shadowColor: '#6B5CE7', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8, width: 160 },
  modalPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
