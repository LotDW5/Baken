import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import Agenda from './app/(tabs)/agenda';
import Contacten from './app/(tabs)/contacten';
import HomeScreen from './app/(tabs)/index';
import Instellingen from './app/(tabs)/instellingen';
import Profiel from './app/(tabs)/profiel';
import Statistieken from './app/(tabs)/statistieken';
import MoodCheckInScreen from './app/stemming/[mood].tsx';
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
          <Stack.Screen name="Stemming" component={MoodCheckInScreen} />
        <Stack.Screen name="Profiel" component={Profiel} />
        <Stack.Screen name="Instellingen" component={Instellingen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
