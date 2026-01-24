import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles } from './styles';

export interface ColorOption {
    name: string;
    colorClass: string;
    bgColor: string;
}

interface BroadcastControlsProps {
    onSendColor: (name: string, colorClass: string) => void;
}

export const COLORS: ColorOption[] = [
    { name: 'RED', colorClass: 'bg-red-500', bgColor: '#ef4444' },
    { name: 'BLUE', colorClass: 'bg-blue-500', bgColor: '#3b82f6' },
    { name: 'GREEN', colorClass: 'bg-green-500', bgColor: '#22c55e' },
    { name: 'YELLOW', colorClass: 'bg-yellow-500', bgColor: '#eab308' },
];

export function BroadcastControls({ onSendColor }: BroadcastControlsProps) {
    return (
        <View style={styles.controllerArea}>
            <Text style={styles.sectionTitle}>BROADCAST (ALLE)</Text>

            <View style={{ gap: 16 }}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1, height: 80, borderRadius: 12, backgroundColor: COLORS[0].bgColor, overflow: 'hidden' }}>
                        <Pressable
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => onSendColor(COLORS[0].name, COLORS[0].colorClass)}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{COLORS[0].name}</Text>
                        </Pressable>
                    </View>
                    <View style={{ flex: 1, height: 80, borderRadius: 12, backgroundColor: COLORS[1].bgColor, overflow: 'hidden' }}>
                        <Pressable
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => onSendColor(COLORS[1].name, COLORS[1].colorClass)}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{COLORS[1].name}</Text>
                        </Pressable>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1, height: 80, borderRadius: 12, backgroundColor: COLORS[2].bgColor, overflow: 'hidden' }}>
                        <Pressable
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => onSendColor(COLORS[2].name, COLORS[2].colorClass)}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{COLORS[2].name}</Text>
                        </Pressable>
                    </View>
                    <View style={{ flex: 1, height: 80, borderRadius: 12, backgroundColor: COLORS[3].bgColor, overflow: 'hidden' }}>
                        <Pressable
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => onSendColor(COLORS[3].name, COLORS[3].colorClass)}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{COLORS[3].name}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}
