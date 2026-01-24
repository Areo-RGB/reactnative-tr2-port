import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Droplet } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StepInput } from '../../components/StepInput';
import { Toggle } from '../../components/Toggle';
import { MicSettingsCard } from './MicSettingsCard';
import { styles } from './styles';
import { ColorsSettings } from '../../types';

interface ColorsConfigViewProps {
    settings: ColorsSettings;
    micLevel: number;
    onStart: () => void;
    onNavigateToLobby: () => void;
    onSettingsChange: (settings: ColorsSettings) => void;
}

export function ColorsConfigView({
    settings,
    micLevel,
    onStart,
    onNavigateToLobby,
    onSettingsChange,
}: ColorsConfigViewProps) {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerRow}>
                    <View style={styles.iconBox}>
                        <Droplet size={32} color="#c084fc" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>
                            Farben
                        </Text>
                        <Text style={styles.headerDescription}>
                            Stroop-Effekt und Reaktions-Training.
                        </Text>
                    </View>
                </View>

                <View style={styles.contentStack}>
                    <Card>
                        <Text style={styles.sectionTitle}>Modus</Text>
                        <View style={styles.controlsStack}>
                            <Toggle
                                label="Sound Control Modus"
                                description="Farbe wechselt bei Geräusch"
                                checked={settings.soundControlMode}
                                onChange={(v) => onSettingsChange({ ...settings, soundControlMode: v })}
                            />

                            {!settings.soundControlMode ? (
                                <>
                                    <StepInput
                                        label="Intervall (Geschwindigkeit)"
                                        value={settings.intervalMs}
                                        min={500} max={5000} step={100}
                                        onChange={(v) => onSettingsChange({ ...settings, intervalMs: v })}
                                        formatValue={(v) => `${(v / 1000).toFixed(1)}s`}
                                    />
                                    <Toggle
                                        label="Unendlich"
                                        description="Kein Limit"
                                        checked={settings.isInfinite || false}
                                        onChange={(v) => onSettingsChange({ ...settings, isInfinite: v })}
                                    />
                                    <StepInput
                                        label="Anzahl Schritte"
                                        value={settings.limitSteps}
                                        min={5} max={100} step={5}
                                        onChange={(v) => onSettingsChange({ ...settings, limitSteps: v })}
                                        style={settings.isInfinite ? { opacity: 0.2 } : {}}
                                    />
                                </>
                            ) : (
                                <StepInput
                                    label="Dauer"
                                    value={settings.totalDurationSec}
                                    min={10} max={300} step={10}
                                    onChange={(v) => onSettingsChange({ ...settings, totalDurationSec: v })}
                                    formatValue={(v) => `${v}s`}
                                />
                            )}
                        </View>
                    </Card>

                    <Card>
                        <Text style={styles.sectionTitle}>Optionen</Text>
                        <View style={styles.controlsStack}>
                            <Toggle
                                label="Audio Feedback"
                                checked={settings.playSound}
                                onChange={(v) => onSettingsChange({ ...settings, playSound: v })}
                            />
                            <Toggle
                                label="Sound Zähler Overlay"
                                description="Zeigt Zähler auf dem Bildschirm"
                                checked={settings.useSoundCounter}
                                onChange={(v) => onSettingsChange({ ...settings, useSoundCounter: v })}
                            />
                        </View>
                    </Card>

                    {(settings.soundControlMode || settings.useSoundCounter) && (
                        <MicSettingsCard
                            level={micLevel}
                            soundThreshold={settings.soundThreshold}
                            soundCooldown={settings.soundCooldown}
                            onThresholdChange={(v) => onSettingsChange({ ...settings, soundThreshold: v })}
                            onCooldownChange={(v) => onSettingsChange({ ...settings, soundCooldown: v })}
                        />
                    )}

                    <Button size="lg" onPress={onStart}>
                        Training Starten
                    </Button>

                    <Button variant="secondary" onPress={onNavigateToLobby}>
                        Lobby Beitreten (Remote)
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}
