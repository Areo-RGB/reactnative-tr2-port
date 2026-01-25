import { useMemo } from 'react';
import type { GameStateData, Role } from '../types';

export function useNearbyLobby(_deviceId: string, _deviceName: string) {
    const defaultState: GameStateData = { state: 'LOBBY' };

    return useMemo(() => ({
        devices: [],
        myRole: 'idle' as Role,
        setMyRole: () => undefined,
        remoteMode: 'none' as const,
        joinLobby: () => undefined,
        leaveLobby: () => undefined,
        gameState: defaultState,
        startGame: () => undefined,
        stopGame: () => undefined,
        sendCommand: () => undefined,
        sendSettings: () => undefined,
        lastCommand: null,
        backToWhiteSettings: { enabled: false, duration: 2 },
        isLoading: false,
        error: null,
        clearError: () => undefined,
    }), []);
}
