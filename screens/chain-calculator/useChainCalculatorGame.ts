import { useState, useCallback, useEffect } from 'react';
import { GameState } from '../../types';
import { ChainCalcSettings } from '../../types';

export type DisplayPhase = 'countdown' | 'operation' | 'total';
export type ExtendedSettings = ChainCalcSettings & { isInfinite?: boolean };

interface UseChainCalculatorGameProps {
    settings: ExtendedSettings | null;
    playBeepSound: () => void;
    onStateChange?: (state: GameState) => void;
}

export function useChainCalculatorGame({ settings, playBeepSound, onStateChange }: UseChainCalculatorGameProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [displayValue, setDisplayValue] = useState<string>('');
    const [runningTotal, setRunningTotal] = useState(0);
    const [history, setHistory] = useState<string>('0');
    const [displayPhase, setDisplayPhase] = useState<DisplayPhase>('countdown');
    const [countdownValue, setCountdownValue] = useState(0);
    const [currentOperation, setCurrentOperation] = useState<{ val: number; op: string } | null>(null);

    const generateOperation = useCallback((currentTotal: number) => {
        const num = Math.floor(Math.random() * 9) + 1;
        const isAdd = Math.random() > 0.5 || (currentTotal - num < 0);
        return { val: num, op: isAdd ? '+' : '-' };
    }, []);

    const reset = useCallback(() => {
        setCurrentStep(0);
        setDisplayValue('');
        setRunningTotal(0);
        setHistory('0');
        setDisplayPhase('countdown');
        setCountdownValue(0);
        setCurrentOperation(null);
    }, []);

    useEffect(() => {
        if (!settings) return;

        let timer: ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null = null;

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
                    if (timer) clearInterval(timer);
                    setCurrentStep(1);
                    setDisplayPhase('operation');
                }
            }, 1000);
            return () => { if (timer) clearInterval(timer as NodeJS.Timeout); };
        }

        const shouldStop = !settings.isInfinite && currentStep > settings.steps;
        if (shouldStop) {
            onStateChange?.(GameState.PENDING);
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
                        if (timer) clearInterval(timer as NodeJS.Timeout);
                        setDisplayPhase('total');
                        return 0;
                    }
                    return prev - 100;
                });
            }, 100);
            return () => { if (timer) clearInterval(timer as NodeJS.Timeout); };
        }
        else if (displayPhase === 'total') {
            playBeepSound();

            timer = setTimeout(() => {
                setCurrentStep(s => s + 1);
                setDisplayPhase('operation');
            }, 800);
            return () => { if (timer) clearTimeout(timer as NodeJS.Timeout); };
        }

    }, [currentStep, displayPhase, settings, playBeepSound, generateOperation, runningTotal, onStateChange]);

    return {
        currentStep,
        displayValue,
        runningTotal,
        history,
        displayPhase,
        countdownValue,
        currentOperation,
        reset,
    };
}
