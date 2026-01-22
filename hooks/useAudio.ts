import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';

const BEEP_URL = 'https://video-idea.fra1.cdn.digitaloceanspaces.com/beeps/beep-short.mp3';

export const useAudio = () => {
    const [sound, setSound] = useState<Audio.Sound>();

    // Use a simpler approach for beep: just play the file
    const playBeep = useCallback(async (freq = 600, duration = 0.1) => {
        // Note: Frequency modulation is not easily supported with simple file playback in expo-av without more work.
        // For this port, we'll stick to playing the beep sound file.
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: BEEP_URL },
                { shouldPlay: true }
            );
            setSound(newSound);

            // Cleanup after playback
            newSound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    await newSound.unloadAsync();
                }
            });
        } catch (error) {
            console.log('Error playing beep', error);
        }
    }, []);

    const playSuccess = useCallback(() => {
        playBeep(500, 0.1); // Placeholder: just plays beep for now
    }, [playBeep]);

    const playFailure = useCallback(() => {
        playBeep(300, 0.2); // Placeholder: just plays beep for now
    }, [playBeep]);

    useEffect(() => {
        return () => {
            // Unload sound on unmount if it exists
            sound?.unloadAsync();
        };
    }, [sound]);

    return { playBeep, playSuccess, playFailure };
};
