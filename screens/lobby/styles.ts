import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    statusText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: 12,
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    roleSelection: {
        marginBottom: 32,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    controllerArea: {
        marginBottom: 32,
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // slate-900 / 0.5
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    displayArea: {
        marginBottom: 32,
        padding: 24,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 16,
        alignItems: 'center',
    },
    waitingText: {
        color: '#10b981',
        fontStyle: 'italic',
    },
    listContent: {
        gap: 12,
    },
    deviceCard: {
        padding: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
    },
    myDeviceCard: {
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    deviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    deviceIdText: {
        color: '#64748b',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    individualControlsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    miniBtn: {
        flex: 1,
        height: 48,
        padding: 0,
        minHeight: 0,
    },
    deviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deviceName: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    myName: {
        color: '#818cf8',
    },
    deviceRole: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
    },
    errorCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        marginBottom: 24,
        padding: 12,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
    },
    settingsArea: {
        marginBottom: 24,
    },
    settingsButtonText: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBody: {
        padding: 16,
        gap: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
});
