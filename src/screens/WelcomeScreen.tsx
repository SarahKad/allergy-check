import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../lib/UserContext';
import { useProfile } from '../lib/ProfileContext';

export function WelcomeScreen({ onSettings }: { onSettings: () => void }) {
  const { palette } = useTheme();
  const { setMode } = useUser();
  const { profile } = useProfile();
  const childName = profile.childName || 'Kid';

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <View style={styles.topRow}>
        <Pressable onPress={onSettings} hitSlop={12}>
          <Text style={[styles.settingsLink, { color: palette.accent }]}>Settings</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={[styles.badge, { backgroundColor: palette.bgElevated, borderColor: palette.cardBorder }]}>
          <Text style={styles.badgeEmoji}>🍓</Text>
        </View>
        <Text style={[styles.title, { color: palette.text }]}>Allergy Check</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          Step 1 — who's checking?
        </Text>

        <View style={styles.choices}>
          <Pressable
            onPress={() => setMode('lily')}
            style={({ pressed }) => [
              styles.choice,
              {
                backgroundColor: palette.card,
                borderColor: palette.cardBorder,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.choiceEmoji}>👧</Text>
            <Text style={[styles.choiceLabel, { color: palette.text }]}>It's me, {childName}!</Text>
            <Text style={[styles.choiceHint, { color: palette.textMuted }]}>
              Friendly, simple words and big buttons.
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode('adult')}
            style={({ pressed }) => [
              styles.choice,
              {
                backgroundColor: palette.card,
                borderColor: palette.cardBorder,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.choiceEmoji}>👨‍👩‍👧</Text>
            <Text style={[styles.choiceLabel, { color: palette.text }]}>Grown-up</Text>
            <Text style={[styles.choiceHint, { color: palette.textMuted }]}>
              Full ingredient details and modifications.
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.footnote, { color: palette.textDim }]}>
        Always double-check serious allergies with the source.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topRow: {
    alignItems: 'flex-end',
  },
  settingsLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    marginBottom: 28,
  },
  choices: {
    width: '100%',
    gap: 14,
  },
  choice: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: 'flex-start',
  },
  choiceEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  choiceLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  choiceHint: {
    fontSize: 13,
    marginTop: 4,
  },
  footnote: {
    fontSize: 12,
    textAlign: 'center',
  },
});
