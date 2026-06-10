import { COLORS } from '@/constants/colors';
import THEME from '@/constants/theme';
import useAppTheme from '@/hooks/use-app-theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Layout constants matching app tokens
const CARD_MAX_WIDTH = 393;
const CARD_CONTENT_WIDTH = CARD_MAX_WIDTH - 48;
// eslint-disable-next-line import/no-named-as-default
import applyShadow from '@/utils/shadow';

export default function BottomTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const theme = useAppTheme();
  // navigation fills full width; internal padding keeps buttons away from edges

  return (
    <View style={[styles.wrapper, applyShadow({ opacity: 0.12, radius: 14, offsetX: 0, offsetY: -6, elevation: 12 })]}>
      {/* Web-specific floating action for nested Check-in -> Activiteiten (keeps button above nav) */}
      {Platform.OS === 'web' && (() => {
        const focusedRoute = state.routes[state.index];
        const nested = focusedRoute.state as any;
        const nestedActiveName = nested && nested.routes && nested.routes.length > 0 ? nested.routes[nested.index].name : null;
        // Show Ga verder on Stemming, and an Overslaan white FAB on Activiteiten
        if (focusedRoute.name === 'Check-in' && nestedActiveName === 'Stemming') {
          const currentNestedRoute = nested && nested.routes && nested.routes.length > 0 ? nested.routes[nested.index] : null;
          const moodParam = currentNestedRoute && currentNestedRoute.params ? (currentNestedRoute.params as any).mood : undefined;

          
          
        }
        return null;
      })()}
      <View style={styles.container}>
      {state.routes.map((route, index) => {
        // Only render the four main tabs
        const VISIBLE_TABS = ['Check-in', 'Contacten', 'Agenda', 'Statistieken'];
        if (!VISIBLE_TABS.includes(route.name)) return null;
        // Determine whether this tab is focused
        let focused = state.index === index;
        // If the Check-in tab contains a nested stack, only mark it focused
        // when its nested stack is on the Home route (so nested screens
        // like Stemming / Activiteiten do NOT keep the tab highlighted).
        if (route.name === 'Check-in') {
          const nested = route.state as any;
          const nestedActiveName = nested && nested.routes && nested.routes.length > 0 ? nested.routes[nested.index].name : null;
          if (nestedActiveName && nestedActiveName !== 'Home') {
            focused = false;
          }
        }
        const descriptor = descriptors[route.key];
        // Allow screens to hide their tab via `options.tabBarVisible === false`
        if (descriptor && descriptor.options && (descriptor.options as any).tabBarVisible === false) {
          return null;
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
  fabWrap: {
    position: 'absolute',
    left: THEME.spacing.s,
    right: THEME.spacing.s,
    bottom: THEME.sizes.tabBarHeight + 24,
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
    borderRadius: 24,
    paddingVertical: 16,
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
