import { COLORS, getTheme } from '@/constants/colors';
import THEME from '@/constants/theme';
import applyShadow from '@/utils/shadow';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
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
  const [theme, setTheme] = useState(getTheme());
  const [selectedPeriod] = useState(PERIOD_OPTIONS[0]);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setTheme(getTheme(savedTheme));
      }
    };

    loadTheme();
  }, []);

  const maxBarHeight = 120;
  const maxValue = useMemo(() => Math.max(...STATISTICS_BARS.map((bar) => bar.value)), []);

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
            {STATISTICS_BARS.map((bar, index) => {
              const barHeight = Math.max((bar.value / maxValue) * maxBarHeight, 34);
              const isPrimary = index === 0;

              return (
                <View key={bar.label} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isPrimary ? theme.color : '#B6AEEE',
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Jouw favoriete activiteiten</Text>

        <View style={styles.activityList}>
          {FAVORITE_ACTIVITIES.map((activity, index) => {
            const isPrimary = index === 0;
            const iconColor = isPrimary ? theme.color : '#6C60E6';

            return (
              <TouchableOpacity
                key={activity.label}
                style={[
                  styles.activityCard,
                  isPrimary && { borderColor: theme.color },
                ]}
                activeOpacity={0.9}
              >
                <View style={[styles.activityIconCircle, { backgroundColor: `${theme.color}18` }]}>
                  {activity.iconFamily === 'Ionicons' ? (
                    <Ionicons name={activity.icon as any} size={22} color={iconColor} />
                  ) : (
                    <MaterialCommunityIcons name={activity.icon as any} size={22} color={iconColor} />
                  )}
                </View>

                <Text style={styles.activityLabel}>{activity.label}</Text>
              </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 14,
  },
  activityList: {
    gap: 12,
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