import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Monitor, Smartphone, Play, Users } from 'lucide-react-native';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useFirebaseLobby, Device as LobbyDevice, Role } from '../hooks/useFirebaseLobby';
import * as Device from 'expo-device';

// Generate a random client ID for this session
const CLIENT_ID = Math.random().toString(36).substring(7);

// Get a user-friendly device name
const getDeviceName = (): string => {
    const name = Device.deviceName || Device.modelName;
    const manufacturer = Device.manufacturer;

    if (!name) {
        return `Device ${CLIENT_ID.substring(0, 4)}`;
    }

    // If name doesn't include manufacturer, prepend it
    if (manufacturer && !name.toLowerCase().includes(manufacturer.toLowerCase())) {
        return `${manufacturer} ${name}`;
    }

    return name;
};

const DEVICE_NAME = getDeviceName();

export default function LobbyScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { initialRole } = route.params || {};


    // Use the Firebase Hook
    const {
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
    } = useFirebaseLobby(CLIENT_ID, DEVICE_NAME);

    // Color class to hex mapping
    const colorMap: { [key: string]: string } = {
        'bg-red-500': '#ef4444',
        'bg-blue-500': '#3b82f6',
        'bg-green-500': '#22c55e',
        'bg-yellow-500': '#eab308',
    };

    // Get current display color from lastCommand
    const displayColor = lastCommand?.class ? colorMap[lastCommand.class] || null : null;

    // Auto-Join on mount (or we could have a "Join" button in the hook, but UI usually has it)
    // The previous screen had a "Join Lobby" button leading here.
    // So we should probably join automatically when mounting this screen.
    useEffect(() => {
        joinLobby();
        if (initialRole) {
            setMyRole(initialRole);
        }
        return () => leaveLobby();
    }, []);

    // Navigate to Colors fullscreen when display receives a color command
    useEffect(() => {
        if (myRole === 'display' && lastCommand?.name) {
            navigation.navigate('Colors', { remoteStart: true, clientId: CLIENT_ID });
        }
    }, [lastCommand, myRole, navigation]);

    // Handle Remote Colors (Controller Mode)
    const handleSendColor = (colorName: string, colorClass: string, targetId?: string) => {
        sendCommand({ name: colorName, class: colorClass }, targetId);
    };

    const renderDevice = ({ item }: { item: LobbyDevice }) => {
        const isMe = item.id === CLIENT_ID;
        const Icon = item.role === 'controller' ? Smartphone : Monitor;

        const isDisplay = item.role === 'display';
        const showControls = myRole === 'controller' && isDisplay;

        return (
            <Card style={[styles.deviceCard, isMe && styles.myDeviceCard]}>
                <View style={[styles.deviceRow, showControls && { marginBottom: 16 }]}>
                    <View style={styles.deviceIcon}>
                        <Icon size={24} color={isMe ? '#ffffff' : '#94a3b8'} />
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={[styles.deviceName, isMe && styles.myName]}>
                                {item.name} {isMe ? '(Du)' : ''}
                            </Text>
                            <Text style={styles.deviceRole}>
                                {item.role.toUpperCase()}
                            </Text>
                        </View>
                        {showControls && (
                            <Text style={styles.deviceIdText}>{item.id.substring(0, 4)}</Text>
                        )}
                    </View>
                </View>

                {showControls && (
                    <View style={styles.individualControlsRow}>
                        <Button
                            style={[styles.miniBtn, { backgroundColor: '#ef4444' }]}
                            onPress={() => handleSendColor('Red', 'bg-red-500', item.id)}
                        >
                            <View />
                        </Button>
                        <Button
                            style={[styles.miniBtn, { backgroundColor: '#3b82f6' }]}
                            onPress={() => handleSendColor('Blue', 'bg-blue-500', item.id)}
                        >
                            <View />
                        </Button>
                        <Button
                            style={[styles.miniBtn, { backgroundColor: '#22c55e' }]}
                            onPress={() => handleSendColor('Green', 'bg-green-500', item.id)}
                        >
                            <View />
                        </Button>
                        <Button
                            style={[styles.miniBtn, { backgroundColor: '#eab308' }]}
                            onPress={() => handleSendColor('Yellow', 'bg-yellow-500', item.id)}
                        >
                            <View />
                        </Button>
                    </View>
                )}
            </Card>
        );
    };

    return (
        <Layout title="Lobby">
            <View style={styles.container}>
                <View style={styles.statusSection}>
                    <View style={styles.statusBadge}>
                        <Users size={16} color="#10b981" />
                        <Text style={styles.statusText}>Connected</Text>
                    </View>
                    <Text style={styles.lobbyCode}>Firebase Lobby</Text>
                </View>

                <View style={styles.roleSelection}>
                    <Text style={styles.sectionTitle}>Wähle deine Rolle</Text>
                    <View style={styles.roleButtons}>
                        <Button
                            variant={myRole === 'display' ? 'primary' : 'secondary'}
                            onPress={() => setMyRole('display')}
                            style={{ flex: 1 }}
                        >
                            Display
                        </Button>
                        <Button
                            variant={myRole === 'controller' ? 'primary' : 'secondary'}
                            onPress={() => setMyRole('controller')}
                            style={{ flex: 1 }}
                        >
                            Controller
                        </Button>
                    </View>
                </View>

                {myRole === 'controller' && (
                    <View style={styles.controllerArea}>
                        <Text style={styles.sectionTitle}>BROADCAST (ALLE)</Text>

                        <View style={{ gap: 16 }}>
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <View style={{ flex: 1, height: 80, borderRadius: 12, backgroundColor: '#ef4444', overflow: 'hidden' }}>
                                    <Pressable
                                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                        onPress={() => handleSendColor('Red', 'bg-red-500')}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>RED</Text>
                                    </Pressable>
                                </View>
                                <View style={{ flex: 1, height: 80, borderRadius: 12, backgroundColor: '#3b82f6', overflow: 'hidden' }}>
                                    <Pressable
                                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                        onPress={() => handleSendColor('Blue', 'bg-blue-500')}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>BLUE</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <View style={{ flex: 1, height: 80, borderRadius: 12, backgroundColor: '#22c55e', overflow: 'hidden' }}>
                                    <Pressable
                                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                        onPress={() => handleSendColor('Green', 'bg-green-500')}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>GREEN</Text>
                                    </Pressable>
                                </View>
                                <View style={{ flex: 1, height: 80, borderRadius: 12, backgroundColor: '#eab308', overflow: 'hidden' }}>
                                    <Pressable
                                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                        onPress={() => handleSendColor('Yellow', 'bg-yellow-500')}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>YELLOW</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {myRole === 'display' && (
                    <View style={[
                        styles.displayArea,
                        displayColor && { backgroundColor: displayColor, flex: 1, minHeight: 300 }
                    ]}>
                        {displayColor ? (
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 48, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 }}>
                                {lastCommand?.name?.toUpperCase()}
                            </Text>
                        ) : (
                            <Text style={styles.waitingText}>Warte auf Farbsignal...</Text>
                        )}
                    </View>
                )}

                <Text style={styles.sectionTitle}>
                    {myRole === 'controller'
                        ? `EINZELSTEUERUNG (${devices.filter(d => d.role === 'display').length})`
                        : 'Verbundene Geräte'}
                </Text>
                <FlatList
                    data={devices}
                    renderItem={renderDevice}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    statusText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: 12,
    },
    lobbyCode: {
        color: '#94a3b8',
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    roleSelection: {
        marginBottom: 32,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    controllerArea: {
        marginBottom: 32,
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // slate-900 / 0.5
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    displayArea: {
        marginBottom: 32,
        padding: 24,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 16,
        alignItems: 'center',
    },
    waitingText: {
        color: '#10b981',
        fontStyle: 'italic',
    },
    listContent: {
        gap: 12,
    },
    deviceCard: {
        padding: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
    },
    myDeviceCard: {
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    deviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    deviceIdText: {
        color: '#64748b',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    individualControlsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    miniBtn: {
        flex: 1,
        height: 48,
        padding: 0,
        minHeight: 0,
    },
    deviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deviceName: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    myName: {
        color: '#818cf8',
    },
    deviceRole: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
