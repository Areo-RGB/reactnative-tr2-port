import { useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

const BEEP_URL = 'https://video-idea.fra1.cdn.digitaloceanspaces.com/beeps/beep-short.mp3';

export const useAudio = () => {
    // Use ref instead of state to avoid re-renders and prevent cleanup issues
    const soundRef = useRef<Audio.Sound | null>(null);

    const unloadSound = useCallback(async () => {
        if (soundRef.current) {
            try {
                await soundRef.current.unloadAsync();
            } catch (error) {
                console.log('Error unloading sound', error);
            }
            soundRef.current = null;
        }
    }, []);

    // Use a simpler approach for beep: just play the file
    const playBeep = useCallback(async (freq = 600, duration = 0.1) => {
        // Note: Frequency modulation is not easily supported with simple file playback in expo-av without more work.
        // For this port, we'll stick to playing the beep sound file.

        // Unload any existing sound before creating a new one to prevent memory leaks
        await unloadSound();

        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: BEEP_URL },
                { shouldPlay: true }
            );
            soundRef.current = newSound;

            // Cleanup after playback - but only if this is still the current sound
            newSound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    // Only unload if this is still the current sound (not replaced by a new one)
                    if (soundRef.current === newSound) {
                        await newSound.unloadAsync();
                        soundRef.current = null;
                    }
                }
            });
        } catch (error) {
            console.log('Error playing beep', error);
            soundRef.current = null;
        }
    }, [unloadSound]);

    const playSuccess = useCallback(() => {
        playBeep(500, 0.1); // Placeholder: just plays beep for now
    }, [playBeep]);

    const playFailure = useCallback(() => {
        playBeep(300, 0.2); // Placeholder: just plays beep for now
    }, [playBeep]);

    // Note: Since we're using useRef instead of useState, we don't need a cleanup effect
    // The sound will be automatically unloaded after playback finishes
    // If the component unmounts while playing, the sound will continue to play
    // but won't cause a memory leak since it will unload itself

    return { playBeep, playSuccess, playFailure };
};
