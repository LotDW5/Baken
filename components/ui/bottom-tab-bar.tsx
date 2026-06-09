import { COLORS, MOOD_OPTIONS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import applyShadow from '@/utils/shadow';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BottomTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const theme = useAppTheme();
  // Always render the bottom tab bar for every route
  // navigation fills full width; internal padding keeps buttons away from edges

  return (
    <View testID="bottom-tab-bar-wrapper" style={[styles.wrapper, applyShadow({ opacity: 0.12, radius: 14, offsetX: 0, offsetY: -6, elevation: 12 })]}>
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
          const moodParam = currentNestedRoute && currentNestedRoute.params ? (currentNestedRoute.params as any).mood : undefined;

          if (isStemmingRoute) {
            const onPress = () => {
              (navigation as any).navigate('Check-in', { screen: 'Activiteiten', params: { mood: moodParam } });
            };

            const selectedMood = MOOD_OPTIONS.find(m => m.id === moodParam);
            const bgColor = selectedMood ? selectedMood.color : theme.color;

            return (
              <View style={styles.fabWrap} pointerEvents="box-none">
                <TouchableOpacity style={[styles.fabButtonLarge, { backgroundColor: bgColor }]} onPress={onPress}>
                  <Text style={[styles.fabText, { color: COLORS.white }]}>Ga verder</Text>
                </TouchableOpacity>
              </View>
            );
          }

          if (isActiviteitenRoute) {
            const onPress = () => {
              // Try to emit a custom event to the nested Activiteiten route (listener based)
              console.log('[bottom-tab-bar] Overslaan FAB pressed');
              // Navigate with a changing param to ensure the screen reacts when focused
              console.log('[bottom-tab-bar] navigating to Activiteiten with __overslaan param');
              (navigation as any).navigate('Check-in', { screen: 'Activiteiten', params: { __overslaan: Date.now(), mood: moodParam } });
            };

            return (
              <View style={styles.fabWrap} pointerEvents="box-none">
                <TouchableOpacity style={styles.fabButton} onPress={onPress}>
                  <Text style={[styles.fabText, { color: COLORS.foreground }]}>Overslaan</Text>
                </TouchableOpacity>
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
    left: THEME.spacing.l,
    right: THEME.spacing.l,
    bottom: THEME.sizes.tabBarHeight + 48,
    alignItems: 'center',
    zIndex: 9999,
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
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#3CA98A',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: THEME.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  fabText: {
    color: COLORS.foreground,
    fontWeight: '600',
    fontSize: 15,
  },
});
