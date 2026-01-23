import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error to console (in production, send to error tracking service)
        console.error('Error Boundary caught an error:', error);
        console.error('Error Info:', errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.emoji}>⚠️</Text>
                        <Text style={styles.title}>Etwas ist schiefgelaufen</Text>
                        <Text style={styles.message}>
                            Die App ist auf ein Problem gestoßen.
                        </Text>
                        {__DEV__ && this.state.error && (
                            <Text style={styles.errorDetail}>
                                {this.state.error.message}
                            </Text>
                        )}
                        <Pressable style={styles.button} onPress={this.handleReset}>
                            <Text style={styles.buttonText}>Erneut versuchen</Text>
                        </Pressable>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
    },
    errorDetail: {
        fontSize: 12,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
