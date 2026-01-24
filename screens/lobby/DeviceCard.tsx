import React from 'react';
import { View, Text } from 'react-native';
import { Monitor, Smartphone } from 'lucide-react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LobbyDevice } from '../../types';
import { styles } from './styles';
import { COLORS } from './BroadcastControls';

interface DeviceCardProps {
    item: LobbyDevice;
    clientId: string;
    myRole: string;
    onSendColor: (name: string, colorClass: string, targetId?: string) => void;
}

export function DeviceCard({ item, clientId, myRole, onSendColor }: DeviceCardProps) {
    const isMe = item.id === clientId;
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
                    {COLORS.map(color => (
                        <Button
                            key={color.name}
                            style={[styles.miniBtn, { backgroundColor: color.bgColor }]}
                            onPress={() => onSendColor(color.name, color.colorClass, item.id)}
                        >
                            <View />
                        </Button>
                    ))}
                </View>
            )}
        </Card>
    );
}
