/**
 * MotionDetectionPackage.kt
 *
 * React Native Package for Motion Detection TurboModule Registration
 *
 * This package registers the MotionDetectionModule with React Native,
 * making it accessible from JavaScript via NativeModules.
 *
 * Package Registration Flow:
 * 1. MainApplication includes this package in getPackages()
 * 2. React Native calls createNativeModules() during initialization
 * 3. MotionDetectionModule is instantiated and registered
 * 4. JavaScript can access via:
 *    - import { NativeModules } from 'react-native'
 *    - NativeModules.MotionDetection.start(config)
 *
 * The package follows the standard React Native module pattern
 * and is compatible with both Old Architecture and New Architecture (TurboModules).
 */

package com.paul.reactnative.motiondetection

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * React Package implementation for MotionDetection module
 *
 * This class is responsible for creating and providing the
 * MotionDetectionModule instance to React Native.
 */
class MotionDetectionPackage : ReactPackage {

    /**
     * Create native modules for this package
     *
     * Called by React Native during app initialization.
     * Returns a list of all native modules provided by this package.
     *
     * @param reactContext The React application context
     * @return List containing the MotionDetectionModule
     */
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(MotionDetectionModule(reactContext))
    }

    /**
     * Create view managers for this package
     *
     * This package doesn't provide any custom views, so returns empty list.
     * View managers would be used for native UI components.
     *
     * @param reactContext The React application context
     * @return Empty list (no view managers)
     */
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
