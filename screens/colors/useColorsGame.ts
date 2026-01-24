import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState } from '../../types';
import { ColorsSettings } from '../../types';
import { COLORS_DATA } from '../../constants';

export function useColorsGame(settings: ColorsSettings | null, playBeep: (freq: number, duration: number) => void) {
    const [currentColor, setCurrentColor] = useState(COLORS_DATA[0]);
    const [step, setStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [triggerCount, setTriggerCount] = useState(0);
    const [waitingForSound, setWaitingForSound] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const reset = useCallback(() => {
        setStep(0);
        setTriggerCount(0);
        setTimeLeft(settings?.totalDurationSec || 0);
        setWaitingForSound(settings?.soundControlMode || false);
        setCurrentColor(COLORS_DATA[0]);
    }, [settings]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        currentColor,
        step,
        timeLeft,
        triggerCount,
        waitingForSound,
        intervalRef,
        nextColor,
        handleMicTrigger,
        reset,
        setCurrentColor,
        setStep,
        setTimeLeft,
        setWaitingForSound,
    };
}
