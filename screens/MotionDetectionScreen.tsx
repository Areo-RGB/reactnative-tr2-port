/**
 * MotionDetectionScreen.tsx
 *
 * React Native UI for Motion Detection with Virtual Tripwire
 *
 * Layout (Portrait Mode):
 * ┌─────────────────────────────────┐
 * │                                 │
 * │     Camera Preview (1/4)        │  Top quarter of screen
 * │     ┃ Red Tripwire Line ┃       │  Vertical red line in center
 * │     [ROI Overlay]               │  Semi-transparent region
 * │                                 │
 * ├─────────────────────────────────┤
 * │                                 │
 * │     Status: "Idle"              │
 * │                                 │
 * │         00:00.000               │  Large timer display
 * │                                 │
 * │     Motion Events: 0            │  Event counter
 * │                                 │
 * │   [Start]  [Stop]  [Reset]      │  Control buttons
 * │                                 │
 * │     Configuration...            │  Settings area
 * │                                 │
 * └─────────────────────────────────┘  Bottom 3/4 of screen
 *
 * Behavior:
 * 1. App starts → Shows "Idle" status
 * 2. User taps Start → Motion detection begins
 * 3. When motion crosses tripwire → Timer starts, status shows "Motion Detected"
 * 4. Timer updates in real-time showing elapsed time
 * 5. User can Stop/Reset at any time
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Play, Square, RotateCcw, Settings, Camera } from 'lucide-react-native';
import { useMotionDetection, DetectionStatus } from '../hooks/useMotionDetection';
import type { MotionDetectionConfig } from '../modules/MotionDetection';

// ==================== Constants ====================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Camera preview takes top 1/4 of screen */
const CAMERA_HEIGHT = SCREEN_HEIGHT / 4;

/** Default ROI width as percentage of frame */
const DEFAULT_ROI_WIDTH_PERCENT = 0.1;

/** Colors for status display */
const STATUS_COLORS: Record<DetectionStatus, string> = {
  idle: '#64748b', // slate-500
  running: '#22c55e', // green-500
  motion_detected: '#ef4444', // red-500
  timing: '#f59e0b', // amber-500
};

/** Status labels for display */
const STATUS_LABELS: Record<DetectionStatus, string> = {
  idle: 'Idle',
  running: 'Detecting...',
  motion_detected: 'Motion!',
  timing: 'Timing',
};

// ==================== Helper Functions ====================

/**
 * Format milliseconds as MM:SS.mmm
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// ==================== Sub-Components ====================

/**
 * Camera preview area with tripwire overlay
 *
 * Shows a placeholder when camera is not active,
 * with a visual representation of the virtual tripwire.
 */
function CameraPreview({
  roiWidthPercent,
  isRunning,
}: {
  roiWidthPercent: number;
  isRunning: boolean;
}) {
  // Calculate ROI dimensions for overlay
  const roiWidth = SCREEN_WIDTH * roiWidthPercent;
  const roiLeft = (SCREEN_WIDTH - roiWidth) / 2;

  return (
    <View style={styles.cameraContainer}>
      {/* Camera placeholder / background */}
      <View style={styles.cameraPlaceholder}>
        <Camera size={48} color="#475569" />
        <Text style={styles.cameraPlaceholderText}>
          {isRunning ? 'Camera Active' : 'Camera Preview'}
        </Text>
        {!isRunning && (
          <Text style={styles.cameraSubtext}>Tap Start to begin motion detection</Text>
        )}
      </View>

      {/* ROI overlay - semi-transparent rectangle */}
      <View
        style={[
          styles.roiOverlay,
          {
            left: roiLeft,
            width: roiWidth,
          },
        ]}
      />

      {/* Tripwire line - vertical red line in center */}
      <View style={styles.tripwireLine} />

      {/* ROI indicator labels */}
      <View style={styles.roiLabelContainer}>
        <Text style={styles.roiLabel}>Tripwire ROI ({Math.round(roiWidthPercent * 100)}%)</Text>
      </View>
    </View>
  );
}

/**
 * Timer display component with large numeric output
 */
function TimerDisplay({
  elapsedMs,
  status,
}: {
  elapsedMs: number;
  status: DetectionStatus;
}) {
  const statusColor = STATUS_COLORS[status];
  const statusLabel = STATUS_LABELS[status];

  return (
    <View style={styles.timerContainer}>
      {/* Status indicator */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>

      {/* Large timer display */}
      <Text style={[styles.timerText, status === 'timing' && styles.timerTextActive]}>
        {formatTime(elapsedMs)}
      </Text>
    </View>
  );
}

/**
 * Control buttons for start/stop/reset
 */
function Controls({
  isRunning,
  onStart,
  onStop,
  onReset,
}: {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}) {
  return (
    <View style={styles.controlsContainer}>
      {/* Start button */}
      <Pressable
        style={[styles.controlButton, styles.startButton, isRunning && styles.buttonDisabled]}
        onPress={onStart}
        disabled={isRunning}
      >
        <Play size={24} color={isRunning ? '#64748b' : '#ffffff'} fill={isRunning ? '#64748b' : '#ffffff'} />
        <Text style={[styles.controlButtonText, isRunning && styles.buttonTextDisabled]}>Start</Text>
      </Pressable>

      {/* Stop button */}
      <Pressable
        style={[styles.controlButton, styles.stopButton, !isRunning && styles.buttonDisabled]}
        onPress={onStop}
        disabled={!isRunning}
      >
        <Square size={24} color={!isRunning ? '#64748b' : '#ffffff'} fill={!isRunning ? '#64748b' : '#ffffff'} />
        <Text style={[styles.controlButtonText, !isRunning && styles.buttonTextDisabled]}>Stop</Text>
      </Pressable>

      {/* Reset button */}
      <Pressable style={[styles.controlButton, styles.resetButton]} onPress={onReset}>
        <RotateCcw size={24} color="#ffffff" />
        <Text style={styles.controlButtonText}>Reset</Text>
      </Pressable>
    </View>
  );
}

/**
 * Configuration panel for motion detection settings
 */
function ConfigPanel({
  config,
  onConfigChange,
  disabled,
}: {
  config: MotionDetectionConfig;
  onConfigChange: (config: MotionDetectionConfig) => void;
  disabled: boolean;
}) {
  return (
    <View style={[styles.configPanel, disabled && styles.configPanelDisabled]}>
      <View style={styles.configHeader}>
        <Settings size={20} color="#94a3b8" />
        <Text style={styles.configTitle}>Configuration</Text>
      </View>

      {/* Threshold slider */}
      <View style={styles.configRow}>
        <Text style={styles.configLabel}>Threshold</Text>
        <Text style={styles.configValue}>{config.threshold || 30}</Text>
      </View>
      <View style={styles.configSliderRow}>
        {[10, 20, 30, 50, 80].map((value) => (
          <Pressable
            key={value}
            style={[
              styles.configChip,
              config.threshold === value && styles.configChipActive,
              disabled && styles.configChipDisabled,
            ]}
            onPress={() => !disabled && onConfigChange({ ...config, threshold: value })}
            disabled={disabled}
          >
            <Text
              style={[
                styles.configChipText,
                config.threshold === value && styles.configChipTextActive,
              ]}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Min pixels slider */}
      <View style={styles.configRow}>
        <Text style={styles.configLabel}>Min Pixels</Text>
        <Text style={styles.configValue}>{config.minPixels || 100}</Text>
      </View>
      <View style={styles.configSliderRow}>
        {[50, 100, 200, 500, 1000].map((value) => (
          <Pressable
            key={value}
            style={[
              styles.configChip,
              config.minPixels === value && styles.configChipActive,
              disabled && styles.configChipDisabled,
            ]}
            onPress={() => !disabled && onConfigChange({ ...config, minPixels: value })}
            disabled={disabled}
          >
            <Text
              style={[
                styles.configChipText,
                config.minPixels === value && styles.configChipTextActive,
              ]}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ROI Width slider */}
      <View style={styles.configRow}>
        <Text style={styles.configLabel}>ROI Width</Text>
        <Text style={styles.configValue}>{Math.round((config.roiWidthPercent || 0.1) * 100)}%</Text>
      </View>
      <View style={styles.configSliderRow}>
        {[0.05, 0.1, 0.2, 0.3, 0.5].map((value) => (
          <Pressable
            key={value}
            style={[
              styles.configChip,
              config.roiWidthPercent === value && styles.configChipActive,
              disabled && styles.configChipDisabled,
            ]}
            onPress={() => !disabled && onConfigChange({ ...config, roiWidthPercent: value })}
            disabled={disabled}
          >
            <Text
              style={[
                styles.configChipText,
                config.roiWidthPercent === value && styles.configChipTextActive,
              ]}
            >
              {Math.round(value * 100)}%
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/**
 * Stats display showing motion detection metrics
 */
function StatsDisplay({
  motionCount,
  lastEvent,
}: {
  motionCount: number;
  lastEvent: { delta: number; processingTimeNs: number } | null;
}) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{motionCount}</Text>
        <Text style={styles.statLabel}>Motion Events</Text>
      </View>
      {lastEvent && (
        <>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{lastEvent.delta}</Text>
            <Text style={styles.statLabel}>Pixels Changed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(lastEvent.processingTimeNs / 1_000_000).toFixed(1)}ms
            </Text>
            <Text style={styles.statLabel}>Processing</Text>
          </View>
        </>
      )}
    </View>
  );
}

// ==================== Main Screen Component ====================

/**
 * Motion Detection Screen
 *
 * Main screen component that integrates the motion detection TurboModule
 * with the React Native UI.
 */
export default function MotionDetectionScreen() {
  const navigation = useNavigation();

  // Motion detection hook
  const {
    isAvailable,
    isRunning,
    status,
    lastMotionEvent,
    elapsedMs,
    error,
    start,
    stop,
    resetTimer,
    motionCount,
  } = useMotionDetection();

  // Configuration state
  const [config, setConfig] = useState<MotionDetectionConfig>({
    threshold: 30,
    minPixels: 100,
    fpsTarget: 60,
    roiWidthPercent: DEFAULT_ROI_WIDTH_PERCENT,
  });

  // Handlers
  const handleStart = useCallback(() => {
    start(config);
  }, [start, config]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleReset = useCallback(() => {
    stop();
    resetTimer();
  }, [stop, resetTimer]);

  // Check platform availability
  if (Platform.OS !== 'android') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>Motion Detection</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.unavailableContainer}>
          <Camera size={64} color="#64748b" />
          <Text style={styles.unavailableText}>
            Motion Detection is only available on Android
          </Text>
          <Text style={styles.unavailableSubtext}>
            This feature uses CameraX for high-performance frame analysis
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Motion Detection</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Camera preview with tripwire (top 1/4) */}
      <CameraPreview roiWidthPercent={config.roiWidthPercent || DEFAULT_ROI_WIDTH_PERCENT} isRunning={isRunning} />

      {/* Main content area (bottom 3/4) */}
      <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentContainer}>
        {/* Error display */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Timer display */}
        <TimerDisplay elapsedMs={elapsedMs} status={status} />

        {/* Stats display */}
        <StatsDisplay motionCount={motionCount} lastEvent={lastMotionEvent} />

        {/* Control buttons */}
        <Controls
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
        />

        {/* Configuration panel */}
        <ConfigPanel config={config} onConfigChange={setConfig} disabled={isRunning} />

        {/* Module availability indicator */}
        <View style={styles.availabilityIndicator}>
          <View
            style={[
              styles.availabilityDot,
              { backgroundColor: isAvailable ? '#22c55e' : '#ef4444' },
            ]}
          />
          <Text style={styles.availabilityText}>
            {isAvailable ? 'TurboModule Ready' : 'TurboModule Not Available'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b', // slate-800
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40,
  },

  // Camera preview
  cameraContainer: {
    height: CAMERA_HEIGHT,
    backgroundColor: '#0f172a', // slate-900
    position: 'relative',
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b', // slate-500
    fontWeight: '500',
  },
  cameraSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#475569', // slate-600
  },

  // ROI overlay
  roiOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // red with transparency
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },

  // Tripwire line
  tripwireLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: '#ef4444', // red-500
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },

  // ROI label
  roiLabelContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  roiLabel: {
    fontSize: 10,
    color: '#ef4444',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Content area
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  // Error banner
  errorBanner: {
    backgroundColor: '#7f1d1d', // red-900
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5', // red-300
    fontSize: 14,
    textAlign: 'center',
  },

  // Timer
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#e2e8f0', // slate-200
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerTextActive: {
    color: '#f59e0b', // amber-500
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8', // slate-400
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155', // slate-700
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#22c55e', // green-500
  },
  stopButton: {
    backgroundColor: '#ef4444', // red-500
  },
  resetButton: {
    backgroundColor: '#3b82f6', // blue-500
  },
  buttonDisabled: {
    backgroundColor: '#334155', // slate-700
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonTextDisabled: {
    color: '#64748b', // slate-500
  },

  // Config panel
  configPanel: {
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  configPanelDisabled: {
    opacity: 0.5,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0', // slate-200
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 14,
    color: '#94a3b8', // slate-400
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  configSliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  configChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#334155', // slate-700
    borderRadius: 8,
  },
  configChipActive: {
    backgroundColor: '#3b82f6', // blue-500
  },
  configChipDisabled: {
    opacity: 0.5,
  },
  configChipText: {
    fontSize: 12,
    color: '#94a3b8', // slate-400
  },
  configChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Availability indicator
  availabilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    color: '#64748b', // slate-500
  },

  // Unavailable state
  unavailableContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  unavailableText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8', // slate-400
    textAlign: 'center',
  },
  unavailableSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b', // slate-500
    textAlign: 'center',
  },
});
