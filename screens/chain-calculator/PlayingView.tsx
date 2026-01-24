import React from 'react';
import { View, Text } from 'react-native';
import { Check, X, Infinity as InfinityIcon } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { styles } from './styles';
import { ExtendedSettings, DisplayPhase } from './useChainCalculatorGame';

interface PlayingViewProps {
    settings: ExtendedSettings;
    currentStep: number;
    displayValue: string;
    runningTotal: number;
    displayPhase: DisplayPhase;
    countdownValue: number;
    currentOperation: { val: number; op: string } | null;
    onDone: () => void;
    onCancel: () => void;
}

export function PlayingView({
    settings,
    currentStep,
    displayValue,
    runningTotal,
    displayPhase,
    countdownValue,
    currentOperation,
    onDone,
    onCancel,
}: PlayingViewProps) {
    const isInitialCountdown = currentStep === 0;
    const showCountdown = displayPhase === 'countdown' && !isInitialCountdown;
    const showTotal = displayPhase === 'total';

    let mainDisplay = displayValue;
    let mainTextColor = '#6366f1'; // indigo-500

    if (showTotal && currentOperation) {
        mainDisplay = String(runningTotal);
        mainTextColor = '#10b981'; // emerald-500
    }

    return (
        <View style={styles.playingContainer}>
            <View style={styles.stepIndicator}>
                {settings.isInfinite ? (
                    <View style={styles.stepRow}>
                        <InfinityIcon size={20} color="#94a3b8" />
                        <Text style={styles.stepText}>Schritt {currentStep}</Text>
                    </View>
                ) : (
                    <Text style={styles.stepText}>
                        Schritt {Math.min(currentStep, settings.steps)} / {settings.steps}
                    </Text>
                )}
            </View>

            <View>
                <Text
                    style={[
                        styles.mainDisplay,
                        { color: mainTextColor, fontSize: settings.fontSize * 8 }
                    ]}
                >
                    {mainDisplay}
                </Text>
            </View>

            <View style={styles.progressBarBg}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: showCountdown ? `${(countdownValue / (settings.speed * 1000)) * 100}%` : '0%' }
                    ]}
                />
            </View>

            <View style={styles.playingControls}>
                <Button variant="secondary" onPress={onDone} style={styles.controlButton}>
                    <View style={styles.btnRow}>
                        <Check size={20} color="#10b981" />
                        <Text style={styles.controlTextDone}>Fertig</Text>
                    </View>
                </Button>
                <Button variant="secondary" onPress={onCancel} style={styles.controlButton}>
                    <View style={styles.btnRow}>
                        <X size={20} color="#ef4444" />
                        <Text style={styles.controlTextCancel}>Abbruch</Text>
                    </View>
                </Button>
            </View>
        </View>
    );
}
