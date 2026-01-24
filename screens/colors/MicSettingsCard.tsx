import React from 'react';
import { View, Text } from 'react-native';
import { Mic } from 'lucide-react-native';
import { Card } from '../../components/Card';
import { StepInput } from '../../components/StepInput';
import { AudioLevelBar } from '../../components/AudioLevelBar';
import { styles } from './styles';

interface MicSettingsCardProps {
    level: number;
    soundThreshold: number;
    soundCooldown: number;
    onThresholdChange: (value: number) => void;
    onCooldownChange: (value: number) => void;
}

export function MicSettingsCard({
    level,
    soundThreshold,
    soundCooldown,
    onThresholdChange,
    onCooldownChange,
}: MicSettingsCardProps) {
    return (
        <Card style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
            <View style={styles.micHeader}>
                <Mic size={20} color="#60a5fa" />
                <Text style={styles.micTitle}>Mikrofon Einstellungen</Text>
            </View>
            <View style={styles.micControls}>
                <AudioLevelBar level={level} threshold={soundThreshold} />
                <StepInput
                    label="Schwellenwert"
                    value={soundThreshold}
                    min={1} max={100}
                    onChange={onThresholdChange}
                    formatValue={(v) => `${v}%`}
                />
                <StepInput
                    label="Cooldown"
                    value={soundCooldown}
                    min={100} max={1000} step={50}
                    onChange={onCooldownChange}
                    formatValue={(v) => `${v}ms`}
                />
            </View>
        </Card>
    );
}
