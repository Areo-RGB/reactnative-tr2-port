import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { Signal, Wifi, Monitor, Smartphone, Users, Settings, X } from 'lucide-react-native';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { StepInput } from '../components/StepInput';
import { Toggle } from '../components/Toggle';
import { useLobby } from '../context/LobbyContext';
import { LobbyDevice, Role } from '../types';
import type { LobbyScreenNavigationProp, LobbyScreenRouteProp } from '../types/navigation';

export default function LobbyScreen() {
    const navigation = useNavigation<LobbyScreenNavigationProp>();
    const isFocused = useIsFocused();
    const route = useRoute<LobbyScreenRouteProp>();
    const { initialRole } = route.params || {};

    const [showSettings, setShowSettings] = useState(false);

    const [backToWhiteEnabled, setBackToWhiteEnabled] = useLocalStorage('back_to_white_enabled', false);
    const [backToWhiteDuration, setBackToWhiteDuration] = useLocalStorage('back_to_white_duration', 2);

    const {
        CLIENT_ID,
        DEVICE_NAME,
        devices,
        myRole,
        setMyRole,
        joinLobby,
        leaveLobby,
        gameState,
        startGame,
        stopGame,
        sendCommand,
        sendSettings,
        lastCommand,
        error
    } = useLobby();

    // Color class to hex mapping
    const colorMap: { [key: string]: string } = {
        'bg-white': '#ffffff',
        'bg-red-500': '#ef4444',
        'bg-blue-500': '#3b82f6',
        'bg-green-500': '#22c55e',
        'bg-yellow-500': '#eab308',
    };

    // Get current display color from lastCommand
    const displayColor = lastCommand?.class ? colorMap[lastCommand.class] || null : null;

    // Handle Lobby Lifecycle (Join on mount)
    useEffect(() => {
        joinLobby();
        if (initialRole) {
            setMyRole(initialRole);
        }
    }, [initialRole]);

    // Navigate to Colors fullscreen when display receives a color command
    useEffect(() => {
        if (isFocused && myRole === 'display' && lastCommand?.name) {
            navigation.navigate('Colors', {
                remoteStart: true,
                clientId: CLIENT_ID,
                connectionMode: 'nearby'
            });
        }
    }, [lastCommand, myRole, navigation, isFocused]);

    // Broadcast settings when becoming controller or when settings change
    useEffect(() => {
        if (myRole === 'controller') {
            sendSettings({
                backToWhite: !!backToWhiteEnabled,
                duration: backToWhiteDuration ?? 2
            });
        }
    }, [myRole, backToWhiteEnabled, backToWhiteDuration, sendSettings]);

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
                        <Text style={styles.statusText}>Nearby Mode Active</Text>
                    </View>
                </View>

                {error && (
                    <Card style={styles.errorCard}>
                        <Text style={styles.errorText}>{error.message}</Text>
                    </Card>
                )}

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
                    <View style={styles.settingsArea}>
                        <Button
                            variant="secondary"
                            onPress={() => setShowSettings(true)}
                        >
                            <Settings size={18} color="#94a3b8" />
                            <Text style={styles.settingsButtonText}>Back2White Einstellungen</Text>
                        </Button>
                    </View>
                )}

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
                        ? `EINZELSTEUERUNG (${devices.filter((d: LobbyDevice) => d.role === 'display').length})`
                        : 'Verbundene Geräte'}
                </Text>
                <FlatList
                    data={devices}
                    renderItem={renderDevice}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {/* Back2White Settings Modal */}
            <Modal
                visible={showSettings}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSettings(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Back2White Einstellungen</Text>
                            <Pressable onPress={() => setShowSettings(false)}>
                                <X size={24} color="#94a3b8" />
                            </Pressable>
                        </View>

                        <View style={styles.modalBody}>
                            <Toggle
                                label="Back2White aktivieren"
                                description="Farben automatisch nach Dauer auf Weiß zurücksetzen"
                                checked={backToWhiteEnabled}
                                onChange={setBackToWhiteEnabled}
                            />

                            {backToWhiteEnabled && (
                                <StepInput
                                    label="Dauer bis zum Zurücksetzen"
                                    value={backToWhiteDuration}
                                    min={0.5} max={10} step={0.5}
                                    onChange={setBackToWhiteDuration}
                                    formatValue={(v) => `${v}s`}
                                />
                            )}
                        </View>

                        <View style={styles.modalFooter}>
                            <Button
                                variant="secondary"
                                onPress={() => setShowSettings(false)}
                                style={{ flex: 1, marginRight: 8 }}
                            >
                                <Text>Abbrechen</Text>
                            </Button>
                            <Button
                                onPress={() => {
                                    sendSettings({
                                        backToWhite: backToWhiteEnabled,
                                        duration: backToWhiteDuration
                                    });
                                    setShowSettings(false);
                                }}
                                style={{ flex: 1 }}
                            >
                                <Text>Übernehmen</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
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
    modeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
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
    errorCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        marginBottom: 24,
        padding: 12,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
    },
    settingsArea: {
        marginBottom: 24,
    },
    settingsButtonText: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBody: {
        padding: 16,
        gap: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
});
