import { Text, Pressable, PressableProps, StyleSheet } from 'react-native';

interface ButtonProps extends PressableProps {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    style?: any;
    children: React.ReactNode;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    style,
    ...props
}: ButtonProps) {

    return (
        <Pressable
            style={({ pressed }) => [
                styles.base,
                styles[variant],
                styles[size],
                pressed && styles.pressed,
                style
            ]}
            {...props}
        >
            <Text style={[styles.textBase, styles[`text${variant}` as keyof typeof styles], styles[`text${size}` as keyof typeof styles]]}>
                {children}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        opacity: 0.8,
    },
    primary: {
        backgroundColor: '#6366f1', // indigo-500
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 2,
    },
    secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    outline: {
        borderWidth: 2,
        borderColor: '#6366f1',
    },
    sm: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    md: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    lg: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        width: '100%',
    },
    textBase: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textprimary: {
        color: '#ffffff',
    },
    textsecondary: {
        color: '#ffffff',
    },
    textoutline: {
        color: '#6366f1',
    },
    textsm: {
        fontSize: 14,
    },
    textmd: {
        fontSize: 16,
    },
    textlg: {
        fontSize: 18,
    },
});
