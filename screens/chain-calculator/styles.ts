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
    // Playing state
    playingContainer: {
        flex: 1,
        backgroundColor: '#020617',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepText: {
        fontSize: 20,
        color: '#94a3b8', // slate-400
        fontFamily: 'monospace',
    },
    mainDisplay: {
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
        textAlign: 'center',
    },
    progressBarBg: {
        height: 8,
        width: 192,
        backgroundColor: '#1e293b', // slate-800
        borderRadius: 9999,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6366f1', // indigo-500
    },
    playingControls: {
        flexDirection: 'row',
        gap: 32,
        marginTop: 48,
    },
    controlButton: {
        paddingHorizontal: 16,
    },
    btnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    controlTextDone: {
        color: '#10b981', // emerald-500
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    controlTextCancel: {
        color: '#ef4444', // red-500
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Pending state
    pendingContainer: {
        flex: 1,
        backgroundColor: '#020617',
        justifyContent: 'center',
        padding: 24,
    },
    questionMark: {
        fontSize: 96,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 48,
        color: '#6366f1', // indigo-500
    },
    answerCard: {
        marginBottom: 24,
        padding: 16,
    },
    answerText: {
        fontSize: 48,
        fontFamily: 'monospace',
        textAlign: 'center',
        height: 80,
        color: '#ffffff',
        textAlignVertical: 'center',
    },
    numpadGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    numpadBtn: {
        width: '30%',
        height: 80,
    },
    // Finished state
    finishedContainer: {
        flex: 1,
        backgroundColor: '#020617',
        justifyContent: 'center',
        padding: 24,
        alignItems: 'center',
        gap: 40,
    },
    emoji: {
        fontSize: 72,
    },
    resultText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    resultValue: {
        fontSize: 96,
        fontWeight: '900', // black
        fontVariant: ['tabular-nums'],
    },
    historyHeader: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginHorizontal: -24,
        marginTop: -24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginBottom: 24,
    },
    historyLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#64748b', // slate-500
        paddingHorizontal: 24,
    },
    historyText: {
        fontFamily: 'monospace',
        fontSize: 24,
        color: '#94a3b8', // slate-400
        lineHeight: 32,
    },
    resultActions: {
        flexDirection: 'row',
        gap: 24,
        width: '100%',
    },
    // Config state
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 48,
    },
    iconBox: {
        padding: 20,
        backgroundColor: '#1e293b',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)', // emerald-500/30
        shadowColor: '#10b981',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#34d399', // emerald-400
    },
    headerDescription: {
        color: '#94a3b8',
        fontSize: 18,
    },
    contentStack: {
        gap: 32,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    togglesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingTop: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        marginTop: 24,
        justifyContent: 'center',
    },
});
