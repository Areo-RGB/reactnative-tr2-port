import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';

interface StepInputProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    formatValue?: (val: number) => string;
    style?: StyleProp<ViewStyle>;
}

export const StepInput = memo(function StepInput({
    label, value, min, max, step = 1, onChange, formatValue, style
}: StepInputProps) {

    const handleDecrement = useCallback(() => {
        if (value > min) {
            onChange(Math.max(min, value - step));
        }
    }, [value, min, step, onChange]);

    const handleIncrement = useCallback(() => {
        if (value < max) {
            onChange(Math.min(max, value + step));
        }
    }, [value, max, step, onChange]);

    const displayValue = formatValue ? formatValue(value) : value;

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.inputRow}>
                <Pressable
                    onPress={handleDecrement}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        value <= min && styles.buttonDisabled
                    ]}
                    disabled={value <= min}
                    accessibilityLabel={`Verringere ${label}`}
                    accessibilityRole="button"
                >
                    <Minus size={24} color={value <= min ? '#475569' : '#ffffff'} />
                </Pressable>

                <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>{displayValue}</Text>
                </View>

                <Pressable
                    onPress={handleIncrement}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        value >= max && styles.buttonDisabled
                    ]}
                    disabled={value >= max}
                    accessibilityLabel={`Erhöhe ${label}`}
                    accessibilityRole="button"
                >
                    <Plus size={24} color={value >= max ? '#475569' : '#ffffff'} />
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 12,
    },
    label: {
        color: '#94a3b8', // slate-400
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 16,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1e293b', // slate-800
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    buttonPressed: {
        backgroundColor: '#334155', // slate-700
        transform: [{ scale: 0.95 }],
    },
    buttonDisabled: {
        opacity: 0.5,
        backgroundColor: '#0f172a',
    },
    valueContainer: {
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#6366f1', // indigo-500
        fontVariant: ['tabular-nums'],
    },
});
