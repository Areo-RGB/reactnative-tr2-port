import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617', // slate-950
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 80,
    },
    // Playing overlay
    overlay: {
        flex: 1,
    },
    gameInfoTop: {
        position: 'absolute',
        top: 80,
        left: 24,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'monospace',
        fontSize: 20,
        zIndex: 50,
    },
    counterContainer: {
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        pointerEvents: 'none',
    },
    counterText: {
        fontSize: 128,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.3)',
    },
    waitingContainer: {
        position: 'absolute',
        bottom: 128,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 50,
    },
    waitingBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 9999,
    },
    waitingText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    // Config
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
    },
    iconBox: {
        padding: 16,
        backgroundColor: '#1e293b', // slate-800
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)', // purple-500/30
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    headerDescription: {
        color: '#94a3b8', // slate-400
    },
    contentStack: {
        gap: 24,
        paddingBottom: 48,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#ffffff',
    },
    controlsStack: {
        gap: 16,
    },
    // Mic settings
    micHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    micTitle: {
        fontWeight: 'bold',
        color: '#60a5fa', // blue-400
    },
    micControls: {
        gap: 24,
    },
});
