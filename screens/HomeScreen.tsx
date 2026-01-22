import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TOOLS } from '../constants';
import { Card } from '../components/Card';

export default function HomeScreen() {
    const navigation = useNavigation<any>();

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
                        const Icon = tool.icon;
                        // Map accent colors manually significantly since we lose tailwind classes
                        const accentColors: Record<string, string> = {
                            'border-purple-500': '#a855f7',
                            'border-green-500': '#22c55e',
                            'border-blue-500': '#3b82f6',
                            'border-red-500': '#ef4444',
                            'border-orange-500': '#f97316',
                            'border-cyan-500': '#06b6d4',
                        };
                        const accentColor = accentColors[tool.accentColor] || '#ffffff';

                        return (
                            <Pressable
                                key={tool.id}
                                onPress={() => navigation.navigate(tool.path)}
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
                                            <View style={styles.tagsDisplay}>
                                                {tool.tags.map(tag => (
                                                    <View key={tag} style={styles.tag}>
                                                        <Text style={styles.tagText}>
                                                            {tag}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            </Pressable>
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
});
