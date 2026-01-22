import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Calculator, Check, RotateCcw, Infinity as InfinityIcon, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Slider } from '../components/Slider';
import { Toggle } from '../components/Toggle';
import { useAudio } from '../hooks/useAudio';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChainCalcSettings, GameState } from '../types';


type DisplayPhase = 'countdown' | 'operation' | 'total';
type ExtendedSettings = ChainCalcSettings & { isInfinite?: boolean };

export default function ChainCalculatorScreen() {
    const navigation = useNavigation();

    const [settings, setSettings] = useLocalStorage<ExtendedSettings>('chain-calc-settings', {
        speed: 3,
        steps: 5,
        fontSize: 10,
        playBeep: true,
        isInfinite: false,
    });

    const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);
    const [currentStep, setCurrentStep] = useState(0);
    const [displayValue, setDisplayValue] = useState<string>('');
    const [runningTotal, setRunningTotal] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [history, setHistory] = useState<string>('0');
    const [isCorrect, setIsCorrect] = useState(false);
    const [displayPhase, setDisplayPhase] = useState<DisplayPhase>('countdown');
    const [countdownValue, setCountdownValue] = useState(0);

    const { playBeep, playSuccess, playFailure } = useAudio();
    const [currentOperation, setCurrentOperation] = useState<{ val: number; op: string } | null>(null);

    const playBeepSound = useCallback(() => {
        if (settings?.playBeep) {
            playBeep(800, 0.1);
        }
    }, [playBeep, settings?.playBeep]);

    const applyLevel = (level: number) => {
        if (!settings) return;
        if (level === 1) setSettings(s => ({ ...s, speed: 5, steps: 5, isInfinite: false }));
        if (level === 2) setSettings(s => ({ ...s, speed: 5, steps: 10, isInfinite: false }));
        if (level === 3) setSettings(s => ({ ...s, speed: 3, steps: 5, isInfinite: false }));
    };

    const currentLevel = (() => {
        if (!settings) return 'custom';
        if (settings.isInfinite) return 'custom';
        if (settings.speed === 5 && settings.steps === 5) return '1';
        if (settings.speed === 5 && settings.steps === 10) return '2';
        if (settings.speed === 3 && settings.steps === 5) return '3';
        return 'custom';
    })();


    const generateOperation = useCallback((currentTotal: number) => {
        const num = Math.floor(Math.random() * 9) + 1;
        const isAdd = Math.random() > 0.5 || (currentTotal - num < 0);
        return { val: num, op: isAdd ? '+' : '-' };
    }, []);

    useEffect(() => {
        if (gameState !== GameState.PLAYING || !settings) return;

        let timer: any;

        if (currentStep === 0) {
            let count = 3;
            setDisplayPhase('countdown');
            setDisplayValue(String(count));
            playBeepSound();

            timer = setInterval(() => {
                count--;
                if (count > 0) {
                    setDisplayValue(String(count));
                    playBeepSound();
                } else {
                    clearInterval(timer);
                    setCurrentStep(1);
                    setDisplayPhase('operation');
                }
            }, 1000);
            return () => clearInterval(timer);
        }

        const shouldStop = !settings.isInfinite && currentStep > settings.steps;
        if (shouldStop) {
            setGameState(GameState.PENDING);
            return;
        }

        if (displayPhase === 'operation') {
            const { val, op } = generateOperation(runningTotal);
            const valStr = `${op}${val}`;
            const newTotal = op === '+' ? runningTotal + val : runningTotal - val;

            setRunningTotal(newTotal);
            setCurrentOperation({ val, op });
            setDisplayValue(valStr);
            setHistory(prev => prev === '0' ? valStr : `${prev} ${valStr}`);

            setCountdownValue(settings.speed * 1000);
            setDisplayPhase('countdown');
        }
        else if (displayPhase === 'countdown') {
            timer = setInterval(() => {
                setCountdownValue(prev => {
                    if (prev <= 100) {
                        clearInterval(timer);
                        setDisplayPhase('total');
                        return 0;
                    }
                    return prev - 100;
                });
            }, 100);
            return () => clearInterval(timer);
        }
        else if (displayPhase === 'total') {
            playBeepSound();

            timer = setTimeout(() => {
                setCurrentStep(s => s + 1);
                setDisplayPhase('operation');
            }, 800);
            return () => clearTimeout(timer);
        }

    }, [gameState, currentStep, displayPhase, settings?.steps, settings?.speed, settings?.isInfinite, playBeepSound, generateOperation, runningTotal]);

    const handleNumpad = (num: number) => {
        setUserAnswer(prev => prev.length < 4 ? prev + num : prev);
    };

    const handleClear = () => setUserAnswer('');

    const submitAnswer = () => {
        const correct = parseInt(userAnswer) === runningTotal;
        setIsCorrect(correct);
        if (correct) playSuccess(); else playFailure();
        setGameState(GameState.FINISHED);
    };

    if (!settings) return <View style={styles.container} />;

    if (gameState === GameState.PLAYING) {
        // ... (Rendering Logic kept same)
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
                    <Button variant="secondary" onPress={() => setGameState(GameState.PENDING)} style={styles.controlButton}>
                        <View style={styles.btnRow}>
                            <Check size={20} color="#10b981" />
                            <Text style={styles.controlTextDone}>Fertig</Text>
                        </View>
                    </Button>
                    <Button variant="secondary" onPress={() => setGameState(GameState.CONFIG)} style={styles.controlButton}>
                        <View style={styles.btnRow}>
                            <X size={20} color="#ef4444" />
                            <Text style={styles.controlTextCancel}>Abbruch</Text>
                        </View>
                    </Button>
                </View>
            </View>
        );
    }

    if (gameState === GameState.PENDING) {
        // ...
        return (
            <View style={styles.pendingContainer}>
                <Text style={styles.questionMark}>?</Text>

                <Card style={styles.answerCard}>
                    <Text style={styles.answerText}>
                        {userAnswer || '...'}
                    </Text>
                </Card>

                <View style={styles.numpadGrid}>
                    {[1, 2, 3].map(n => (
                        <Button key={n} variant="secondary" onPress={() => handleNumpad(n)} style={styles.numpadBtn}>
                            {n}
                        </Button>
                    ))}
                    {[4, 5, 6].map(n => (
                        <Button key={n} variant="secondary" onPress={() => handleNumpad(n)} style={styles.numpadBtn}>
                            {n}
                        </Button>
                    ))}
                    {[7, 8, 9].map(n => (
                        <Button key={n} variant="secondary" onPress={() => handleNumpad(n)} style={styles.numpadBtn}>
                            {n}
                        </Button>
                    ))}
                    <Button variant="secondary" onPress={handleClear} style={[styles.numpadBtn, { backgroundColor: 'rgba(127, 29, 29, 0.3)' }]}>
                        <Text style={{ color: '#f87171' }}>C</Text>
                    </Button>
                    <Button variant="secondary" onPress={() => handleNumpad(0)} style={styles.numpadBtn}>
                        0
                    </Button>
                    <Button variant="primary" onPress={submitAnswer} style={[styles.numpadBtn, { backgroundColor: '#059669' }]}>
                        <Check size={32} color="white" />
                    </Button>
                </View>
            </View>
        );
    }

    if (gameState === GameState.FINISHED) {
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
                    <Button variant="secondary" onPress={() => setGameState(GameState.CONFIG)} style={{ flex: 1 }}>
                        Einstellungen
                    </Button>
                    <Button onPress={() => {
                        setRunningTotal(0);
                        setHistory('0');
                        setUserAnswer('');
                        setCurrentStep(0);
                        setDisplayPhase('countdown');
                        setCurrentOperation(null);
                        setGameState(GameState.PLAYING);
                    }} style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <RotateCcw size={24} color="white" />
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Erneut versuchen</Text>
                        </View>
                    </Button>
                </View>
            </View>
        );
    }

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
                        <Text style={styles.sectionTitle}>
                            Level Presets
                        </Text>
                        <View style={styles.presetButtons}>
                            <Button size="sm" variant={currentLevel === '1' ? 'primary' : 'secondary'} onPress={() => applyLevel(1)}>Level 1</Button>
                            <Button size="sm" variant={currentLevel === '2' ? 'primary' : 'secondary'} onPress={() => applyLevel(2)}>Level 2</Button>
                            <Button size="sm" variant={currentLevel === '3' ? 'primary' : 'secondary'} onPress={() => applyLevel(3)}>Level 3</Button>
                        </View>

                        <View style={{ gap: 48 }}>
                            <Slider
                                label="Zeit pro Schritt"
                                value={settings.speed}
                                min={1} max={10} step={1}
                                onChange={(v) => setSettings(s => ({ ...s, speed: v }))}
                                formatValue={(v) => `${v}s`}
                            />
                            <Slider
                                label="Anzahl Schritte"
                                value={settings.steps}
                                min={3} max={50} step={1}
                                onChange={(v) => setSettings(s => ({ ...s, steps: v }))}
                                style={settings.isInfinite ? { opacity: 0.2 } : {}}
                            />
                        </View>

                        <View style={styles.togglesRow}>
                            <Toggle
                                label="Unendlich"
                                description="Kein Limit"
                                checked={settings.isInfinite ?? false}
                                onChange={(v) => setSettings(s => ({ ...s, isInfinite: v }))}
                                style={{ width: '45%' }}
                            />
                            <Toggle
                                label="Audio Feedback"
                                description="Beep Sound"
                                checked={settings.playBeep}
                                onChange={(v) => setSettings(s => ({ ...s, playBeep: v }))}
                                style={{ width: '45%' }}
                            />
                        </View>
                    </Card>

                    <Card style={{ padding: 32 }}>
                        <Text style={styles.sectionTitle}>Anzeige</Text>
                        <Slider
                            label="Zahlengröße"
                            value={settings.fontSize}
                            min={4} max={20} step={1}
                            onChange={(v) => setSettings(s => ({ ...s, fontSize: v }))}
                            formatValue={(v) => `${v}`}
                        />
                    </Card>

                    <Button size="lg" onPress={() => {
                        setRunningTotal(0);
                        setHistory('0');
                        setUserAnswer('');
                        setCurrentStep(0);
                        setDisplayPhase('countdown');
                        setCurrentOperation(null);
                        setGameState(GameState.PLAYING);
                    }}>
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
    playingContainer: {
        flex: 1,
        backgroundColor: '#020617',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepText: {
        fontSize: 20,
        color: '#94a3b8', // slate-400
        fontFamily: 'monospace',
    },
    mainDisplay: {
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
        textAlign: 'center',
    },
    progressBarBg: {
        height: 8,
        width: 192,
        backgroundColor: '#1e293b', // slate-800
        borderRadius: 9999,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6366f1', // indigo-500
    },
    playingControls: {
        flexDirection: 'row',
        gap: 32,
        marginTop: 48,
    },
    controlButton: {
        paddingHorizontal: 16,
    },
    btnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    controlTextDone: {
        color: '#10b981', // emerald-500
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    controlTextCancel: {
        color: '#ef4444', // red-500
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    pendingContainer: {
        flex: 1,
        backgroundColor: '#020617',
        justifyContent: 'center',
        padding: 24,
    },
    questionMark: {
        fontSize: 96,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 48,
        color: '#6366f1', // indigo-500
    },
    answerCard: {
        marginBottom: 24,
        padding: 16,
    },
    answerText: {
        fontSize: 48,
        fontFamily: 'monospace',
        textAlign: 'center',
        height: 80,
        color: '#ffffff',
        textAlignVertical: 'center',
    },
    numpadGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    numpadBtn: {
        width: '30%',
        height: 80,
    },
    finishedContainer: {
        flex: 1,
        backgroundColor: '#020617',
        justifyContent: 'center',
        padding: 24,
        alignItems: 'center',
        gap: 40,
    },
    emoji: {
        fontSize: 72,
    },
    resultText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    resultValue: {
        fontSize: 96,
        fontWeight: '900', // black
        fontVariant: ['tabular-nums'],
    },
    historyHeader: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginHorizontal: -24,
        marginTop: -24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginBottom: 24,
    },
    historyLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#64748b', // slate-500
        paddingHorizontal: 24,
    },
    historyText: {
        fontFamily: 'monospace',
        fontSize: 24,
        color: '#94a3b8', // slate-400
        lineHeight: 32,
    },
    resultActions: {
        flexDirection: 'row',
        gap: 24,
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 48,
    },
    iconBox: {
        padding: 20,
        backgroundColor: '#1e293b',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)', // emerald-500/30
        shadowColor: '#10b981',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#34d399', // emerald-400
    },
    headerDescription: {
        color: '#94a3b8',
        fontSize: 18,
    },
    contentStack: {
        gap: 32,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    presetButtons: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 40,
    },
    togglesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingTop: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        marginTop: 24,
        justifyContent: 'center',
    },
});
