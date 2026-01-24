import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAudio } from '../hooks/useAudio';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMicrophone } from '../hooks/useMicrophone';
import { useLobby } from '../context/LobbyContext';
import { GameState, ColorsSettings } from '../types';
import { COLORS_DATA } from '../constants';
import { useColorsGame, PlayingOverlay, ColorsConfigView } from './colors';
import type { ColorsScreenNavigationProp, ColorsScreenRouteProp } from '../types/navigation';

export default function ColorsScreen() {
    const navigation = useNavigation<ColorsScreenNavigationProp>();
    const route = useRoute<ColorsScreenRouteProp>();
    const isRemote = route.params?.remoteStart;
    const clientId = route.params?.clientId || Math.random().toString(36).substring(7);
    const deviceName = `Device ${clientId.substring(0, 4)}`;
    const connectionMode = route.params?.connectionMode || 'nearby';

    const { playBeep } = useAudio();

    const {
        lastCommand,
        setMyRole,
        joinLobby,
        backToWhiteSettings
    } = useLobby();

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

    const lastProcessedTimestamp = useRef<number>(0);
    const revertTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        currentColor,
        step,
        timeLeft,
        triggerCount,
        waitingForSound,
        intervalRef,
        nextColor,
        handleMicTrigger,
        reset: resetGame,
        setCurrentColor,
        setStep,
        setTimeLeft,
        setWaitingForSound,
    } = useColorsGame(settings, playBeep);

    // Initialize Remote Presence
    useEffect(() => {
        if (isRemote) {
            joinLobby();
            setMyRole('display');
        }
    }, [isRemote, connectionMode]);

    // Remote Control Listener (Firebase/Nearby)
    useEffect(() => {
        // Handle Remote Start
        if (isRemote && gameState === GameState.CONFIG) {
            startGame();
        }

        // Handle Remote Color from Command
        if (lastCommand && lastCommand.name && lastCommand.timestamp > lastProcessedTimestamp.current) {
            lastProcessedTimestamp.current = lastCommand.timestamp;

            const colorName = lastCommand.name;
            const color = COLORS_DATA.find(c => c.name.toLowerCase() === colorName.toLowerCase());

            if (color) {
                setCurrentColor(color);
                if (gameState !== GameState.PLAYING) setGameState(GameState.PLAYING);
                if (settings?.playSound) playBeep(600, 0.1);

                // Back2White logic - auto-revert to white after duration
                if (isRemote && backToWhiteSettings?.enabled && color.name !== 'White') {
                    if (revertTimeout.current) clearTimeout(revertTimeout.current);
                    revertTimeout.current = setTimeout(() => {
                        const white = COLORS_DATA.find(c => c.name === 'White');
                        if (white) {
                            setCurrentColor(white);
                        }
                    }, (backToWhiteSettings.duration || 2) * 1000);
                }
            }
        }
    }, [isRemote, lastCommand, playBeep, settings?.playSound, backToWhiteSettings, gameState, setCurrentColor]);

    const isMicActive = gameState === GameState.PLAYING && settings && (settings.soundControlMode || settings.useSoundCounter);

    const { level } = useMicrophone({
        threshold: settings?.soundThreshold ?? 50,
        cooldown: settings?.soundCooldown ?? 500,
        active: !!isMicActive,
        onTrigger: handleMicTrigger
    });

    // Game timer effect
    useEffect(() => {
        if (gameState !== GameState.PLAYING || !settings) return;

        // If remote mode, do NOT run auto timer
        if (isRemote) return;

        // Clear any existing interval before creating a new one
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!settings.soundControlMode) {
            intervalRef.current = setInterval(() => {
                setStep(currentStep => {
                    if (!settings.isInfinite && currentStep >= settings.limitSteps) {
                        setGameState(GameState.FINISHED);
                        return currentStep;
                    }
                    nextColor();
                    return currentStep + 1;
                });
            }, settings.intervalMs);
        } else {
            if (timeLeft <= 0) {
                setGameState(GameState.FINISHED);
                return;
            }
            intervalRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        setGameState(GameState.FINISHED);
                    }
                    return t - 1;
                });
            }, 1000);

            setWaitingForSound(true);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [gameState, settings?.soundControlMode, settings?.intervalMs, settings?.limitSteps, settings?.isInfinite, settings?.totalDurationSec, nextColor, timeLeft, isRemote, intervalRef, setStep, setTimeLeft, setWaitingForSound, setGameState]);

    // Cleanup revert timeout on unmount
    useEffect(() => {
        return () => {
            if (revertTimeout.current) clearTimeout(revertTimeout.current);
        };
    }, []);

    const startGame = () => {
        if (!settings) return;
        resetGame();
        setGameState(GameState.PLAYING);
        if (!isRemote) nextColor();
    };

    if (!settings) return <View style={{ flex: 1, backgroundColor: '#020617' }} />;

    if (gameState === GameState.PLAYING) {
        return (
            <PlayingOverlay
                currentColor={currentColor}
                step={step}
                timeLeft={timeLeft}
                triggerCount={triggerCount}
                waitingForSound={waitingForSound}
                soundControlMode={settings.soundControlMode}
                isInfinite={settings.isInfinite || false}
                limitSteps={settings.limitSteps}
                useSoundCounter={settings.useSoundCounter}
                onExit={() => setGameState(GameState.CONFIG)}
            />
        );
    }

    return (
        <ColorsConfigView
            settings={settings}
            micLevel={level}
            onStart={startGame}
            onNavigateToLobby={() => navigation.navigate('Lobby')}
            onSettingsChange={setSettings}
        />
    );
}
