import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import * as NearbyConnections from 'expo-nearby-connections';
import { Strategy } from 'expo-nearby-connections';
import { Role, LobbyDevice as Device, GameStateData } from '../types';

export type NearbyLobbyError = {
    code: string;
    message: string;
};

async function requestAndroidPermissions() {
    if (Platform.OS !== 'android') return true;

    console.log('Nearby: Requesting permissions for API level', Platform.Version);

    const permissions: any[] = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ];

    if (Number(Platform.Version) >= 31) {
        permissions.push(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
    }

    if (Number(Platform.Version) >= 33) {
        permissions.push('android.permission.NEARBY_WIFI_DEVICES');
    }

    try {
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        return Object.values(granted).every(
            (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );
    } catch (err) {
        console.error('Nearby: Permission request failed', err);
        return false;
    }
}

export function useNearbyLobby(deviceId: string, deviceName: string) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [myRole, setMyRole] = useState<Role>('idle');
    const [remoteMode, setRemoteMode] = useState<'none' | 'lobby' | 'controller' | 'display'>('none');
    const [gameState, setGameState] = useState<GameStateData>({ state: 'LOBBY' });
    const [lastCommand, setLastCommand] = useState<{ name: string; class: string; timestamp: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<NearbyLobbyError | null>(null);
    const [backToWhiteSettings, setBackToWhiteSettings] = useState<{
        enabled: boolean;
        duration: number;
    }>({ enabled: false, duration: 2 });

    const connectedPeers = useRef<Set<string>>(new Set());
    const discoveredPeers = useRef<Map<string, string>>(new Map());
    const connectingPeers = useRef<Set<string>>(new Set());
    const connectionQueue = useRef<string[]>([]);
    const isProcessingQueue = useRef(false);

    const clearError = useCallback(() => setError(null), []);

    const processQueue = useCallback(async () => {
        if (isProcessingQueue.current || connectionQueue.current.length === 0) return;

        isProcessingQueue.current = true;
        const peerId = connectionQueue.current.shift();

        if (peerId && !connectedPeers.current.has(peerId)) {
            try {
                const peerName = discoveredPeers.current.get(peerId) || 'Unknown Device';
                console.log(`Nearby: Connection Queue -> Requesting ${peerName} (${peerId})`);
                await NearbyConnections.requestConnection(peerId);
            } catch (err: any) {
                console.error(`Nearby: Connection request failed to ${peerId}`, err);
                connectingPeers.current.delete(peerId);
            }
        }

        setTimeout(() => {
            isProcessingQueue.current = false;
            processQueue();
        }, 1500);
    }, []);

    const addToConnectionQueue = useCallback((peerId: string) => {
        if (connectedPeers.current.has(peerId) || connectingPeers.current.has(peerId)) return;

        connectingPeers.current.add(peerId);
        connectionQueue.current.push(peerId);
        processQueue();
    }, [processQueue]);

    const activeState = useRef<{ mode: string, role: string }>({ mode: 'none', role: 'idle' });

    useEffect(() => {
        if (remoteMode === activeState.current.mode && myRole === activeState.current.role) {
            return;
        }

        activeState.current = { mode: remoteMode, role: myRole };

        if (remoteMode === 'none') {
            NearbyConnections.stopAdvertise();
            NearbyConnections.stopDiscovery();
            connectedPeers.current.clear();
            connectingPeers.current.clear();
            connectionQueue.current = [];
            setDevices([]);
            return;
        }

        const startNearby = async () => {
            try {
                setIsLoading(true);
                clearError();

                const hasPermission = await requestAndroidPermissions();
                if (!hasPermission) {
                    setError({
                        code: 'PERMISSION_DENIED',
                        message: 'Nearby Connections requires Bluetooth and Location permissions.'
                    });
                    setIsLoading(false);
                    return;
                }

                await NearbyConnections.stopAdvertise();
                await NearbyConnections.stopDiscovery();

                // Small delay to allow native cleanup
                await new Promise(resolve => setTimeout(resolve, 500));

                // Using P2P_CLUSTER to allow multiple devices to connect freely
                if (myRole === 'display') {
                    await NearbyConnections.startAdvertise(deviceName, Strategy.P2P_CLUSTER);
                    console.log('Nearby: Started Advertising (Cluster)');
                } else if (myRole === 'controller') {
                    await NearbyConnections.startDiscovery(deviceName, Strategy.P2P_CLUSTER);
                    console.log('Nearby: Started Discovery (Cluster)');
                }
            } catch (err: any) {
                console.error('Nearby: Failed to start', err);
                setError({ code: 'START_FAILED', message: err.message || 'Failed to start Nearby Connections' });
            } finally {
                setIsLoading(false);
            }
        };

        startNearby();
    }, [remoteMode, myRole, deviceName]);

    useEffect(() => {
        if (myRole !== 'controller' || remoteMode === 'none') return;

        const unsubscribeFound = NearbyConnections.onPeerFound((peer) => {
            console.log('Nearby: Peer found', peer.name, peer.peerId);
            discoveredPeers.current.set(peer.peerId, peer.name);
            addToConnectionQueue(peer.peerId);
        });

        const unsubscribeLost = NearbyConnections.onPeerLost((peer) => {
            discoveredPeers.current.delete(peer.peerId);
            connectingPeers.current.delete(peer.peerId);
        });

        return () => {
            unsubscribeFound();
            unsubscribeLost();
        };
    }, [myRole, remoteMode, addToConnectionQueue]);

    useEffect(() => {
        if (remoteMode === 'none') return;

        const unsubscribeInvitation = NearbyConnections.onInvitationReceived((peer) => {
            NearbyConnections.acceptConnection(peer.peerId).catch(err => {
                console.error('Nearby: Accept failed', err);
            });
        });

        const unsubscribeConnected = NearbyConnections.onConnected((peer) => {
            console.log('Nearby: Connected to', peer.name);
            connectedPeers.current.add(peer.peerId);
            connectingPeers.current.delete(peer.peerId);

            // Upsert device list
            setDevices(prev => {
                const existing = prev.find(d => d.id === peer.peerId);
                if (existing) return prev;
                return [...prev, {
                    id: peer.peerId,
                    client_id: peer.peerId,
                    name: peer.name,
                    role: 'idle',
                    lastSeen: Date.now()
                }];
            });

            const payload = JSON.stringify({
                type: 'device_info',
                role: myRole,
                name: deviceName,
                id: deviceId
            });
            NearbyConnections.sendText(peer.peerId, payload).catch(err => {
                console.error('Nearby: Sync failed', err);
            });
        });

        const unsubscribeDisconnected = NearbyConnections.onDisconnected((peer) => {
            connectedPeers.current.delete(peer.peerId);
            connectingPeers.current.delete(peer.peerId);
            setDevices(prev => prev.filter(d => d.id !== peer.peerId));
        });

        return () => {
            unsubscribeInvitation();
            unsubscribeConnected();
            unsubscribeDisconnected();
        };
    }, [remoteMode, myRole, deviceName, deviceId]);

    useEffect(() => {
        if (remoteMode === 'none') return;

        const unsubscribeText = NearbyConnections.onTextReceived((data) => {
            try {
                const payload = JSON.parse(data.text);

                if (payload.type === 'device_info') {
                    setDevices(prev => {
                        const exists = prev.some(d => d.id === data.peerId);
                        if (!exists) {
                            return [...prev, {
                                id: data.peerId,
                                client_id: payload.id || data.peerId,
                                name: payload.name,
                                role: payload.role,
                                lastSeen: Date.now()
                            }];
                        }
                        return prev.map(d => d.id === data.peerId ? {
                            ...d,
                            role: payload.role,
                            name: payload.name,
                            client_id: payload.id || d.client_id
                        } : d);
                    });
                } else if (payload.type === 'command') {
                    if (payload.timestamp > (Date.now() - 10000)) {
                        setLastCommand(payload);
                    }
                } else if (payload.type === 'game_state') {
                    setGameState(payload.state);
                } else if (payload.type === 'settings') {
                    setBackToWhiteSettings({
                        enabled: payload.backToWhite ?? false,
                        duration: payload.duration ?? 2
                    });
                }
            } catch (err) {
                console.error('Nearby: Failed to parse sequence', err);
            }
        });

        return () => unsubscribeText();
    }, [remoteMode]);

    const joinLobby = useCallback(() => setRemoteMode('lobby'), []);
    const leaveLobby = useCallback(() => {
        setRemoteMode('none');
        setMyRole('idle');
        NearbyConnections.stopAdvertise();
        NearbyConnections.stopDiscovery();
        connectedPeers.current.clear();
        setDevices([]);
    }, []);

    const startGame = useCallback((game: 'colors' | 'chain-calc') => {
        const nextState: GameStateData = { state: 'RUNNING', game };
        setGameState(nextState);

        const payload = JSON.stringify({ type: 'game_state', state: nextState });
        connectedPeers.current.forEach(peerId => {
            NearbyConnections.sendText(peerId, payload).catch(err => console.error('Nearby: Start failed', err));
        });
    }, []);

    const stopGame = useCallback(() => {
        const nextState: GameStateData = { state: 'LOBBY' };
        setGameState(nextState);

        const payload = JSON.stringify({ type: 'game_state', state: nextState });
        connectedPeers.current.forEach(peerId => {
            NearbyConnections.sendText(peerId, payload).catch(err => console.error('Nearby: Stop failed', err));
        });
    }, []);

    const sendCommand = useCallback((payload: { name: string; class: string }, targetId?: string) => {
        const cmd = {
            ...payload,
            type: 'command',
            timestamp: Date.now()
        };
        const cmdStr = JSON.stringify(cmd);

        if (targetId) {
            NearbyConnections.sendText(targetId, cmdStr).catch(err => {
                console.error(`Nearby: Send failed to ${targetId}`, err);
            });
        } else {
            connectedPeers.current.forEach(peerId => {
                NearbyConnections.sendText(peerId, cmdStr).catch(err => {
                    console.error(`Nearby: Broadcast failed to ${peerId}`, err);
                });
            });
        }
    }, []);

    const sendSettings = useCallback((settings: { backToWhite: boolean; duration: number }) => {
        const payload = JSON.stringify({ type: 'settings', ...settings });
        connectedPeers.current.forEach(peerId => {
            NearbyConnections.sendText(peerId, payload).catch(err => {
                console.error(`Nearby: Send settings failed to ${peerId}`, err);
            });
        });
    }, []);

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
