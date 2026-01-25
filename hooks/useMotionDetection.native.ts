/**
 * useMotionDetection.native.ts
 *
 * React Hook for Motion Detection (Android Native Implementation)
 *
 * This hook provides a React-friendly interface to the motion detection
 * TurboModule. It handles:
 *
 * 1. Automatic cleanup on unmount
 * 2. State management for detection status
 * 3. Event subscription lifecycle
 * 4. Timer management for motion timing
 *
 * Usage:
 * ```tsx
 * function MotionScreen() {
 *   const {
 *     isRunning,
 *     lastMotionEvent,
 *     elapsedMs,
 *     start,
 *     stop,
 *     resetTimer
 *   } = useMotionDetection();
 *
 *   return (
 *     <View>
 *       <Text>Status: {isRunning ? 'Active' : 'Idle'}</Text>
 *       <Text>Time: {elapsedMs}ms</Text>
 *       <Button onPress={start} title="Start" />
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MotionDetection, MotionDetectionConfig, MotionEvent } from '../modules/MotionDetection';

// ==================== Types ====================

/**
 * Detection status states
 */
export type DetectionStatus = 'idle' | 'running' | 'motion_detected' | 'timing';

/**
 * Hook return value
 */
export interface UseMotionDetectionResult {
  /** Whether motion detection is available on this platform */
  isAvailable: boolean;

  /** Whether motion detection is currently running */
  isRunning: boolean;

  /** Current detection status for UI display */
  status: DetectionStatus;

  /** Most recent motion event (null if none) */
  lastMotionEvent: MotionEvent | null;

  /** Elapsed time since first motion detection (milliseconds) */
  elapsedMs: number;

  /** Error message if any */
  error: string | null;

  /** Start motion detection with optional config */
  start: (config?: MotionDetectionConfig) => void;

  /** Stop motion detection */
  stop: () => void;

  /** Reset the timer to zero */
  resetTimer: () => void;

  /** Total motion events detected in current session */
  motionCount: number;
}

// ==================== Hook Implementation ====================

/**
 * React hook for motion detection
 *
 * @param autoStart If true, starts detection automatically on mount
 * @returns Motion detection state and controls
 */
export function useMotionDetection(autoStart = false): UseMotionDetectionResult {
  // ==================== State ====================

  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [lastMotionEvent, setLastMotionEvent] = useState<MotionEvent | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [motionCount, setMotionCount] = useState(0);

  // ==================== Refs ====================

  /**
   * Timer start timestamp (nanoseconds from first motion event)
   * Using ref to avoid re-renders on each frame
   */
  const timerStartNs = useRef<number | null>(null);

  /**
   * Animation frame ID for timer updates
   */
  const animationFrameId = useRef<number | null>(null);

  /**
   * Flag to track if timer is running
   */
  const isTimerRunning = useRef(false);

  // ==================== Timer Logic ====================

  /**
   * Update elapsed time based on current time and start time
   * Uses requestAnimationFrame for smooth updates
   */
  const updateTimer = useCallback(() => {
    if (!isTimerRunning.current || timerStartNs.current === null) {
      return;
    }

    // Calculate elapsed time in milliseconds
    const now = performance.now() * 1_000_000; // Convert to nanoseconds
    const elapsed = now - timerStartNs.current;
    setElapsedMs(Math.floor(elapsed / 1_000_000));

    // Schedule next update
    animationFrameId.current = requestAnimationFrame(updateTimer);
  }, []);

  /**
   * Start the timer from a motion event
   */
  const startTimer = useCallback(
    (event: MotionEvent) => {
      if (timerStartNs.current === null) {
        // Use current performance time as reference
        // (event.timestampNs is from native clock, not directly comparable)
        timerStartNs.current = performance.now() * 1_000_000;
        isTimerRunning.current = true;
        setStatus('timing');
        updateTimer();
      }
    },
    [updateTimer]
  );

  /**
   * Stop and reset the timer
   */
  const resetTimer = useCallback(() => {
    timerStartNs.current = null;
    isTimerRunning.current = false;
    setElapsedMs(0);
    setMotionCount(0);
    setLastMotionEvent(null);

    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    setStatus(isRunning ? 'running' : 'idle');
  }, [isRunning]);

  // ==================== Event Handlers ====================

  /**
   * Handle motion detection events
   */
  const handleMotion = useCallback(
    (event: MotionEvent) => {
      setLastMotionEvent(event);
      setMotionCount((prev) => prev + 1);

      // Start timer on first motion
      startTimer(event);
    },
    [startTimer]
  );

  /**
   * Handle error events
   */
  const handleError = useCallback((event: { message: string }) => {
    setError(event.message);
    setStatus('idle');
    setIsRunning(false);
  }, []);

  /**
   * Handle status change events
   */
  const handleStatus = useCallback(
    (event: { status: 'started' | 'stopped' }) => {
      if (event.status === 'started') {
        setIsRunning(true);
        setStatus('running');
        setError(null);
      } else {
        setIsRunning(false);
        if (!isTimerRunning.current) {
          setStatus('idle');
        }
      }
    },
    []
  );

  // ==================== Controls ====================

  /**
   * Start motion detection
   */
  const start = useCallback((config?: MotionDetectionConfig) => {
    if (!MotionDetection.isAvailable()) {
      setError('Motion detection not available on this platform');
      return;
    }

    setError(null);
    MotionDetection.start(config || {});
  }, []);

  /**
   * Stop motion detection
   */
  const stop = useCallback(() => {
    MotionDetection.stop();
  }, []);

  // ==================== Effects ====================

  /**
   * Set up event subscriptions
   */
  useEffect(() => {
    const motionSub = MotionDetection.addMotionListener(handleMotion);
    const errorSub = MotionDetection.addErrorListener(handleError);
    const statusSub = MotionDetection.addStatusListener(handleStatus);

    return () => {
      motionSub.remove();
      errorSub.remove();
      statusSub.remove();
    };
  }, [handleMotion, handleError, handleStatus]);

  /**
   * Auto-start if requested
   */
  useEffect(() => {
    if (autoStart && MotionDetection.isAvailable()) {
      start();
    }
  }, [autoStart, start]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Stop detection
      MotionDetection.stop();

      // Cancel animation frame
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // ==================== Return ====================

  return {
    isAvailable: MotionDetection.isAvailable(),
    isRunning,
    status,
    lastMotionEvent,
    elapsedMs,
    error,
    start,
    stop,
    resetTimer,
    motionCount,
  };
}

export default useMotionDetection;
