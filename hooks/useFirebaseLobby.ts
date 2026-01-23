import { useState, useEffect, useCallback } from 'react';
import { ref, set, onValue, onDisconnect, remove, update } from 'firebase/database';
import { db } from '../utils/firebase';

export type Role = 'display' | 'controller' | 'idle';

export interface Device {
    id: string;
    client_id: string; // Keep for compatibility, same as id
    role: Role;
    name: string;
    lastSeen: number;
}

export interface GameStateData {
    state: 'LOBBY' | 'RUNNING';
    game?: 'colors' | 'chain-calc';
}

export interface FirebaseError {
    code: string;
    message: string;
}

export function useFirebaseLobby(deviceId: string, deviceName: string) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [myRole, setMyRole] = useState<Role>('idle');
    const [remoteMode, setRemoteMode] = useState<'none' | 'lobby' | 'controller' | 'display'>('none');
    const [gameState, setGameState] = useState<GameStateData>({ state: 'LOBBY' });
    const [lastCommand, setLastCommand] = useState<{ name: string; class: string; timestamp: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<FirebaseError | null>(null);

    const clearError = useCallback(() => setError(null), []);

    // Helper to wrap Firebase operations with error handling
    const withErrorHandling = useCallback(async <T,>(
        operation: () => T,
        errorMessage: string
    ): Promise<T | null> => {
        try {
            setIsLoading(true);
            clearError();
            const result = await operation();
            return result;
        } catch (err: any) {
            console.error(errorMessage, err);
            setError({
                code: err.code || 'UNKNOWN',
                message: err.message || errorMessage
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [clearError]);

    // 1a. Initial Presence Setup (only when joining lobby)
    useEffect(() => {
        if (remoteMode === 'none') return;

        const deviceRef = ref(db, `session/default/devices/${deviceId}`);

        const setupPresence = async () => {
            await withErrorHandling(async () => {
                await set(deviceRef, {
                    id: deviceId,
                    client_id: deviceId,
                    name: deviceName,
                    role: myRole,
                    lastSeen: Date.now()
                });

                // Handle disconnect
                const disconnectRef = onDisconnect(deviceRef);
                disconnectRef.remove();
            }, 'Failed to set up presence in Firebase');
        };

        setupPresence();

        return () => {
            // Only remove on true unmount (leaving lobby)
            remove(deviceRef).catch(err => {
                console.error('Failed to remove device on unmount:', err);
            });
        };
    }, [remoteMode, deviceId, deviceName, myRole, withErrorHandling]);

    // 1b. Update role separately (without triggering full presence cleanup)
    useEffect(() => {
        if (remoteMode === 'none') return;

        const deviceRef = ref(db, `session/default/devices/${deviceId}`);
        update(deviceRef, {
            role: myRole,
            lastSeen: Date.now()
        }).catch(err => {
            console.error('Failed to update role:', err);
            setError({
                code: err.code || 'UPDATE_FAILED',
                message: err.message || 'Failed to update role'
            });
        });
    }, [myRole, remoteMode, deviceId]);

    // 2. Listen to Device List
    useEffect(() => {
        if (remoteMode === 'none') return;

        const allDevicesRef = ref(db, 'session/default/devices');
        const unsubscribe = onValue(allDevicesRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    const deviceList = Object.values(data) as Device[];
                    setDevices(deviceList);
                } else {
                    setDevices([]);
                }
                clearError();
            } catch (err: any) {
                console.error('Failed to parse device list:', err);
                setError({
                    code: 'PARSE_ERROR',
                    message: 'Failed to parse device list'
                });
            }
        }, (error: { code?: string; message?: string }) => {
            console.error('Firebase device list error:', error);
            setError({
                code: error.code || 'LISTEN_ERROR',
                message: error.message || 'Failed to listen to device list'
            });
        });

        return () => unsubscribe();
    }, [remoteMode, clearError]);

    // 3. Listen to Game State
    useEffect(() => {
        if (remoteMode === 'none') return;

        const gameStateRef = ref(db, 'session/default/game_state');
        const unsubscribe = onValue(gameStateRef, (snapshot) => {
            try {
                const val = snapshot.val();
                // Value can be string "RUNNING" or object { state: "RUNNING", game: "..." }
                let state: 'LOBBY' | 'RUNNING' = 'LOBBY';
                let game: 'colors' | 'chain-calc' | undefined = undefined;

                if (typeof val === 'string') {
                    state = val as 'LOBBY' | 'RUNNING';
                } else if (typeof val === 'object' && val) {
                    state = val.state;
                    game = val.game;
                }

                setGameState({ state, game });

                // Auto-transition logic (like in tr2)
                if (state === 'RUNNING' && remoteMode === 'lobby' && myRole !== 'idle') {
                    setRemoteMode(myRole === 'controller' ? 'controller' : 'display');
                }
                if (state === 'LOBBY' && (remoteMode === 'controller' || remoteMode === 'display')) {
                    setRemoteMode('lobby');
                }
                clearError();
            } catch (err: any) {
                console.error('Failed to parse game state:', err);
                setError({
                    code: 'PARSE_ERROR',
                    message: 'Failed to parse game state'
                });
            }
        }, (error: { code?: string; message?: string }) => {
            console.error('Firebase game state error:', error);
            setError({
                code: error.code || 'LISTEN_ERROR',
                message: error.message || 'Failed to listen to game state'
            });
        });

        return () => unsubscribe();
    }, [remoteMode, myRole, clearError]);

    // 4. Listen for Commands (Display specific)
    useEffect(() => {
        // We listen for commands if we are in display or controller mode (to confirm?)
        // tr2 listens only in 'display' mode.
        // But for Chain Calc we might need it.
        if (remoteMode === 'none') return;

        const commandRef = ref(db, `session/default/commands/${deviceId}`);
        const unsubscribe = onValue(commandRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data && data.timestamp > (Date.now() - 5000)) { // Only recent commands
                    setLastCommand(data);
                }
                clearError();
            } catch (err: any) {
                console.error('Failed to parse command:', err);
                setError({
                    code: 'PARSE_ERROR',
                    message: 'Failed to parse command'
                });
            }
        }, (error: { code?: string; message?: string }) => {
            console.error('Firebase command error:', error);
            setError({
                code: error.code || 'LISTEN_ERROR',
                message: error.message || 'Failed to listen to commands'
            });
        });

        return () => unsubscribe();
    }, [remoteMode, deviceId, clearError]);


    // Actions
    const joinLobby = useCallback(() => setRemoteMode('lobby'), []);
    const leaveLobby = useCallback(() => {
        setRemoteMode('none');
        setMyRole('idle');
    }, []);

    const startGame = useCallback((game: 'colors' | 'chain-calc') => {
        if (myRole !== 'controller') {
            setError({
                code: 'PERMISSION_DENIED',
                message: 'Only controllers can start games'
            });
            return;
        }
        set(ref(db, 'session/default/game_state'), { state: 'RUNNING', game })
            .catch(err => {
                console.error('Failed to start game:', err);
                setError({
                    code: err.code || 'START_FAILED',
                    message: err.message || 'Failed to start game'
                });
            });
    }, [myRole]);

    const stopGame = useCallback(() => {
        if (myRole !== 'controller') {
            setError({
                code: 'PERMISSION_DENIED',
                message: 'Only controllers can stop games'
            });
            return;
        }
        set(ref(db, 'session/default/game_state'), 'LOBBY')
            .catch(err => {
                console.error('Failed to stop game:', err);
                setError({
                    code: err.code || 'STOP_FAILED',
                    message: err.message || 'Failed to stop game'
                });
            });
    }, [myRole]);

    const sendCommand = useCallback((payload: { name: string; class: string }, targetId?: string) => {
        const cmd = {
            ...payload,
            timestamp: Date.now()
        };

        if (targetId) {
            set(ref(db, `session/default/commands/${targetId}`), cmd)
                .catch(err => {
                    console.error('Failed to send command:', err);
                    setError({
                        code: err.code || 'SEND_FAILED',
                        message: err.message || 'Failed to send command'
                    });
                });
        } else {
            // Broadcast to all displays
            const displays = devices.filter(d => d.role === 'display');
            displays.forEach(d => {
                set(ref(db, `session/default/commands/${d.id}`), cmd)
                    .catch(err => {
                        console.error(`Failed to send command to ${d.id}:`, err);
                    });
            });
        }
    }, [devices]);

    return {
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
        lastCommand,
        isLoading,
        error,
        clearError
    };
}
