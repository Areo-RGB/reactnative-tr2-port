/**
 * MotionDetectionScreen.web.tsx
 *
 * Web-specific Motion Detection Screen
 *
 * This version uses browser APIs (getUserMedia, Canvas) instead of
 * native modules. It renders an HTML video element for the camera preview.
 *
 * Layout (Portrait Mode):
 * ┌─────────────────────────────────┐
 * │                                 │
 * │     Video Preview (1/4)         │  HTML video element with stream
 * │     ┃ Red Tripwire Line ┃       │  CSS overlay for tripwire
 * │     [ROI Overlay]               │  Semi-transparent CSS region
 * │                                 │
 * ├─────────────────────────────────┤
 * │                                 │
 * │     Status + Timer + Controls   │  Same as native version
 * │                                 │
 * └─────────────────────────────────┘
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Play, Square, RotateCcw, Settings, Camera } from 'lucide-react-native';
import { useMotionDetection, DetectionStatus } from '../hooks/useMotionDetection.web';
import type { MotionDetectionConfig } from '../modules/MotionDetection.web';

// ==================== Constants ====================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAMERA_HEIGHT = Math.min(SCREEN_HEIGHT / 4, 240);
const DEFAULT_ROI_WIDTH_PERCENT = 0.1;

const STATUS_COLORS: Record<DetectionStatus, string> = {
  idle: '#64748b',
  running: '#22c55e',
  motion_detected: '#ef4444',
  timing: '#f59e0b',
};

const STATUS_LABELS: Record<DetectionStatus, string> = {
  idle: 'Idle',
  running: 'Detecting...',
  motion_detected: 'Motion!',
  timing: 'Timing',
};

// ==================== Helper Functions ====================

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// ==================== Video Preview Component ====================

/**
 * Web-specific video preview with tripwire overlay
 */
function VideoPreview({
  videoElement,
  mediaStream,
  roiWidthPercent,
  isRunning,
}: {
  videoElement: HTMLVideoElement | null;
  mediaStream: MediaStream | null;
  roiWidthPercent: number;
  isRunning: boolean;
}) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Set up video element when stream is available
  useEffect(() => {
    if (!videoContainerRef.current) return;

    // Clear previous video
    if (videoRef.current) {
      videoRef.current.remove();
      videoRef.current = null;
    }

    if (mediaStream && isRunning) {
      // Create and configure video element
      const video = document.createElement('video');
      video.srcObject = mediaStream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scaleX(-1);
      `;

      videoContainerRef.current.appendChild(video);
      videoRef.current = video;

      video.play().catch(console.error);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.remove();
        videoRef.current = null;
      }
    };
  }, [mediaStream, isRunning]);

  const roiWidth = SCREEN_WIDTH * roiWidthPercent;
  const roiLeft = (SCREEN_WIDTH - roiWidth) / 2;

  return (
    <View style={styles.cameraContainer}>
      {/* Video container - uses native DOM for video element */}
      <View style={styles.videoWrapper}>
        {isRunning ? (
          <div
            ref={videoContainerRef}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0f172a',
              position: 'relative',
            }}
          />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Camera size={48} color="#475569" />
            <Text style={styles.cameraPlaceholderText}>Camera Preview</Text>
            <Text style={styles.cameraSubtext}>Tap Start to begin motion detection</Text>
          </View>
        )}
      </View>

      {/* ROI overlay */}
      <View
        style={[
          styles.roiOverlay,
          {
            left: roiLeft,
            width: roiWidth,
          },
        ]}
      />

      {/* Tripwire line */}
      <View style={styles.tripwireLine} />

      {/* ROI label */}
      <View style={styles.roiLabelContainer}>
        <Text style={styles.roiLabel}>Tripwire ROI ({Math.round(roiWidthPercent * 100)}%)</Text>
      </View>
    </View>
  );
}

// ==================== Timer Display ====================

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
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
      <Text style={[styles.timerText, status === 'timing' && styles.timerTextActive]}>
        {formatTime(elapsedMs)}
      </Text>
    </View>
  );
}

// ==================== Controls ====================

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
      <Pressable
        style={[styles.controlButton, styles.startButton, isRunning && styles.buttonDisabled]}
        onPress={onStart}
        disabled={isRunning}
      >
        <Play
          size={24}
          color={isRunning ? '#64748b' : '#ffffff'}
          fill={isRunning ? '#64748b' : '#ffffff'}
        />
        <Text style={[styles.controlButtonText, isRunning && styles.buttonTextDisabled]}>
          Start
        </Text>
      </Pressable>

      <Pressable
        style={[styles.controlButton, styles.stopButton, !isRunning && styles.buttonDisabled]}
        onPress={onStop}
        disabled={!isRunning}
      >
        <Square
          size={24}
          color={!isRunning ? '#64748b' : '#ffffff'}
          fill={!isRunning ? '#64748b' : '#ffffff'}
        />
        <Text style={[styles.controlButtonText, !isRunning && styles.buttonTextDisabled]}>
          Stop
        </Text>
      </Pressable>

      <Pressable style={[styles.controlButton, styles.resetButton]} onPress={onReset}>
        <RotateCcw size={24} color="#ffffff" />
        <Text style={styles.controlButtonText}>Reset</Text>
      </Pressable>
    </View>
  );
}

// ==================== Config Panel ====================

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

      {/* Threshold */}
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

      {/* Min Pixels */}
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

      {/* ROI Width */}
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

// ==================== Stats Display ====================

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

// ==================== Main Screen ====================

export default function MotionDetectionScreen() {
  const navigation = useNavigation();

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
    mediaStream,
    videoElement,
  } = useMotionDetection();

  const [config, setConfig] = useState<MotionDetectionConfig>({
    threshold: 30,
    minPixels: 100,
    fpsTarget: 60,
    roiWidthPercent: DEFAULT_ROI_WIDTH_PERCENT,
  });

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Motion Detection (Web)</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Video Preview */}
      <VideoPreview
        videoElement={videoElement}
        mediaStream={mediaStream}
        roiWidthPercent={config.roiWidthPercent || DEFAULT_ROI_WIDTH_PERCENT}
        isRunning={isRunning}
      />

      {/* Content Area */}
      <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentContainer}>
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Browser Support Warning */}
        {!isAvailable && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              Camera access not available. Please use HTTPS or localhost.
            </Text>
          </View>
        )}

        {/* Timer */}
        <TimerDisplay elapsedMs={elapsedMs} status={status} />

        {/* Stats */}
        <StatsDisplay motionCount={motionCount} lastEvent={lastMotionEvent} />

        {/* Controls */}
        <Controls
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
        />

        {/* Config */}
        <ConfigPanel config={config} onConfigChange={setConfig} disabled={isRunning} />

        {/* Status Indicator */}
        <View style={styles.availabilityIndicator}>
          <View
            style={[
              styles.availabilityDot,
              { backgroundColor: isAvailable ? '#22c55e' : '#ef4444' },
            ]}
          />
          <Text style={styles.availabilityText}>
            {isAvailable ? 'Browser Camera Ready' : 'Camera Not Available'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
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

  cameraContainer: {
    height: CAMERA_HEIGHT,
    backgroundColor: '#0f172a',
    position: 'relative',
    overflow: 'hidden',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  cameraSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#475569',
  },

  roiOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },

  tripwireLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: '#ef4444',
  },

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

  contentArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  errorBanner: {
    backgroundColor: '#7f1d1d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },

  warningBanner: {
    backgroundColor: '#78350f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    color: '#fcd34d',
    fontSize: 14,
    textAlign: 'center',
  },

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
    color: '#e2e8f0',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerTextActive: {
    color: '#f59e0b',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
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
    color: '#94a3b8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155',
  },

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
    backgroundColor: '#22c55e',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  resetButton: {
    backgroundColor: '#3b82f6',
  },
  buttonDisabled: {
    backgroundColor: '#334155',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonTextDisabled: {
    color: '#64748b',
  },

  configPanel: {
    backgroundColor: '#1e293b',
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
    color: '#e2e8f0',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 14,
    color: '#94a3b8',
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
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  configChipActive: {
    backgroundColor: '#3b82f6',
  },
  configChipDisabled: {
    opacity: 0.5,
  },
  configChipText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  configChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },

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
    color: '#64748b',
  },
});
