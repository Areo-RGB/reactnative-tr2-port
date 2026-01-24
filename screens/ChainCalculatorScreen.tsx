import React, { useState, useCallback } from 'react';
import { GameState } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
    useChainCalculatorGame,
    PlayingView,
    PendingView,
    FinishedView,
    ConfigView,
} from './chain-calculator';
import type { ExtendedSettings } from './chain-calculator';

export default function ChainCalculatorScreen() {
    const [settings, setSettings] = useLocalStorage<ExtendedSettings>('chain-calc-settings', {
        speed: 3,
        steps: 5,
        fontSize: 10,
        playBeep: true,
        isInfinite: false,
    });

    const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    const { playBeep, playSuccess, playFailure } = useAudio();

    const playBeepSound = useCallback(() => {
        if (settings?.playBeep) {
            playBeep(800, 0.1);
        }
    }, [playBeep, settings?.playBeep]);

    const {
        currentStep,
        displayValue,
        runningTotal,
        history,
        displayPhase,
        countdownValue,
        currentOperation,
        reset: resetGame,
    } = useChainCalculatorGame({
        settings,
        playBeepSound,
        onStateChange: setGameState,
    });

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

    const handleStart = () => {
        resetGame();
        setUserAnswer('');
        setIsCorrect(false);
        setGameState(GameState.PLAYING);
    };

    const handleRetry = () => {
        resetGame();
        setUserAnswer('');
        setIsCorrect(false);
        setGameState(GameState.PLAYING);
    };

    if (!settings) return null;

    if (gameState === GameState.PLAYING) {
        return (
            <PlayingView
                settings={settings}
                currentStep={currentStep}
                displayValue={displayValue}
                runningTotal={runningTotal}
                displayPhase={displayPhase}
                countdownValue={countdownValue}
                currentOperation={currentOperation}
                onDone={() => setGameState(GameState.PENDING)}
                onCancel={() => setGameState(GameState.CONFIG)}
            />
        );
    }

    if (gameState === GameState.PENDING) {
        return (
            <PendingView
                userAnswer={userAnswer}
                onNumPress={handleNumpad}
                onClear={handleClear}
                onSubmit={submitAnswer}
            />
        );
    }

    if (gameState === GameState.FINISHED) {
        return (
            <FinishedView
                isCorrect={isCorrect}
                runningTotal={runningTotal}
                history={history}
                onSettings={() => setGameState(GameState.CONFIG)}
                onRetry={handleRetry}
            />
        );
    }

    return (
        <ConfigView
            settings={settings}
            onStart={handleStart}
            onSettingsChange={setSettings}
        />
    );
}
