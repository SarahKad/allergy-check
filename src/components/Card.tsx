import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function Card({
  children,
  style,
  borderColor,
  background,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  borderColor?: string;
  background?: string;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: background ?? palette.card,
          borderColor: borderColor ?? palette.cardBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
});
