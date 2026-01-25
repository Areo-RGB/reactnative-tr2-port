/**
 * MotionDetection.web.ts
 *
 * Web-based Motion Detection using Browser APIs
 *
 * This module provides motion detection for web browsers using:
 * - navigator.mediaDevices.getUserMedia() for camera access
 * - Canvas API for frame capture and pixel processing
 * - requestAnimationFrame for 60fps processing loop
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                        JavaScript Layer                              │
 * │   - Calls start(config) / stop()                                    │
 * │   - Receives motion events via callbacks                            │
 * └─────────────────────┬───────────────────────────────────────────────┘
 *                       │
 * ┌─────────────────────▼───────────────────────────────────────────────┐
 * │                    MotionDetectionWeb                                │
 * │   - Manages MediaStream lifecycle                                   │
 * │   - Coordinates video/canvas elements                               │
 * └─────────────────────┬───────────────────────────────────────────────┘
 *                       │
 * ┌─────────────────────▼───────────────────────────────────────────────┐
 * │                    Frame Processing Loop                             │
 * │   - Captures frames via Canvas.drawImage()                          │
 * │   - Gets pixel data via getImageData()                              │
 * │   - Computes luminance-based frame difference                       │
 * │   - Runs at ~60fps via requestAnimationFrame                        │
 * └─────────────────────┬───────────────────────────────────────────────┘
 *                       │ When motion detected
 * ┌─────────────────────▼───────────────────────────────────────────────┐
 * │                    Event Callbacks                                   │
 * │   - Minimal payload: timestampNs, frameIndex, delta                 │
 * │   - Synchronous callback invocation                                 │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Performance Optimizations:
 * 1. ROI Processing: Only analyze pixels in the vertical tripwire region
 * 2. Luminance Only: Convert RGB to grayscale for single-channel comparison
 * 3. Buffer Reuse: Pre-allocated Uint8Array for previous frame
 * 4. Early Exit: Stop processing when motion threshold exceeded
 * 5. Downscaled Processing: Use smaller canvas for faster pixel access
 */

// ==================== Type Definitions ====================

/**
 * Configuration for motion detection (same as native)
 */
export interface MotionDetectionConfig {
  threshold?: number;
  minPixels?: number;
  fpsTarget?: number;
  roiWidthPercent?: number;
}

/**
 * Motion detection event payload (same as native)
 */
export interface MotionEvent {
  timestampNs: number;
  frameIndex: number;
  delta: number;
  processingTimeNs: number;
}

export interface MotionErrorEvent {
  message: string;
}

export interface MotionStatusEvent {
  status: 'started' | 'stopped';
}

export type MotionEventListener = (event: MotionEvent) => void;
export type MotionErrorListener = (event: MotionErrorEvent) => void;
export type MotionStatusListener = (event: MotionStatusEvent) => void;

/**
 * Subscription object returned by add*Listener methods
 */
export interface Subscription {
  remove: () => void;
}

// ==================== Constants ====================

const DEFAULT_THRESHOLD = 30;
const DEFAULT_MIN_PIXELS = 100;
const DEFAULT_FPS_TARGET = 60;
const DEFAULT_ROI_WIDTH_PERCENT = 0.1;

// Processing canvas size (smaller = faster, but less precise)
const PROCESS_WIDTH = 320;
const PROCESS_HEIGHT = 240;

// ==================== Motion Detection Engine ====================

/**
 * Web-based motion detection engine
 *
 * Uses browser APIs to capture and analyze camera frames
 */
class MotionDetectionEngine {
  // Configuration
  private threshold = DEFAULT_THRESHOLD;
  private minPixels = DEFAULT_MIN_PIXELS;
  private fpsTarget = DEFAULT_FPS_TARGET;
  private roiWidthPercent = DEFAULT_ROI_WIDTH_PERCENT;

  // State
  private isRunning = false;
  private frameIndex = 0;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameInterval = 1000 / DEFAULT_FPS_TARGET;

  // Media elements
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;
  private mediaStream: MediaStream | null = null;

  // Frame buffers
  private previousFrameBuffer: Uint8Array | null = null;
  private hasPreviousFrame = false;

  // Event listeners
  private motionListeners: Set<MotionEventListener> = new Set();
  private errorListeners: Set<MotionErrorListener> = new Set();
  private statusListeners: Set<MotionStatusListener> = new Set();

  /**
   * Check if motion detection is available in this browser
   */
  isAvailable(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Start motion detection with configuration
   */
  async start(config: MotionDetectionConfig = {}): Promise<void> {
    if (this.isRunning) {
      console.warn('Motion detection already running, stopping first');
      this.stop();
    }

    // Parse configuration
    this.threshold = config.threshold ?? DEFAULT_THRESHOLD;
    this.minPixels = config.minPixels ?? DEFAULT_MIN_PIXELS;
    this.fpsTarget = config.fpsTarget ?? DEFAULT_FPS_TARGET;
    this.roiWidthPercent = config.roiWidthPercent ?? DEFAULT_ROI_WIDTH_PERCENT;
    this.frameInterval = 1000 / this.fpsTarget;

    // Reset state
    this.frameIndex = 0;
    this.hasPreviousFrame = false;
    this.previousFrameBuffer = null;

    try {
      // Request camera access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      // Create video element for stream
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.mediaStream;
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.muted = true;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!this.videoElement) {
          reject(new Error('Video element not created'));
          return;
        }

        this.videoElement.onloadedmetadata = () => {
          this.videoElement?.play().then(resolve).catch(reject);
        };

        this.videoElement.onerror = () => {
          reject(new Error('Failed to load video stream'));
        };
      });

      // Create processing canvas (smaller for performance)
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = PROCESS_WIDTH;
      this.canvasElement.height = PROCESS_HEIGHT;
      this.canvasContext = this.canvasElement.getContext('2d', {
        willReadFrequently: true,
      });

      if (!this.canvasContext) {
        throw new Error('Failed to get canvas context');
      }

      // Allocate frame buffer
      const roiWidth = Math.floor(PROCESS_WIDTH * this.roiWidthPercent);
      const bufferSize = roiWidth * PROCESS_HEIGHT;
      this.previousFrameBuffer = new Uint8Array(bufferSize);

      // Start processing loop
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.processFrame();

      // Emit started status
      this.emitStatus('started');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.emitError(message);
      this.cleanup();
    }
  }

  /**
   * Stop motion detection and release resources
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.cleanup();
    this.emitStatus('stopped');
  }

  /**
   * Get the video element for preview display
   */
  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  /**
   * Get the media stream for external use
   */
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  // ==================== Event Subscription ====================

  addMotionListener(listener: MotionEventListener): Subscription {
    this.motionListeners.add(listener);
    return {
      remove: () => this.motionListeners.delete(listener),
    };
  }

  addErrorListener(listener: MotionErrorListener): Subscription {
    this.errorListeners.add(listener);
    return {
      remove: () => this.errorListeners.delete(listener),
    };
  }

  addStatusListener(listener: MotionStatusListener): Subscription {
    this.statusListeners.add(listener);
    return {
      remove: () => this.statusListeners.delete(listener),
    };
  }

  // ==================== Private Methods ====================

  /**
   * Main frame processing loop
   *
   * Uses requestAnimationFrame for smooth 60fps processing
   * with frame rate limiting based on fpsTarget
   */
  private processFrame = (): void => {
    if (!this.isRunning) {
      return;
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.processFrame);

    // Frame rate limiting
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed < this.frameInterval) {
      return;
    }

    this.lastFrameTime = now - (elapsed % this.frameInterval);

    // Process frame
    this.analyzeFrame();
  };

  /**
   * Analyze a single frame for motion
   *
   * Processing steps:
   * 1. Draw video frame to canvas (downscaled)
   * 2. Get pixel data from ROI
   * 3. Convert to luminance and compare with previous frame
   * 4. Count changed pixels and emit event if threshold exceeded
   */
  private analyzeFrame(): void {
    if (
      !this.videoElement ||
      !this.canvasContext ||
      !this.previousFrameBuffer ||
      this.videoElement.readyState < 2
    ) {
      return;
    }

    const startTime = performance.now();
    this.frameIndex++;

    // Draw video frame to canvas (automatically downscales)
    this.canvasContext.drawImage(
      this.videoElement,
      0,
      0,
      PROCESS_WIDTH,
      PROCESS_HEIGHT
    );

    // Calculate ROI bounds (vertical strip in center)
    const roiWidth = Math.floor(PROCESS_WIDTH * this.roiWidthPercent);
    const roiLeft = Math.floor((PROCESS_WIDTH - roiWidth) / 2);
    const roiHeight = PROCESS_HEIGHT;

    // Get pixel data from ROI
    const imageData = this.canvasContext.getImageData(
      roiLeft,
      0,
      roiWidth,
      roiHeight
    );
    const pixels = imageData.data;

    // Process pixels and count changes
    let changedPixels = 0;
    let bufferIndex = 0;
    let motionDetected = false;

    // Iterate over pixels in ROI
    // pixels array is RGBA format (4 bytes per pixel)
    for (let i = 0; i < pixels.length; i += 4) {
      // Convert RGB to luminance (Y-plane equivalent)
      // Using standard luminance formula: Y = 0.299*R + 0.587*G + 0.114*B
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const luminance = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);

      if (this.hasPreviousFrame) {
        // Calculate difference with previous frame
        const previousLuminance = this.previousFrameBuffer[bufferIndex];
        const diff = Math.abs(luminance - previousLuminance);

        if (diff > this.threshold) {
          changedPixels++;

          // Early exit optimization
          if (changedPixels >= this.minPixels) {
            motionDetected = true;
            // Continue to update buffer even after detection
          }
        }
      }

      // Store current luminance for next frame
      this.previousFrameBuffer[bufferIndex] = luminance;
      bufferIndex++;
    }

    this.hasPreviousFrame = true;

    // Emit motion event if detected
    if (motionDetected) {
      const processingTime = performance.now() - startTime;
      this.emitMotion({
        timestampNs: startTime * 1_000_000, // Convert ms to ns
        frameIndex: this.frameIndex,
        delta: changedPixels,
        processingTimeNs: processingTime * 1_000_000,
      });
    }
  }

  /**
   * Emit motion detected event
   */
  private emitMotion(event: MotionEvent): void {
    this.motionListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in motion listener:', e);
      }
    });
  }

  /**
   * Emit error event
   */
  private emitError(message: string): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener({ message });
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Emit status change event
   */
  private emitStatus(status: 'started' | 'stopped'): void {
    this.statusListeners.forEach((listener) => {
      try {
        listener({ status });
      } catch (e) {
        console.error('Error in status listener:', e);
      }
    });
  }

  /**
   * Clean up all resources
   */
  private cleanup(): void {
    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Clean up video element
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    // Clean up canvas
    this.canvasElement = null;
    this.canvasContext = null;

    // Clear buffers
    this.previousFrameBuffer = null;
    this.hasPreviousFrame = false;
  }
}

// ==================== Singleton Instance ====================

const motionEngine = new MotionDetectionEngine();

// ==================== Public API ====================

/**
 * Motion Detection Module (Web Version)
 *
 * Provides the same interface as the native module for consistency.
 */
export const MotionDetection = {
  isAvailable(): boolean {
    return motionEngine.isAvailable();
  },

  start(config: MotionDetectionConfig = {}): void {
    motionEngine.start(config);
  },

  stop(): void {
    motionEngine.stop();
  },

  addMotionListener(listener: MotionEventListener): Subscription {
    return motionEngine.addMotionListener(listener);
  },

  addErrorListener(listener: MotionErrorListener): Subscription {
    return motionEngine.addErrorListener(listener);
  },

  addStatusListener(listener: MotionStatusListener): Subscription {
    return motionEngine.addStatusListener(listener);
  },

  /**
   * Web-specific: Get the video element for preview display
   */
  getVideoElement(): HTMLVideoElement | null {
    return motionEngine.getVideoElement();
  },

  /**
   * Web-specific: Get the media stream
   */
  getMediaStream(): MediaStream | null {
    return motionEngine.getMediaStream();
  },
};

export default MotionDetection;
