/**
 * MotionDetectionSpec.kt
 *
 * TurboModule Specification for Motion Detection
 *
 * This file defines the interface contract between JavaScript and the native
 * motion detection module. It specifies:
 * - start(config): Begin motion detection with configuration
 * - stop(): Stop motion detection and release resources
 *
 * The specification follows React Native's TurboModule pattern for type-safe
 * communication between JS and native code with minimal bridge overhead.
 *
 * Threading Model:
 * - JS calls are received on the JS thread
 * - CameraX runs on its internal executor
 * - Motion detection runs on a dedicated background thread
 * - Events are emitted back to JS via the event emitter
 */

package com.paul.reactnative.motiondetection

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableMap

/**
 * Abstract specification class for the Motion Detection TurboModule
 *
 * This class defines the contract that the MotionDetectionModule must implement.
 * It extends ReactContextBaseJavaModule for React Native integration.
 */
abstract class MotionDetectionSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    /**
     * Module name exposed to JavaScript
     * This is used in JS as: NativeModules.MotionDetection
     */
    override fun getName(): String = NAME

    /**
     * Start motion detection with the given configuration
     *
     * @param config Configuration map containing:
     *   - threshold: Int (0-255) - Pixel difference threshold for motion detection
     *   - minPixels: Int - Minimum number of changed pixels to trigger motion
     *   - fpsTarget: Int - Target frames per second (max 60)
     *   - roiWidthPercent: Float (0-1) - Width of ROI as percentage of frame width
     *
     * The motion engine will:
     * 1. Initialize CameraX with the specified FPS target
     * 2. Set up a vertical tripwire ROI in the center of the frame
     * 3. Begin frame analysis on a background thread
     * 4. Emit 'onMotionDetected' events when motion crosses the threshold
     */
    abstract fun start(config: ReadableMap)

    /**
     * Stop motion detection and release all resources
     *
     * This method:
     * 1. Stops the CameraX image analysis
     * 2. Releases camera resources
     * 3. Clears motion detection buffers
     * 4. Stops the background processing thread
     *
     * Safe to call multiple times - subsequent calls are no-ops
     */
    abstract fun stop()

    companion object {
        /**
         * Module name constant used for JS bridge registration
         */
        const val NAME = "MotionDetection"
    }
}
