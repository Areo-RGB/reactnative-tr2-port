import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

interface UseMicrophoneProps {
    threshold: number;
    cooldown: number;
    active: boolean;
    onTrigger: () => void;
}

export const useMicrophone = ({ threshold, cooldown, active, onTrigger }: UseMicrophoneProps) => {
    const [level, setLevel] = useState(0);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const lastTriggerTime = useRef<number>(0);

    useEffect(() => {
        let isMounted = true;

        const cleanup = async () => {
            if (recordingRef.current) {
                try {
                    await recordingRef.current.stopAndUnloadAsync();
                } catch (e) {
                    // Ignore unload errors
                }
                recordingRef.current = null;
            }
        };

        if (!active) {
            cleanup();
            setLevel(0);
            return;
        }

        const startRecording = async () => {
            try {
                const { granted } = await Audio.requestPermissionsAsync();
                if (!granted) return;

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                });

                const recording = new Audio.Recording();
                await recording.prepareToRecordAsync({
                    ...Audio.RecordingOptionsPresets.LOW_QUALITY,
                    isMeteringEnabled: true,
                });

                recording.setOnRecordingStatusUpdate((status) => {
                    if (!isMounted) return;
                    if (status.isRecording && status.metering !== undefined) {
                        // Metering is usually -160 (silence) to 0 (max volume)
                        // Normalize to 0-100
                        const db = status.metering;
                        // Map -60dB (quiet room) -> 0, -10dB (loud) -> 100
                        // Range is 50dB
                        const normalized = Math.max(0, Math.min(100, (db + 60) * 2));

                        setLevel(normalized);

                        const now = Date.now();
                        if (normalized > threshold && (now - lastTriggerTime.current > cooldown)) {
                            lastTriggerTime.current = now;
                            onTrigger();
                        }
                    }
                });

                await recording.startAsync();
                recordingRef.current = recording;

            } catch (err) {
                console.error('Failed to start recording', err);
            }
        };

        startRecording();

        return () => {
            isMounted = false;
            cleanup();
        };
    }, [active, threshold, cooldown, onTrigger]);

    return { level };
};
