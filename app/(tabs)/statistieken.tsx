import { COLORS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import { onDataChange } from '@/utils/data-events';
import applyShadow from '@/utils/shadow';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PERIOD_OPTIONS = ['Laatste maand', 'Laatste 3 maanden', 'Dit jaar'];

const STATISTICS_BARS = [
  { label: 'Wk 1', value: 92 },
  { label: 'Wk 2', value: 64 },
  { label: 'Wk 3', value: 64 },
  { label: 'Wk 4', value: 45 },
  { label: 'Wk 5', value: 45 },
  { label: 'Wk 6', value: 45 },
  { label: 'Wk 7', value: 38 },
];

const ACTIVITY_ICON_MAP: Record<string, any> = {
  'Een warme douche/ bad nemen': require('../../assets/icons/Water.png'),
  'Iemand knuffelen': require('../../assets/icons/Hart.png'),
  'Naar buiten gaan in de natuur': require('../../assets/icons/Bos.png'),
  'Muziek luisteren': require('../../assets/icons/Muziek.png'),
  'Een sigaret roken': require('../../assets/icons/Icon.png'),
  'Een boek lezen': require('../../assets/icons/Boek.png'),
  'Serie of film kijken': require('../../assets/icons/TV.png'),
  'Podcast luisteren': require('../../assets/icons/Muziek-1.png'),
  'Mediteren': require('../../assets/icons/Sterren.png'),
  'Ademhalingsoefeningen': require('../../assets/icons/Wind.png'),
  'Tekenen of schilderen': require('../../assets/icons/Schilderen.png'),
  'Iets opschrijven': require('../../assets/icons/Schrijven.png'),
  'Muziek maken': require('../../assets/icons/Muziek.png'),
  'Breien of haken': require('../../assets/icons/Breien.png'),
  'Knutselen': require('../../assets/icons/Knutselen.png'),
  'Wandelen': require('../../assets/icons/Wandelen.png'),
  'Sporten': require('../../assets/icons/Sporten.png'),
  'Yoga doen': require('../../assets/icons/Yoga.png'),
  'Slapen of een dutje doen': require('../../assets/icons/Slapen.png'),
  'Dansen': require('../../assets/icons/Dansen.png'),
  'Tuinieren': require('../../assets/icons/Tuinieren.png'),
  'Contact opnemen met vrienden': require('../../assets/icons/Contacten.png'),
  'Bellen met een vriend(in)': require('../../assets/icons/Bellen.png'),
  'Samen iets drinken': require('../../assets/icons/Drinken.png'),
  'Grapjes maken': require('../../assets/icons/Grappig.png'),
  'Huisdier knuffelen': require('../../assets/icons/Huisdier.png'),
  'Met dieren in contact komen': require('../../assets/icons/Dieren.png'),
  'Social media bekijken': require('../../assets/icons/Socials.png'),
  'Opruimen of schoonmaken': require('../../assets/icons/Schoonmaken.png'),
  'Spelletjes spelen': require('../../assets/icons/Spelen.png'),
  'Een buitenactiviteit doen': require('../../assets/icons/Buiten.png'),
  'Koken of bakken': require('../../assets/icons/Koken.png'),
  'To-do lijst maken': require('../../assets/icons/To-do.png'),
  'Planning maken': require('../../assets/icons/Planning.png'),
  'Je routine volgen': require('../../assets/icons/Routine.png'),
  'Dagboek schrijven': require('../../assets/icons/Dagboek.png'),
  'Bidden': require('../../assets/icons/Bidden.png'),
  'Naar de kerk gaan': require('../../assets/icons/Kerk.png'),
  'In de natuur zijn': require('../../assets/icons/Natuur.png'),
};

export default function StatistiekenScreen() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  
  const [activityStats, setActivityStats] = useState<Array<{ label: string; count: number; avg: number }>>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView | null>(null);
  const activityPositions = useRef<Record<string, number>>({});


  const maxBarHeight = 120;
  const MAX_RATING = 5;
  const maxPillHeight = 36;
  const barsToShow = useMemo(() => {
    const done = activityStats ? activityStats.filter(a => a.count > 0) : [];
    // Sort primarily by average rating (desc), then by count (desc)
    const sorted = done.slice().sort((a, b) => (b.avg - a.avg) || (b.count - a.count));
    return sorted.slice(0, 6).map(a => ({ label: a.label, value: a.avg, count: a.count }));
  }, [activityStats]);
  // Always scale bars to the 5-star rating scale so heights change predictably
  const maxValue = MAX_RATING;

  const withAlpha = (hex: string, alpha = '33') => (hex && hex.length === 7 ? `${hex}${alpha}` : hex);

  const loadStats = useCallback(async () => {
    try {
      const raw = (await AsyncStorage.getItem('moodCheckIns')) || '[]';
      const checks = JSON.parse(raw);

      try { console.log('[statistieken] loadStats called - moodCheckIns length=', (checks || []).length); } catch (e) {}

      const map: Record<string, { count: number; sum: number }> = {};
      (checks || []).forEach((c: any) => {
        const label = c.activity || c.selectedActivity || c.name || 'Onbekend';
        const rating = typeof c.rating === 'number' ? c.rating : (typeof c.value === 'number' ? c.value : NaN);
        if (!map[label]) map[label] = { count: 0, sum: 0 };
        map[label].count += 1;
        if (!isNaN(rating)) map[label].sum += rating;
      });

      const rawCA = (await AsyncStorage.getItem('copingActivities')) || '[]';
      let coping: any = [];
      try {
        coping = JSON.parse(rawCA);
      } catch (e) {
        coping = [];
      }

      if (Array.isArray(coping)) {
        coping.forEach((a: any) => {
          const label = a && (a.label || a.name) || a;
          if (!map[label]) map[label] = { count: 0, sum: 0 };
        });
      } else if (coping && typeof coping === 'object') {
        // support shape: { moodId: [labels...] } or { label: {...} }
        Object.keys(coping).forEach((k) => {
          const v = coping[k];
          if (Array.isArray(v)) {
            v.forEach((a: any) => {
              const label = a && (a.label || a.name) || a;
              if (!map[label]) map[label] = { count: 0, sum: 0 };
            });
          } else {
            const label = (v && (v.label || v.name)) || k;
            if (!map[label]) map[label] = { count: 0, sum: 0 };
          }
        });
      }

      const stats = Object.keys(map).map((label) => {
        const { count, sum } = map[label];
        return { label, count, avg: count > 0 ? Math.round((sum / count) * 10) / 10 : 0 };
      });

      try { console.log('[statistieken] computed stats count=', stats.length); } catch (e) {}
      setActivityStats(stats);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  // subscribe to data events so stats update immediately when moodCheckIns change
  useEffect(() => {
    const unsub = onDataChange(() => loadStats());
    return () => unsub();
  }, [loadStats]);

  const topActivities = useMemo(() => {
    if (!activityStats || activityStats.length === 0) return [];
    const sorted = activityStats.slice().sort((a, b) => (b.avg - a.avg) || (b.count - a.count));
    return sorted.slice(0, 6);
  }, [activityStats]);

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.pageHeader}>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Mijn statistieken</Text>
        </View>
      </View>

      <View style={styles.pageContent}>
        <View>
          <View style={styles.filterRow} />

          <View style={styles.chartCard}>
            <View style={styles.chartArea}>
              {Array.from({ length: 6 }).map((_, i) => {
                const bar = barsToShow && barsToShow[i];
                if (bar) {
                  const isSelected = selectedBar === bar.label;
                  const anySelected = !!selectedBar;
                  const bg = isSelected ? theme.color : (anySelected ? withAlpha(theme.color, '22') : withAlpha(theme.color, '44'));
                  const MIN_BAR_HEIGHT = 8;
                  const barHeight = Math.max((bar.value / MAX_RATING) * maxBarHeight, MIN_BAR_HEIGHT);
                  return (
                    <TouchableOpacity
                      key={bar.label}
                      style={styles.barColumn}
                      activeOpacity={0.85}
                      onPress={() => {
                          const next = expandedActivity === bar.label ? null : bar.label;
                          setExpandedActivity(next);
                          setSelectedBar(next);
                          // scroll the corresponding activity into view (if we have its layout)
                          if (next && activityPositions.current[next] != null && scrollRef.current) {
                            const y = activityPositions.current[next];
                            // small offset so card sits nicely below header
                            const offset = Math.max(0, y - 8);
                            try { scrollRef.current?.scrollTo({ y: offset, animated: true }); } catch (e) {}
                          }
                        }}
                    >
                      <View style={[styles.bar, { height: barHeight, backgroundColor: bg }]} />
                    </TouchableOpacity>
                  );
                }

                // preview column
                return (
                  <View key={`preview-${i}`} style={styles.barColumn}>
                      <View style={[styles.bar, { height: 8, backgroundColor: withAlpha(theme.color, '22') }]} />
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.content} onStartShouldSetResponder={() => true}>
          <Text style={styles.sectionTitle}>Jouw favoriete activiteiten</Text>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.activityList}>
          {topActivities && topActivities.length > 0 ? (
            topActivities.map((activity: any, index: number) => {
            const isSelected = expandedActivity === activity.label;
            const iconAsset = ACTIVITY_ICON_MAP[activity.label];
            return (
              <View key={activity.label} onLayout={(e) => { activityPositions.current[activity.label] = e.nativeEvent.layout.y; }}>
                <TouchableOpacity
                  style={[
                    styles.activityCard,
                    isSelected ? { borderColor: theme.color } : {},
                  ]}
                  activeOpacity={0.9}
                  onPress={() => {
                    const next = expandedActivity === activity.label ? null : activity.label;
                    setExpandedActivity(next);
                    setSelectedBar(next);
                  }}
                >
                  <View style={[styles.activityIconCircle, { backgroundColor: isSelected ? `${theme.color}18` : `${theme.color}10` }]}>
                    {iconAsset ? (
                      <Image source={iconAsset} style={[styles.activityIcon, { tintColor: theme.color }]} />
                    ) : (
                      <Ionicons name="star-outline" size={22} color={isSelected ? theme.color : withAlpha(theme.color, 'AA')} />
                    )}
                  </View>

                  <Text style={styles.activityLabel}>{activity.label}</Text>
                </TouchableOpacity>

                {expandedActivity === activity.label ? (
                  <View style={[styles.activityDetail, { marginLeft: 0, width: '100%' }] }>
                    <Text style={styles.activityDetailText}>
                      {`Je hebt dit ${activity.count} keer gedaan en een gemiddelde van ${activity.avg === 1 ? '1 ster' : activity.avg + ' sterren'}`}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Je hebt nog geen activiteiten gedaan</Text>
                <Text style={styles.emptySubtitle}>Klik op een gevoel op de Check-in pagina om te beginnen</Text>
              </View>
            </View>
          )}
        </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<any>({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 32,
  },
  pageContent: {
    paddingTop: 0,
    flex: 1,
    paddingBottom: THEME.sizes.tabBarHeight + 48,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DEDDE7',
    backgroundColor: '#FFFFFF',
  },
  periodText: {
    fontSize: 13,
    color: COLORS.foreground,
    fontWeight: '500',
  },
  chartCard: {
    paddingTop: 8,
    marginBottom: 22,
    paddingHorizontal: 24,
  },
  
  chartArea: {
    height: 170,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    justifyContent: 'space-between',
  },
  barColumn: {
    flex: 1,
    paddingHorizontal: 6,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 46,
    borderRadius: 8,
  },
  pill: {
    width: '100%',
    height: 34,
    borderRadius: 17,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.foreground,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 4,
  },
  activityList: {
    gap: 12,
    marginTop: 0,
  },
  
  activityDetail: {
    marginTop: 8,
    marginBottom: 6,
    marginLeft: 68,
    padding: 12,
    backgroundColor: '#F6F5FA',
    borderRadius: 12,
  },
  activityDetailText: {
    fontSize: 13,
    color: COLORS.foreground,
    lineHeight: 18,
  },
  noActivitiesBox: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  noActivitiesText: {
    color: COLORS.mutedForeground,
    fontSize: 14,
  },
  emptyState: { flex: 1, alignItems: 'center', gap: 16, paddingBottom: THEME.sizes.tabBarHeight + 48 },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderColor: COLORS.border,
    paddingVertical: 44,
    paddingHorizontal: 28,
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.foreground, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.mutedForeground, textAlign: 'center' },
  activityCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#F2F2F6',
    ...applyShadow({ opacity: 0.05, radius: 10, offsetX: 0, offsetY: 2, elevation: 2 }),
  },
  activityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  activityLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  bottomSpacer: {
    height: 12,
  },
});