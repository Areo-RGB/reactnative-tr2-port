import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Droplet, Mic } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Slider } from '../components/Slider';
import { Toggle } from '../components/Toggle';
import { FullscreenOverlay } from '../components/FullscreenOverlay';
import { AudioLevelBar } from '../components/AudioLevelBar';
import { useMicrophone } from '../hooks/useMicrophone';
import { useAudio } from '../hooks/useAudio';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ColorsSettings, GameState } from '../types';
import { COLORS_DATA } from '../constants';
import { Layout } from '../components/Layout';

export default function ColorsScreen() {
    const navigation = useNavigation();
    const [settings, setSettings] = useLocalStorage<ColorsSettings>('colors-settings', {
        intervalMs: 2000,
        limitSteps: 20,
        playSound: true,
        soundControlMode: false,
        totalDurationSec: 60,
        useSoundCounter: false,
        soundThreshold: 50,
        soundCooldown: 500,
        selectedDeviceId: '',
        isInfinite: false,
    });

    const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);
    const [currentColor, setCurrentColor] = useState(COLORS_DATA[0]);
    const [step, setStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [triggerCount, setTriggerCount] = useState(0);
    const [waitingForSound, setWaitingForSound] = useState(false);

    const { playBeep } = useAudio();

    const nextColor = useCallback(() => {
        const next = COLORS_DATA[Math.floor(Math.random() * COLORS_DATA.length)];
        setCurrentColor(next);
        setStep(s => s + 1);
        if (settings && settings.playSound) playBeep(600, 0.1);
    }, [settings, playBeep]);

    const handleMicTrigger = useCallback(() => {
        if (!settings) return;

        if (settings.soundControlMode) {
            if (waitingForSound) {
                setWaitingForSound(false);
                nextColor();
            }
        }

        if (settings.useSoundCounter) {
            setTriggerCount(c => c + 1);
        }
    }, [settings, waitingForSound, nextColor]);

    const isMicActive = gameState === GameState.PLAYING && settings && (settings.soundControlMode || settings.useSoundCounter);

    const { level } = useMicrophone({
        threshold: settings?.soundThreshold ?? 50,
        cooldown: settings?.soundCooldown ?? 500,
        active: !!isMicActive,
        onTrigger: handleMicTrigger
    });

    useEffect(() => {
        if (gameState !== GameState.PLAYING || !settings) return;

        let intervalId: any;

        if (!settings.soundControlMode) {
            intervalId = setInterval(() => {
                if (!settings.isInfinite && step >= settings.limitSteps) {
                    setGameState(GameState.FINISHED);
                } else {
                    nextColor();
                }
            }, settings.intervalMs);
        } else {
            if (timeLeft <= 0) {
                setGameState(GameState.FINISHED);
            }
            intervalId = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) setGameState(GameState.FINISHED);
                    return t - 1;
                });
            }, 1000);

            setWaitingForSound(true);
        }

        return () => clearInterval(intervalId);
    }, [gameState, step, settings?.soundControlMode, settings?.intervalMs, settings?.limitSteps, settings?.totalDurationSec, nextColor, timeLeft]);

    const startGame = () => {
        if (!settings) return;
        setStep(0);
        setTriggerCount(0);
        setTimeLeft(settings.totalDurationSec);
        setWaitingForSound(settings.soundControlMode);
        setGameState(GameState.PLAYING);
        nextColor();
    };

    if (!settings) return <View style={styles.container} />;

    if (gameState === GameState.PLAYING) {
        // Map tailwind color classes to hex codes for FullscreenOverlay background
        const bgColors: Record<string, string> = {
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
            <FullscreenOverlay onExit={() => setGameState(GameState.CONFIG)} style={[styles.overlay, { backgroundColor: bgColor }]}>
                <Text style={styles.gameInfoTop}>
                    {settings.soundControlMode
                        ? `${timeLeft}s`
                        : settings.isInfinite ? `Schritt ${step}` : `${step} / ${settings.limitSteps}`
                    }
                </Text>

                {settings.useSoundCounter ? (
                    <View style={styles.counterContainer}>
                        <Text style={styles.counterText}>
                            {triggerCount}
                        </Text>
                    </View>
                ) : null}

                {settings.soundControlMode && waitingForSound ? (
                    <View style={styles.waitingContainer}>
                        <View style={styles.waitingBadge}>
                            <Text style={styles.waitingText}>Mache ein Geräusch!</Text>
                        </View>
                    </View>
                ) : null}
            </FullscreenOverlay>
        );
    }

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
                                onChange={(v) => setSettings(s => ({ ...s, soundControlMode: v }))}
                            />

                            {!settings.soundControlMode ? (
                                <>
                                    <Slider
                                        label="Intervall (Geschwindigkeit)"
                                        value={settings.intervalMs}
                                        min={500} max={5000} step={100}
                                        onChange={(v) => setSettings(s => ({ ...s, intervalMs: v }))}
                                        formatValue={(v) => `${(v / 1000).toFixed(1)}s`}
                                    />
                                    <Toggle
                                        label="Unendlich"
                                        description="Kein Limit"
                                        checked={settings.isInfinite || false}
                                        onChange={(v) => setSettings(s => ({ ...s, isInfinite: v }))}
                                    />
                                    <Slider
                                        label="Anzahl Schritte"
                                        value={settings.limitSteps}
                                        min={5} max={100} step={5}
                                        onChange={(v) => setSettings(s => ({ ...s, limitSteps: v }))}
                                        style={settings.isInfinite ? { opacity: 0.2 } : {}}
                                    />
                                </>
                            ) : (
                                <Slider
                                    label="Dauer"
                                    value={settings.totalDurationSec}
                                    min={10} max={300} step={10}
                                    onChange={(v) => setSettings(s => ({ ...s, totalDurationSec: v }))}
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
                                onChange={(v) => setSettings(s => ({ ...s, playSound: v }))}
                            />
                            <Toggle
                                label="Sound Zähler Overlay"
                                description="Zeigt Zähler auf dem Bildschirm"
                                checked={settings.useSoundCounter}
                                onChange={(v) => setSettings(s => ({ ...s, useSoundCounter: v }))}
                            />
                        </View>
                    </Card>

                    {(settings.soundControlMode || settings.useSoundCounter) && (
                        <Card style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                            <View style={styles.micHeader}>
                                <Mic size={20} color="#60a5fa" />
                                <Text style={styles.micTitle}>Mikrofon Einstellungen</Text>
                            </View>
                            <View style={styles.micControls}>
                                <AudioLevelBar level={level} threshold={settings.soundThreshold} />
                                <Slider
                                    label="Schwellenwert"
                                    value={settings.soundThreshold}
                                    min={1} max={100}
                                    onChange={(v) => setSettings(s => ({ ...s, soundThreshold: v }))}
                                    formatValue={(v) => `${v}%`}
                                />
                                <Slider
                                    label="Cooldown"
                                    value={settings.soundCooldown}
                                    min={100} max={1000} step={50}
                                    onChange={(v) => setSettings(s => ({ ...s, soundCooldown: v }))}
                                    formatValue={(v) => `${v}ms`}
                                />
                            </View>
                        </Card>
                    )}

                    <Button size="lg" onPress={startGame}>
                        Training Starten
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617', // slate-950
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 80,
    },
    overlay: {
        flex: 1,
    },
    gameInfoTop: {
        position: 'absolute',
        top: 80,
        left: 24,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'monospace',
        fontSize: 20,
        zIndex: 50,
    },
    counterContainer: {
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        pointerEvents: 'none',
    },
    counterText: {
        fontSize: 128,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.3)',
    },
    waitingContainer: {
        position: 'absolute',
        bottom: 128,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 50,
    },
    waitingBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 9999,
    },
    waitingText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
    },
    iconBox: {
        padding: 16,
        backgroundColor: '#1e293b', // slate-800
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)', // purple-500/30
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    headerDescription: {
        color: '#94a3b8', // slate-400
    },
    contentStack: {
        gap: 24,
        paddingBottom: 48,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#ffffff',
    },
    controlsStack: {
        gap: 16,
    },
    micHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    micTitle: {
        fontWeight: 'bold',
        color: '#60a5fa', // blue-400
    },
    micControls: {
        gap: 24,
    },
});
