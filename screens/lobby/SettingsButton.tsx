import React from 'react';
import { View } from 'react-native';
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
                <Text style={styles.settingsButtonText}>Einstellungen</Text>
            </Button>
        </View>
    );
}
