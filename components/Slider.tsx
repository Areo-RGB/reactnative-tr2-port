import React, { memo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import RNSlider from '@react-native-community/slider';

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    formatValue?: (val: number) => string;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
}

export const Slider = memo(function Slider({
    label, value, min, max, step = 1, onChange, formatValue, style, accessibilityLabel
}: SliderProps) {
    const formattedValue = formatValue ? formatValue(value) : value;
    const defaultAccessibilityLabel = accessibilityLabel || `${label}, ${formattedValue}`;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>
                    {formattedValue}
                </Text>
            </View>
            <RNSlider
                style={styles.slider}
                minimumValue={min}
                maximumValue={max}
                step={step}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor="#6366f1"
                maximumTrackTintColor="#374151"
                thumbTintColor="#ffffff"
                accessibilityLabel={defaultAccessibilityLabel}
                accessibilityHint={`Swipe to adjust from ${formatValue?.(min) || min} to ${formatValue?.(max) || max}`}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9ca3af', // gray-400
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#818cf8', // indigo-400
        fontSize: 16,
    },
    slider: {
        width: '100%',
        height: 40,
    },
});
