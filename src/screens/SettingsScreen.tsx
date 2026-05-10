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
import { clearFamilyCode, getFamilyCode, setFamilyCode } from '../lib/secureKey';

export function SettingsScreen({
  onBack,
  onOpenProfile,
}: {
  onBack: () => void;
  onOpenProfile: () => void;
}) {
  const { palette, pref, setPref } = useTheme();
  const { setMode } = useUser();
  const [codeInput, setCodeInput] = useState('');
  const [hasCode, setHasCode] = useState(false);

  useEffect(() => {
    getFamilyCode().then((c) => {
      if (c) {
        setHasCode(true);
        setCodeInput(c);
      }
    });
  }, []);

  async function save() {
    const v = codeInput.trim();
    if (!v) {
      Alert.alert('Empty code', 'Type your family code first.');
      return;
    }
    await setFamilyCode(v);
    setHasCode(true);
    Alert.alert('Saved', 'Family code stored on this device.');
  }

  async function remove() {
    Alert.alert('Remove family code?', "You'll need to re-enter it before checking again.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await clearFamilyCode();
          setCodeInput('');
          setHasCode(false);
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
          <Text style={[styles.section, { color: palette.text }]}>Family code</Text>
          <Text style={[styles.body, { color: palette.textMuted }]}>
            The code your family shares to use the app. Stored on this device only.
          </Text>

          <TextInput
            value={codeInput}
            onChangeText={setCodeInput}
            placeholder="e.g. lily-2026"
            placeholderTextColor={palette.textDim}
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

          {hasCode ? (
            <View style={styles.actionsRow}>
              <Pressable onPress={remove} hitSlop={8}>
                <Text style={[styles.linkText, { color: palette.unsafeAccent }]}>Remove</Text>
              </Pressable>
            </View>
          ) : null}

          <Button label="Save code" onPress={save} fullWidth style={{ marginTop: 8 }} />
        </Card>

        <Card>
          <Text style={[styles.section, { color: palette.text }]}>Allergy profile</Text>
          <Text style={[styles.body, { color: palette.textMuted }]}>
            Customize whose allergies the app is checking for.
          </Text>
          <Button label="Edit profile" onPress={onOpenProfile} variant="secondary" fullWidth />
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
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
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
