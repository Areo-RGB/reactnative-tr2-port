import React from 'react';
import { View, Text } from 'react-native';
import { FullscreenOverlay } from '../../components/FullscreenOverlay';
import { ColorData } from '../../types';
import { styles } from './styles';

interface PlayingOverlayProps {
    currentColor: ColorData;
    step: number;
    timeLeft: number;
    triggerCount: number;
    waitingForSound: boolean;
    soundControlMode: boolean;
    isInfinite: boolean;
    limitSteps: number;
    useSoundCounter: boolean;
    onExit: () => void;
}

export function PlayingOverlay({
    currentColor,
    step,
    timeLeft,
    triggerCount,
    waitingForSound,
    soundControlMode,
    isInfinite,
    limitSteps,
    useSoundCounter,
    onExit,
}: PlayingOverlayProps) {
    const bgColors: Record<string, string> = {
        'bg-white': '#ffffff',
        'bg-red-500': '#ef4444',
        'bg-blue-500': '#3b82f6',
        'bg-green-500': '#22c55e',
        'bg-yellow-500': '#eab308',
        'bg-purple-500': '#a855f7',
        'bg-pink-500': '#ec4899',
        'bg-orange-500': '#f97316',
        'bg-teal-500': '#14b8a6',
    };
    const bgColor = bgColors[currentColor.class] || '#000000';

    return (
        <FullscreenOverlay onExit={onExit} style={[styles.overlay, { backgroundColor: bgColor }]}>
            <Text style={styles.gameInfoTop}>
                {soundControlMode
                    ? `${timeLeft}s`
                    : isInfinite ? `Schritt ${step}` : `${step} / ${limitSteps}`
                }
            </Text>

            {useSoundCounter ? (
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {triggerCount}
                    </Text>
                </View>
            ) : null}

            {soundControlMode && waitingForSound ? (
                <View style={styles.waitingContainer}>
                    <View style={styles.waitingBadge}>
                        <Text style={styles.waitingText}>Mache ein Geräusch!</Text>
                    </View>
                </View>
            ) : null}
        </FullscreenOverlay>
    );
}
