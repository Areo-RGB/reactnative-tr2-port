/**
 * Expo Config Plugin for Motion Detection TurboModule
 *
 * This plugin configures the Android build to include:
 * 1. CameraX dependencies for camera frame capture
 * 2. Native Kotlin TurboModule for motion detection
 * 3. Proper package registration in MainApplication
 *
 * The motion detection system uses CameraX ImageAnalysis to capture frames
 * at 60 FPS, processes them in a dedicated background thread, and emits
 * motion events to JavaScript with <10ms latency.
 */

const {
  withAppBuildGradle,
  withMainApplication,
  withDangerousMod,
  createRunOncePlugin,
} = require('expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');
const fs = require('fs');
const path = require('path');

/**
 * CameraX version to use - stable release compatible with target API levels
 * Updated to 1.5.2 for improved stability and performance
 */
const CAMERAX_VERSION = '1.5.2';

/**
 * Tag used for idempotent code insertion via mergeContents
 */
const MOTION_DETECTION_TAG = 'with-motion-detection-package';

/**
 * Add CameraX dependencies to app/build.gradle
 * CameraX is required for efficient frame capture and analysis
 */
function withCameraXDependencies(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const buildGradle = config.modResults.contents;

      // Check if dependencies are already added
      if (buildGradle.includes('camera-core')) {
        return config;
      }

      // CameraX dependencies for frame capture and analysis
      const cameraXDeps = `
    // CameraX dependencies for motion detection (version ${CAMERAX_VERSION})
    implementation "androidx.camera:camera-core:${CAMERAX_VERSION}"
    implementation "androidx.camera:camera-camera2:${CAMERAX_VERSION}"
    implementation "androidx.camera:camera-lifecycle:${CAMERAX_VERSION}"
    implementation "androidx.camera:camera-view:${CAMERAX_VERSION}"

    // Concurrent futures for CameraX
    implementation "androidx.concurrent:concurrent-futures-ktx:1.2.0"
`;

      // Insert dependencies after the existing dependencies block opener
      const dependenciesRegex = /dependencies\s*\{/;
      if (dependenciesRegex.test(buildGradle)) {
        config.modResults.contents = buildGradle.replace(
          dependenciesRegex,
          `dependencies {\n${cameraXDeps}`
        );
      }
    }
    return config;
  });
}

/**
 * Configure Java/Kotlin version for CameraX compatibility
 */
function withJavaVersion(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const buildGradle = config.modResults.contents;

      // Check if compileOptions already exists with Java 17
      if (buildGradle.includes('sourceCompatibility JavaVersion.VERSION_17')) {
        return config;
      }

      // Add compileOptions for Java 17 (required by CameraX 1.5.x)
      const compileOptions = `
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
`;

      // Find the android block and add compileOptions
      const androidBlockRegex = /android\s*\{/;
      if (androidBlockRegex.test(buildGradle)) {
        // Only add if not already present
        if (!buildGradle.includes('compileOptions')) {
          config.modResults.contents = buildGradle.replace(
            androidBlockRegex,
            `android {\n${compileOptions}`
          );
        }
      }
    }
    return config;
  });
}

/**
 * Register the MotionDetectionPackage in MainApplication
 * Uses mergeContents for stable, idempotent insertion
 *
 * This makes the TurboModule available to JavaScript
 */
function withMotionDetectionPackage(config) {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    const language = config.modResults.language;

    // Check if already registered
    if (contents.includes('MotionDetectionPackage')) {
      return config;
    }

    // Add import statement using mergeContents for idempotent insertion
    const importStatement =
      'import com.paul.reactnative.motiondetection.MotionDetectionPackage';

    // Insert import after package declaration
    const importResult = mergeContents({
      tag: `${MOTION_DETECTION_TAG}-import`,
      src: contents,
      newSrc: importStatement,
      anchor: /^package .+$/m,
      offset: 1,
      comment: '//',
    });

    if (importResult.didMerge) {
      contents = importResult.contents;
    }

    // Determine anchor and insertion based on language (Kotlin vs Java)
    let packageAnchor;
    let packageLine;

    if (language === 'kt' || language === 'kotlin') {
      // Kotlin: return PackageList(this).packages
      packageAnchor = /return\s+PackageList\(this\)\.packages/;
      packageLine = 'packages.add(MotionDetectionPackage())';
    } else {
      // Java: return packages;
      packageAnchor = /return\s+packages;/;
      packageLine = 'packages.add(new MotionDetectionPackage());';
    }

    // Insert package registration using mergeContents
    // Place it before the return statement
    const packageResult = mergeContents({
      tag: `${MOTION_DETECTION_TAG}-register`,
      src: contents,
      newSrc: `            ${packageLine}`,
      anchor: packageAnchor,
      offset: 0,
      comment: '//',
    });

    if (packageResult.didMerge) {
      config.modResults.contents = packageResult.contents;
    } else {
      // Fallback: try alternative anchors if primary didn't match
      // For Expo SDK 54+ which may have different MainApplication structure
      const altAnchorKotlin = /override fun getPackages\(\)[^{]*\{/;
      const altAnchorJava = /protected List<ReactPackage> getPackages\(\)[^{]*\{/;
      const altAnchor = language === 'kt' || language === 'kotlin' ? altAnchorKotlin : altAnchorJava;

      const altResult = mergeContents({
        tag: `${MOTION_DETECTION_TAG}-register`,
        src: contents,
        newSrc: `\n            ${packageLine}`,
        anchor: altAnchor,
        offset: 1,
        comment: '//',
      });

      if (altResult.didMerge) {
        config.modResults.contents = altResult.contents;
      } else {
        console.warn(
          '[withMotionDetection] Could not find anchor to insert MotionDetectionPackage. ' +
            'You may need to manually add it to MainApplication.'
        );
        config.modResults.contents = contents;
      }
    }

    return config;
  });
}

/**
 * Copy native Kotlin files to the Android project
 * These files implement the CameraX-based motion detection
 */
function withMotionDetectionFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const packagePath = 'com/paul/reactnative/motiondetection';
      const androidSrcPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        packagePath
      );

      // Create directory if it doesn't exist
      if (!fs.existsSync(androidSrcPath)) {
        fs.mkdirSync(androidSrcPath, { recursive: true });
      }

      // Copy each native file
      const nativeFilesDir = path.join(projectRoot, 'native', 'android', 'motiondetection');
      if (fs.existsSync(nativeFilesDir)) {
        const files = fs.readdirSync(nativeFilesDir);
        for (const file of files) {
          if (file.endsWith('.kt')) {
            const srcPath = path.join(nativeFilesDir, file);
            const destPath = path.join(androidSrcPath, file);
            fs.copyFileSync(srcPath, destPath);
            console.log(`[withMotionDetection] Copied ${file} to ${destPath}`);
          }
        }
      } else {
        console.warn(
          `[withMotionDetection] Native files directory not found: ${nativeFilesDir}`
        );
      }

      return config;
    },
  ]);
}

/**
 * Main plugin function that applies all modifications
 */
function withMotionDetection(config) {
  // Apply all modifications in sequence
  config = withCameraXDependencies(config);
  config = withJavaVersion(config);
  config = withMotionDetectionPackage(config);
  config = withMotionDetectionFiles(config);

  return config;
}

// Export as a run-once plugin to prevent duplicate modifications
module.exports = createRunOncePlugin(
  withMotionDetection,
  'withMotionDetection',
  '1.0.0'
);
