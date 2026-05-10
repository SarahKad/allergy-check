import React, { useMemo, useState } from 'react';
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
import { useProfile } from '../lib/ProfileContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ALLERGEN_CATALOG } from '../lib/allergenCatalog';
import { ProfileAllergen, ProfileTrigger, newCustomAllergenId } from '../lib/profile';

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const { palette } = useTheme();
  const { profile, setProfile } = useProfile();

  const [name, setName] = useState(profile.childName);
  const [age, setAge] = useState(
    profile.childAge != null ? String(profile.childAge) : '',
  );
  const [allergens, setAllergens] = useState<ProfileAllergen[]>(profile.confirmedAllergens);
  const [triggers, setTriggers] = useState<ProfileTrigger[]>(profile.potentialTriggers);

  const [customLabel, setCustomLabel] = useState('');
  const [customAliases, setCustomAliases] = useState('');
  const [triggerLabel, setTriggerLabel] = useState('');

  const selectedIds = useMemo(() => new Set(allergens.map((a) => a.id)), [allergens]);

  function toggleCatalog(catalogId: string) {
    if (selectedIds.has(catalogId)) {
      setAllergens((cur) => cur.filter((a) => a.id !== catalogId));
      return;
    }
    const entry = ALLERGEN_CATALOG.find((c) => c.id === catalogId);
    if (!entry) return;
    setAllergens((cur) => [
      ...cur,
      {
        id: entry.id,
        label: entry.label,
        hiddenNames: [...entry.hiddenNames],
        notes: entry.note,
      },
    ]);
  }

  function addCustomAllergen() {
    const label = customLabel.trim();
    if (!label) {
      Alert.alert('Name needed', 'Type a name for the custom allergen first.');
      return;
    }
    const aliases = customAliases
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setAllergens((cur) => [
      ...cur,
      {
        id: newCustomAllergenId(),
        label,
        hiddenNames: aliases,
      },
    ]);
    setCustomLabel('');
    setCustomAliases('');
  }

  function removeAllergen(id: string) {
    setAllergens((cur) => cur.filter((a) => a.id !== id));
  }

  function addTrigger() {
    const label = triggerLabel.trim();
    if (!label) return;
    setTriggers((cur) => [...cur, { label }]);
    setTriggerLabel('');
  }

  function removeTrigger(idx: number) {
    setTriggers((cur) => cur.filter((_, i) => i !== idx));
  }

  async function save() {
    if (allergens.length === 0) {
      Alert.alert(
        'No allergens listed',
        'Without at least one allergen the app has nothing to flag. Add one before saving.',
      );
      return;
    }
    const ageNum = age.trim() === '' ? null : Number(age);
    if (age.trim() !== '' && (Number.isNaN(ageNum) || ageNum! < 0 || ageNum! > 25)) {
      Alert.alert('Check age', 'Age should be a number between 0 and 25.');
      return;
    }
    await setProfile({
      ...profile,
      childName: name.trim() || profile.childName,
      childAge: ageNum,
      confirmedAllergens: allergens,
      potentialTriggers: triggers,
    });
    onBack();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerWrap}>
        <Header
          title="Allergy profile"
          leftLabel="Cancel"
          onLeft={onBack}
          rightLabel="Save"
          onRight={save}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[styles.section, { color: palette.text }]}>Child</Text>
          <Text style={[styles.label, { color: palette.textMuted }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Lily"
            placeholderTextColor={palette.textDim}
            style={[
              styles.input,
              {
                color: palette.text,
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
              },
            ]}
          />

          <Text style={[styles.label, { color: palette.textMuted, marginTop: 12 }]}>
            Age <Text style={{ color: palette.textDim }}>(optional)</Text>
          </Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="7"
            placeholderTextColor={palette.textDim}
            keyboardType="number-pad"
            style={[
              styles.input,
              {
                color: palette.text,
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
              },
            ]}
          />
        </Card>

        <Card>
          <Text style={[styles.section, { color: palette.text }]}>Confirmed allergens</Text>
          <Text style={[styles.body, { color: palette.textMuted }]}>
            Tap to toggle. These are always treated as unsafe — including the hidden names listed in
            the app's reference table.
          </Text>

          <View style={styles.chips}>
            {ALLERGEN_CATALOG.map((c) => {
              const active = selectedIds.has(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => toggleCatalog(c.id)}
                  style={[
                    styles.chip,
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
                      fontSize: 13,
                    }}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {allergens.filter((a) => a.id.startsWith('custom-')).length > 0 ? (
            <View style={{ marginTop: 14 }}>
              <Text style={[styles.label, { color: palette.textMuted }]}>Custom</Text>
              {allergens
                .filter((a) => a.id.startsWith('custom-'))
                .map((a) => (
                  <View
                    key={a.id}
                    style={[
                      styles.row,
                      { backgroundColor: palette.bgElevated, borderColor: palette.cardBorder },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowTitle, { color: palette.text }]}>{a.label}</Text>
                      {a.hiddenNames.length ? (
                        <Text style={[styles.rowSub, { color: palette.textMuted }]}>
                          Aliases: {a.hiddenNames.join(', ')}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable onPress={() => removeAllergen(a.id)} hitSlop={8}>
                      <Text style={[styles.removeText, { color: palette.unsafeAccent }]}>
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                ))}
            </View>
          ) : null}

          <View style={{ marginTop: 14 }}>
            <Text style={[styles.label, { color: palette.textMuted }]}>Add a custom allergen</Text>
            <TextInput
              value={customLabel}
              onChangeText={setCustomLabel}
              placeholder="e.g. Tomatoes"
              placeholderTextColor={palette.textDim}
              style={[
                styles.input,
                {
                  color: palette.text,
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                },
              ]}
            />
            <Text style={[styles.label, { color: palette.textMuted, marginTop: 8 }]}>
              Aliases <Text style={{ color: palette.textDim }}>(comma-separated, optional)</Text>
            </Text>
            <TextInput
              value={customAliases}
              onChangeText={setCustomAliases}
              placeholder="tomato paste, marinara"
              placeholderTextColor={palette.textDim}
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  color: palette.text,
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                },
              ]}
            />
            <Button
              label="Add allergen"
              onPress={addCustomAllergen}
              variant="secondary"
              fullWidth
              style={{ marginTop: 10 }}
            />
          </View>
        </Card>

        <Card>
          <Text style={[styles.section, { color: palette.text }]}>Potential triggers</Text>
          <Text style={[styles.body, { color: palette.textMuted }]}>
            Things that don't always cause a reaction but should get a caution flag.
          </Text>

          {triggers.map((t, i) => (
            <View
              key={`${i}-${t.label}`}
              style={[
                styles.row,
                { backgroundColor: palette.bgElevated, borderColor: palette.cardBorder },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: palette.text }]}>{t.label}</Text>
                {t.notes ? (
                  <Text style={[styles.rowSub, { color: palette.textMuted }]}>{t.notes}</Text>
                ) : null}
              </View>
              <Pressable onPress={() => removeTrigger(i)} hitSlop={8}>
                <Text style={[styles.removeText, { color: palette.unsafeAccent }]}>Remove</Text>
              </Pressable>
            </View>
          ))}

          <Text style={[styles.label, { color: palette.textMuted, marginTop: 8 }]}>
            Add a trigger
          </Text>
          <TextInput
            value={triggerLabel}
            onChangeText={setTriggerLabel}
            placeholder="e.g. Raw onion"
            placeholderTextColor={palette.textDim}
            style={[
              styles.input,
              {
                color: palette.text,
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
              },
            ]}
            onSubmitEditing={addTrigger}
            returnKeyType="done"
          />
          <Button
            label="Add trigger"
            onPress={addTrigger}
            variant="secondary"
            fullWidth
            style={{ marginTop: 10 }}
          />
        </Card>

        <Button label="Save profile" onPress={save} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20, paddingTop: 12 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 12,
  },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 2 },
  removeText: { fontSize: 14, fontWeight: '600' },
});
