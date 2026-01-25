import { View, Pressable, ViewProps, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface FullscreenOverlayProps extends ViewProps {
  onExit: () => void;
  style?: any;
  children: React.ReactNode;
}

export function FullscreenOverlay({ children, onExit, style, ...props }: FullscreenOverlayProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
      <Pressable onPress={onExit} style={styles.exitButton}>
        <ArrowLeft size={32} color="rgba(255,255,255,0.7)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    padding: 16,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 60,
  },
});
