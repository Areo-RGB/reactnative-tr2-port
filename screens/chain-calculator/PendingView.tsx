import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../../components/Card';
import { Numpad } from './Numpad';
import { styles } from './styles';

interface PendingViewProps {
    userAnswer: string;
    onNumPress: (num: number) => void;
    onClear: () => void;
    onSubmit: () => void;
}

export function PendingView({ userAnswer, onNumPress, onClear, onSubmit }: PendingViewProps) {
    return (
        <View style={styles.pendingContainer}>
            <Text style={styles.questionMark}>?</Text>

            <Card style={styles.answerCard}>
                <Text style={styles.answerText}>
                    {userAnswer || '...'}
                </Text>
            </Card>

            <Numpad
                onNumPress={onNumPress}
                onClear={onClear}
                onSubmit={onSubmit}
            />
        </View>
    );
}
