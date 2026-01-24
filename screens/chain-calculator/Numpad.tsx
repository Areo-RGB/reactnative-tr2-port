import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Check } from 'lucide-react-native';
import { styles } from './styles';

interface NumpadProps {
    onNumPress: (num: number) => void;
    onClear: () => void;
    onSubmit: () => void;
}

export function Numpad({ onNumPress, onClear, onSubmit }: NumpadProps) {
    return (
        <View style={styles.numpadGrid}>
            {[1, 2, 3].map(n => (
                <Button key={n} variant="secondary" onPress={() => onNumPress(n)} style={styles.numpadBtn}>
                    {n}
                </Button>
            ))}
            {[4, 5, 6].map(n => (
                <Button key={n} variant="secondary" onPress={() => onNumPress(n)} style={styles.numpadBtn}>
                    {n}
                </Button>
            ))}
            {[7, 8, 9].map(n => (
                <Button key={n} variant="secondary" onPress={() => onNumPress(n)} style={styles.numpadBtn}>
                    {n}
                </Button>
            ))}
            <Button variant="secondary" onPress={onClear} style={[styles.numpadBtn, { backgroundColor: 'rgba(127, 29, 29, 0.3)' }]}>
                <Text style={{ color: '#f87171' }}>C</Text>
            </Button>
            <Button variant="secondary" onPress={() => onNumPress(0)} style={styles.numpadBtn}>
                0
            </Button>
            <Button variant="primary" onPress={onSubmit} style={[styles.numpadBtn, { backgroundColor: '#059669' }]}>
                <Check size={32} color="white" />
            </Button>
        </View>
    );
}
