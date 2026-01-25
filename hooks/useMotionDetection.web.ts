/**
 * useMotionDetection.web.ts
 *
 * Web Stub for Motion Detection Hook
 *
 * Motion detection is Android-only due to the CameraX dependency.
 * This stub provides the same interface for web builds to prevent
 * import errors, but all functionality returns sensible defaults.
 *
 * The isAvailable flag will always be false on web, allowing UI
 * to show appropriate "not available" messages.
 */

import { useState, useCallback } from 'react';
import type { MotionDetectionConfig, MotionEvent } from '../modules/MotionDetection';

// ==================== Types ====================

export type DetectionStatus = 'idle' | 'running' | 'motion_detected' | 'timing';

export interface UseMotionDetectionResult {
  isAvailable: boolean;
  isRunning: boolean;
  status: DetectionStatus;
  lastMotionEvent: MotionEvent | null;
  elapsedMs: number;
  error: string | null;
  start: (config?: MotionDetectionConfig) => void;
  stop: () => void;
  resetTimer: () => void;
  motionCount: number;
}

// ==================== Hook Implementation ====================

/**
 * Web stub for motion detection hook
 *
 * Returns isAvailable: false and no-op functions.
 * UI should check isAvailable and show appropriate message.
 */
export function useMotionDetection(_autoStart = false): UseMotionDetectionResult {
  const [error] = useState<string | null>('Motion detection is only available on Android');

  const noOp = useCallback(() => {
    console.warn('Motion detection is not available on web');
  }, []);

  return {
    isAvailable: false,
    isRunning: false,
    status: 'idle',
    lastMotionEvent: null,
    elapsedMs: 0,
    error,
    start: noOp,
    stop: noOp,
    resetTimer: noOp,
    motionCount: 0,
  };
}

export default useMotionDetection;
