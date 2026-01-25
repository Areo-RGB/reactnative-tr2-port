/**
 * MotionDetectionPackage.kt
 *
 * TurboReactPackage for Motion Detection TurboModule Registration
 *
 * This package registers the MotionDetectionModule with React Native's
 * New Architecture (TurboModules), making it accessible from JavaScript.
 *
 * Package Registration Flow:
 * 1. MainApplication includes this package in getPackages()
 * 2. React Native calls getModule() during TurboModule resolution
 * 3. MotionDetectionModule is instantiated and registered
 * 4. JavaScript can access via:
 *    - import { NativeModules } from 'react-native'
 *    - NativeModules.MotionDetection.start(config)
 *
 * TurboModule Benefits:
 * - Lazy loading: Module is only instantiated when first accessed
 * - Type safety: Direct JSI bindings without JSON serialization overhead
 * - Better performance: Synchronous native calls where applicable
 */

package com.paul.reactnative.motiondetection

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * TurboReactPackage implementation for MotionDetection module
 *
 * Extends TurboReactPackage for New Architecture support with
 * lazy module loading and proper module metadata.
 */
class MotionDetectionPackage : TurboReactPackage() {

    /**
     * Get a specific module by name
     *
     * Called by React Native's TurboModule system when the module
     * is first accessed from JavaScript. This enables lazy loading.
     *
     * @param name The module name being requested
     * @param reactContext The React application context
     * @return The module instance if name matches, null otherwise
     */
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == MotionDetectionModule.NAME) {
            MotionDetectionModule(reactContext)
        } else {
            null
        }
    }

    /**
     * Provide metadata about available modules
     *
     * Returns a provider that describes all modules in this package,
     * including their names, class names, and TurboModule compatibility.
     *
     * @return ReactModuleInfoProvider with module metadata
     */
    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                MotionDetectionModule.NAME to ReactModuleInfo(
                    MotionDetectionModule.NAME,           // name
                    MotionDetectionModule::class.java.name, // className
                    false,                                  // canOverrideExistingModule
                    false,                                  // needsEagerInit
                    false,                                  // isCxxModule
                    true                                    // isTurboModule
                )
            )
        }
    }
}
