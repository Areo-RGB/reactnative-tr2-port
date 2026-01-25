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
  withProjectBuildGradle,
  withAppBuildGradle,
  withMainApplication,
  withDangerousMod,
  createRunOncePlugin,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * CameraX version to use - compatible with the target API levels
 */
const CAMERAX_VERSION = '1.3.4';

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
    // CameraX dependencies for motion detection
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

      // Check if compileOptions already exists
      if (buildGradle.includes('sourceCompatibility JavaVersion.VERSION_17')) {
        return config;
      }

      // Add compileOptions for Java 17 (required by newer CameraX)
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
 * This makes the TurboModule available to JavaScript
 */
function withMotionDetectionPackage(config) {
  return withMainApplication(config, (config) => {
    const contents = config.modResults.contents;

    // Check if already registered
    if (contents.includes('MotionDetectionPackage')) {
      return config;
    }

    // Add import statement
    const importStatement =
      'import com.paul.reactnative.motiondetection.MotionDetectionPackage';
    const packageImportRegex = /^package .+$/m;
    const match = contents.match(packageImportRegex);

    if (match) {
      config.modResults.contents = contents.replace(
        packageImportRegex,
        `${match[0]}\n\n${importStatement}`
      );
    }

    // Add package to getPackages() list
    // Find the packages list in ReactNativeHost
    const packagesRegex = /override fun getPackages\(\): List<ReactPackage>\s*\{[\s\S]*?return\s+PackageList\(this\)\.packages/;
    const packagesMatch = config.modResults.contents.match(packagesRegex);

    if (packagesMatch) {
      // Add to the packages list
      const newPackagesCode = `${packagesMatch[0]}.apply {
                add(MotionDetectionPackage())
            }`;
      config.modResults.contents = config.modResults.contents.replace(
        packagesRegex,
        newPackagesCode
      );
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
            console.log(`Copied ${file} to ${destPath}`);
          }
        }
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
