import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

interface DisplayAreaProps {
    displayColor: string | null;
    colorName: string | null;
}

export function DisplayArea({ displayColor, colorName }: DisplayAreaProps) {
    return (
        <View style={[
            styles.displayArea,
            displayColor && { backgroundColor: displayColor, flex: 1, minHeight: 300 }
        ]}>
            {displayColor ? (
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 48, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 }}>
                    {colorName?.toUpperCase()}
                </Text>
            ) : (
                <Text style={styles.waitingText}>Warte auf Farbsignal...</Text>
            )}
        </View>
    );
}
