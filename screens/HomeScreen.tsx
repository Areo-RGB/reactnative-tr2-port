import React, { useMemo, useCallback, memo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Monitor, Smartphone, LucideIcon } from 'lucide-react-native';
import { TOOLS } from '../constants';
import { Card } from '../components/Card';
import type { HomeScreenNavigationProp, RootStackParamList } from '../types/navigation';

// Memoized ToolCard component to prevent re-renders
const ToolCard = memo(function ToolCard({
    tool,
    accentColor,
    onToolPress,
    onPressDisplay,
    onPressController,
}: {
    tool: typeof TOOLS[0];
    accentColor: string;
    onToolPress: (path: keyof RootStackParamList) => void;
    onPressDisplay: () => void;
    onPressController: () => void;
}) {
    const Icon = tool.icon;

    // Memoize the press handler to avoid creating new functions on each render
    const handlePress = useCallback(() => {
        onToolPress(tool.path as keyof RootStackParamList);
    }, [onToolPress, tool.path]);

    return (
        <Pressable
            onPress={handlePress}
            accessible={true}
            accessibilityLabel={`${tool.name}. ${tool.description}`}
            accessibilityRole="button"
            accessibilityHint={`Öffnet ${tool.name}`}
        >
            <Card
                style={[
                    styles.card,
                    { borderLeftColor: accentColor, borderLeftWidth: 4 }
                ]}
            >
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <Icon size={28} color="#ffffff" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>{tool.name}</Text>
                        <Text style={styles.cardDescription}>{tool.description}</Text>

                        {tool.id === 'colors' ? (
                            <View style={styles.actionButtons}>
                                <Pressable
                                    style={[styles.actionBtn, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}
                                    onPress={onPressDisplay}
                                    accessible={true}
                                    accessibilityLabel="Display Modus"
                                    accessibilityHint="Öffnet die Lobby im Display Modus"
                                    accessibilityRole="button"
                                >
                                    <Monitor size={16} color="#3b82f6" />
                                    <Text style={[styles.actionBtnText, { color: '#3b82f6' }]}>Display</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
                                    onPress={onPressController}
                                    accessible={true}
                                    accessibilityLabel="Controller Modus"
                                    accessibilityHint="Öffnet die Lobby im Controller Modus"
                                    accessibilityRole="button"
                                >
                                    <Smartphone size={16} color="#ef4444" />
                                    <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Controller</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View style={styles.tagsDisplay}>
                                {tool.tags.map(tag => (
                                    <View key={tag} style={styles.tag}>
                                        <Text style={styles.tagText}>
                                            {tag}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </Card>
        </Pressable>
    );
});

export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();

    // Memoize accent colors mapping
    const accentColors = useMemo<Record<string, string>>(() => ({
        'border-purple-500': '#a855f7',
        'border-green-500': '#22c55e',
        'border-blue-500': '#3b82f6',
        'border-red-500': '#ef4444',
        'border-orange-500': '#f97316',
        'border-cyan-500': '#06b6d4',
    }), []);

    // Navigation handlers with useCallback
    const handleToolPress = useCallback((path: keyof RootStackParamList) => {
        navigation.navigate(path);
    }, [navigation]);

    const handleNavigateToDisplay = useCallback(() => {
        navigation.navigate('Lobby', { initialRole: 'display' });
    }, [navigation]);

    const handleNavigateToController = useCallback(() => {
        navigation.navigate('Lobby', { initialRole: 'controller' });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: '#818cf8' }]}>
                        Training
                    </Text>
                    <Text style={styles.subtitle}>
                        Training Tools Collection
                    </Text>
                </View>

                <View style={styles.grid}>
                    {TOOLS.map((tool) => {
                        const accentColor = accentColors[tool.accentColor] || '#ffffff';

                        return (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                accentColor={accentColor}
                                onToolPress={handleToolPress}
                                onPressDisplay={handleNavigateToDisplay}
                                onPressController={handleNavigateToController}
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617', // slate-950
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 80,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 16,
    },
    title: {
        fontSize: 48,
        fontWeight: '900', // black
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#94a3b8', // slate-400
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 3.2, // 0.2em
        fontSize: 12,
        textAlign: 'center',
    },
    grid: {
        gap: 24,
    },
    card: {
        overflow: 'hidden',
        position: 'relative',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        zIndex: 10,
        position: 'relative',
    },
    iconContainer: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#ffffff',
    },
    cardDescription: {
        fontSize: 14,
        color: '#94a3b8', // slate-400
        marginBottom: 16,
        lineHeight: 20,
    },
    tagsDisplay: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#64748b', // slate-500
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
