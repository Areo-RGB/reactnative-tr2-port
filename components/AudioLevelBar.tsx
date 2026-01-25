import { View, StyleSheet } from 'react-native';

export function AudioLevelBar({ level, threshold }: { level: number; threshold: number }) {
  return (
    <View style={styles.container}>
      {/* Threshold Marker */}
      <View style={[styles.threshold, { left: `${threshold}%` }]} />
      {/* Level Bar */}
      <View style={[styles.bar, { width: `${level}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    overflow: 'hidden',
    position: 'relative',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    width: '100%',
  },
  threshold: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#ef4444', // red-500
    zIndex: 10,
    opacity: 0.7,
  },
  bar: {
    height: '100%',
    backgroundColor: '#22c55e', // green-500
  },
});
