import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { Users } from 'lucide-react-native';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLobby } from '../context/LobbyContext';
import { LobbyDevice } from '../types';
import type { LobbyScreenNavigationProp, LobbyScreenRouteProp } from '../types/navigation';
import {
    RoleSelector,
    BroadcastControls,
    DisplayArea,
    DeviceCard,
    Back2WhiteModal,
    SettingsButton,
    styles,
} from './lobby';

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
        devices,
        myRole,
        setMyRole,
        joinLobby,
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
    }, [lastCommand, myRole, navigation, isFocused, CLIENT_ID]);

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
        return (
            <DeviceCard
                item={item}
                clientId={CLIENT_ID}
                myRole={myRole}
                onSendColor={handleSendColor}
            />
        );
    };

    const displayCount = devices.filter((d: LobbyDevice) => d.role === 'display').length;

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

                <RoleSelector myRole={myRole} onRoleChange={setMyRole} />

                {myRole === 'controller' && (
                    <SettingsButton onPress={() => setShowSettings(true)} />
                )}

                {myRole === 'controller' && (
                    <BroadcastControls onSendColor={handleSendColor} />
                )}

                {myRole === 'display' && (
                    <DisplayArea displayColor={displayColor} colorName={lastCommand?.name || null} />
                )}

                <Text style={styles.sectionTitle}>
                    {myRole === 'controller'
                        ? `EINZELSTEUERUNG (${displayCount})`
                        : 'Verbundene Geräte'}
                </Text>
                <FlatList
                    data={devices}
                    renderItem={renderDevice}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            <Back2WhiteModal
                visible={showSettings}
                enabled={backToWhiteEnabled}
                duration={backToWhiteDuration ?? 2}
                onEnabledChange={setBackToWhiteEnabled}
                onDurationChange={setBackToWhiteDuration}
                onClose={() => setShowSettings(false)}
                onApply={() => {
                    sendSettings({
                        backToWhite: backToWhiteEnabled,
                        duration: backToWhiteDuration ?? 2
                    });
                    setShowSettings(false);
                }}
            />
        </Layout>
    );
}
