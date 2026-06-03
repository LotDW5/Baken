import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image, Platform } from 'react-native';
import 'react-native-gesture-handler';
import Agenda from './app/(tabs)/agenda';
import Contacten from './app/(tabs)/contacten';
import HomeScreen from './app/(tabs)/index';
import Instellingen from './app/(tabs)/instellingen';
import Profiel from './app/(tabs)/profiel';
import Statistieken from './app/(tabs)/statistieken';
import THEME from './constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, any> = {
              'Check-in': require('./assets/icons/Check-in.png'),
              Contacten: require('./assets/icons/Contacten.png'),
              Agenda: require('./assets/icons/Agenda.png'),
              Statistieken: require('./assets/icons/Statistieken.png'),
            };

            const iconNamesWeb: Record<string, string> = {
              'Check-in': 'happy-outline',
              Contacten: 'people-outline',
              Agenda: 'calendar-outline',
              Statistieken: 'stats-chart-outline',
            };

            const src = icons[route.name];
            return (
              <Image
                source={src}
                style={{ width: 20, height: 20, tintColor: color, resizeMode: 'contain' }}
              />
            );
          },
        tabBarActiveTintColor: '#6DB3C1',
        tabBarInactiveTintColor: '#B0A299',
        tabBarStyle: {
          height: THEME.sizes.tabBarHeight,
          paddingBottom: Platform.OS === 'web' ? 10 : 16,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Check-in" component={HomeScreen} />
      <Tab.Screen name="Contacten" component={Contacten} />
      <Tab.Screen name="Agenda" component={Agenda} />
      <Tab.Screen name="Statistieken" component={Statistieken} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="Profiel" component={Profiel} />
        <Stack.Screen name="Instellingen" component={Instellingen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
