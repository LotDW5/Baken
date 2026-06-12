import { COLORS, MOOD_OPTIONS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import HeadAvatar from '../components/HeadAvatar';
// eslint-disable-next-line import/no-named-as-default
import applyShadow from '@/utils/shadow';
import { onThemeChange } from '@/utils/theme-events';

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

// Layout constants (match ActivitiesScreen)
const CARD_MAX_WIDTH = 393;

function HomeContent() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const hexToRgba = (hex: string, alpha = 1) => {
    try {
      const h = hex.replace('#', '');
      const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    } catch (e) {
      return `rgba(0,0,0,${alpha})`;
    }
  };
  const [selectedBackground, setSelectedBackground] = useState('butterfly');
  const [customBackgrounds, setCustomBackgrounds] = useState<{id:string; uri:string}[]>([]);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [weekChecks, setWeekChecks] = useState<Record<string, boolean>>({});
  const [weekCount, setWeekCount] = useState(0);
  const [recentCompletion, setRecentCompletion] = useState<{ activity: string; timestamp: string; message?: string } | null>(null);
  const [recentRating, setRecentRating] = useState<number>(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      const savedBg = await AsyncStorage.getItem('homeBackground');
      const savedCustom = await AsyncStorage.getItem('customBackgrounds');

      if (savedTheme) {
        /* theme handled by useAppTheme hook */
      }
      if (savedCustom) {
        try {
          const parsed = JSON.parse(savedCustom);
          setCustomBackgrounds(Array.isArray(parsed) ? parsed : []);
        } catch { setCustomBackgrounds([]); }
      }
      if (savedBg) setSelectedBackground(savedBg);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // load preferences on mount
    loadPreferences();

    // check whether we've shown the welcome bubble before
    const checkWelcome = async () => {
      try {
        const seen = await AsyncStorage.getItem('seenWelcome');
        if (!seen) {
          // only show welcome if onboarding presumably completed (optional)
          setShowWelcome(true);
        }
        // try to load profile name
        const prof = await AsyncStorage.getItem('profile');
        if (prof) {
          try {
            const parsed = JSON.parse(prof);
            setUserName(parsed?.name || parsed?.firstName || null);
          } catch { setUserName(null); }
        }
      } catch (e) { console.error('welcome check failed', e); }
    };
    checkWelcome();

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

    const loadRecent = async () => {
      try {
        const raw = await AsyncStorage.getItem('recentCompletion');
        if (raw) {
          const parsed = JSON.parse(raw);
          setRecentCompletion(parsed);
          await AsyncStorage.removeItem('recentCompletion');
        }
      } catch (e) {
        console.error('Failed to read recentCompletion', e);
      }
    };
    loadRecent();

    // listen for focus events from navigation
    const unsubscribe = (navigation as any)?.addListener?.('focus', loadPreferences);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    // reload preferences when theme/background changes elsewhere
    const unsub = onThemeChange(() => { loadPreferences(); });
    return unsub;
  }, [loadPreferences]);

  let backgroundImage: any = BACKGROUND_IMAGES['butterfly'];
  if (String(selectedBackground).startsWith('custom-')) {
    const found = customBackgrounds.find(c => c.id === selectedBackground);
    if (found && found.uri) backgroundImage = { uri: found.uri };
  } else {
    backgroundImage = BACKGROUND_IMAGES[selectedBackground as keyof typeof BACKGROUND_IMAGES] || BACKGROUND_IMAGES['butterfly'];
  }

  const iconMap: Record<string, any> = {
    good: require('../../assets/icons/Goed.png'),
    okay: require('../../assets/icons/Minder goed.png'),
    bad: require('../../assets/icons/Niet goed.png'),
    crisis: require('../../assets/icons/Crisis.png'),
  };

  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    // reset loaded flag when background changes so we show placeholder until loaded
    setBgLoaded(false);
  }, [selectedBackground]);

  useEffect(() => {
    // also refresh recentCompletion when navigating back to this screen
    const unsubscribe = (navigation as any)?.addListener?.('focus', async () => {
      try {
        const raw = await AsyncStorage.getItem('recentCompletion');
        if (raw) {
          const parsed = JSON.parse(raw);
          setRecentCompletion(parsed);
          await AsyncStorage.removeItem('recentCompletion');
        }
      } catch (e) { console.error(e); }
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [navigation]);

  useEffect(() => {
    // reset rating when a new recentCompletion appears/disappears
    setRecentRating(0);
  }, [recentCompletion]);

  useEffect(() => {
    // when a message has been written to recentCompletion, show it for 10s then clear
    let timer: number | null = null;
    if (recentCompletion && recentCompletion.message) {
      timer = setTimeout(async () => {
        try {
          await AsyncStorage.removeItem('recentCompletion');
        } catch (e) { /* ignore */ }
        setRecentCompletion(null);
      }, 10000) as unknown as number;
    }
    return () => { if (timer) clearTimeout(timer as any); };
  }, [recentCompletion]);

  const getCompletionMessage = (rating: number, activity: string) => {
    if (rating <= 2) return 'Spijtig! Misschien kun je een andere activiteit proberen die beter bij je past?';
    if (rating === 3) return 'Goed geprobeerd! Blijf experimenteren met wat voor jou werkt.';
    if (rating === 4) return 'Fijn om te horen dat dit je geholpen heeft!';
    return 'Super! Deze activiteit werkt echt goed voor je.'; // 5
  };

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
              <HeadAvatar style={styles.iconImage} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Instellingen' as any)}>
            <View style={styles.iconCircle}>
              <Image source={require('../../assets/icons/Instellingen.png')} style={[styles.iconImage, { tintColor: theme.color }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Week tracker (positioned above card) */}
        {showWelcome ? (
          <View style={styles.recentWrapper}>
            <View style={styles.recentRow}>
              <View style={styles.recentAvatarWrap}>
                <HeadAvatar style={styles.recentAvatar} />
              </View>
              <View style={[styles.recentBubble, { maxWidth: Math.min(320, Math.max(0, screenWidth - 120)) }]}>
                <View style={styles.recentTail} />
                <Text style={styles.recentText}>Dag {userName ? userName : ''}! Welkom bij BAKEN</Text>
                <Text style={[styles.recentText, { marginTop: 8, fontSize: 13, color: COLORS.mutedForeground }]}>Hier vind je dagelijks check-ins en activiteiten om je te ondersteunen. Veeg omhoog om te beginnen.</Text>
                <View style={{ height: 6 }} />
                <TouchableOpacity style={[styles.recentPrimary, { alignSelf: 'flex-end', marginTop: 8 }]} onPress={async () => { await AsyncStorage.setItem('seenWelcome', '1'); setShowWelcome(false); }}>
                  <Text style={styles.recentPrimaryText}>Begrepen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : recentCompletion ? (
          <View style={styles.recentWrapper}>
            <View style={styles.recentRow}>
              <View style={styles.recentAvatarWrap}>
                  <HeadAvatar style={styles.recentAvatar} />
                </View>
              <View style={[styles.recentBubble, { maxWidth: Math.min(320, Math.max(0, screenWidth - 120)) }]}>
                <View style={styles.recentTail} />
                {recentCompletion.message ? (
                  <Text style={styles.recentText}>{recentCompletion.message}</Text>
                ) : (
                  <>
                    <Text style={styles.recentTitle}>Hoe goed heeft {String(recentCompletion.activity).toLowerCase()} je geholpen?</Text>
                    {/* rating row */}
                    <View style={styles.starRow}>
                      {[1,2,3,4,5].map((n) => (
                        <TouchableOpacity key={n} onPress={() => setRecentRating(n)} activeOpacity={0.8}>
                          <Image
                            source={n <= recentRating ? require('../../assets/icons/Gevulde ster.png') : require('../../assets/icons/Ster.png')}
                            style={[styles.starIcon, n <= recentRating ? { tintColor: '#FFB84D' } : null]}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.recentActionsRow}>
                      <TouchableOpacity style={styles.recentSecondary} onPress={() => { setRecentCompletion(null); setRecentRating(0); }}>
                        <Text style={styles.recentSecondaryText}>Overslaan</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={recentRating === 0}
                        style={[
                          styles.recentPrimary,
                          { backgroundColor: recentRating === 0 ? hexToRgba(theme.color, 0.18) : theme.color },
                        ]}
                        onPress={async () => {
                          if (recentRating === 0 || !recentCompletion) return;
                          try {
                            const message = getCompletionMessage(recentRating, recentCompletion.activity);
                            const updated = { ...recentCompletion, message, timestamp: new Date().toISOString() };
                            await AsyncStorage.setItem('recentCompletion', JSON.stringify(updated));
                            setRecentCompletion(updated);
                            setRecentRating(0);
                            // Persist the rating into the most recent matching moodCheckIn
                            try {
                              const raw = (await AsyncStorage.getItem('moodCheckIns')) || '[]';
                              const moods = JSON.parse(raw);
                              for (let i = moods.length - 1; i >= 0; i--) {
                                const m = moods[i];
                                if (m.activity && m.activity === recentCompletion.activity) {
                                  m.rating = recentRating;
                                  break;
                                }
                              }
                              await AsyncStorage.setItem('moodCheckIns', JSON.stringify(moods));
                              try { (await import('@/utils/data-events')).emitDataChange(); } catch (e) { /* ignore */ }
                            } catch (e) {
                              console.error('Failed to persist rating into moodCheckIns', e);
                            }
                          } catch (e) {
                            console.error('Failed to persist rating/message', e);
                          }
                        }}
                      >
                        <Text style={[styles.recentPrimaryText, { color: recentRating === 0 ? theme.color : '#fff' }]}>Opslaan</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        ) : (
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
        )}

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
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
    bottom: 125,
  },
  recentWrapper: {
    position: 'absolute',
    top: 144,
    left: 24,
    maxWidth: CARD_MAX_WIDTH,
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    zIndex: 20,
  },
  recentRow: { flexDirection: 'row', alignItems: 'flex-start', position: 'relative' },
  recentAvatarWrap: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 16, zIndex: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 6 },
  recentAvatar: { width: 40, height: 40, resizeMode: 'contain' },
  recentBubble: { backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18, alignSelf: 'flex-start', minWidth: 160, marginLeft: 0, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, elevation: 10, position: 'relative' },
  recentTail: { position: 'absolute', left: -7, top: 20, width: 14, height: 14, backgroundColor: COLORS.white, transform: [{ rotate: '45deg' }], shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 0, zIndex: -1 },
  recentTitle: { fontWeight: '700', marginBottom: 6, fontSize: 15, lineHeight: 20, letterSpacing: 0 },
  recentText: { color: COLORS.foreground, fontSize: 14 },
  starRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  starIcon: { width: 24, height: 24, marginHorizontal: 4, tintColor: '#D0D0D0' },
  starSelected: { tintColor: '#F6C34A' },
  recentActionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  recentSecondary: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: '#EAEAF2', backgroundColor: '#fff', marginRight: 12 },
  recentSecondaryText: { color: COLORS.foreground, fontWeight: '700' },
  recentPrimary: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, backgroundColor: '#6B5CE7' },
  recentPrimaryText: { color: '#fff', fontWeight: '700' },
  recentPrimaryDisabled: { backgroundColor: '#D8D4F6' },
  recentPrimaryTextDisabled: { color: 'rgba(255,255,255,0.85)' },
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
    marginTop: THEME.spacing.xs - 4,
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
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
