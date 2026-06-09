import { COLORS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import applyShadow from '@/utils/shadow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Layout constants matching app tokens
const CARD_MAX_WIDTH = 393;
const CARD_CONTENT_WIDTH = CARD_MAX_WIDTH - 48;

export default function BottomTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const theme = useAppTheme();
  const wrapperShadow = Platform.OS === 'web'
    ? { boxShadow: '0 -18px 30px rgba(0,0,0,0.14)' }
    : applyShadow({ opacity: 0.14, radius: 18, offsetX: 0, offsetY: -8, elevation: 16 });
  // Always render the bottom tab bar for every route
  // navigation fills full width; internal padding keeps buttons away from edges

  return (
    <View testID="bottom-tab-bar-wrapper" style={[styles.wrapper, wrapperShadow]}>
        {Platform.OS === 'web' && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: -28, height: 28, zIndex: 3, backgroundImage: 'linear-gradient(rgba(0,0,0,0.14), rgba(0,0,0,0))' } as any} />
        )}
        {Platform.OS !== 'web' && (
          <View style={styles.nativeTopShadowWrapper} pointerEvents="none">
            <View style={[styles.nativeTopShadow, applyShadow({ opacity: 0.14, radius: 12, offsetX: 0, offsetY: 4, elevation: 10 })]} />
          </View>
        )}
        <View style={styles.separator} />
      {/* Web-specific floating action for nested Check-in -> Activiteiten (keeps button above nav) */}
      {Platform.OS === 'web' && (() => {
        const focusedRoute = state.routes[state.index];
        const nested = focusedRoute.state as any;
        const nestedActiveName = nested && nested.routes && nested.routes.length > 0 ? nested.routes[nested.index].name : null;
        // Show Ga verder on the mood check-in (Stemming) and an Overslaan white FAB on Activiteiten
        const isStemmingRoute = nestedActiveName === 'Stemming' || nestedActiveName === '[mood]' || (nestedActiveName && nestedActiveName.toLowerCase().includes('mood')) || (nestedActiveName && nestedActiveName.toLowerCase().includes('stemming'));
        const isActiviteitenRoute = nestedActiveName === 'Activiteiten' || (nestedActiveName && nestedActiveName.toLowerCase().includes('activiteiten'));

        if (focusedRoute.name === 'Check-in' && (isStemmingRoute || isActiviteitenRoute)) {
          const currentNestedRoute = nested && nested.routes && nested.routes.length > 0 ? nested.routes[nested.index] : null;
          // Attempt to locate the mood id from several places (nested params, focusedRoute params, or route name)
          const moodParamFromNested = currentNestedRoute && currentNestedRoute.params ? (currentNestedRoute.params as any).mood : undefined;
          const moodParamFromFocused = (focusedRoute && (focusedRoute as any).params) ? (focusedRoute as any).params.mood : undefined;
          const moodIdFromName = currentNestedRoute && typeof currentNestedRoute.name === 'string' ? currentNestedRoute.name : undefined;
          const moodParam = moodParamFromNested || moodParamFromFocused || moodIdFromName;

          // Only render the overlay FAB for the Activiteiten nested route on web.

          if (isActiviteitenRoute) {
            // Render a floating "Overslaan" button above the tab bar for Activiteiten
            return (
              <View key="fab-activiteiten" style={styles.fabWrap}>
                <View style={styles.fabOverlay}>
                  <TouchableOpacity
                    style={styles.fabButtonLarge}
                    onPress={async () => {
                      try {
                        const moodParamFromNested = currentNestedRoute && currentNestedRoute.params ? (currentNestedRoute.params as any).mood : undefined;
                        const moodParamFromFocused = (focusedRoute && (focusedRoute as any).params) ? (focusedRoute as any).params.mood : undefined;
                        const moodId = moodParamFromNested || moodParamFromFocused || 'okay';

                        const moodNote = await AsyncStorage.getItem('tempMoodNote');
                        const moodData = { mood: moodId, note: moodNote || '', timestamp: new Date().toISOString() };
                        const existing = await AsyncStorage.getItem('moodCheckIns') || '[]';
                        const arr = JSON.parse(existing);
                        arr.push(moodData);
                        await AsyncStorage.setItem('moodCheckIns', JSON.stringify(arr));
                        await AsyncStorage.setItem('lastMoodCheckIn', new Date().toDateString());
                        await AsyncStorage.removeItem('tempMoodNote');
                        navigation.navigate('Check-in');
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    <Text style={styles.fabText}>Overslaan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
        }
        return null;
      })()}
      <View style={styles.container}>
      {state.routes.map((route, index) => {
        // Don't render tab buttons for hidden helper routes
        if (route.name === 'Nonverbaal' || route.name === 'NonverbaalMessage') return null;
        // Determine whether this tab is focused
        const focused = state.index === index;
        const descriptor = descriptors[route.key];
        // Allow screens to hide their tab via `options.tabBarVisible === false` or `options.tabBarStyle.display === 'none'`
        if (descriptor && descriptor.options) {
          const opts: any = descriptor.options as any;
          if (opts.tabBarVisible === false || (opts.tabBarStyle && (opts.tabBarStyle as any).display === 'none')) {
            return null;
          }
        }
        const label = descriptor.options.title ?? route.name;
        const icons: Record<string, any> = {
          'Check-in': require('@/assets/icons/Check-in.png'),
          Contacten: require('@/assets/icons/Contacten.png'),
          Agenda: require('@/assets/icons/Agenda.png'),
          Statistieken: require('@/assets/icons/Statistieken.png'),
        };

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.75}
          >
            <View style={styles.iconWrap}>
              <Image source={icons[route.name]} style={[styles.icon, { tintColor: focused ? theme.color : COLORS.mutedForeground }]} />
            </View>
            <Text style={[styles.label, { color: focused ? theme.color : COLORS.mutedForeground }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    backgroundColor: '#FFF',
    borderTopWidth: 0.666667,
    borderTopColor: 'rgba(0,0,0,0.04)',
    zIndex: 9999,
  },
  separator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 0.666667,
    backgroundColor: 'rgba(0,0,0,0.04)',
    zIndex: 2,
  },
  nativeTopShadowWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: THEME.sizes.tabBarHeight,
    height: 28,
    alignItems: 'center',
    zIndex: 9999,
  },
  nativeTopShadow: {
    width: '100%',
    maxWidth: CARD_CONTENT_WIDTH + 48,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  
  container: {
    width: '100%',
    minHeight: THEME.sizes.tabBarHeight,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.s,
    paddingTop: THEME.spacing.s,
    paddingBottom: THEME.spacing.m,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  
  label: {
    marginTop: 0,
    fontSize: 11,
    fontWeight: '500',
  },
  wrapperContacten: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: THEME.sizes.tabBarHeight,
    alignItems: 'center',
    zIndex: 99999,
  },
  fabOverlay: {
    width: '100%',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingTop: 32,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  fabButton: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: 520,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: THEME.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  fabButtonLarge: {
    width: CARD_CONTENT_WIDTH - 32,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: THEME.spacing.m,
    marginHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
  },
  fabText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 15,
  },
  button: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: THEME.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  secondaryButton: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.foreground,
    fontWeight: '600',
    fontSize: 14,
  },
});
