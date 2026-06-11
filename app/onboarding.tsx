import { COLORS, THEME_COLORS, getTheme } from '@/constants/colors';
import useAppTheme from '@/hooks/use-app-theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

// primary color is provided by the global app theme

type OnboardingStep = 'welcome' | 'profile' | 'good' | 'okay' | 'bad' | 'crisis' | 'avatar';
// add theme selection step after avatar
type OnboardingStepExtended = OnboardingStep | 'theme';

const ACTIVITY_CATEGORIES = [
  {
    name: 'Zintuiglijke rust',
    activities: [
      { name: 'Een warme douche/ bad nemen', icon: require('../assets/icons/Water.png') },
      { name: 'Iemand knuffelen', icon: require('../assets/icons/Hart.png') },
      { name: 'Naar buiten gaan in de natuur', icon: require('../assets/icons/Bos.png') },
      { name: 'Muziek luisteren', icon: require('../assets/icons/Muziek.png') },
      { name: 'Een sigaret roken', icon: require('../assets/icons/Icon.png') }
    ]
  },
  {
    name: 'Mentale rust',
    activities: [
      { name: 'Een boek lezen', icon: require('../assets/icons/Boek.png') },
      { name: 'Serie of film kijken', icon: require('../assets/icons/TV.png') },
      { name: 'Podcast luisteren', icon: require('../assets/icons/Muziek-1.png') },
      { name: 'Mediteren', icon: require('../assets/icons/Sterren.png') },
      { name: 'Ademhalingsoefeningen', icon: require('../assets/icons/Wind.png') }
    ]
  },
  {
    name: 'Creatieve rust',
    activities: [
      { name: 'Tekenen of schilderen', icon: require('../assets/icons/Schilderen.png') },
      { name: 'Iets opschrijven', icon: require('../assets/icons/Schrijven.png') },
      { name: 'Muziek maken', icon: require('../assets/icons/Muziek.png') },
      { name: 'Breien of haken', icon: require('../assets/icons/Breien.png') },
      { name: 'Knutselen', icon: require('../assets/icons/Knutselen.png') }
    ]
  },
  {
    name: 'Fysieke rust',
    activities: [
      { name: 'Wandelen', icon: require('../assets/icons/Wandelen.png') },
      { name: 'Sporten', icon: require('../assets/icons/Sporten.png') },
      { name: 'Yoga doen', icon: require('../assets/icons/Yoga.png') },
      { name: 'Slapen of een dutje doen', icon: require('../assets/icons/Slapen.png') },
      { name: 'Dansen', icon: require('../assets/icons/Dansen.png') },
      { name: 'Tuinieren', icon: require('../assets/icons/Tuinieren.png') }
    ]
  },
  {
    name: 'Sociale rust',
    activities: [
      { name: 'Contact opnemen met vrienden', icon: require('../assets/icons/Contacten.png') },
      { name: 'Bellen met een vriend(in)', icon: require('../assets/icons/Bellen.png') },
      { name: 'Samen iets drinken', icon: require('../assets/icons/Drinken.png') },
      { name: 'Grapjes maken', icon: require('../assets/icons/Grappig.png') },
      { name: 'Huisdier knuffelen', icon: require('../assets/icons/Huisdier.png') },
      { name: 'Met dieren in contact komen', icon: require('../assets/icons/Dieren.png') },
      { name: 'Social media bekijken', icon: require('../assets/icons/Socials.png') }
    ]
  },
  {
    name: 'Afleiding & plezier',
    activities: [
      { name: 'Opruimen of schoonmaken', icon: require('../assets/icons/Schoonmaken.png') },
      { name: 'Spelletjes spelen', icon: require('../assets/icons/Spelen.png') },
      { name: 'Een buitenactiviteit doen', icon: require('../assets/icons/Buiten.png') },
      { name: 'Koken of bakken', icon: require('../assets/icons/Koken.png') }
    ]
  },
  {
    name: 'Structuur & veiligheid',
    activities: [
      { name: 'To-do lijst maken', icon: require('../assets/icons/To-do.png') },
      { name: 'Planning maken', icon: require('../assets/icons/Planning.png') },
      { name: 'Je routine volgen', icon: require('../assets/icons/Routine.png') },
      { name: 'Dagboek schrijven', icon: require('../assets/icons/Dagboek.png') }
    ]
  },
  {
    name: 'Spirituele rust',
    activities: [
      { name: 'Bidden', icon: require('../assets/icons/Bidden.png') },
      { name: 'Naar de kerk gaan', icon: require('../assets/icons/Kerk.png') },
      { name: 'In de natuur zijn', icon: require('../assets/icons/Natuur.png') }
    ]
  }
];

const MOOD_STEPS = [
  { id: 'good', title: 'Goed', color: '#4CAF93', bgColor: '#EAF8F0' },
  { id: 'okay', title: 'Minder goed', color: '#FFB84D', bgColor: '#FFF6EB' },
  { id: 'bad', title: 'Niet goed', color: '#9B8CE8', bgColor: '#F0EDF7' },
  { id: 'crisis', title: 'Crisis', color: '#E85D75', bgColor: '#FFF0F2' },
  { id: 'avatar', title: 'Personage', color: '#7C6FE2', bgColor: '#F4F2FF' }
];

const MOOD_ICONS: Record<string, any> = {
  good: require('../assets/icons/Goed.png'),
  okay: require('../assets/icons/Minder goed.png'),
  bad: require('../assets/icons/Niet goed.png'),
  crisis: require('../assets/icons/Crisis.png'),
};

const ONBOARD_BACKGROUNDS = [
  { id: 'butterfly', name: 'Vlinder', file: require('../assets/images/butterfly-wild.jpg') },
  { id: 'grand-canyon', name: 'Grand Canyon', file: require('../assets/images/grand-canyon-nature-footage-arizona-usa.jpg') },
  { id: 'trees-mountain', name: 'Bergbos', file: require('../assets/images/green-yellow-trees-near-mountain-white-clouds-daytime.jpg') },
  { id: 'forest-path', name: 'Wandelpad', file: require('../assets/images/green-yellow-trees-near-mountain-white-clouds-daytime.jpg') },
  { id: 'river-trees', name: 'Rivier', file: require('../assets/images/river-trees.jpg') },
  { id: 'flowers-butterfly', name: 'Bloemen', file: require('../assets/images/spring-scene-with-flowers-butterfly.jpg') },
  { id: 'lagoon', name: 'Lagune', file: require('../assets/images/vertical-shot-beautiful-lagoon-surrounded-by-mossy-rocks-forest-skrad-croatia.jpg') },
  { id: 'mushroom', name: 'Paddenstoel', file: require('../assets/images/vertical-shot-mushroom-growing-nature.jpg') },
  { id: 'narrow-path', name: 'Bospad', file: require('../assets/images/vertical-shot-narrow-pathway-forest-with-lot-tall-green-trees.jpg') },
  { id: 'scotland-river', name: 'Schotland', file: require('../assets/images/vertical-shot-river-surrounded-by-mountains-meadows-scotland.jpg') },
  { id: 'johnston-canyon', name: 'Canyon', file: require('../assets/images/vertical-shot-small-river-johnston-canyon-massive.jpg') },
  { id: 'waterfall', name: 'Waterval', file: require('../assets/images/waterfall-chae-son-national-park-lampang-thailand.jpg') },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const GRID_GAP = 10;
  // subtract 24px left + 24px right to keep cards 24px from edges
  const cardWidth = (screenWidth - 48 - GRID_GAP) / 2;
  const [currentStep, setCurrentStep] = useState<OnboardingStepExtended>('welcome');
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [selectedBackground, setSelectedBackground] = useState('butterfly');
  const [customBackgrounds, setCustomBackgrounds] = useState<{id:string; uri:string}[]>([]);
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
  const [isCustomFocused, setIsCustomFocused] = useState(false);
  const [editingCustom, setEditingCustom] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, string[]>>({
    good: [],
    okay: [],
    bad: [],
    crisis: []
  });

  // Avatar/personage assets
  const HEADS = [
    { name: 'Hoofd bruin', src: require('../assets/personage/hoofdbruin.png') },
    { name: 'Hoofd donker', src: require('../assets/personage/hoofddonker.png') },
    { name: 'Hoofd wit', src: require('../assets/personage/hoofdwit.png') },
  ];
  const SKIN_COLORS = ['#8B5F3C', '#5A3420', '#F0C8B3'];
  const HAIRS = [
    { name: 'Lang haar bruin', src: require('../assets/personage/langhaarbruin.png') },
    { name: 'Lang haar donker', src: require('../assets/personage/langhaardonker.png') },
    { name: 'Lang haar wit', src: require('../assets/personage/langhaarwit.png') },
  ];
  const TOPS = [
    { name: 'Bovenstuk 1', src: require('../assets/personage/bovenstuk1.png') },
    { name: 'Bovenstuk 2', src: require('../assets/personage/bovenstuk2.png') },
    { name: 'Bovenstuk 3', src: require('../assets/personage/bovenstuk3.png') },
  ];
  const BOTTOMS = [
    { name: 'Onderstuk 1', src: require('../assets/personage/onderstuk1.png') },
  ];
  const SHOES = [
    { name: 'Schoenen 1', src: require('../assets/personage/schoenen1.png') },
  ];

  const [headIndex, setHeadIndex] = useState(0);
  const [hairIndex, setHairIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoesIndex, setShoesIndex] = useState(0);
  const [activePart, setActivePart] = useState<string | null>(null);

  const cycle = (idx: number, max: number, delta: number) => {
    return (idx + delta + max) % max;
  };

  // Theme/background helpers (copied/adapted from profiel.tsx)
  const handleThemeChange = async (id: string) => {
    try {
      setSelectedTheme(id);
      await AsyncStorage.setItem('appTheme', id);
      try { (await import('@/utils/theme-events')).emitThemeChange(); } catch (e) { /* ignore */ }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackgroundChange = async (id: string) => {
    try {
      setSelectedBackground(id);
      await AsyncStorage.setItem('homeBackground', id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBackground = async () => {
    try {
      if (Platform.OS === 'web') {
        alert('Fotokeuze is niet beschikbaar in de webversie.');
        return;
      }
      // eslint-disable-next-line import/no-unresolved
      const ImagePicker = await import('expo-image-picker');
      const perm = ImagePicker.requestMediaLibraryPermissionsAsync ? await ImagePicker.requestMediaLibraryPermissionsAsync() : null;
      if (perm && perm.status !== 'granted') {
        alert("Toegang tot je foto's is nodig om een achtergrond te kiezen.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (result && !(result as any).cancelled) {
        const newId = `custom-${Date.now()}`;
        // support both shapes
        const uri = (result as any).uri || (result as any).assets?.[0]?.uri;
        const newEntry = { id: newId, uri };
        const next = [newEntry, ...customBackgrounds];
        setCustomBackgrounds(next);
        await AsyncStorage.setItem('customBackgrounds', JSON.stringify(next));
        // set selected to the new custom background
        setSelectedBackground(newId);
        await AsyncStorage.setItem('homeBackground', newId);
      }
    } catch (e) {
      console.warn('[onboarding] image picker error', e);
      alert('Kon de fotokeuze niet openen (image picker niet beschikbaar).');
    }
  };

  const handlePickProfileImage = async () => {
    try {
      if (Platform.OS === 'web') {
        alert('Fotokeuze is niet beschikbaar in de webversie.');
        return;
      }
      // eslint-disable-next-line import/no-unresolved
      const ImagePicker = await import('expo-image-picker');
      const perm = ImagePicker.requestMediaLibraryPermissionsAsync ? await ImagePicker.requestMediaLibraryPermissionsAsync() : null;
      if (perm && perm.status !== 'granted') {
        alert("Toegang tot je foto's is nodig om een profielfoto te kiezen.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (result && !(result as any).cancelled) {
        const uri = (result as any).uri || (result as any).assets?.[0]?.uri;
        if (uri) {
          setProfileImage(uri);
          await AsyncStorage.setItem('profileImage', uri);
        }
      }
    } catch (e) {
      console.warn('[onboarding] pick profile image error', e);
      alert('Kon de fotokeuze niet openen (image picker niet beschikbaar).');
    }
  };

  // load saved theme/background/custom backgrounds when onboarding mounts
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        const savedBg = await AsyncStorage.getItem('homeBackground');
        const savedProfileImage = await AsyncStorage.getItem('profileImage');
        const savedCustom = await AsyncStorage.getItem('customBackgrounds');
        if (savedTheme) setSelectedTheme(savedTheme);
        if (savedBg) setSelectedBackground(savedBg);
        if (savedProfileImage) setProfileImage(savedProfileImage);
        if (savedCustom) {
          try {
            const parsed = JSON.parse(savedCustom);
            setCustomBackgrounds(Array.isArray(parsed) ? parsed : []);
          } catch { setCustomBackgrounds([]); }
        }
      } catch (err) {
        console.warn('[onboarding] failed to load saved theme/background', err);
      }
    })();
  }, []);

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
      setCurrentStep('avatar');
    } else if (currentStep === 'avatar') {
      try {
        const nameParts = fullName.trim().split(/\s+/);

        // save selected avatar if any
        const avatarData = {
          head: HEADS?.[headIndex]?.name || null,
          hair: HAIRS?.[hairIndex]?.name || null,
          top: TOPS?.[topIndex]?.name || null,
          bottom: BOTTOMS?.[bottomIndex]?.name || null,
          shoes: SHOES?.[shoesIndex]?.name || null,
        };

        await AsyncStorage.setItem('user_data', JSON.stringify({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' '),
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
          avatar: avatarData,
        }));
        // persist theme and activities so profile picks them up
        await AsyncStorage.setItem('appTheme', selectedTheme);
        try { (await import('@/utils/theme-events')).emitThemeChange(); } catch (e) { /* ignore */ }
        await AsyncStorage.setItem('copingActivities', JSON.stringify(selectedActivities));

        // continue to theme selection step inside onboarding
        setCurrentStep('theme');
      } catch (error) {
        Alert.alert('Error', 'Er is iets misgegaan');
      }
    }
  };

  const finalizeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('appTheme', selectedTheme);
      try { (await import('@/utils/theme-events')).emitThemeChange(); } catch (e) { /* ignore */ }
      await AsyncStorage.setItem('homeBackground', selectedBackground);
      await AsyncStorage.setItem('customBackgrounds', JSON.stringify(customBackgrounds));
      await AsyncStorage.setItem('onboarding_completed', 'true');
      (navigation as any).reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      console.error('Failed to finalize onboarding', e);
      Alert.alert('Fout', 'Kon onboarding niet opslaan');
    }
  };

  const handleBack = () => {
    if (currentStep === 'profile') setCurrentStep('welcome');
    else if (currentStep === 'good') setCurrentStep('profile');
    else if (currentStep === 'okay') setCurrentStep('good');
    else if (currentStep === 'bad') setCurrentStep('okay');
    else if (currentStep === 'crisis') setCurrentStep('bad');
    else if (currentStep === 'avatar') setCurrentStep('crisis');
  };

  const handleSkipAvatar = async () => {
    try {
      const nameParts = fullName.trim().split(/\s+/);
      await AsyncStorage.setItem('user_data', JSON.stringify({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' '),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        avatar: null,
      }));
      await AsyncStorage.setItem('appTheme', selectedTheme);
      try { (await import('@/utils/theme-events')).emitThemeChange(); } catch (e) { /* ignore */ }
      await AsyncStorage.setItem('copingActivities', JSON.stringify(selectedActivities));
      // move to theme selection so user can pick color/background
      setCurrentStep('theme');
    } catch (error) {
      Alert.alert('Error', 'Er is iets misgegaan');
    }
  };

  const currentMood = MOOD_STEPS.find(m => m.id === currentStep);
  const progressStep = MOOD_STEPS.findIndex(m => m.id === currentStep) + 1;
  const MOOD_FOOTER_HEIGHT = 140;
  
  const canAddCustomActivity = customActivityName.trim().length > 0;
  // overlay positioning: use fixed on web to avoid parent overflow issues
  // Make the white overlay reach to the very bottom of the viewport on web
  const overlayPosition = Platform.OS === 'web'
    ? ({ position: 'fixed' as any, left: 0, right: 0, bottom: 0 })
    : ({ position: 'absolute' as any, left: 0, right: 0, bottom: insets.bottom });

  useEffect(() => {
    const requested = (route.params as any)?.step as OnboardingStep | undefined;
    if (requested && ['good', 'okay', 'bad', 'crisis', 'profile', 'welcome', 'avatar'].includes(requested)) {
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

  // Web-only: debug which elements set overflow:hidden and could block scrolling.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const els = Array.from(document.querySelectorAll('*'));
      const hidden = els.filter((e) => {
        const s = window.getComputedStyle(e as Element);
        return s.overflow === 'hidden' || s.overflowY === 'hidden' || s.overflowX === 'hidden' || s.overflow === 'clip';
      }).slice(0, 30).map((e) => {
        const s = window.getComputedStyle(e as Element);
        const r = (e as Element).getBoundingClientRect?.() || { top: 0, left: 0, width: 0, height: 0 };
        return {
          tag: (e as Element).tagName,
          id: (e as Element).id,
          className: (e as Element).className,
          overflow: `${s.overflow}/${s.overflowY}/${s.overflowX}`,
          rect: { top: Math.round(r.top), height: Math.round(r.height) },
        };
      });
      // verbose log for debugging in browser console
      // eslint-disable-next-line no-console
      console.log('[ONBOARDING DEBUG] overflow-hidden elements:', hidden);
      if (hidden.length === 0) {
        // eslint-disable-next-line no-console
        console.log('[ONBOARDING DEBUG] no overflow:hidden elements found');
      }

      // TEMP FIX: allow scrolling by setting body/html overflow to auto while onboarding mood screen is active
      try {
        const prevBody = document.body.style.overflow;
        const prevHtml = document.documentElement.style.overflow;
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        // eslint-disable-next-line no-console
        console.log('[ONBOARDING DEBUG] forced body/html overflow -> auto (prev:', prevBody, prevHtml, ')');
        return () => {
          document.body.style.overflow = prevBody || '';
          document.documentElement.style.overflow = prevHtml || '';
          // eslint-disable-next-line no-console
          console.log('[ONBOARDING DEBUG] restored body/html overflow (prev:', prevBody, prevHtml, ')');
        };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[ONBOARDING DEBUG] failed to force overflow:auto', err);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ONBOARDING DEBUG] error scanning DOM for overflow', err);
    }
  }, [currentStep]);

  if (currentStep === 'welcome') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.welcomeContainer}>
          <Image source={require('../assets/images/Logo 1.png')} style={styles.logo} />
          <Text style={styles.welcomeTitle}>Welkom!</Text>
          <Text style={styles.welcomeSubtitle}>Ontdek wat jou kan helpen om je goed te voelen.</Text>
        </View>
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.white,
            elevation: 0,
            shadowOpacity: 0,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowColor: 'transparent',
          }}
        >
          <View style={{ paddingHorizontal: 24, paddingBottom: (insets.bottom || 0) + 12, paddingTop: 8 }}>
            <TouchableOpacity
              style={{ backgroundColor: theme.color, borderRadius: 20, paddingVertical: 16, width: '100%', alignItems: 'center' }}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Beginnen</Text>
            </TouchableOpacity>
          </View>
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
                {/* Profile avatar intentionally hidden per design request */}
                <View style={{ height: 8 }} />

              <Text style={styles.profileTitle}>Welke naam wil je gebruiken?</Text>

              <View style={[styles.inputWrapper, { width: '100%' }, isProfileFocused ? { borderColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.08, shadowRadius: 8 } : null]}> 
                <TextInput
                  style={styles.input}
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.white,
            elevation: 0,
            shadowOpacity: 0,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowColor: 'transparent',
          }}
        >
          <View style={{ paddingHorizontal: 24, paddingBottom: (insets.bottom || 0) + 12, paddingTop: 8 }}>
            <TouchableOpacity
              style={{ backgroundColor: theme.color, borderRadius: 20, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 }}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Volgende</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderRadius: 20, paddingVertical: 14, width: '100%', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E0E0E0' }}
              onPress={handleBack}
            >
              <Text style={[styles.secondaryButtonText, { color: COLORS.foreground }]}>Terug</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      </SafeAreaView>
    );
  }

      if (currentStep === 'avatar') {
        return (
          <SafeAreaView style={styles.safeArea}>
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 0 }}>
              <View style={styles.pageHeaderOnboarding}>
                <View style={styles.titleWrapOnboarding}>
                  <Text style={styles.pageTitleOnboarding}>Maak jouw personage</Text>
                </View>
              </View>

              

              <View style={styles.avatarPreviewContainer}>
                <View style={styles.avatarPreviewInner}>
                  <Image source={BOTTOMS[bottomIndex].src} style={[styles.avatarBottomImage, { position: 'absolute' }]} resizeMode="contain" />
                  <Image source={TOPS[topIndex].src} style={[styles.avatarTopImage, { position: 'absolute' }]} resizeMode="contain" />
                  <View style={[styles.avatarSkinCircle, { backgroundColor: SKIN_COLORS[headIndex] }]} />
                  <Image source={HEADS[headIndex].src} style={[styles.avatarHeadImage, { position: 'absolute' }]} resizeMode="contain" />
                  <Image source={HAIRS[hairIndex].src} style={[styles.avatarHairImage, { position: 'absolute' }]} resizeMode="contain" />
                  <Image source={SHOES[shoesIndex].src} style={[styles.avatarShoesImage, { position: 'absolute' }]} resizeMode="contain" />
                  {/* chevrons around avatar parts */}
                  <TouchableOpacity
                    style={[styles.arrowButton, activePart === 'head' ? styles.arrowButtonActive : {}, { left: -24, top: 22 }]}
                    onPress={() => {
                      setHeadIndex(cycle(headIndex, HEADS.length, -1));
                      setActivePart('head');
                      setTimeout(() => setActivePart(null), 300);
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color={activePart === 'head' ? '#fff' : COLORS.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.arrowButton, activePart === 'head' ? styles.arrowButtonActive : {}, { right: -24, top: 22 }]}
                    onPress={() => {
                      setHeadIndex(cycle(headIndex, HEADS.length, 1));
                      setActivePart('head');
                      setTimeout(() => setActivePart(null), 300);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color={activePart === 'head' ? '#fff' : COLORS.mutedForeground} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.arrowButton, activePart === 'top' ? styles.arrowButtonActive : {}, { left: -24, top: 160 }]}
                    onPress={() => {
                      setTopIndex(cycle(topIndex, TOPS.length, -1));
                      setActivePart('top');
                      setTimeout(() => setActivePart(null), 300);
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color={activePart === 'top' ? '#fff' : COLORS.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.arrowButton, activePart === 'top' ? styles.arrowButtonActive : {}, { right: -24, top: 160 }]}
                    onPress={() => {
                      setTopIndex(cycle(topIndex, TOPS.length, 1));
                      setActivePart('top');
                      setTimeout(() => setActivePart(null), 300);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color={activePart === 'top' ? '#fff' : COLORS.mutedForeground} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.arrowButton, activePart === 'bottom' ? styles.arrowButtonActive : {}, { left: -24, top: 260 }]}
                    onPress={() => {
                      setBottomIndex(cycle(bottomIndex, BOTTOMS.length, -1));
                      setActivePart('bottom');
                      setTimeout(() => setActivePart(null), 300);
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color={activePart === 'bottom' ? '#fff' : COLORS.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.arrowButton, activePart === 'bottom' ? styles.arrowButtonActive : {}, { right: -24, top: 260 }]}
                    onPress={() => {
                      setBottomIndex(cycle(bottomIndex, BOTTOMS.length, 1));
                      setActivePart('bottom');
                      setTimeout(() => setActivePart(null), 300);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color={activePart === 'bottom' ? '#fff' : COLORS.mutedForeground} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.arrowButton, activePart === 'shoes' ? styles.arrowButtonActive : {}, { left: -24, top: 340 }]}
                    onPress={() => {
                      setShoesIndex(cycle(shoesIndex, SHOES.length, -1));
                      setActivePart('shoes');
                      setTimeout(() => setActivePart(null), 300);
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color={activePart === 'shoes' ? '#fff' : COLORS.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.arrowButton, activePart === 'shoes' ? styles.arrowButtonActive : {}, { right: -24, top: 340 }]}
                    onPress={() => {
                      setShoesIndex(cycle(shoesIndex, SHOES.length, 1));
                      setActivePart('shoes');
                      setTimeout(() => setActivePart(null), 300);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color={activePart === 'shoes' ? '#fff' : COLORS.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* footer buttons rendered in overlay to match other pages */}

            {/* avatar footer: place absolute at bottom matching profile spacing */}
            <View
              pointerEvents="box-none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: COLORS.white,
                elevation: 0,
                shadowOpacity: 0,
                shadowRadius: 0,
                shadowOffset: { width: 0, height: 0 },
                shadowColor: 'transparent',
              }}
            >
              <View style={{ paddingHorizontal: 24, paddingBottom: (insets.bottom || 0) + 12, paddingTop: 8 }}>
                <TouchableOpacity
                  style={{ backgroundColor: theme.color, borderRadius: 20, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 }}
                  onPress={handleNext}
                >
                  <Text style={styles.buttonText}>Opslaan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ borderRadius: 20, paddingVertical: 14, width: '100%', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E0E0E0' }}
                  onPress={handleSkipAvatar}
                >
                  <Text style={[styles.secondaryButtonText, { color: COLORS.foreground }]}>Overslaan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </SafeAreaView>
        );
      }

    // THEME selection step (inline screen similar to profiel background/color picker)
    if (currentStep === 'theme') {
      // build display backgrounds (add + builtins + customs)
      const removedBuiltInId = ONBOARD_BACKGROUNDS[2]?.id;
      const builtInEntries = ONBOARD_BACKGROUNDS.filter(b => b.id !== removedBuiltInId).map(b => ({ id: b.id, file: b.file }));
      const customEntries = customBackgrounds.map(c => ({ id: c.id, file: { uri: c.uri } }));
      const displayBackgrounds = [ { id: 'add' }, ...builtInEntries, ...customEntries ];

      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={{ flex: 1 }}>
            <View style={styles.pageHeaderOnboarding}>
              <View style={styles.titleWrapOnboarding}>
                <Text style={styles.pageTitleOnboarding}>Kies een kleur en achtergrond</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.cardOption}>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>App kleur</Text>
                  <View style={styles.colorGrid}>
                    {THEME_COLORS.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: t.bgColor },
                          selectedTheme === t.id && styles.colorSwatchSelected,
                        ]}
                        onPress={() => handleThemeChange(t.id)}
                      >
                        <View style={[styles.colorDot, { backgroundColor: t.color }]} />
                        {selectedTheme === t.id && (
                          <View style={styles.colorCheckBadge}>
                            <MaterialCommunityIcons name="check" size={18} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.cardOption}>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Achtergrond</Text>
                  <View style={styles.bgGrid}>
                    {displayBackgrounds.map((bg) => {
                      if (bg.id === 'add') {
                        return (
                          <TouchableOpacity key="add" style={[styles.bgThumbWrapper, styles.addThumb]} onPress={handleAddBackground}>
                            <View style={styles.addInner}>
                              <Image source={require('../assets/icons/Plus.png')} style={styles.addIcon} />
                            </View>
                          </TouchableOpacity>
                        );
                      }

                      const isSelected = selectedBackground === bg.id;
                      const source = (bg as any).file ?? ONBOARD_BACKGROUNDS[0].file;
                      return (
                        <TouchableOpacity key={bg.id} style={[styles.bgThumbWrapper, isSelected && styles.bgThumbWrapperSelected]} onPress={() => handleBackgroundChange(bg.id)}>
                          <Image source={source} style={styles.bgThumbImage} />
                          {isSelected && (
                            <View style={styles.bgSelectedOverlay}>
                              <View style={styles.bgSelectedCircle}>
                                <Image source={require('../assets/icons/Check.png')} style={[styles.bgCheckIcon, { tintColor: getTheme(selectedTheme).color }]} />
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View
              pointerEvents="box-none"
              style={{
                position: Platform.OS === 'web' ? ('fixed' as any) : ('absolute' as any),
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: COLORS.white,
                elevation: 0,
                shadowOpacity: 0,
                shadowRadius: 0,
                shadowOffset: { width: 0, height: 0 },
                shadowColor: 'transparent',
                zIndex: 9999,
              }}
            >
              <View style={{ paddingHorizontal: 24, paddingBottom: (insets.bottom || 0) + 12, paddingTop: 8 }}>
                <TouchableOpacity
                  style={{ backgroundColor: getTheme(selectedTheme).color, borderRadius: 20, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 }}
                  onPress={finalizeOnboarding}
                >
                  <Text style={styles.buttonText}>Opslaan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ borderRadius: 20, paddingVertical: 14, width: '100%', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E0E0E0' }}
                  onPress={finalizeOnboarding}
                >
                  <Text style={[styles.secondaryButtonText, { color: COLORS.foreground }]}>Overslaan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
                <View key={i} style={[styles.progressDot, { backgroundColor: i <= progressStep ? theme.color : '#E1DFE8' }]} />
              ))}
            </View>

            <ScrollView
              style={styles.moodScroll}
              contentContainerStyle={[styles.activitiesScroll, { flexGrow: 1, paddingBottom: isKeyboardVisible ? insets.bottom + 24 : insets.bottom + MOOD_FOOTER_HEIGHT + 24 }]}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <Image source={MOOD_ICONS[currentMood.id]} style={[styles.moodImage, { tintColor: currentMood.color, marginTop: 24 }]} resizeMode="contain" />
              <Text style={styles.moodTitle}>{currentMood.title}</Text>
              <Text style={styles.moodSubtitle}>{currentMood.id === 'okay' ? 'Kies activiteiten die je kunnen helpen om je weer wat beter te voelen' : currentMood.id === 'bad' ? 'Kies activiteiten die je kunnen helpen op momenten dat je je niet goed voelt' : currentMood.id === 'crisis' ? 'Kies activiteiten die je kunnen helpen in momenten van crisis' : 'Kies activiteiten waar je je doorgaans goed bij voelt'}</Text>

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
                              backgroundColor: isSelected ? currentMood.bgColor : COLORS.card,
                              borderColor: isSelected ? currentMood.color : COLORS.border,
                            }
                          ]}
                          onPress={() => handleActivityToggle(currentMood.id, activity.name)}
                        >
                          {typeof activity.icon === 'string' ? (
                            <Ionicons
                              name={activity.icon as any}
                              size={28}
                              color={isSelected ? currentMood.color : COLORS.mutedForeground}
                              style={styles.activityIcon}
                            />
                          ) : (
                            <Image source={activity.icon as any} style={[styles.activityIcon, { width: 28, height: 28, tintColor: isSelected ? currentMood.color : COLORS.mutedForeground }]} />
                          )}
                          <Text style={[styles.activityText, { color: isSelected ? currentMood.color : COLORS.foreground }]}>{activity.name}</Text>
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
                      <Text style={[styles.editButton, { color: theme.color }]}>{editingCustom ? 'Gereed' : 'Bewerken'}</Text>
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
                                backgroundColor: isSelected ? currentMood.bgColor : COLORS.card,
                                borderColor: isSelected ? currentMood.color : COLORS.border,
                              }
                            ]}
                            onPress={() => handleActivityToggle(currentMood.id, activityName)}
                          >
                            <Ionicons name="add-circle-outline" size={28} color={isSelected ? theme.color : COLORS.mutedForeground} style={styles.activityIcon} />
                            <Text style={[styles.activityText, { color: isSelected ? theme.color : COLORS.foreground }]}>{activityName}</Text>
                          </TouchableOpacity>

                          {editingCustom && (
                            <TouchableOpacity style={styles.removeCustomButton} onPress={() => handleRemoveCustomActivity(currentMood.id, activityName)}>
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
                    style={[styles.customActivityInput, (isCustomFocused || customActivityName.trim() !== '') ? ({ borderColor: theme.color, borderWidth: 1, outlineColor: theme.color as any, outlineWidth: 1 as any, outlineStyle: 'solid' as any } as any) : null]}
                    value={customActivityName}
                    onChangeText={setCustomActivityName}
                    placeholder="Typ een activiteit"
                    placeholderTextColor={COLORS.mutedForeground}
                    returnKeyType="done"
                    onSubmitEditing={handleAddCustomActivity}
                    onFocus={() => setIsCustomFocused(true)}
                    onBlur={() => setIsCustomFocused(false)}
                  />
                  <View style={styles.customActivityActions}>
                    <TouchableOpacity
                      style={[styles.customActivityAddButton, canAddCustomActivity ? { backgroundColor: theme.color } : { backgroundColor: 'rgba(107, 92, 231, 0.35)' }]}
                      onPress={handleAddCustomActivity}
                      disabled={!canAddCustomActivity}
                    >
                      <Text style={[styles.customActivityAddButtonText, canAddCustomActivity ? { color: theme.color } : styles.customActivityAddButtonTextDisabled]}>Toevoegen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.customActivityCancelButton} onPress={() => setShowCustomActivity(false)}>
                      <Text style={styles.customActivityCancelButtonText}>Annuleren</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.addActivityButton} onPress={() => setShowCustomActivity(true)}>
                <Ionicons name="add" size={18} color={theme.color} />
                <Text style={[styles.addActivityButtonText, { color: theme.color }]}>Voeg een activiteit toe</Text>
              </TouchableOpacity>

              {/* spacer removed — paddingBottom handles spacing for the fixed footer */}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* footer fixed outside KeyboardAvoidingView so keyboard doesn't push it up */}
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: COLORS.white }}>
          <View style={{ paddingHorizontal: 24, paddingBottom: (insets.bottom || 0) + 12, paddingTop: 8 }}>
            <TouchableOpacity style={{ backgroundColor: theme.color, borderRadius: 20, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 }} onPress={handleNext}>
              <Text style={styles.buttonText}>Ga verder</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ borderRadius: 20, paddingVertical: 14, width: '100%', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E0E0E0' }} onPress={handleBack}>
              <Text style={[styles.secondaryButtonText, { color: COLORS.foreground }]}>Terug</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginTop: -80,
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
    marginBottom: 4,
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
    borderColor: COLORS.border,
    borderWidth: 1,
    // web focus outline (cast to any to satisfy RN typings)
    outlineColor: 'transparent' as any,
    outlineWidth: 0 as any,
    outlineStyle: 'none' as any,
  },
  input: { backgroundColor: 'transparent', borderRadius: 20, borderWidth: 0, paddingHorizontal: 0, paddingVertical: 8, outlineWidth: 0, outlineColor: 'transparent', boxShadow: 'none', fontSize: 16, color: COLORS.foreground },
  inputWrapper: { backgroundColor: COLORS.inputBackground, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(107,92,231,0.06)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
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
    paddingHorizontal: 24,
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
    position: 'relative',
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
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    fontSize: 14,
    color: COLORS.foreground,
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
    gap: 10,
    backgroundColor: COLORS.background,
    zIndex: 10,
    elevation: 10,
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
    borderRadius: 20,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#000',
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
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.white,
  },
  logo: {
    width: 420,
    height: 420,
    resizeMode: 'contain',
    marginBottom: 2,
    alignSelf: 'center',
    marginTop: -12,
  },
  addActivityButton: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.foreground,
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
    borderColor: '#E0E0E0',
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
    backgroundColor: COLORS.background,
  },
  customActivityAddButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.06)',
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
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 15,
    alignItems: 'center',
  },
  customActivityCancelButtonText: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatarCircleOnboarding: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImageOnboarding: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarAddBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addIconSmall: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  avatarPreviewInner: {
    width: 120,
    height: 420,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  avatarImage: {
    width: 140,
    height: 520,
  },
  avatarHeadImage: {
    width: 110,
    height: 110,
    top: 6,
    alignSelf: 'center',
    zIndex: 6,
  },
  avatarHairImage: {
    width: 120,
    height: 110,
    top: 2,
    alignSelf: 'center',
    zIndex: 7,
  },
  avatarTopImage: {
    width: 120,
    height: 100,
    top: 120,
    alignSelf: 'center',
    zIndex: 4,
  },
  avatarBottomImage: {
    width: 120,
    height: 180,
    top: 220,
    alignSelf: 'center',
    zIndex: 3,
  },
  avatarShoesImage: {
    width: 120,
    height: 80,
    top: 360,
    alignSelf: 'center',
    zIndex: 8,
  },
  avatarSkinCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    zIndex: 3,
  },
  pageHeaderOnboarding: {
    marginTop: 144,
    marginBottom: 24,
    paddingHorizontal: 24,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  titleWrapOnboarding: { flex: 1, alignItems: 'flex-start' },
  pageTitleOnboarding: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, textAlign: 'left' },
  sectionCard: {
    marginBottom: 18,
  },

  cardOption: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 12,
  },

  content: { 
    paddingHorizontal: 24, 
    paddingTop: 0,
    paddingBottom: 160,
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 14,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E6E8EE',
    backgroundColor: '#F8F8FB',
  },
  colorSwatchSelected: {
    borderWidth: 2.5,
    borderColor: '#1F2230',
    backgroundColor: '#FBFAFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCheckBadge: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D2D3A',
    borderWidth: 2,
    borderColor: '#F5F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bgGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },

  bgThumbWrapper: {
    width: '32%',
    aspectRatio: 0.7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C9CCD4',
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },

  addThumb: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {},

  bgThumbWrapperSelected: {
    borderWidth: 1.5,
    borderColor: '#1F2230',
  },

  bgThumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    resizeMode: 'cover',
  },

  bgSelectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bgSelectedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCheckIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  addIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  arrowButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonActive: {
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarControls: {
    marginTop: 18,
    gap: 14,
  },
  avatarControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarPartLabel: {
    fontSize: 16,
    fontFamily: FONT_SEMIBOLD,
    color: COLORS.foreground,
  },
});
