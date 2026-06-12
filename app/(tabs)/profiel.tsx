import { COLORS, THEME_COLORS, getTheme } from '@/constants/colors';
import themeConstants from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import HeadAvatar from '../components/HeadAvatar';
 
import applyShadow from '@/utils/shadow';

interface UserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

const BACKGROUNDS = [
  { id: 'butterfly', name: 'Vlinder', file: require('../../assets/images/butterfly-wild.jpg') },
  { id: 'grand-canyon', name: 'Grand Canyon', file: require('../../assets/images/grand-canyon-nature-footage-arizona-usa.jpg') },
  { id: 'trees-mountain', name: 'Bergbos', file: require('../../assets/images/green-yellow-trees-near-mountain-white-clouds-daytime.jpg') },
  { id: 'forest-path', name: 'Wandelpad', file: require('../../assets/images/green-yellow-trees-near-mountain-white-clouds-daytime.jpg') },
  { id: 'river-trees', name: 'Rivier', file: require('../../assets/images/river-trees.jpg') },
  { id: 'flowers-butterfly', name: 'Bloemen', file: require('../../assets/images/spring-scene-with-flowers-butterfly.jpg') },
  { id: 'lagoon', name: 'Lagune', file: require('../../assets/images/vertical-shot-beautiful-lagoon-surrounded-by-mossy-rocks-forest-skrad-croatia.jpg') },
  { id: 'mushroom', name: 'Paddenstoel', file: require('../../assets/images/vertical-shot-mushroom-growing-nature.jpg') },
  { id: 'narrow-path', name: 'Bospad', file: require('../../assets/images/vertical-shot-narrow-pathway-forest-with-lot-tall-green-trees.jpg') },
  { id: 'scotland-river', name: 'Schotland', file: require('../../assets/images/vertical-shot-river-surrounded-by-mountains-meadows-scotland.jpg') },
  { id: 'johnston-canyon', name: 'Canyon', file: require('../../assets/images/vertical-shot-small-river-johnston-canyon-massive.jpg') },
  { id: 'waterfall', name: 'Waterval', file: require('../../assets/images/waterfall-chae-son-national-park-lampang-thailand.jpg') },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const globalTheme = useAppTheme();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [selectedBackground, setSelectedBackground] = useState('butterfly');
  const [customBackgrounds, setCustomBackgrounds] = useState<{id:string; uri:string}[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const uiTheme = selectedTheme ? getTheme(selectedTheme) : globalTheme;

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return `rgba(99,84,255,${alpha})`;
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c+c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('user_data');
      if (saved) setUserData(JSON.parse(saved));

      const savedTheme = await AsyncStorage.getItem('appTheme');
      const savedBg = await AsyncStorage.getItem('homeBackground');
      const savedCustom = await AsyncStorage.getItem('customBackgrounds');

      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
      if (savedBg) setSelectedBackground(savedBg);
      const savedProfile = await AsyncStorage.getItem('profileImage');
      if (savedProfile) setProfileImage(savedProfile);
      if (savedCustom) {
        try {
          const parsed = JSON.parse(savedCustom);
          setCustomBackgrounds(Array.isArray(parsed) ? parsed : []);
        } catch { setCustomBackgrounds([]); }
      }
    } catch (e) {
      console.error(e);
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
      if (result && !result.cancelled) {
        const uri = (result as any).uri || (result as any).assets?.[0]?.uri;
        if (uri) {
          setProfileImage(uri);
          await AsyncStorage.setItem('profileImage', uri);
        }
      }
    } catch (e) {
      console.warn('[profiel] pick profile image error', e);
      alert('Kon de fotokeuze niet openen (image picker niet beschikbaar).');
    }
  };

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
      try { (await import('@/utils/theme-events')).emitThemeChange(); } catch (e) { /* ignore */ }
    } catch (e) {
      console.error(e);
    }
  };

  // Build grid: fixed order — plus tile, then built-in backgrounds (excluding the 3rd one per request), then custom backgrounds
  const removedBuiltInId = BACKGROUNDS[2]?.id; // third item (index 2)
  const builtInEntries = BACKGROUNDS
    .filter(b => b.id !== removedBuiltInId)
    .map(b => ({ id: b.id, file: b.file }));

  const customEntries = customBackgrounds.map(c => ({ id: c.id, file: { uri: c.uri } }));

  const displayBackgrounds = [
    { id: 'add' },
    ...builtInEntries,
    ...customEntries,
  ];

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
      if (result && !result.cancelled) {
        const newId = `custom-${Date.now()}`;
        const newEntry = { id: newId, uri: result.uri };
        const next = [newEntry, ...customBackgrounds];
        setCustomBackgrounds(next);
        await AsyncStorage.setItem('customBackgrounds', JSON.stringify(next));
        // set selected to the new custom background
        setSelectedBackground(newId);
        await AsyncStorage.setItem('homeBackground', newId);
        try { (await import('@/utils/theme-events')).emitThemeChange(); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      console.warn('[profiel] image picker error', e);
      alert('Kon de fotokeuze niet openen (image picker niet beschikbaar).');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.topIconsRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Profiel')}>
              <View style={styles.iconCircle}>
                <HeadAvatar style={styles.iconImage} />
              </View>
            </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => (navigation as any).navigate('Instellingen')}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: uiTheme.color }]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.pageHeader}>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Mijn Profiel</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* PROFILE CARD */}
        <View style={styles.cardProfile}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.profileEditBtn, { backgroundColor: hexToRgba(uiTheme.color, 0.08) }]}
            onPress={() => (navigation as any).navigate('Onboarding', { fromProfile: true, step: 'avatar' })}
          >
            <Image source={require('../../assets/icons/Aanpassen.png')} style={[styles.editIcon, { tintColor: uiTheme.color }]} />
          </TouchableOpacity>
          <View style={styles.profileSectionCard}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={handlePickProfileImage}>
                <View style={styles.avatarCircle}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                  ) : (
                    <HeadAvatar style={styles.avatarImage} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{userData?.firstName || 'Lot'}</Text>
          </View>
        </View>

        {/* APP KLEUR CARD */}
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

        {/* ACHTERGROND CARD */}
        <View style={styles.cardOption}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Achtergrond</Text>
            <View style={styles.bgGrid}>
              {displayBackgrounds.map((bg) => {
                if (bg.id === 'add') {
                  return (
                    <TouchableOpacity
                      key="add"
                      style={[styles.bgThumbWrapper, styles.addThumb]}
                      onPress={handleAddBackground}
                    >
                      <View style={styles.addInner}>
                        <Image source={require('../../assets/icons/Plus.png')} style={styles.addIcon} />
                      </View>
                    </TouchableOpacity>
                  );
                }

                const isSelected = selectedBackground === bg.id;
                const source = (bg as any).file ?? require('../../assets/images/butterfly-wild.jpg');
                return (
                  <TouchableOpacity
                    key={bg.id}
                    style={[
                      styles.bgThumbWrapper,
                      isSelected && styles.bgThumbWrapperSelected,
                    ]}
                    onPress={() => handleBackgroundChange(bg.id)}
                  >
                    <Image source={source} style={styles.bgThumbImage} />

                    {isSelected && (
                      <View style={styles.bgSelectedOverlay}>
                        <View style={styles.bgSelectedCircle}>
                                <Image source={require('../../assets/icons/Check.png')} style={[styles.bgCheckIcon, { tintColor: uiTheme.color }]} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginBottom: 6,
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

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    padding: 4,
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
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  

  iconImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
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

  titleWrap: { flex: 1, alignItems: 'flex-start' },

  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.foreground, textAlign: 'left' },

  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },

  content: { 
    paddingHorizontal: 24, 
    paddingTop: 0,
    paddingBottom: themeConstants.sizes.tabBarHeight + 32,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 22,
    marginBottom: 24,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardProfile: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 18,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...applyShadow({ opacity: 0.04, radius: 18, offsetX: 0, offsetY: 8, elevation: 4 }),
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

  profileSectionCard: {
    alignItems: 'center',
    marginBottom: 18,
    paddingTop: 6,
  },

  avatar: {
    // kept for backward-compat, inner circle uses avatarCircle
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 4,
  },

  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    /* no shadow: keep flat per visual spec */
  },

  avatarImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },

  profileEditBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },

  editIcon: { width: 18, height: 18, resizeMode: 'contain' },

  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.foreground,
    marginTop: 6,
  },

  sectionCard: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 12,
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
  addPlus: {
    // legacy: kept for reference
  },

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
});
