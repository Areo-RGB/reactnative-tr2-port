import React, { memo, useCallback } from 'react';
import { View, Text, Switch, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const Toggle = memo(function Toggle({
  label,
  description,
  checked,
  onChange,
  style,
  accessibilityLabel,
}: ToggleProps) {
  const handlePress = useCallback(() => {
    onChange(!checked);
  }, [checked, onChange]);

  const defaultAccessibilityLabel =
    accessibilityLabel || `${label}, ${checked ? 'eingeschaltet' : 'ausgeschaltet'}`;

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, style]}
      accessible={true}
      accessibilityLabel={defaultAccessibilityLabel}
      accessibilityHint={description}
      accessibilityRole="switch"
      accessibilityState={{ checked: checked }}
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
});

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
