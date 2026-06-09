import { COLORS, MOOD_OPTIONS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
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

function HomeContent() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const [selectedBackground, setSelectedBackground] = useState('butterfly');
  const [bgLoaded, setBgLoaded] = useState(false);
  const [weekChecks, setWeekChecks] = useState<Record<string, boolean>>({});
  const [weekCount, setWeekCount] = useState(0);

  const loadPreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      const savedBg = await AsyncStorage.getItem('homeBackground');

      if (savedTheme) {
        /* theme handled by useAppTheme hook */
      }
      if (savedBg) setSelectedBackground(savedBg);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // load preferences on mount
    loadPreferences();

    // load mood check-ins for week tracker
    const loadWeekChecks = async () => {
      try {
        const raw = await AsyncStorage.getItem('moodCheckIns') || '[]';
        const moods = JSON.parse(raw);

        // build this week's dates (Mon-Sun)
        const today = new Date();
        const day = today.getDay(); // 0 (Sun) - 6 (Sat)
        const mondayOffset = (day === 0) ? -6 : (1 - day);
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);

        const week: string[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          week.push(d.toDateString());
        }

        const checks: Record<string, boolean> = {};
        week.forEach(d => (checks[d] = false));

        moods.forEach((m: any) => {
          try {
            const ts = new Date(m.timestamp).toDateString();
            if (checks[ts] === false) checks[ts] = true;
          } catch (e) { /* ignore malformed */ }
        });

        const count = Object.values(checks).filter(Boolean).length;
        setWeekChecks(checks);
        setWeekCount(count);
      } catch (e) {
        console.error(e);
      }
    };
    loadWeekChecks();

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

        {/* Week tracker (positioned above card) */}
        <View style={[styles.weekTrackerWrapper, { backgroundColor: COLORS.white, ...applyShadow({ opacity: 0.06, radius: 8, offsetX:0, offsetY:4, elevation:4 }) }]}> 
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>Deze week</Text>
            <Text style={styles.weekCount}>{weekCount}/7 dagen</Text>
          </View>
          <View style={styles.weekDots}> 
            {Object.keys(weekChecks).length === 0 ? (
              <View style={{height: 32}} />
            ) : (
              // ensure we always render 7 days left-to-right
              ['Ma','Di','Wo','Do','Vr','Za','Zo'].map((short, i) => {
                const d = Object.keys(weekChecks)[i];
                const checked = !!weekChecks[d];
                  return (
                    <View key={d} style={[styles.weekDayItem, i < 6 ? { marginRight: THEME.spacing.s } : null]}>
                    <View style={[styles.weekDot, checked ? { borderColor: theme.color, backgroundColor: theme.bgColor } : null]}>
                      {checked && (
                        <Image source={require('../../assets/icons/Check.png')} style={[styles.checkIcon, { tintColor: theme.color }]} resizeMode="contain" />
                      )}
                    </View>
                    <Text style={styles.weekDayLabel}>{short}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Main card */}
        <View style={styles.cardContainer}>
          <Text style={styles.title}>Hoe voel je je op dit moment?</Text>
          
          <View style={styles.moodsGrid}>
            {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[styles.moodButton, { borderColor: mood.color }]}
                  onPress={() => (navigation as any).navigate('Check-in', { screen: 'Stemming', params: { mood: mood.id } })}
                >
                  <Image 
                    source={iconMap[mood.id]} 
                    style={[styles.moodImage, { tintColor: mood.color }]}
                    resizeMode="contain"
                  />
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Wrap HomeContent and the staging screens in a Stack so nested navigation works
import { createStackNavigator } from '@react-navigation/stack';
import MoodCheckInScreen from './stemming/[mood]';
import ActivityDetail from './stemming/[mood]/[activity]';
import ActivitiesScreen from './stemming/[mood]/activiteiten';
import ActivityComplete from './stemming/[mood]/activity-complete';

const Stack = createStackNavigator();

export default function CheckInStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeContent} />
      <Stack.Screen name="Stemming" component={MoodCheckInScreen} />
      <Stack.Screen name="Activiteiten" component={ActivitiesScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
      <Stack.Screen name="ActivityComplete" component={ActivityComplete} />
    </Stack.Navigator>
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
    backgroundColor: 'rgba(247,245,251,0.6)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: THEME.sizes.tabBarHeight + 40,
  },
  header: {
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
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: THEME.spacing.l,
    paddingHorizontal: THEME.spacing.l,
    marginTop: 12,
    minHeight: THEME.sizes.cardHeight,
    ...applyShadow({ opacity: 0.14, radius: 18, offsetX: 0, offsetY: 8, elevation: 8 }),
    position: 'absolute',
    alignSelf: 'center',
    left: THEME.spacing.l,
    right: THEME.spacing.l,
    bottom: 129,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.foreground,
    marginBottom: THEME.spacing.m,
    lineHeight: THEME.typography.title.lineHeight,
    alignSelf: 'center',
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
    flex: 1,
    minWidth: 60,
    maxWidth: 84,
    height: THEME.sizes.moodButtonHeight,
    borderRadius: 12,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: THEME.spacing.s,
    paddingBottom: THEME.spacing.s,
    marginHorizontal: THEME.spacing.xs,
    ...applyShadow({ opacity: 0.06, radius: 4, offsetX: 0, offsetY: 1, elevation: 1 }),
  },
  moodEmoji: {
    fontSize: 36,
  },
  moodImage: {
    width: 44,
    height: 44,
    marginBottom: THEME.spacing.s,
    resizeMode: 'contain',
  },
  moodLabel: {
    fontSize: THEME.typography.label.fontSize,
    fontWeight: THEME.typography.label.fontWeight as any,
    textAlign: 'center',
    lineHeight: THEME.typography.label.lineHeight,
    marginTop: THEME.spacing.xs,
    color: COLORS.foreground,
  },
  weekTrackerWrapper: {
    marginBottom: 12,
    position: 'absolute',
    top: 144,
    left: THEME.spacing.l,
    right: THEME.spacing.l,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: THEME.spacing.m,
    zIndex: 15,
    borderWidth: 0,
    backgroundColor: COLORS.white,
    ...applyShadow({ opacity: 0.06, radius: 12, offsetX: 0, offsetY: 8, elevation: 10 }),
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  weekCount: {
    fontSize: 12,
    color: COLORS.mutedForeground,
  },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.s,
    width: '100%',
  },
  weekDayItem: {
    alignItems: 'center',
    width: 36,
  },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: 18,
    height: 18,
  },
  weekDayLabel: {
    fontSize: 12,
    color: COLORS.mutedForeground,
  },
  iconImage: {
    width: THEME.sizes.iconSmall,
    height: THEME.sizes.iconSmall,
    resizeMode: 'contain',
  },
});
