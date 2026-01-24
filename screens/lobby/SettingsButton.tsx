import React from 'react';
import { View } from 'react-native';
import { Settings } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Text } from 'react-native';
import { styles } from './styles';

interface SettingsButtonProps {
    onPress: () => void;
}

export function SettingsButton({ onPress }: SettingsButtonProps) {
    return (
        <View style={styles.settingsArea}>
            <Button
                variant="secondary"
                onPress={onPress}
            >
                <Settings size={18} color="#94a3b8" />
                <Text style={styles.settingsButtonText}>Back2White Einstellungen</Text>
            </Button>
        </View>
    );
}
