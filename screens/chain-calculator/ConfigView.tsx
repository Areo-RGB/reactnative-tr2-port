import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Calculator } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StepInput } from '../../components/StepInput';
import { Toggle } from '../../components/Toggle';
import { ExtendedSettings } from './useChainCalculatorGame';
import { styles } from './styles';

interface ConfigViewProps {
    settings: ExtendedSettings;
    onStart: () => void;
    onSettingsChange: (settings: ExtendedSettings) => void;
}

export function ConfigView({ settings, onStart, onSettingsChange }: ConfigViewProps) {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerRow}>
                    <View style={styles.iconBox}>
                        <Calculator size={40} color="#34d399" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>
                            Kettenrechner
                        </Text>
                        <Text style={styles.headerDescription}>
                            Trainiere dein Arbeitsgedächtnis und Kopfrechnen.
                        </Text>
                    </View>
                </View>

                <View style={styles.contentStack}>
                    <Card style={{ padding: 32 }}>

                        <View style={{ gap: 48 }}>
                            <StepInput
                                label="Zeit pro Schritt"
                                value={settings.speed}
                                min={1} max={10} step={1}
                                onChange={(v) => onSettingsChange({ ...settings, speed: v })}
                                formatValue={(v) => `${v}s`}
                            />
                            <StepInput
                                label="Anzahl Schritte"
                                value={settings.steps}
                                min={3} max={50} step={1}
                                onChange={(v) => onSettingsChange({ ...settings, steps: v })}
                                style={settings.isInfinite ? { opacity: 0.2 } : {}}
                            />
                        </View>

                        <View style={styles.togglesRow}>
                            <Toggle
                                label="Unendlich"
                                description="Kein Limit"
                                checked={settings.isInfinite ?? false}
                                onChange={(v) => onSettingsChange({ ...settings, isInfinite: v })}
                                style={{ width: '45%' }}
                            />
                            <Toggle
                                label="Audio Feedback"
                                description="Beep Sound"
                                checked={settings.playBeep}
                                onChange={(v) => onSettingsChange({ ...settings, playBeep: v })}
                                style={{ width: '45%' }}
                            />
                        </View>
                    </Card>

                    <Card style={{ padding: 32 }}>
                        <Text style={styles.sectionTitle}>Anzeige</Text>
                        <StepInput
                            label="Zahlengröße"
                            value={settings.fontSize}
                            min={4} max={20} step={1}
                            onChange={(v) => onSettingsChange({ ...settings, fontSize: v })}
                        />
                    </Card>

                    <Button size="lg" onPress={onStart}>
                        Training Starten
                    </Button>

                </View>
            </ScrollView>
        </View>
    );
}
