import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as Device from 'expo-device';
import { useNearbyLobby } from '../hooks/useNearbyLobby';
import { Role, LobbyDevice, GameStateData } from '../types';

// Singleton IDs for the session
const CLIENT_ID = 'V4-' + Math.random().toString(36).substring(7);

const getDeviceName = (): string => {
    const name = Device.deviceName || Device.modelName;
    const manufacturer = Device.manufacturer;

    if (!name) {
        return `Device ${CLIENT_ID.substring(0, 4)}`;
    }

    if (manufacturer && !name.toLowerCase().includes(manufacturer.toLowerCase())) {
        return `${manufacturer} ${name}`;
    }

    return name;
};

const DEVICE_NAME = getDeviceName();

interface LobbyContextType {
    CLIENT_ID: string;
    DEVICE_NAME: string;

    // Combined Lobby State
    devices: LobbyDevice[];
    myRole: Role;
    setMyRole: (role: Role) => void;
    remoteMode: 'none' | 'lobby' | 'controller' | 'display';
    joinLobby: () => void;
    leaveLobby: () => void;
    gameState: GameStateData;
    startGame: (game: 'colors' | 'chain-calc') => void;
    stopGame: () => void;
    sendCommand: (payload: { name: string; class: string }, targetId?: string) => void;
    sendSettings: (settings: { backToWhite: boolean; duration: number }, targetId?: string) => void;
    lastCommand: { name: string; class: string; timestamp: number } | null;
    backToWhiteSettings: { enabled: boolean; duration: number };
    isLoading: boolean;
    error: { code: string; message: string } | null;
}

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

export const LobbyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Only use Fast Nearby Connections
    const nearbyLobby = useNearbyLobby(CLIENT_ID, DEVICE_NAME);

    const value = useMemo(() => ({
        CLIENT_ID,
        DEVICE_NAME,
        ...nearbyLobby
    }), [nearbyLobby]);

    return (
        <LobbyContext.Provider value={value}>
            {children}
        </LobbyContext.Provider>
    );
};

export const useLobby = () => {
    const context = useContext(LobbyContext);
    if (context === undefined) {
        throw new Error('useLobby must be used within a LobbyProvider');
    }
    return context;
};
