import React from 'react';
import { View, Text } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { styles } from './styles';

interface FinishedViewProps {
    isCorrect: boolean;
    runningTotal: number;
    history: string;
    onSettings: () => void;
    onRetry: () => void;
}

export function FinishedView({ isCorrect, runningTotal, history, onSettings, onRetry }: FinishedViewProps) {
    return (
        <View style={styles.finishedContainer}>
            <Text style={styles.emoji}>{isCorrect ? '🎉' : '❌'}</Text>
            <Text style={styles.resultText}>{isCorrect ? 'Korrekt!' : 'Falsch!'}</Text>

            <Text style={[styles.resultValue, { color: isCorrect ? '#10b981' : '#ef4444' }]}>
                {runningTotal}
            </Text>

            <Card style={{ width: '100%' }}>
                <View style={styles.historyHeader}>
                    <Text style={styles.historyLabel}>Rechnung</Text>
                </View>
                <Text style={styles.historyText}>
                    {history} <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>= {runningTotal}</Text>
                </Text>
            </Card>

            <View style={styles.resultActions}>
                <Button variant="secondary" onPress={onSettings} style={{ flex: 1 }}>
                    Einstellungen
                </Button>
                <Button onPress={onRetry} style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <RotateCcw size={24} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Erneut versuchen</Text>
                    </View>
                </Button>
            </View>
        </View>
    );
}
