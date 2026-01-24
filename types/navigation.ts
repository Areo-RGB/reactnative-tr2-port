import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

/**
 * Navigation parameters for each screen in the app
 */
export type RootStackParamList = {
    Home: undefined;
    Colors: ColorsScreenParams;
    ChainCalculator: undefined;
    Lobby: LobbyScreenParams;
};

/**
 * Parameters for ColorsScreen
 */
export type ColorsScreenParams = {
    remoteStart?: boolean;
    clientId?: string;
    connectionMode?: 'firebase' | 'nearby';
} | undefined;

/**
 * Parameters for LobbyScreen
 */
export type LobbyScreenParams = {
    initialRole?: 'display' | 'controller';
} | undefined;

/**
 * Navigation prop type for each screen
 */
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type ColorsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Colors'>;
export type ColorsScreenRouteProp = RouteProp<RootStackParamList, 'Colors'>;
export type ChainCalculatorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChainCalculator'>;
export type LobbyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lobby'>;
export type LobbyScreenRouteProp = RouteProp<RootStackParamList, 'Lobby'>;

/**
 * Global navigation type declaration for React Navigation
 */
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
