import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../lib/UserContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { clearApiKey, getApiKey, setApiKey } from '../lib/secureKey';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { palette, pref, setPref } = useTheme();
  const { setMode } = useUser();
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    getApiKey().then((k) => {
      if (k) {
        setHasKey(true);
        setKeyInput(k);
      }
    });
  }, []);

  async function save() {
    const v = keyInput.trim();
    if (!v) {
      Alert.alert('Empty key', 'Paste your Anthropic API key first.');
      return;
    }
    await setApiKey(v);
    setHasKey(true);
    Alert.alert('Saved', 'API key stored securely on this device.');
  }

  async function remove() {
    Alert.alert('Remove API key?', 'You will need to re-enter it before checking ingredients.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await clearApiKey();
          setKeyInput('');
          setHasKey(false);
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerWrap}>
        <Header title="Settings" leftLabel="Back" onLeft={onBack} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[styles.section, { color: palette.text }]}>Anthropic API key</Text>
          <Text style={[styles.body, { color: palette.textMuted }]}>
            The app calls Claude directly with your key. It's stored securely on this device only.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="sk-ant-…"
              placeholderTextColor={palette.textDim}
              secureTextEntry={!reveal}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  color: palette.text,
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                },
              ]}
            />
          </View>

          <View style={styles.actionsRow}>
            <Pressable onPress={() => setReveal((r) => !r)} hitSlop={8}>
              <Text style={[styles.linkText, { color: palette.accent }]}>
                {reveal ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
            {hasKey ? (
              <Pressable onPress={remove} hitSlop={8}>
                <Text style={[styles.linkText, { color: palette.unsafeAccent }]}>Remove</Text>
              </Pressable>
            ) : null}
          </View>

          <Button label="Save key" onPress={save} fullWidth style={{ marginTop: 8 }} />
        </Card>

        <Card>
          <Text style={[styles.section, { color: palette.text }]}>Appearance</Text>
          <View style={styles.segmented}>
            {(['system', 'light', 'dark'] as const).map((opt) => {
              const active = pref === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setPref(opt)}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: active ? palette.accent : palette.bgElevated,
                      borderColor: active ? palette.accent : palette.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? palette.accentText : palette.text,
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={[styles.section, { color: palette.text }]}>User</Text>
          <Text style={[styles.body, { color: palette.textMuted }]}>
            Switch back to the welcome screen to change who's checking.
          </Text>
          <Button
            label="Change user"
            variant="secondary"
            onPress={() => {
              setMode(null);
              onBack();
            }}
            fullWidth
            style={{ marginTop: 8 }}
          />
        </Card>

        <Text style={[styles.footnote, { color: palette.textDim }]}>
          Allergy Check is an assistive tool. For high-risk allergies, always verify with the source.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  inputRow: { marginBottom: 8 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  linkText: { fontSize: 14, fontWeight: '600' },
  segmented: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  footnote: { fontSize: 12, textAlign: 'center' },
});
