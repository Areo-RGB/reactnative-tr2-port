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

export function useFirebaseLobby(deviceId: string, deviceName: string) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [myRole, setMyRole] = useState<Role>('idle');
    const [remoteMode, setRemoteMode] = useState<'none' | 'lobby' | 'controller' | 'display'>('none');
    const [gameState, setGameState] = useState<GameStateData>({ state: 'LOBBY' });
    const [lastCommand, setLastCommand] = useState<any>(null);

    // 1a. Initial Presence Setup (only when joining lobby)
    useEffect(() => {
        if (remoteMode === 'none') return;

        const deviceRef = ref(db, `session/default/devices/${deviceId}`);

        // Set initial presence
        set(deviceRef, {
            id: deviceId,
            client_id: deviceId,
            name: deviceName,
            role: myRole,
            lastSeen: Date.now()
        });

        // Handle disconnect
        const disconnectRef = onDisconnect(deviceRef);
        disconnectRef.remove();

        return () => {
            // Only remove on true unmount (leaving lobby)
            remove(deviceRef);
        };
    }, [remoteMode, deviceId, deviceName]); // Note: myRole removed from deps

    // 1b. Update role separately (without triggering full presence cleanup)
    useEffect(() => {
        if (remoteMode === 'none') return;

        const deviceRef = ref(db, `session/default/devices/${deviceId}`);
        update(deviceRef, {
            role: myRole,
            lastSeen: Date.now()
        });
    }, [myRole, remoteMode, deviceId]);

    // 2. Listen to Device List
    useEffect(() => {
        if (remoteMode === 'none') return;

        const allDevicesRef = ref(db, 'session/default/devices');
        const unsubscribe = onValue(allDevicesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const deviceList = Object.values(data) as Device[];
                // Filter stales? tr2 doesn't do it explicitly in the view, but we can.
                // Let's rely on onDisconnect for now, or add filter if needed.
                setDevices(deviceList);
            } else {
                setDevices([]);
            }
        });

        return () => unsubscribe();
    }, [remoteMode]);

    // 3. Listen to Game State
    useEffect(() => {
        if (remoteMode === 'none') return;

        const gameStateRef = ref(db, 'session/default/game_state');
        const unsubscribe = onValue(gameStateRef, (snapshot) => {
            const val = snapshot.val();
            // Value can be string "RUNNING" or object { state: "RUNNING", game: "..." }
            let state: 'LOBBY' | 'RUNNING' = 'LOBBY';
            let game: 'colors' | 'chain-calc' | undefined = undefined;

            if (typeof val === 'string') {
                state = val as any;
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
        });

        return () => unsubscribe();
    }, [remoteMode, myRole]);

    // 4. Listen for Commands (Display specific)
    useEffect(() => {
        // We listen for commands if we are in display or controller mode (to confirm?)
        // tr2 listens only in 'display' mode.
        // But for Chain Calc we might need it.
        if (remoteMode === 'none') return;

        const commandRef = ref(db, `session/default/commands/${deviceId}`);
        const unsubscribe = onValue(commandRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.timestamp > (Date.now() - 5000)) { // Only recent commands
                setLastCommand(data);
            }
        });

        return () => unsubscribe();
    }, [remoteMode, deviceId]);


    // Actions
    const joinLobby = () => setRemoteMode('lobby');
    const leaveLobby = () => {
        setRemoteMode('none');
        setMyRole('idle');
    };

    const startGame = (game: 'colors' | 'chain-calc') => {
        if (myRole !== 'controller') return;
        set(ref(db, 'session/default/game_state'), { state: 'RUNNING', game });
    };

    const stopGame = () => {
        if (myRole !== 'controller') return;
        set(ref(db, 'session/default/game_state'), 'LOBBY');
    };

    const sendCommand = (payload: any, targetId?: string) => {
        const cmd = {
            ...payload,
            timestamp: Date.now()
        };

        if (targetId) {
            set(ref(db, `session/default/commands/${targetId}`), cmd);
        } else {
            // Broadcast to all displays
            const displays = devices.filter(d => d.role === 'display');
            displays.forEach(d => {
                set(ref(db, `session/default/commands/${d.id}`), cmd);
            });
        }
    };

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
        lastCommand
    };
}
