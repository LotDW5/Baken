import { COLORS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import applyShadow from '@/utils/shadow';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState, useEffect } from 'react';
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

const FAVORITE_ACTIVITIES = [
  { label: 'Dansen', icon: 'music-note', iconFamily: 'Ionicons' as const },
  { label: 'Naar buiten gaan in de natuur', icon: 'pine-tree', iconFamily: 'MaterialCommunityIcons' as const },
  { label: 'Opruimen of schoonmaken', icon: 'sparkles', iconFamily: 'MaterialCommunityIcons' as const },
];

export default function StatistiekenScreen() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const [selectedPeriod] = useState(PERIOD_OPTIONS[0]);
  const [activityStats, setActivityStats] = useState<Array<{ label: string; count: number; avg: number }>>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);


  const maxBarHeight = 120;
  const barsToShow = useMemo(() => {
    const done = activityStats ? activityStats.filter(a => a.count > 0) : [];
    const sortedByCount = done.slice().sort((a, b) => b.count - a.count);
    return sortedByCount.slice(0, 6).map(a => ({ label: a.label, value: a.count }));
  }, [activityStats]);
  const maxValue = useMemo(() => (barsToShow && barsToShow.length > 0 ? Math.max(...barsToShow.map((bar) => bar.value)) : 1), [barsToShow]);

  const withAlpha = (hex: string, alpha = '33') => (hex && hex.length === 7 ? `${hex}${alpha}` : hex);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        const raw = (await AsyncStorage.getItem('moodCheckIns')) || '[]';
        const checks = JSON.parse(raw);

        const map: Record<string, { count: number; sum: number }> = {};
        (checks || []).forEach((c: any) => {
          const label = c.activity || c.selectedActivity || c.name || 'Onbekend';
          const rating = typeof c.rating === 'number' ? c.rating : (typeof c.value === 'number' ? c.value : NaN);
          if (!map[label]) map[label] = { count: 0, sum: 0 };
          map[label].count += 1;
          if (!isNaN(rating)) map[label].sum += rating;
        });

        const rawCA = (await AsyncStorage.getItem('copingActivities')) || '[]';
        const coping = JSON.parse(rawCA);
        (coping || []).forEach((a: any) => {
          const label = a.label || a.name || a;
          if (!map[label]) map[label] = { count: 0, sum: 0 };
        });

        const stats = Object.keys(map).map((label) => {
          const { count, sum } = map[label];
          return { label, count, avg: count > 0 ? Math.round((sum / count) * 10) / 10 : 0 };
        });

        if (!mounted) return;
        setActivityStats(stats);
      } catch (e) {
        console.error(e);
      }
    };

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const topActivities = useMemo(() => {
    if (!activityStats || activityStats.length === 0) return FAVORITE_ACTIVITIES.map(a => ({ label: a.label, count: 0, avg: 0 }));
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.periodButton} activeOpacity={0.8}>
            <Text style={styles.periodText}>{selectedPeriod}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartArea}>
            {barsToShow && barsToShow.length > 0 ? (
              barsToShow.map((bar, index) => {
                const barHeight = Math.max((bar.value / maxValue) * maxBarHeight, 34);
                const isPrimary = index === 0;

                return (
                  <TouchableOpacity key={bar.label} style={styles.barColumn} activeOpacity={0.8} onPress={() => setExpandedActivity(expandedActivity === bar.label ? null : bar.label)}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isPrimary ? theme.color : withAlpha(theme.color, '44'),
                        },
                      ]}
                    />
                    <Text style={styles.barLabel} numberOfLines={1}>{bar.label}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Text style={{color: COLORS.mutedForeground}}>Nog geen activiteiten</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Jouw favoriete activiteiten</Text>

        <View style={styles.activityList}>
          {topActivities.map((activity, index) => {
            const fav = FAVORITE_ACTIVITIES.find(f => f.label === activity.label);
            const isPrimary = index === 0;
            const iconColor = isPrimary ? theme.color : withAlpha(theme.color, 'AA');
            const IconComp = fav && fav.iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
            const iconName = fav ? fav.icon : 'star-outline';

            return (
              <View key={activity.label}>
                <TouchableOpacity
                  style={[
                    styles.activityCard,
                    isPrimary && { borderColor: theme.color },
                  ]}
                  activeOpacity={0.9}
                  onPress={() => setExpandedActivity(expandedActivity === activity.label ? null : activity.label)}
                >
                  <View style={[styles.activityIconCircle, { backgroundColor: `${theme.color}18` }]}>
                    <IconComp name={iconName as any} size={22} color={iconColor} />
                  </View>

                  <Text style={styles.activityLabel}>{activity.label}</Text>
                </TouchableOpacity>

                {expandedActivity === activity.label ? (
                  <View style={styles.activityDetail}>
                    <Text style={styles.activityDetailText}>
                      {`Je hebt dit ${activity.count} keer gedaan en een gemiddelde van ${activity.avg} sterren`}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
        </ScrollView>
      </View>

      <View style={styles.bottomSpacer} />
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
  },
  chartArea: {
    height: 170,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 12,
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
    marginBottom: 14,
  },
  activityList: {
    gap: 12,
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
    borderColor: COLORS.border,
    ...applyShadow({ opacity: 0.05, radius: 10, offsetX: 0, offsetY: 2, elevation: 2 }),
  },
  activityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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