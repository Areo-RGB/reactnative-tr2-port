/**
 * useMotionDetection.web.ts
 *
 * React Hook for Motion Detection (Web Browser Implementation)
 *
 * This hook provides motion detection using browser APIs:
 * - getUserMedia for camera access
 * - Canvas API for frame processing
 * - requestAnimationFrame for 60fps loop
 *
 * The hook manages:
 * 1. Camera permissions and stream lifecycle
 * 2. Motion detection state and events
 * 3. Timer management for motion timing
 * 4. Video element reference for preview display
 *
 * Usage:
 * ```tsx
 * function MotionScreen() {
 *   const {
 *     isRunning,
 *     status,
 *     elapsedMs,
 *     videoRef,
 *     start,
 *     stop,
 *   } = useMotionDetection();
 *
 *   return (
 *     <View>
 *       {videoRef && <video ref={el => el && (el.srcObject = videoRef)} />}
 *       <Text>Time: {elapsedMs}ms</Text>
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MotionDetection,
  MotionDetectionConfig,
  MotionEvent,
} from '../modules/MotionDetection.web';

// ==================== Types ====================

export type DetectionStatus = 'idle' | 'running' | 'motion_detected' | 'timing';

export interface UseMotionDetectionResult {
  /** Whether motion detection is available in this browser */
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

  /** Media stream for video preview (web-specific) */
  mediaStream: MediaStream | null;

  /** Video element for preview (web-specific) */
  videoElement: HTMLVideoElement | null;
}

// ==================== Hook Implementation ====================

/**
 * React hook for web-based motion detection
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
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  // ==================== Refs ====================

  /** Timer start timestamp */
  const timerStartTime = useRef<number | null>(null);

  /** Animation frame ID for timer updates */
  const animationFrameId = useRef<number | null>(null);

  /** Flag to track if timer is running */
  const isTimerRunning = useRef(false);

  // ==================== Timer Logic ====================

  /**
   * Update elapsed time using requestAnimationFrame
   */
  const updateTimer = useCallback(() => {
    if (!isTimerRunning.current || timerStartTime.current === null) {
      return;
    }

    const elapsed = performance.now() - timerStartTime.current;
    setElapsedMs(Math.floor(elapsed));

    animationFrameId.current = requestAnimationFrame(updateTimer);
  }, []);

  /**
   * Start the timer from a motion event
   */
  const startTimer = useCallback(() => {
    if (timerStartTime.current === null) {
      timerStartTime.current = performance.now();
      isTimerRunning.current = true;
      setStatus('timing');
      updateTimer();
    }
  }, [updateTimer]);

  /**
   * Stop and reset the timer
   */
  const resetTimer = useCallback(() => {
    timerStartTime.current = null;
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
      startTimer();
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
    setMediaStream(null);
    setVideoElement(null);
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

        // Get video element and stream from motion detection module
        const video = MotionDetection.getVideoElement();
        const stream = MotionDetection.getMediaStream();
        setVideoElement(video);
        setMediaStream(stream);
      } else {
        setIsRunning(false);
        setMediaStream(null);
        setVideoElement(null);
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
      setError('Camera not available in this browser');
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
      MotionDetection.stop();

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
    mediaStream,
    videoElement,
  };
}

export default useMotionDetection;
