/**
 * MotionDetection.ts
 *
 * TypeScript Interface for Motion Detection TurboModule
 *
 * This module provides type-safe access to the native motion detection
 * functionality implemented in Kotlin. It handles:
 *
 * 1. Type definitions for configuration and events
 * 2. Native module access via NativeModules
 * 3. Event subscription via NativeEventEmitter
 *
 * Usage Example:
 * ```typescript
 * import { MotionDetection, MotionDetectionConfig } from './modules/MotionDetection';
 *
 * // Configure motion detection
 * const config: MotionDetectionConfig = {
 *   threshold: 30,
 *   minPixels: 100,
 *   fpsTarget: 60,
 *   roiWidthPercent: 0.1
 * };
 *
 * // Start detection
 * MotionDetection.start(config);
 *
 * // Subscribe to events
 * const subscription = MotionDetection.addMotionListener((event) => {
 *   console.log('Motion detected at frame:', event.frameIndex);
 * });
 *
 * // Cleanup
 * subscription.remove();
 * MotionDetection.stop();
 * ```
 *
 * Threading Model:
 * - start() and stop() are called from JS thread
 * - Events are emitted from native background thread
 * - Event callbacks run on JS thread
 */

import { NativeModules, NativeEventEmitter, Platform, EmitterSubscription } from 'react-native';

// ==================== Type Definitions ====================

/**
 * Configuration for motion detection
 *
 * All values have sensible defaults in the native module,
 * so you can pass an empty object for default behavior.
 */
export interface MotionDetectionConfig {
  /**
   * Pixel difference threshold (0-255)
   *
   * A pixel is considered "changed" if the absolute difference
   * between current and previous frame exceeds this value.
   *
   * Lower values = more sensitive (more false positives)
   * Higher values = less sensitive (may miss subtle motion)
   *
   * @default 30
   */
  threshold?: number;

  /**
   * Minimum number of changed pixels to trigger motion event
   *
   * Motion is only reported when this many pixels exceed the threshold.
   * This helps filter out noise and minor lighting changes.
   *
   * @default 100
   */
  minPixels?: number;

  /**
   * Target frames per second (1-60)
   *
   * Higher FPS = lower latency, more CPU usage
   * Lower FPS = higher latency, less CPU usage
   *
   * Note: Actual FPS depends on device capabilities
   *
   * @default 60
   */
  fpsTarget?: number;

  /**
   * ROI width as percentage of frame width (0.01-1.0)
   *
   * The ROI (Region of Interest) is a vertical strip in the
   * center of the frame - this is the "virtual tripwire".
   *
   * 0.1 = 10% of frame width (narrow tripwire, fast processing)
   * 1.0 = 100% of frame width (full frame, slower processing)
   *
   * @default 0.1
   */
  roiWidthPercent?: number;
}

/**
 * Motion detection event payload
 *
 * Emitted each time motion is detected in the ROI.
 * The payload is kept minimal for low-latency delivery.
 */
export interface MotionEvent {
  /**
   * Nanosecond timestamp when motion was detected
   * Use for precise timing measurements
   */
  timestampNs: number;

  /**
   * Sequential frame number (starts at 1)
   * Useful for tracking dropped frames or detection rate
   */
  frameIndex: number;

  /**
   * Number of pixels that exceeded the threshold
   * Always >= minPixels when event is emitted
   */
  delta: number;

  /**
   * Time taken to process the frame (nanoseconds)
   * Useful for performance monitoring
   */
  processingTimeNs: number;
}

/**
 * Error event payload
 */
export interface MotionErrorEvent {
  /** Error description */
  message: string;
}

/**
 * Status change event payload
 */
export interface MotionStatusEvent {
  /** Current status: "started" | "stopped" */
  status: 'started' | 'stopped';
}

/**
 * Event listener callback types
 */
export type MotionEventListener = (event: MotionEvent) => void;
export type MotionErrorListener = (event: MotionErrorEvent) => void;
export type MotionStatusListener = (event: MotionStatusEvent) => void;

// ==================== Native Module Interface ====================

/**
 * Native module interface matching the Kotlin implementation
 */
interface MotionDetectionNativeModule {
  start(config: MotionDetectionConfig): void;
  stop(): void;
  getConstants(): {
    EVENT_MOTION_DETECTED: string;
    EVENT_ERROR: string;
    EVENT_STATUS: string;
  };
}

// ==================== Module Access ====================

/**
 * Get the native module, with platform check
 *
 * Returns null on non-Android platforms since the module
 * is Android-only.
 */
function getNativeModule(): MotionDetectionNativeModule | null {
  if (Platform.OS !== 'android') {
    return null;
  }

  const module = NativeModules.MotionDetection;
  if (!module) {
    console.warn(
      'MotionDetection native module not found. ' +
        'Make sure you have run expo prebuild and rebuilt the app.'
    );
    return null;
  }

  return module as MotionDetectionNativeModule;
}

// Native module instance (cached)
const nativeModule = getNativeModule();

// Event emitter for subscribing to native events
const eventEmitter = nativeModule ? new NativeEventEmitter(NativeModules.MotionDetection) : null;

// Event names
const EVENT_MOTION_DETECTED = 'onMotionDetected';
const EVENT_ERROR = 'onMotionError';
const EVENT_STATUS = 'onMotionStatus';

// ==================== Public API ====================

/**
 * Motion Detection Module
 *
 * Provides methods to start/stop motion detection and subscribe to events.
 * Android-only - methods are no-ops on other platforms.
 */
export const MotionDetection = {
  /**
   * Check if motion detection is available on this platform
   */
  isAvailable(): boolean {
    return Platform.OS === 'android' && nativeModule !== null;
  },

  /**
   * Start motion detection with the given configuration
   *
   * @param config Configuration options (all optional)
   */
  start(config: MotionDetectionConfig = {}): void {
    if (!nativeModule) {
      console.warn('MotionDetection: Cannot start - module not available');
      return;
    }

    nativeModule.start(config);
  },

  /**
   * Stop motion detection and release resources
   *
   * Safe to call multiple times or when not running.
   */
  stop(): void {
    if (!nativeModule) {
      return;
    }

    nativeModule.stop();
  },

  /**
   * Subscribe to motion detection events
   *
   * @param listener Callback invoked when motion is detected
   * @returns Subscription object - call .remove() to unsubscribe
   *
   * @example
   * const subscription = MotionDetection.addMotionListener((event) => {
   *   console.log(`Motion at frame ${event.frameIndex}: ${event.delta} pixels`);
   * });
   *
   * // Later...
   * subscription.remove();
   */
  addMotionListener(listener: MotionEventListener): EmitterSubscription {
    if (!eventEmitter) {
      // Return a dummy subscription on unsupported platforms
      return {
        remove: () => {},
      } as EmitterSubscription;
    }

    return eventEmitter.addListener(EVENT_MOTION_DETECTED, listener);
  },

  /**
   * Subscribe to error events
   *
   * @param listener Callback invoked when an error occurs
   * @returns Subscription object - call .remove() to unsubscribe
   */
  addErrorListener(listener: MotionErrorListener): EmitterSubscription {
    if (!eventEmitter) {
      return {
        remove: () => {},
      } as EmitterSubscription;
    }

    return eventEmitter.addListener(EVENT_ERROR, listener);
  },

  /**
   * Subscribe to status change events
   *
   * @param listener Callback invoked when status changes
   * @returns Subscription object - call .remove() to unsubscribe
   */
  addStatusListener(listener: MotionStatusListener): EmitterSubscription {
    if (!eventEmitter) {
      return {
        remove: () => {},
      } as EmitterSubscription;
    }

    return eventEmitter.addListener(EVENT_STATUS, listener);
  },
};

// ==================== Re-exports ====================

export default MotionDetection;
