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
import Nonverbaal from './app/(tabs)/nonverbaal';
import NonverbaalMessage from './app/(tabs)/nonverbaal-bericht';
import Profiel from './app/(tabs)/profiel';
import Statistieken from './app/(tabs)/statistieken';
import Ademen from './app/Ademen';
import Onboarding from './app/onboarding';
import BottomTabBar from './components/ui/bottom-tab-bar';

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
      <Tab.Screen name="Nonverbaal" component={Nonverbaal} />
      <Tab.Screen name="NonverbaalMessage" component={NonverbaalMessage} />
      <Tab.Screen name="Profiel" component={Profiel} options={{ tabBarStyle: { display: 'none' } }} />
      <Tab.Screen name="Instellingen" component={Instellingen} options={{ tabBarStyle: { display: 'none' } }} />
      {/* Nonverbaal screens are full-screen Stack screens (no bottom tab) */}
      <Tab.Screen name="NieuweAfspraak" component={NieuweAfspraak} options={{ tabBarStyle: { display: 'none' } }} />
      <Tab.Screen name="Statistieken" component={Statistieken} />
    </Tab.Navigator>
  );
}

export default function App() {
  // Always start on `Ademen` (breathing) screen; it will redirect after its 5s timer.
  const initialRoute = 'Ademen';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Ademen" component={Ademen} />
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="ContactForm" component={ContactForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
