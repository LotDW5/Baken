import { COLORS, THEME_COLORS, getTheme } from '@/constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// eslint-disable-next-line import/no-named-as-default
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
  { id: 'forest-path', name: 'Wandelpad', file: require('../../assets/images/nature-journey-travel-trekking-summertime-concept-vertical-shot-pathway-park-leading-forested-area-outdoor-view-wooden-boardwalk-along-tall-pine-trees-morning-forest.jpg') },
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
  const [theme, setTheme] = useState(getTheme());
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [selectedBackground, setSelectedBackground] = useState('butterfly');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('user_data');
      if (saved) setUserData(JSON.parse(saved));

      const savedTheme = await AsyncStorage.getItem('appTheme');
      const savedBg = await AsyncStorage.getItem('homeBackground');

      if (savedTheme) {
        setSelectedTheme(savedTheme);
        setTheme(getTheme(savedTheme));
      }
      if (savedBg) setSelectedBackground(savedBg);
    } catch (e) {
      console.error(e);
    }
  };

  const handleThemeChange = async (id: string) => {
    try {
      setSelectedTheme(id);
      setTheme(getTheme(id));
      await AsyncStorage.setItem('appTheme', id);
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

  const displayBackgrounds = BACKGROUNDS;

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Mijn Profiel</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.cardProfile}>
          <View style={styles.profileSectionCard}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.color }]}>
                <Image source={require('../../assets/icons/Profiel.png')} style={styles.avatarImage} />
              </View>
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
              {displayBackgrounds.map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  style={[
                    styles.bgThumbWrapper,
                    selectedBackground === bg.id && styles.bgThumbWrapperSelected,
                  ]}
                  onPress={() => handleBackgroundChange(bg.id)}
                >
                  <Image source={bg.file} style={styles.bgThumbImage} />

                  {selectedBackground === bg.id && (
                    <View style={styles.bgSelectedOverlay}>
                      <View style={styles.bgSelectedCircle}>
                        <Ionicons name="checkmark" size={32} color="#2D2D3A" />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
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
    backgroundColor: COLORS.background,
    paddingTop: 116,
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
    ...applyShadow({ opacity: 0.18, radius: 12, offsetX: 0, offsetY: 4, elevation: 7 }),
  },

  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  titleRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 6,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.foreground,
  },

  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },

  content: { 
    paddingHorizontal: 24, 
    paddingVertical: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 22,
    marginBottom: 24,
    marginHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardProfile: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 18,
    marginHorizontal: 12,
    ...applyShadow({ opacity: 0.04, radius: 18, offsetX: 0, offsetY: 8, elevation: 4 }),
  },
  cardOption: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    marginHorizontal: 12,
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  avatarImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

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
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CFCFD8',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#2D2D3A',
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
