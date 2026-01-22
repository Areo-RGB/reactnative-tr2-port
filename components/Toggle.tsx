import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';

interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    style?: any;
}

export function Toggle({ label, description, checked, onChange, style }: ToggleProps) {
    return (
        <Pressable
            onPress={() => onChange(!checked)}
            style={[styles.container, style]}
        >
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
            </View>
            <Switch
                trackColor={{ false: '#374151', true: '#6366f1' }}
                thumbColor={checked ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onChange}
                value={checked}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    label: {
        fontWeight: 'bold',
        color: '#ffffff',
        fontSize: 16,
    },
    description: {
        color: '#9ca3af', // gray-400
        fontSize: 14,
        marginTop: 2,
    },
});
