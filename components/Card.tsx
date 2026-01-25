import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle, StyleSheet } from 'react-native';

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}

export const Card = React.memo(({ style, children, ...props }: CardProps) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
});

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
});
