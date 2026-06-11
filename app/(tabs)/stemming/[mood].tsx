import { COLORS, MOOD_OPTIONS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const MOOD_ICON_SOURCES: Record<string, any> = {
  good: require('../../../assets/icons/Goed.png'),
  okay: require('../../../assets/icons/Minder goed.png'),
  bad: require('../../../assets/icons/Niet goed.png'),
  crisis: require('../../../assets/icons/Crisis.png'),
};

// Layout constants
const HEADER_HEIGHT = 120;
const CARD_MAX_WIDTH = 393;
const CARD_CONTENT_WIDTH = CARD_MAX_WIDTH - 48; // account for moodCard paddingHorizontal (24 * 2)
const FOOTER_BOTTOM = 140;

// previous constants removed to avoid redeclaration

export default function MoodCheckInScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { mood } = (route.params || {}) as { mood: string };
  const [moodNote, setMoodNote] = useState('');
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const theme = useAppTheme();

  const selectedMood = MOOD_OPTIONS.find((m) => m.id === mood);

  // theme handled by useAppTheme hook

  if (!selectedMood) {
    (navigation as any).goBack();
    return null;
  }

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('tempMoodNote', moodNote || '');
      Alert.alert('Debug', 'handleSave called — navigating...');
      const navAny: any = navigation;
      // First try to navigate within the current navigator
      try {
        console.log('Attempting navigation: navigation.navigate("Activiteiten")');
        (navigation as any).navigate('Activiteiten', { mood: selectedMood.id });
        Alert.alert('Debug', 'Tried navigation.navigate("Activiteiten")');
      } catch (err) {
        console.warn('navigation.navigate("Activiteiten") threw:', err);
      }

      const parent = navAny.getParent && navAny.getParent();
      // If parent is the tab navigator expose 'Check-in', deep navigate into it
      if (parent && typeof parent.getState === 'function') {
        try {
          const state = parent.getState();
          if (state && Array.isArray(state.routeNames) && state.routeNames.includes('Check-in')) {
            console.log('Parent has Check-in tab — navigating into it');
            Alert.alert('Debug', 'Parent has Check-in — navigating into Activiteiten');
            parent.navigate('Check-in', { screen: 'Activiteiten', params: { mood: selectedMood.id } });
          }
        } catch (err) {
          console.warn('parent navigation attempt failed', err);
        }
      }
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
      {/* Fixed header container */}
      <View style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
            <View style={styles.iconCircle}>
              <Image source={require('../../../assets/personage/langhaarbruin.png')} style={styles.iconImage} resizeMode="contain" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
            <View style={styles.iconCircle}>
              <Image source={require('../../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} resizeMode="contain" />
            </View>
          </TouchableOpacity>
        </View>

        {/* header title and back arrow intentionally removed to match design */}
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + THEME.sizes.tabBarHeight + 24 }]} showsVerticalScrollIndicator={false}>
          
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
              onFocus={() => setIsNoteFocused(true)}
              onBlur={() => setIsNoteFocused(false)}
              style={[
                  styles.noteInput,
                  (isNoteFocused || moodNote.trim() !== '') ? styles.noteInputFocus : null,
                    { minHeight: Platform.OS === 'web' ? 420 : 320, marginBottom: 8, width: CARD_CONTENT_WIDTH, alignSelf: 'center' },
              ]}
            />
          </View>
          
        </ScrollView>

        
      </KeyboardAvoidingView>
        {/* Footer overlay (single, matches onboarding) */}
        <View pointerEvents="box-none" style={[styles.fixedFooterWrap, { left: 0, right: 0, bottom: THEME.sizes.tabBarHeight, zIndex: 10005 }]}> 
          <View pointerEvents="box-none" style={{ width: '100%' }}>
            <View pointerEvents="box-none" style={[styles.footer, { backgroundColor: COLORS.white, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingHorizontal: 24, paddingTop: 12, paddingBottom: (insets.bottom || 0) + 12, gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border }]}> 
              <View style={{ width: '100%', paddingHorizontal: 0, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    width: CARD_CONTENT_WIDTH,
                    backgroundColor: selectedMood.color || theme.color || '#F8B34A',
                    paddingVertical: 16,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={handleSave}
                >
                  <Text style={styles.modalPrimaryText}>Ga verder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
    </SafeAreaView>
  );
}
// Note: floating pill restored below

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    width: 32,
    alignItems: 'center',
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
    tintColor: COLORS.foreground,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  floatingButton: {
    position: 'absolute',
    borderRadius: 28,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 22,
    zIndex: 10010,
    alignSelf: 'center',
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
  footerCard: {
    width: '100%',
    maxWidth: 393,
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
  fixedFooterWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: THEME.sizes.tabBarHeight,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
  },

  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    paddingHorizontal: 24,
    paddingTop: THEME.spacing.s,
    zIndex: 20,
  },

  scrollContent: {
    paddingTop: HEADER_HEIGHT + 12,
    paddingHorizontal: 24,
    alignItems: 'center',
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

  headerInner: {
    position: 'absolute',
    top: 136,
    left: THEME.spacing.m,
    right: THEME.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#F9F8FC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: THEME.spacing.m,
    minHeight: 180,
    fontSize: 14,
    color: COLORS.foreground,
    textAlignVertical: 'top',
  },
  noteInputFocus: {
    borderColor: '#6B5CE7',
    shadowColor: '#6B5CE7',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    // web focus outline
    outlineColor: '#6B5CE7' as any,
    outlineWidth: 1 as any,
    outlineStyle: 'solid' as any,
  },
  /* FOOTER */
  footer: {
    paddingHorizontal: THEME.spacing.m,
    paddingBottom: 24,
    paddingTop: 12,
  },
  modalPrimaryButton: { paddingVertical: 14, borderRadius: 20, backgroundColor: '#6B5CE7', justifyContent: 'center', alignItems: 'center', shadowColor: '#6B5CE7', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8, width: 160 },
  modalPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16, textAlign: 'center' },
});
