import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import Agenda from './app/(tabs)/agenda';
import ContactForm from './app/(tabs)/contact-form';
import Contacten from './app/(tabs)/contacten';
import CheckInStack from './app/(tabs)/index';
import Instellingen from './app/(tabs)/instellingen';
import NieuweAfspraak from './app/(tabs)/nieuwe-afspraak';
import Profiel from './app/(tabs)/profiel';
import Statistieken from './app/(tabs)/statistieken';
import BottomTabBar from './components/ui/bottom-tab-bar.tsx';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs() {
  return (
      <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
      })}
    >
      <Tab.Screen name="Check-in" component={CheckInStack} />
        <Tab.Screen name="Contacten" component={Contacten} />
      <Tab.Screen name="Agenda" component={Agenda} />
      <Tab.Screen name="Profiel" component={Profiel} options={{ tabBarVisible: false }} />
      <Tab.Screen name="Instellingen" component={Instellingen} options={{ tabBarVisible: false }} />
      <Tab.Screen name="NieuweAfspraak" component={NieuweAfspraak} options={{ tabBarVisible: false }} />
      <Tab.Screen name="Statistieken" component={Statistieken} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="ContactForm" component={ContactForm} />
        {/* Profiel and Instellingen are now part of the bottom tabs to keep the tab bar visible */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
