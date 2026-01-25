import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getDatabase,
    ref,
    set,
    push,
    onValue,
    off,
    onDisconnect,
    DatabaseReference,
    DataSnapshot
} from 'firebase/database';
import { Role, LobbyDevice as Device, GameStateData } from '../types';

export type NearbyLobbyError = {
    code: string;
    message: string;
};

// Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyBUgv3d448nUtUeCfZ63hEYg_fawXuInkw',
    authDomain: 'colors-3ee8b.firebaseapp.com',
    databaseURL: 'https://colors-3ee8b-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'colors-3ee8b',
    storageBucket: 'colors-3ee8b.firebasestorage.app',
    messagingSenderId: '640372354779',
    appId: '1:640372354779:web:7fdaea7efba8dc35e8a6fe'
};

// Initialize Firebase (singleton)
function initializeFirebaseApp() {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

// Generate or retrieve device ID from localStorage
function getDeviceId(): string {
    const stored = localStorage.getItem('nearby_device_id');
    if (stored) return stored;

    const newId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('nearby_device_id', newId);
    return newId;
}

// Default device name for web
function getDefaultDeviceName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Web Browser (Chrome)';
    if (userAgent.includes('Firefox')) return 'Web Browser (Firefox)';
    if (userAgent.includes('Safari')) return 'Web Browser (Safari)';
    if (userAgent.includes('Edge')) return 'Web Browser (Edge)';
    return 'Web Browser';
}

// Fixed lobby ID for shared web experience
const LOBBY_ID = 'default';

const TIMEOUT_MS = 30000; // 30 seconds timeout for stale devices

interface DisplayData {
    id: string;
    client_id: string;
    role: Role;
    name: string;
    lastSeen: number;
}

interface CommandMessage {
    type: 'command';
    name: string;
    class: string;
    timestamp: number;
}

interface SettingsMessage {
    type: 'settings';
    backToWhite: boolean;
    duration: number;
}

export function useNearbyLobby(deviceId: string, deviceName: string) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [myRole, setMyRole] = useState<Role>('idle');
    const [remoteMode, setRemoteMode] = useState<'none' | 'lobby' | 'controller' | 'display'>('none');
    const [gameState, setGameState] = useState<GameStateData>({ state: 'LOBBY' });
    const [lastCommand, setLastCommand] = useState<{ name: string; class: string; timestamp: number } | null>(null);
    const [isLoading] = useState(false);
    const [error, setError] = useState<NearbyLobbyError | null>(null);
    const [backToWhiteSettings, setBackToWhiteSettings] = useState<{
        enabled: boolean;
        duration: number;
    }>({ enabled: false, duration: 2 });

    // Use provided or default device ID/name
    const effectiveDeviceId = deviceId || getDeviceId();
    const effectiveDeviceName = deviceName || getDefaultDeviceName();

    // Firebase refs
    const dbRef = useRef<ReturnType<typeof getDatabase> | null>(null);
    const presenceRef = useRef<DatabaseReference | null>(null);
    const displaysRef = useRef<DatabaseReference | null>(null);
    const commandsRef = useRef<DatabaseReference | null>(null);
    const settingsRef = useRef<DatabaseReference | null>(null);
    const gameStateRef = useRef<DatabaseReference | null>(null);
    const mySettingsRef = useRef<DatabaseReference | null>(null);

    // Active state tracking
    const activeState = useRef<{ mode: string; role: string }>({ mode: 'none', role: 'idle' });
    const isConnected = useRef(false);

    // Clear error callback
    const clearError = useCallback(() => setError(null), []);

    // Initialize Firebase
    useEffect(() => {
        try {
            const app = initializeFirebaseApp();
            dbRef.current = getDatabase(app);
        } catch (err: any) {
            console.error('Firebase: Initialization failed', err);
            setError({
                code: 'INIT_FAILED',
                message: err.message || 'Failed to initialize Firebase'
            });
        }
    }, []);

    // Cleanup all listeners
    const cleanupListeners = useCallback(() => {
        if (!dbRef.current) return;

        if (presenceRef.current) {
            off(presenceRef.current);
            presenceRef.current = null;
        }
        if (displaysRef.current) {
            off(displaysRef.current);
            displaysRef.current = null;
        }
        if (commandsRef.current) {
            off(commandsRef.current);
            commandsRef.current = null;
        }
        if (settingsRef.current) {
            off(settingsRef.current);
            settingsRef.current = null;
        }
        if (gameStateRef.current) {
            off(gameStateRef.current);
            gameStateRef.current = null;
        }
        if (mySettingsRef.current) {
            off(mySettingsRef.current);
            mySettingsRef.current = null;
        }
    }, []);

    // Setup presence tracking for displays
    const setupDisplayPresence = useCallback(async () => {
        if (!dbRef.current || isConnected.current) return;

        try {
            const db = dbRef.current;

            // Register this display
            presenceRef.current = ref(db, `lobbies/${LOBBY_ID}/displays/${effectiveDeviceId}`);
            const displayData: DisplayData = {
                id: effectiveDeviceId,
                client_id: effectiveDeviceId,
                role: 'display',
                name: effectiveDeviceName,
                lastSeen: Date.now()
            };

            await set(presenceRef.current, displayData);

            // Setup onDisconnect to remove presence
            await onDisconnect(presenceRef.current).remove();

            // Listen for connection state to refresh presence
            const connectedRef = ref(db, '.info/connected');
            const handleConnected = (snap: DataSnapshot) => {
                isConnected.current = snap.val() === true;
                if (isConnected.current && presenceRef.current) {
                    set(presenceRef.current, {
                        ...displayData,
                        lastSeen: Date.now()
                    });
                    onDisconnect(presenceRef.current).remove();
                }
            };

            onValue(connectedRef, handleConnected);

            // Store connected ref for cleanup
            presenceRef.current = connectedRef;

            // Listen for incoming commands
            commandsRef.current = ref(db, `lobbies/${LOBBY_ID}/messages/${effectiveDeviceId}/commands`);
            onValue(commandsRef.current, (snap: DataSnapshot) => {
                const data = snap.val();
                if (!data) return;

                // Get the most recent command
                const commands = Object.values(data) as CommandMessage[];
                const latestCommand = commands
                    .filter(cmd => cmd.timestamp > Date.now() - 10000)
                    .sort((a, b) => b.timestamp - a.timestamp)[0];

                if (latestCommand) {
                    setLastCommand({
                        name: latestCommand.name,
                        class: latestCommand.class,
                        timestamp: latestCommand.timestamp
                    });
                }
            });

            // Listen for settings updates
            mySettingsRef.current = ref(db, `lobbies/${LOBBY_ID}/messages/${effectiveDeviceId}/settings`);
            onValue(mySettingsRef.current, (snap: DataSnapshot) => {
                const data = snap.val();
                if (data && typeof data === 'object') {
                    setBackToWhiteSettings({
                        enabled: data.backToWhite ?? false,
                        duration: data.duration ?? 2
                    });
                }
            });

            // Listen for game state changes
            gameStateRef.current = ref(db, `lobbies/${LOBBY_ID}/state`);
            onValue(gameStateRef.current, (snap: DataSnapshot) => {
                const data = snap.val();
                if (data) {
                    setGameState(data);
                }
            });

            // Keep presence alive with periodic updates
            const keepAlive = setInterval(() => {
                if (presenceRef.current && presenceRef.current.key !== '.info/connected') {
                    const displayRef = ref(db, `lobbies/${LOBBY_ID}/displays/${effectiveDeviceId}/lastSeen`);
                    set(displayRef, Date.now()).catch(() => {});
                }
            }, 5000);

            // Store interval for cleanup
            (presenceRef.current as any)._keepAlive = keepAlive;

        } catch (err: any) {
            console.error('Firebase: Display presence setup failed', err);
            setError({
                code: 'PRESENCE_FAILED',
                message: err.message || 'Failed to setup display presence'
            });
        }
    }, [effectiveDeviceId, effectiveDeviceName]);

    // Setup controller (discover displays)
    const setupControllerDiscovery = useCallback(() => {
        if (!dbRef.current) return;

        try {
            const db = dbRef.current;

            // Listen for all displays
            displaysRef.current = ref(db, `lobbies/${LOBBY_ID}/displays`);
            onValue(displaysRef.current, (snap: DataSnapshot) => {
                const data = snap.val();
                if (!data) {
                    setDevices([]);
                    return;
                }

                const now = Date.now();
                const displays: Device[] = [];

                Object.entries(data).forEach(([id, displayData]: [string, any]) => {
                    // Filter out stale devices
                    if (now - displayData.lastSeen > TIMEOUT_MS) return;

                    displays.push({
                        id: displayData.id || id,
                        client_id: displayData.client_id || id,
                        role: displayData.role || 'display',
                        name: displayData.name || 'Unknown Display',
                        lastSeen: displayData.lastSeen
                    });
                });

                setDevices(displays);
            });

            // Listen for game state changes
            gameStateRef.current = ref(db, `lobbies/${LOBBY_ID}/state`);
            onValue(gameStateRef.current, (snap: DataSnapshot) => {
                const data = snap.val();
                if (data) {
                    setGameState(data);
                }
            });

        } catch (err: any) {
            console.error('Firebase: Controller discovery setup failed', err);
            setError({
                code: 'DISCOVERY_FAILED',
                message: err.message || 'Failed to setup controller discovery'
            });
        }
    }, []);

    // Main effect: handle mode/role changes
    useEffect(() => {
        if (remoteMode === activeState.current.mode && myRole === activeState.current.role) {
            return;
        }

        // Cleanup previous state
        cleanupListeners();

        // Update active state
        activeState.current = { mode: remoteMode, role: myRole };

        if (remoteMode === 'none' || myRole === 'idle') {
            setDevices([]);
            isConnected.current = false;
            return;
        }

        if (myRole === 'display') {
            setupDisplayPresence();
        } else if (myRole === 'controller') {
            setupControllerDiscovery();
        }
    }, [remoteMode, myRole, setupDisplayPresence, setupControllerDiscovery, cleanupListeners]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupListeners();

            // Clear presence if connected
            if (presenceRef.current && dbRef.current) {
                const db = dbRef.current;
                const myPresenceRef = ref(db, `lobbies/${LOBBY_ID}/displays/${effectiveDeviceId}`);
                set(myPresenceRef, null).catch(() => {});

                // Clear keepalive interval
                if ((presenceRef.current as any)._keepAlive) {
                    clearInterval((presenceRef.current as any)._keepAlive);
                }
            }
        };
    }, [effectiveDeviceId, cleanupListeners]);

    const joinLobby = useCallback(() => setRemoteMode('lobby'), []);

    const leaveLobby = useCallback(() => {
        setRemoteMode('none');
        setMyRole('idle');
        cleanupListeners();

        // Clear presence
        if (dbRef.current) {
            const db = dbRef.current;
            const myPresenceRef = ref(db, `lobbies/${LOBBY_ID}/displays/${effectiveDeviceId}`);
            set(myPresenceRef, null).catch(() => {});

            // Clear keepalive
            if (presenceRef.current && (presenceRef.current as any)._keepAlive) {
                clearInterval((presenceRef.current as any)._keepAlive);
            }
        }

        setDevices([]);
        isConnected.current = false;
    }, [effectiveDeviceId, cleanupListeners]);

    const startGame = useCallback(async (game: 'colors' | 'chain-calc') => {
        if (!dbRef.current) return;

        const nextState: GameStateData = { state: 'RUNNING', game };
        setGameState(nextState);

        try {
            const db = dbRef.current;
            const stateRef = ref(db, `lobbies/${LOBBY_ID}/state`);
            await set(stateRef, nextState);
        } catch (err: any) {
            console.error('Firebase: Start game failed', err);
            setError({
                code: 'START_GAME_FAILED',
                message: err.message || 'Failed to start game'
            });
        }
    }, []);

    const stopGame = useCallback(async () => {
        if (!dbRef.current) return;

        const nextState: GameStateData = { state: 'LOBBY' };
        setGameState(nextState);

        try {
            const db = dbRef.current;
            const stateRef = ref(db, `lobbies/${LOBBY_ID}/state`);
            await set(stateRef, nextState);
        } catch (err: any) {
            console.error('Firebase: Stop game failed', err);
            setError({
                code: 'STOP_GAME_FAILED',
                message: err.message || 'Failed to stop game'
            });
        }
    }, []);

    const sendCommand = useCallback(async (payload: { name: string; class: string }, targetId?: string) => {
        if (!dbRef.current) return;

        const cmd: CommandMessage = {
            type: 'command',
            name: payload.name,
            class: payload.class,
            timestamp: Date.now()
        };

        try {
            const db = dbRef.current;

            if (targetId) {
                // Send to specific display
                const commandRef = ref(db, `lobbies/${LOBBY_ID}/messages/${targetId}/commands`);
                await push(commandRef, cmd);
            } else {
                // Send to all displays
                if (devices.length === 0) return;

                await Promise.all(
                    devices.map(device => {
                        const commandRef = ref(db, `lobbies/${LOBBY_ID}/messages/${device.id}/commands`);
                        return push(commandRef, cmd);
                    })
                );
            }
        } catch (err: any) {
            console.error('Firebase: Send command failed', err);
            setError({
                code: 'SEND_COMMAND_FAILED',
                message: err.message || 'Failed to send command'
            });
        }
    }, [devices]);

    const sendSettings = useCallback(async (settings: { backToWhite: boolean; duration: number }) => {
        if (!dbRef.current) return;

        const payload: SettingsMessage = {
            type: 'settings',
            backToWhite: settings.backToWhite,
            duration: settings.duration
        };

        try {
            const db = dbRef.current;

            // Send settings to all displays
            if (devices.length === 0) return;

            await Promise.all(
                devices.map(device => {
                    const settingsRef = ref(db, `lobbies/${LOBBY_ID}/messages/${device.id}/settings`);
                    return set(settingsRef, payload);
                })
            );
        } catch (err: any) {
            console.error('Firebase: Send settings failed', err);
            setError({
                code: 'SEND_SETTINGS_FAILED',
                message: err.message || 'Failed to send settings'
            });
        }
    }, [devices]);

    return useMemo(() => ({
        devices,
        myRole,
        setMyRole,
        remoteMode,
        joinLobby,
        leaveLobby,
        gameState,
        startGame,
        stopGame,
        sendCommand,
        sendSettings,
        lastCommand,
        backToWhiteSettings,
        isLoading,
        error,
        clearError
    }), [
        devices,
        myRole,
        remoteMode,
        joinLobby,
        leaveLobby,
        gameState,
        startGame,
        stopGame,
        sendCommand,
        sendSettings,
        lastCommand,
        backToWhiteSettings,
        isLoading,
        error,
        clearError
    ]);
}
