
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './components/ErrorBoundary';
import HomeScreen from './screens/HomeScreen';
import ColorsScreen from './screens/ColorsScreen';
import ChainCalculatorScreen from './screens/ChainCalculatorScreen';
import LobbyScreen from './screens/LobbyScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#020617' } // slate-950
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Colors" component={ColorsScreen} />
          <Stack.Screen name="ChainCalculator" component={ChainCalculatorScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
