import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Toggle } from '../../components/Toggle';
import { StepInput } from '../../components/StepInput';
import { styles } from './styles';

interface Back2WhiteModalProps {
    visible: boolean;
    enabled: boolean;
    duration: number;
    onEnabledChange: (value: boolean) => void;
    onDurationChange: (value: number) => void;
    onClose: () => void;
    onApply: () => void;
}

export function Back2WhiteModal({
    visible,
    enabled,
    duration,
    onEnabledChange,
    onDurationChange,
    onClose,
    onApply,
}: Back2WhiteModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Back2White Einstellungen</Text>
                        <Pressable onPress={onClose}>
                            <X size={24} color="#94a3b8" />
                        </Pressable>
                    </View>

                    <View style={styles.modalBody}>
                        <Toggle
                            label="Back2White aktivieren"
                            description="Farben automatisch nach Dauer auf Weiß zurücksetzen"
                            checked={enabled}
                            onChange={onEnabledChange}
                        />

                        {enabled && (
                            <StepInput
                                label="Dauer bis zum Zurücksetzen"
                                value={duration}
                                min={0.5} max={10} step={0.5}
                                onChange={onDurationChange}
                                formatValue={(v) => `${v}s`}
                            />
                        )}
                    </View>

                    <View style={styles.modalFooter}>
                        <Button
                            variant="secondary"
                            onPress={onClose}
                            style={{ flex: 1, marginRight: 8 }}
                        >
                            <Text>Abbrechen</Text>
                        </Button>
                        <Button
                            onPress={onApply}
                            style={{ flex: 1 }}
                        >
                            <Text>Übernehmen</Text>
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
