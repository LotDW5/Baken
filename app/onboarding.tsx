import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FONT_REGULAR = Platform.select({
  web: 'Manrope, system-ui, sans-serif',
  default: 'sans-serif',
});

const FONT_SEMIBOLD = Platform.select({
  web: 'Manrope, system-ui, sans-serif',
  default: 'sans-serif',
});

const PRIMARY_COLOR = '#6B5CE7';

type OnboardingStep = 'welcome' | 'profile' | 'good' | 'okay' | 'bad' | 'crisis';

const ACTIVITY_CATEGORIES = [
  {
    name: 'Zintuiglijke rust',
    activities: [
      { name: 'Een warme douche nemen', icon: 'water' },
      { name: 'Een bad nemen', icon: 'water' },
      { name: 'Ontspanningsmuziek luisteren', icon: 'musical-notes' },
      { name: 'Naar buiten gaan', icon: 'leaf' },
      { name: 'In het zonlicht zitten', icon: 'sunny' },
      { name: 'Iemand knuffelen', icon: 'heart' }
    ]
  },
  {
    name: 'Mentale rust',
    activities: [
      { name: 'Een boek lezen', icon: 'book' },
      { name: 'Serie of film kijken', icon: 'film' },
      { name: 'Podcast luisteren', icon: 'ear' },
      { name: 'Mediteren', icon: 'flower' },
      { name: 'Ademhalingsoefeningen doen', icon: 'accessibility' }
    ]
  },
  {
    name: 'Creatieve rust',
    activities: [
      { name: 'Tekenen of schilderen', icon: 'brush' },
      { name: 'Iets opschrijven', icon: 'document-text' },
      { name: 'Muziek maken', icon: 'musical-note' },
      { name: 'Breien of haken', icon: 'create' },
      { name: 'Knutselen', icon: 'cut' }
    ]
  },
  {
    name: 'Fysieke rust',
    activities: [
      { name: 'Wandelen', icon: 'walk' },
      { name: 'Yoga doen', icon: 'body' },
      { name: 'Stretchen', icon: 'fitness' },
      { name: 'Dansen', icon: 'pulse' },
      { name: 'Tuinieren', icon: 'leaf' },
      { name: 'Slapen', icon: 'moon' }
    ]
  },
  {
    name: 'Sociale rust',
    activities: [
      { name: 'Bellen met vrienden', icon: 'call' },
      { name: 'Samen iets drinken', icon: 'cafe' },
      { name: 'Huisdier knuffelen', icon: 'paw' },
      { name: 'Social media bekijken', icon: 'logo-twitter' }
    ]
  },
  {
    name: 'Afleiding & plezier',
    activities: [
      { name: 'Een game spelen', icon: 'game-controller' },
      { name: 'Opruimen', icon: 'layers' },
      { name: 'Iets leuks kopen', icon: 'bag' },
      { name: 'Koken of bakken', icon: 'flame' }
    ]
  },
  {
    name: 'Structuur & veiligheid',
    activities: [
      { name: 'To-do lijst maken', icon: 'checkbox' },
      { name: 'Planning maken', icon: 'calendar' },
      { name: 'Je routine volgen', icon: 'repeat' },
      { name: 'Dagboek schrijven', icon: 'journal' }
    ]
  },
  {
    name: 'Spirituele rust',
    activities: [
      { name: 'Bidden', icon: 'hand-left' },
      { name: 'Naar de kerk gaan', icon: 'home' },
      { name: 'In de natuur zijn', icon: 'leaf' },
      { name: 'Dankbaarheid oefenen', icon: 'heart' }
    ]
  }
];

const MOOD_STEPS = [
  { id: 'good', title: 'Goed', color: '#4CAF93', bgColor: '#EAF8F0' },
  { id: 'okay', title: 'Als je je minder goed voelt', color: '#6B5CE7', bgColor: '#F0EDF7' },
  { id: 'bad', title: 'Als je je niet goed voelt', color: '#6B5CE7', bgColor: '#F0EDF7' },
  { id: 'crisis', title: 'Als je in crisis bent', color: '#6B5CE7', bgColor: '#F0EDF7' }
];

const MOOD_ICONS: Record<string, any> = {
  good: require('../assets/icons/Goed.png'),
  okay: require('../assets/icons/Minder goed.png'),
  bad: require('../assets/icons/Niet goed.png'),
  crisis: require('../assets/icons/Crisis.png'),
};

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const GRID_GAP = 10;
  const cardWidth = (screenWidth - 32 - GRID_GAP) / 2;
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [showCustomActivity, setShowCustomActivity] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isProfileFocused, setIsProfileFocused] = useState(false);
  const [customActivityName, setCustomActivityName] = useState('');
  const [customActivities, setCustomActivities] = useState<Record<string, string[]>>({
    good: [],
    okay: [],
    bad: [],
    crisis: [],
  });
  const [editingCustom, setEditingCustom] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, string[]>>({
    good: [],
    okay: [],
    bad: [],
    crisis: []
  });

  const handleActivityToggle = (moodId: string, activityName: string) => {
    setSelectedActivities(prev => ({
      ...prev,
      [moodId]: prev[moodId]?.includes(activityName)
        ? prev[moodId].filter(a => a !== activityName)
        : [...(prev[moodId] || []), activityName]
    }));
  };

  const handleAddCustomActivity = async () => {
    if (!currentMood) return;

    const trimmedName = customActivityName.trim();
    if (!trimmedName) return;

    setCustomActivities(prev => ({
      ...prev,
      [currentMood.id]: [...(prev[currentMood.id] || []), trimmedName],
    }));
    handleActivityToggle(currentMood.id, trimmedName);

    try {
      const saved = await AsyncStorage.getItem('copingActivities');
      const coping = saved ? JSON.parse(saved) : { good: [], okay: [], bad: [], crisis: [] };
      coping[currentMood.id] = coping[currentMood.id] || [];
      if (!coping[currentMood.id].includes(trimmedName)) {
        coping[currentMood.id].push(trimmedName);
      }
      await AsyncStorage.setItem('copingActivities', JSON.stringify(coping));
    } catch (error) {
      console.error('Failed to persist custom activity', error);
    }

    setCustomActivityName('');
    setShowCustomActivity(false);
  };

  const handleRemoveCustomActivity = async (moodId: string, activityName: string) => {
    // remove from local customActivities state
    setCustomActivities(prev => ({
      ...prev,
      [moodId]: (prev[moodId] || []).filter(a => a !== activityName),
    }));

    // remove from selectedActivities if present
    setSelectedActivities(prev => ({
      ...prev,
      [moodId]: (prev[moodId] || []).filter(a => a !== activityName),
    }));

    // persist removal to AsyncStorage
    try {
      const saved = await AsyncStorage.getItem('copingActivities');
      const coping = saved ? JSON.parse(saved) : { good: [], okay: [], bad: [], crisis: [] };
      coping[moodId] = (coping[moodId] || []).filter((a: string) => a !== activityName);
      await AsyncStorage.setItem('copingActivities', JSON.stringify(coping));
    } catch (error) {
      console.error('Failed to remove custom activity', error);
    }
  };

  const handleNext = async () => {
    if (currentStep === 'welcome') {
      setCurrentStep('profile');
    } else if (currentStep === 'profile') {
      if (!fullName.trim()) {
        Alert.alert('Oeps', 'Vul alstublieft je naam in');
        return;
      }
      setCurrentStep('good');
    } else if (currentStep === 'good') {
      setCurrentStep('okay');
    } else if (currentStep === 'okay') {
      setCurrentStep('bad');
    } else if (currentStep === 'bad') {
      setCurrentStep('crisis');
    } else if (currentStep === 'crisis') {
      try {
        const nameParts = fullName.trim().split(/\s+/);

        await AsyncStorage.setItem('user_data', JSON.stringify({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' '),
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
        }));
        await AsyncStorage.setItem('appTheme', selectedTheme);
        await AsyncStorage.setItem('copingActivities', JSON.stringify(selectedActivities));
        await AsyncStorage.setItem('onboarding_completed', 'true');
        (navigation as any).reset({ index: 0, routes: [{ name: 'Main' }] });
      } catch (error) {
        Alert.alert('Error', 'Er is iets misgegaan');
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'profile') setCurrentStep('welcome');
    else if (currentStep === 'good') setCurrentStep('profile');
    else if (currentStep === 'okay') setCurrentStep('good');
    else if (currentStep === 'bad') setCurrentStep('okay');
    else if (currentStep === 'crisis') setCurrentStep('bad');
  };

  const currentMood = MOOD_STEPS.find(m => m.id === currentStep);
  const progressStep = MOOD_STEPS.findIndex(m => m.id === currentStep) + 1;
  const canAddCustomActivity = customActivityName.trim().length > 0;

  useEffect(() => {
    const requested = (route.params as any)?.step as OnboardingStep | undefined;
    if (requested && ['good', 'okay', 'bad', 'crisis', 'profile', 'welcome'].includes(requested)) {
      setCurrentStep(requested as OnboardingStep);
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [route]);

  if (currentStep === 'welcome') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welkom!</Text>
          <Text style={styles.welcomeSubtitle}>Ontdek wat jou kan helpen om je goed te voelen.</Text>
        </View>
        <View style={[styles.footer, { position: 'absolute', left: 0, right: 0, bottom: 32, paddingHorizontal: 24, backgroundColor: COLORS.white }]}> 
          <TouchableOpacity style={[styles.button, { backgroundColor: PRIMARY_COLOR }]} onPress={handleNext}>
            <Text style={styles.buttonText}>Beginnen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentStep === 'profile') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <ScrollView contentContainerStyle={styles.profileScrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.profileSimpleContent}>
              <Text style={styles.profileTitle}>Welke naam wil je gebruiken?</Text>

              <TextInput
                style={[styles.profileInput, (isProfileFocused || fullName.trim() !== '') && styles.profileInputFocus]}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setIsProfileFocused(true)}
                onBlur={() => setIsProfileFocused(false)}
                placeholder="Je naam"
                placeholderTextColor={COLORS.mutedForeground}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </ScrollView>
          {!isKeyboardVisible && (
            <View style={[styles.footer, { position: 'absolute', left: 0, right: 0, bottom: 32, paddingHorizontal: 24, backgroundColor: COLORS.white }]}>
              <TouchableOpacity style={[styles.button, { backgroundColor: PRIMARY_COLOR }]} onPress={handleNext}>
                <Text style={styles.buttonText}>Volgende</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: '#E0E0E0', backgroundColor: COLORS.white }]} onPress={handleBack}>
                <Text style={[styles.secondaryButtonText, { color: COLORS.foreground }]}>Terug</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (currentMood && ['good', 'okay', 'bad', 'crisis'].includes(currentStep)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 18 : 0}
        >
        <View style={styles.moodScreen}>
          <View style={[styles.progressBar, { paddingTop: insets.top + 56 }]}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.progressDot, { backgroundColor: i <= progressStep ? PRIMARY_COLOR : '#E1DFE8' }]} />
            ))}
          </View>

          <ScrollView
            style={styles.moodScroll}
            contentContainerStyle={[styles.activitiesScroll, { paddingBottom: isKeyboardVisible ? insets.bottom + 24 : insets.bottom + 168 }]}
            keyboardShouldPersistTaps="handled"
          >
            <Image source={MOOD_ICONS[currentMood.id]} style={[styles.moodImage, { tintColor: currentMood.color, marginTop: 24 }]} resizeMode="contain" />
            <Text style={styles.moodTitle}>{currentMood.title}</Text>
            <Text style={styles.moodSubtitle}>Kies activiteiten waar je je doorgaans goed bij voelt</Text>

            {ACTIVITY_CATEGORIES.map((category) => (
              <View key={category.name}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <View style={styles.activityGrid}>
                  {category.activities.map((activity) => {
                    const isSelected = selectedActivities[currentMood.id]?.includes(activity.name);
                    return (
                      <TouchableOpacity
                        key={activity.name}
                        style={[
                          styles.activityButton,
                          { width: cardWidth },
                          {
                            backgroundColor: isSelected ? '#F0EDF7' : COLORS.card,
                            borderColor: isSelected ? PRIMARY_COLOR : COLORS.border,
                          }
                        ]}
                        onPress={() => handleActivityToggle(currentMood.id, activity.name)}
                      >
                              <Ionicons
                                name={activity.icon as any}
                                size={28}
                                color={isSelected ? PRIMARY_COLOR : COLORS.mutedForeground}
                                style={styles.activityIcon}
                              />
                        <Text
                          style={[
                            styles.activityText,
                            { color: isSelected ? PRIMARY_COLOR : COLORS.foreground }
                          ]}
                        >
                          {activity.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            {customActivities[currentMood.id]?.length > 0 && (
              <View>
                <View style={styles.categoryHeaderRow}>
                  <Text style={styles.categoryTitle}>Jouw activiteiten</Text>
                  <TouchableOpacity onPress={() => setEditingCustom(!editingCustom)}>
                    <Text style={styles.editButton}>{editingCustom ? 'Gereed' : 'Bewerken'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.customActivityGrid}>
                  {customActivities[currentMood.id].map((activityName) => {
                    const isSelected = selectedActivities[currentMood.id]?.includes(activityName);
                    return (
                      <View key={activityName} style={[styles.customPillContainer, { width: cardWidth }]}>
                        <TouchableOpacity
                          style={[
                            styles.activityButton,
                            styles.customActivityButton,
                            {
                              backgroundColor: isSelected ? '#F0EDF7' : COLORS.card,
                              borderColor: isSelected ? PRIMARY_COLOR : COLORS.border,
                            }
                          ]}
                          onPress={() => handleActivityToggle(currentMood.id, activityName)}
                        >
                          <Ionicons
                            name="add-circle-outline"
                            size={28}
                            color={isSelected ? PRIMARY_COLOR : COLORS.mutedForeground}
                            style={styles.activityIcon}
                          />
                          <Text
                            style={[
                              styles.activityText,
                              { color: isSelected ? PRIMARY_COLOR : COLORS.foreground }
                            ]}
                          >
                            {activityName}
                          </Text>
                        </TouchableOpacity>

                        {editingCustom && (
                          <TouchableOpacity
                            style={styles.removeCustomButton}
                            onPress={() => handleRemoveCustomActivity(currentMood.id, activityName)}
                          >
                            <Ionicons name="close" size={14} color={COLORS.foreground} />
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {showCustomActivity && (
              <View style={styles.customActivityCard}>
                <Text style={styles.customActivityLabel}>Nieuwe activiteit</Text>
                <TextInput
                  style={styles.customActivityInput}
                  value={customActivityName}
                  onChangeText={setCustomActivityName}
                  placeholder="Typ een activiteit"
                  placeholderTextColor={COLORS.mutedForeground}
                  returnKeyType="done"
                  onSubmitEditing={handleAddCustomActivity}
                />
                <View style={styles.customActivityActions}>
                  <TouchableOpacity
                    style={[
                      styles.customActivityAddButton,
                      canAddCustomActivity ? styles.customActivityAddButtonActive : styles.customActivityAddButtonDisabled,
                    ]}
                    onPress={handleAddCustomActivity}
                    disabled={!canAddCustomActivity}
                  >
                    <Text
                      style={[
                        styles.customActivityAddButtonText,
                        canAddCustomActivity ? styles.customActivityAddButtonTextActive : styles.customActivityAddButtonTextDisabled,
                      ]}
                    >
                      Toevoegen
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.customActivityCancelButton} onPress={() => setShowCustomActivity(false)}>
                    <Text style={styles.customActivityCancelButtonText}>Annuleren</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.addActivityButton} onPress={() => setShowCustomActivity(true)}>
              <Ionicons name="add" size={18} color={PRIMARY_COLOR} />
              <Text style={styles.addActivityButtonText}>Voeg een activiteit toe</Text>
            </TouchableOpacity>
          </ScrollView>

          {!isKeyboardVisible && (
            <View style={[styles.footer, { position: 'absolute', left: 0, right: 0, bottom: 32, paddingHorizontal: 24, backgroundColor: COLORS.white, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: -6 }, elevation: 6 }]}> 
              <TouchableOpacity style={[styles.button, { backgroundColor: PRIMARY_COLOR }]} onPress={handleNext}>
                <Text style={styles.buttonText}>Ga verder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: '#E0E0E0', backgroundColor: COLORS.white, marginTop: 12 }]} onPress={handleBack}>
                <Text style={[styles.secondaryButtonText, { color: COLORS.foreground }]}>Terug</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  profileSimpleContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: -16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.foreground,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: FONT_REGULAR,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  profileEmoji: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 26,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.foreground,
    textAlign: 'center',
    lineHeight: 34,
  },
  profileInput: {
    width: '100%',
    backgroundColor: '#F9F8FC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.foreground,
  },

  profileInputFocus: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    // web focus outline (cast to any to satisfy RN typings)
    outlineColor: PRIMARY_COLOR as any,
    outlineWidth: 1 as any,
    outlineStyle: 'solid' as any,
  },
  fullInput: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.foreground,
    minHeight: 52,
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 4,
    gap: 8,
  },
  progressDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  moodScreen: {
    flex: 1,
    paddingTop: 0,
  },
  moodScroll: {
    flex: 1,
  },
  moodImage: {
    width: 86,
    height: 86,
    alignSelf: 'center',
    marginBottom: 8,
  },
  moodTitle: {
    fontSize: 26,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.foreground,
    textAlign: 'center',
    marginBottom: 8,
  },
  moodSubtitle: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  activitiesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontFamily: FONT_SEMIBOLD,
  },
  categoryTitle: {
    fontSize: 13,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.foreground,
    marginBottom: 8,
    marginTop: 6,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  customActivityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  customPillContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 0,
  },
  removeCustomButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    zIndex: 10,
  },
  activityButton: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
  },
  customActivityButton: {
    width: '100%',
    minHeight: 100,
  },
  activityIcon: {
    marginBottom: 8,
  },
  activityText: {
    fontSize: 13,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: COLORS.background,
  },
  fixedFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: 'rgba(247, 245, 251, 0.98)',
    borderTopWidth: 1,
    borderRadius: 20,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#6B5CE7',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.white,
  },
  addActivityButton: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addActivityButtonText: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  customActivityCard: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 12,
  },
  customActivityLabel: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  customActivityInput: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.foreground,
  },
  customActivityActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  customActivityAddButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  customActivityAddButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  customActivityAddButtonDisabled: {
    backgroundColor: 'rgba(107, 92, 231, 0.35)',
  },
  customActivityAddButtonText: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
  },
  customActivityAddButtonTextActive: {
    color: COLORS.white,
  },
  customActivityAddButtonTextDisabled: {
    color: 'rgba(255,255,255,0.85)',
  },
  customActivityCancelButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    paddingVertical: 12,
    alignItems: 'center',
  },
  customActivityCancelButtonText: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
});
