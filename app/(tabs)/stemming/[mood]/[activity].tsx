import { COLORS, MOOD_OPTIONS, getTheme } from '@/constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ACTIVITY_DESCRIPTIONS: Record<string, string> = {
  'Een warme douche nemen': 'Neem een warme douche om te ontspannen en je lichaam tot rust te laten komen',
  'Een bad nemen': 'Neem een ontspannend bad om volledig tot rust te komen',
  'Ontspanningsmuziek luisteren': 'Luister naar rustige muziek die je helpt ontspannen',
  'Naar buiten gaan': 'Ga naar buiten en ervaar de natuur om je heen',
  'In het zonlicht zitten': 'Zit in het zonlicht om energie en rust te ervaren',
  'Iemand knuffelen': 'Geef iemand een knuffel voor verbinding en troost',
  'Een boek lezen': 'Lees een boek om je gedachten af te leiden en te ontspannen',
  'Serie of film kijken': 'Kijk een serie of film om even uit je hoofd te zijn',
  'Podcast luisteren': 'Luister naar een interessante of ontspannende podcast',
  'Mediteren': 'Mediteer om je gedachten tot rust te brengen',
  'Ademhalingsoefeningen doen': 'Doe rustige ademhalingsoefeningen om te kalmeren',
  'Tekenen of schilderen': 'Maak een tekening of schilderij zonder druk',
  'Iets opschrijven': 'Schrijf je gedachten, gevoelens of een verhaal op',
  'Muziek maken': 'Speel een instrument of zing een liedje',
  'Breien of haken': 'Werk aan een brei- of haakproject om je handen bezig te houden',
  'Knutselen': 'Maak iets creatiefs met je handen',
  'Wandelen': 'Ga een wandeling maken in je eigen tempo',
  'Yoga doen': 'Doe rustige yoga oefeningen om lichaam en geest te verbinden',
  'Stretchen': 'Stretch je lichaam om spanning los te laten',
  'Dansen': 'Dans op muziek die je fijn vindt',
  'Tuinieren': 'Werk in de tuin en verzorg planten',
  'Slapen': 'Ga even liggen om te rusten of te slapen',
  'Bellen met vrienden': 'Bel iemand die je vertrouwt voor een goed gesprek',
  'Samen iets drinken': 'Drink samen een kopje koffie of thee met iemand',
  'Huisdier knuffelen': 'Knuffel of aai je huisdier voor troost',
  'Social media bekijken': 'Scroll door social media als dat je helpt afleiding te vinden',
  'Een game spelen': 'Speel een game om je gedachten te verzetten',
  'Opruimen': 'Ruim je ruimte op om structuur te creëren',
  'Iets leuks kopen': 'Koop iets kleins dat je blij maakt',
  'Koken of bakken': 'Maak een lekker gerecht of bak iets lekkers',
  'To-do lijst maken': 'Schrijf op wat je wilt doen om overzicht te krijgen',
  'Planning maken': 'Plan je dag of week om structuur te vinden',
  'Je routine volgen': 'Doe de vaste dingen die je elke dag doet',
  'Dagboek schrijven': 'Schrijf in je dagboek over je dag of gevoelens',
  'Bidden': 'Neem even de tijd om te bidden',
  'Naar de kerk gaan': 'Bezoek de kerk of een andere gebedsruimte',
  'In de natuur zijn': 'Breng tijd door in de natuur voor spirituele rust',
  'Dankbaarheid oefenen': 'Denk na over waar je dankbaar voor bent',
};

export default function ActivityDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mood, activity } = (route.params || {}) as { mood: string; activity: string };
  const [theme, setTheme] = useState(getTheme());

  const selectedMood = MOOD_OPTIONS.find((m) => m.id === mood);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) setTheme(getTheme(savedTheme));
    };
    loadTheme();
  }, []);

  if (!selectedMood || !activity) {
    (navigation as any).goBack();
    return null;
  }

  const getMoodIcon = (moodId: string) => {
    const iconMap: Record<string, string> = {
      good: 'smiley',
      okay: 'smiley-neutral',
      bad: 'smiley-sad',
      crisis: 'alert-circle',
    };
    return iconMap[moodId] || 'smiley';
  };

  const handleSelectActivity = async () => {
    try {
      const moodNote = await AsyncStorage.getItem('tempMoodNote');
      
      const moodData = {
        mood: selectedMood.id,
        activity: activity,
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
      await AsyncStorage.removeItem('selectedActivity');

      (navigation as any).navigate('Main');
    } catch (error) {
      Alert.alert('Error', 'Er is iets misgegaan bij het opslaan.');
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
        <TouchableOpacity onPress={() => (navigation as any).goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hoe voel je je?</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mood Card */}
        <View style={[styles.moodCard, { backgroundColor: selectedMood.bgColor }]}>
          <MaterialCommunityIcons
            name={getMoodIcon(selectedMood.id) as any}
            size={60}
            color={selectedMood.color}
          />
          <Text style={[styles.moodLabel, { color: COLORS.foreground }]}>
            Ik voel me {selectedMood.label.toLowerCase()}
          </Text>
        </View>

        {/* Activities Section Header */}
        <View style={styles.activitiesTitleContainer}>
          <MaterialCommunityIcons name="star-outline" size={20} color={theme.color} />
          <Text style={styles.activitiesSectionTitle}>Dit kan je helpen</Text>
        </View>

        {/* Selected Activity Card */}
        <View style={[styles.selectedActivityCard, { borderColor: theme.color }]}>
          <View style={[styles.activityIcon, { backgroundColor: selectedMood.color }]}>
            <MaterialCommunityIcons name={getMoodIcon(selectedMood.id) as any} size={24} color={COLORS.white} />
          </View>
          <Text style={styles.selectedActivityTitle}>{activity}</Text>
        </View>

        {/* Activity Description */}
        <Text style={styles.descriptionText}>
          {ACTIVITY_DESCRIPTIONS[activity] || 'Activiteit'}
        </Text>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.color }]}
          onPress={handleSelectActivity}
        >
          <Text style={styles.primaryButtonText}>Ik ga dit doen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: COLORS.foreground }]}
          onPress={() => (navigation as any).goBack()}
        >
          <Text style={styles.secondaryButtonText}>Overslaan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  activitiesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  activitiesSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  selectedActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedActivityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    lineHeight: 20,
    marginBottom: 20,
  },
  footerButtons: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.foreground,
  },
});
