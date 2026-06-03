import { COLORS, MOOD_OPTIONS, getTheme } from '@/constants/colors';
import THEME from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// eslint-disable-next-line import/no-named-as-default
import applyShadow from '@/utils/shadow';

// Background images mapping
const BACKGROUND_IMAGES: Record<string, any> = {
  'butterfly': require('@/assets/images/butterfly-wild.jpg'),
  'grand-canyon': require('@/assets/images/grand-canyon-nature-footage-arizona-usa.jpg'),
  'trees-mountain': require('@/assets/images/green-yellow-trees-near-mountain-white-clouds-daytime.jpg'),
  'forest-path': require('@/assets/images/nature-journey-travel-trekking-summertime-concept-vertical-shot-pathway-park-leading-forested-area-outdoor-view-wooden-boardwalk-along-tall-pine-trees-morning-forest.jpg'),
  'river-trees': require('@/assets/images/river-trees.jpg'),
  'flowers-butterfly': require('@/assets/images/spring-scene-with-flowers-butterfly.jpg'),
  'lagoon': require('@/assets/images/vertical-shot-beautiful-lagoon-surrounded-by-mossy-rocks-forest-skrad-croatia.jpg'),
  'mushroom': require('@/assets/images/vertical-shot-mushroom-growing-nature.jpg'),
  'narrow-path': require('@/assets/images/vertical-shot-narrow-pathway-forest-with-lot-tall-green-trees.jpg'),
  'scotland-river': require('@/assets/images/vertical-shot-river-surrounded-by-mountains-meadows-scotland.jpg'),
  'johnston-canyon': require('@/assets/images/vertical-shot-small-river-johnston-canyon-massive.jpg'),
  'waterfall': require('@/assets/images/waterfall-chae-son-national-park-lampang-thailand.jpg'),
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [theme, setTheme] = useState(getTheme());
  const [selectedBackground, setSelectedBackground] = useState('butterfly');
  const [bgLoaded, setBgLoaded] = useState(false);

  const loadPreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      const savedBg = await AsyncStorage.getItem('homeBackground');

      if (savedTheme) setTheme(getTheme(savedTheme));
      if (savedBg) setSelectedBackground(savedBg);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // load preferences on mount
    loadPreferences();

    // listen for focus events from navigation
    const unsubscribe = (navigation as any)?.addListener?.('focus', loadPreferences);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [navigation]);

  const backgroundImage = BACKGROUND_IMAGES[selectedBackground as keyof typeof BACKGROUND_IMAGES] || BACKGROUND_IMAGES['butterfly'];

  const iconMap: Record<string, any> = {
    good: require('../../assets/icons/Goed.png'),
    okay: require('../../assets/icons/Minder goed.png'),
    bad: require('../../assets/icons/Niet goed.png'),
    crisis: require('../../assets/icons/Crisis.png'),
  };

  useEffect(() => {
    // reset loaded flag when background changes so we show placeholder until loaded
    setBgLoaded(false);
  }, [selectedBackground]);

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.backgroundImage}
      resizeMode="cover"
      blurRadius={0}
      onLoadEnd={() => setBgLoaded(true)}
      onError={() => setBgLoaded(true)}
    >
      <SafeAreaView style={styles.container}>
        {/* while background is loading, show a subtle overlay to avoid flash */}
        {!bgLoaded && (
          <View style={styles.bgPlaceholder}>
            <ActivityIndicator size="large" color="rgba(0,0,0,0.2)" />
          </View>
        )}
        {/* Header with profile and settings */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profiel' as any)}>
            <View style={styles.iconCircle}>
              <Image source={require('../../assets/icons/Profiel.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Instellingen' as any)}>
            <View style={styles.iconCircle}>
              <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Main card */}
        <View style={styles.cardContainer}>
          <Text style={styles.title}>Hoe voel je je op dit moment?</Text>
          
          <View style={styles.moodsGrid}>
            {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[styles.moodButton, { borderColor: mood.color }]}
                  onPress={() => (navigation as any).navigate('Stemming', { mood: mood.id })}
                >
                  <Image 
                    source={iconMap[mood.id]} 
                    style={[styles.moodImage, { tintColor: mood.color }]}
                    resizeMode="contain"
                  />
                  <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bgPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(247,245,251,0.6)'
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.l,
    paddingTop: THEME.spacing.l,
    paddingBottom: THEME.sizes.tabBarHeight + 40,
  },
  header: {
    position: 'absolute',
    top: THEME.spacing.l,
    left: THEME.spacing.l,
    right: THEME.spacing.l,
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
    ...applyShadow({ opacity: 0.18, radius: 12, offsetX: 0, offsetY: 4, elevation: 7 }),
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radii.lg,
    padding: THEME.spacing.l,
    marginTop: 12,
    width: '90%',
    maxWidth: THEME.sizes.cardWidth,
    minHeight: THEME.sizes.cardHeight,
    ...applyShadow({ opacity: 0.14, radius: 18, offsetX: 0, offsetY: 8, elevation: 8 }),
    position: 'absolute',
    left: THEME.spacing.l,
    right: THEME.spacing.l,
    bottom: THEME.sizes.tabBarHeight + 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'left',
    color: COLORS.foreground,
    marginBottom: THEME.spacing.m,
    lineHeight: THEME.typography.title.lineHeight,
    alignSelf: 'flex-start',
  },
  moodsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  moodButton: {
    backgroundColor: '#FFFFFF',
    width: THEME.sizes.moodButtonWidth,
    height: THEME.sizes.moodButtonHeight,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    ...applyShadow({ opacity: 0.06, radius: 4, offsetX: 0, offsetY: 1, elevation: 1 }),
  },
  moodEmoji: {
    fontSize: 36,
  },
  moodImage: {
    width: THEME.sizes.iconMedium,
    height: THEME.sizes.iconMedium,
    marginBottom: THEME.spacing.m,
    resizeMode: 'contain',
  },
  moodLabel: {
    fontSize: THEME.typography.label.fontSize,
    fontWeight: THEME.typography.label.fontWeight as any,
    textAlign: 'center',
    lineHeight: THEME.typography.label.lineHeight,
    marginTop: 8,
  },
  iconImage: {
    width: THEME.sizes.iconSmall,
    height: THEME.sizes.iconSmall,
    resizeMode: 'contain',
  },
});
