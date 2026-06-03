import { getTheme } from '@/constants/colors';
import THEME from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// eslint-disable-next-line import/no-named-as-default
import applyShadow from '@/utils/shadow';

export default function BottomTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const theme = getTheme();
  // navigation fills full width; internal padding keeps buttons away from edges

  return (
    <View style={[styles.wrapper, applyShadow({ opacity: 0.12, radius: 14, offsetX: 0, offsetY: -6, elevation: 12 })]}>
      <View style={styles.container}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const descriptor = descriptors[route.key];
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
              <Image source={icons[route.name]} style={[styles.icon, { tintColor: focused ? theme.color : '#B0A299' }]} />
            </View>
            <Text style={[styles.label, { color: focused ? theme.color : '#B0A299' }]}>{label}</Text>
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
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
});
