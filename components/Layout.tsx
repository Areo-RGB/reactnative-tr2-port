import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  style?: any;
}

export function Layout({ children, title, style }: LayoutProps) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        {canGoBack ? (
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
            <Text style={styles.backText}>Zurück</Text>
          </Pressable>
        ) : (
          <View style={{ width: 80 }} /> // Spacer to balance title if needed, or just empty
        )}

        {/* Optional Title in Center? Or just let screens handle their own titles. 
            User asked for "Header with Back Button". 
            Let's keep it simple: Back button on left. Title logic if provided.
        */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* Balance right side if we want centered title */}
        <View style={{ width: 80 }} />
      </View>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    height: 60,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});
