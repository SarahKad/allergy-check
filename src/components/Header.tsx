import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function Header({
  title,
  subtitle,
  leftLabel,
  onLeft,
  rightLabel,
  onRight,
}: {
  title: string;
  subtitle?: string;
  leftLabel?: string;
  onLeft?: () => void;
  rightLabel?: string;
  onRight?: () => void;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>
          {leftLabel && onLeft ? (
            <Pressable onPress={onLeft} hitSlop={12}>
              <Text style={[styles.action, { color: palette.accent }]}>{leftLabel}</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.right]}>
          {rightLabel && onRight ? (
            <Pressable onPress={onRight} hitSlop={12}>
              <Text style={[styles.action, { color: palette.accent }]}>{rightLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    minWidth: 72,
  },
  right: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
  },
  action: {
    fontSize: 15,
    fontWeight: '600',
  },
});
