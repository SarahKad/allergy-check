import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../lib/UserContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckResult } from '../lib/anthropic';
import { levelColors, verdictColors } from '../theme/colors';

export function ResultScreen({
  result,
  onAgain,
  onHome,
}: {
  result: CheckResult;
  onAgain: () => void;
  onHome: () => void;
}) {
  const { palette } = useTheme();
  const { mode } = useUser();
  const isLily = mode === 'lily';

  const v = verdictColors(palette, result.verdict);

  const verdictEmoji =
    result.verdict === 'safe' ? '🎉' : result.verdict === 'caution' ? '🤔' : '🙅';
  const verdictWord =
    result.verdict === 'safe'
      ? isLily
        ? 'Safe!'
        : 'Looks safe'
      : result.verdict === 'caution'
        ? isLily
          ? 'Hmm…'
          : 'Use caution'
        : isLily
          ? 'Not safe'
          : 'Not safe';

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <View style={styles.headerWrap}>
        <Header title="Result" leftLabel="Home" onLeft={onHome} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card background={v.bg} borderColor={v.border} style={styles.verdictCard}>
          <Text style={[styles.verdictEmoji]}>{verdictEmoji}</Text>
          <Text style={[styles.verdictWord, { color: v.text }]}>{verdictWord}</Text>
          {result.headline ? (
            <Text style={[styles.headline, { color: v.text }]}>{result.headline}</Text>
          ) : null}
        </Card>

        {result.summary ? (
          <Card>
            <Text style={[styles.summary, { color: palette.text }]}>{result.summary}</Text>
          </Card>
        ) : null}

        {result.findings.length > 0 ? (
          <View style={styles.findings}>
            {result.findings.map((f, i) => {
              const c = levelColors(palette, f.level);
              const emoji = f.level === 'ok' ? '✅' : f.level === 'warn' ? '⚠️' : '⛔️';
              return (
                <Card
                  key={`${i}-${f.title}`}
                  background={c.bg}
                  borderColor={c.border}
                  style={styles.findingCard}
                >
                  <View style={styles.findingHeader}>
                    <Text style={styles.findingEmoji}>{emoji}</Text>
                    <Text style={[styles.findingTitle, { color: c.text }]}>{f.title}</Text>
                  </View>
                  <Text style={[styles.findingDetail, { color: c.text }]}>{f.detail}</Text>
                </Card>
              );
            })}
          </View>
        ) : null}

        {result.modifications ? (
          <Card>
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
              {isLily ? 'You could ask:' : 'Suggested modification'}
            </Text>
            <Text style={[styles.body, { color: palette.text }]}>{result.modifications}</Text>
          </Card>
        ) : null}

        {result.encouragement ? (
          <Card background={palette.bgElevated}>
            <Text style={[styles.encouragement, { color: palette.text }]}>
              🌟 {result.encouragement}
            </Text>
          </Card>
        ) : null}

        <View style={styles.buttonRow}>
          <Button label={isLily ? 'Check another' : 'Check another'} onPress={onAgain} fullWidth />
          <Button label="Done" onPress={onHome} variant="secondary" fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  verdictCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  verdictEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  verdictWord: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
  },
  findings: {
    gap: 10,
  },
  findingCard: {
    padding: 14,
  },
  findingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  findingEmoji: { fontSize: 18 },
  findingTitle: { fontSize: 15, fontWeight: '700' },
  findingDetail: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  encouragement: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: {
    gap: 10,
    marginTop: 6,
  },
});
