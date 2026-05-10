import React, { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../lib/UserContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  CheckResult,
  MissingApiKeyError,
  checkLabelImage,
  checkRestaurantItem,
} from '../lib/anthropic';

type Props = {
  onResult: (r: CheckResult) => void;
  onSettings: () => void;
  onChangeUser: () => void;
  requireApiKeySetup: () => void;
};

type Tab = 'label' | 'restaurant';

export function HomeScreen({ onResult, onSettings, onChangeUser, requireApiKeySetup }: Props) {
  const { palette } = useTheme();
  const { mode } = useUser();
  const [tab, setTab] = useState<Tab>('label');
  const [restaurant, setRestaurant] = useState('');
  const [dish, setDish] = useState('');
  const [loading, setLoading] = useState(false);

  const isLily = mode === 'lily';
  const userBadge = isLily ? '👧 Lily' : '👨‍👩‍👧 Grown-up';

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo permission needed', 'Please allow photo access in settings.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
      exif: false,
    });
    if (!res.canceled && res.assets[0]) {
      await runImage(res.assets[0]);
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission needed', 'Please allow camera access in settings.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
      exif: false,
    });
    if (!res.canceled && res.assets[0]) {
      await runImage(res.assets[0]);
    }
  }

  async function runImage(asset: ImagePicker.ImagePickerAsset) {
    if (!asset.base64) {
      Alert.alert('Hmm', "Couldn't read that image. Try again?");
      return;
    }
    setLoading(true);
    try {
      const mediaType = guessMediaType(asset.uri, asset.mimeType);
      const result = await checkLabelImage({
        mode: mode ?? 'adult',
        base64: asset.base64,
        mediaType,
      });
      onResult(result);
    } catch (e: any) {
      handleErr(e);
    } finally {
      setLoading(false);
    }
  }

  async function runRestaurant() {
    if (!dish.trim()) {
      Alert.alert(isLily ? 'Whoops!' : 'Missing dish', 'Tell me what dish to check.');
      return;
    }
    setLoading(true);
    try {
      const result = await checkRestaurantItem({
        mode: mode ?? 'adult',
        restaurant: restaurant.trim() || undefined,
        dish: dish.trim(),
      });
      onResult(result);
    } catch (e: any) {
      handleErr(e);
    } finally {
      setLoading(false);
    }
  }

  function handleErr(e: unknown) {
    if (e instanceof MissingApiKeyError) {
      Alert.alert(
        'API key needed',
        'Add your Anthropic API key in Settings to start checking ingredients.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open settings', onPress: requireApiKeySetup },
        ],
      );
      return;
    }
    const msg = e instanceof Error ? e.message : 'Something went wrong.';
    Alert.alert(isLily ? 'Oh no' : 'Error', msg);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title="Allergy Check"
          subtitle={isLily ? "Let's see if it's safe!" : "Scan a label or look up a dish."}
          leftLabel={userBadge}
          onLeft={onChangeUser}
          rightLabel="Settings"
          onRight={onSettings}
        />

        <View style={[styles.tabs, { backgroundColor: palette.bgElevated, borderColor: palette.cardBorder }]}>
          <TabButton
            label={isLily ? '📷 Photo' : '📷 Label'}
            active={tab === 'label'}
            onPress={() => setTab('label')}
          />
          <TabButton
            label={isLily ? '🍽️ Restaurant' : '🍽️ Restaurant'}
            active={tab === 'restaurant'}
            onPress={() => setTab('restaurant')}
          />
        </View>

        {tab === 'label' ? (
          <Card>
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              {isLily ? 'Show me the label' : 'Scan an ingredient label'}
            </Text>
            <Text style={[styles.cardBody, { color: palette.textMuted }]}>
              {isLily
                ? 'Take a photo of the food package, or pick a picture you already have.'
                : 'Snap a clear photo of the ingredient list, or pick one from your library.'}
            </Text>

            <View style={styles.actions}>
              <Button
                label={isLily ? '📸 Take a photo' : '📸 Take photo'}
                onPress={takePhoto}
                fullWidth
                loading={loading}
              />
              <Button
                label={isLily ? '🖼️ Pick a picture' : '🖼️ Choose from library'}
                onPress={pickFromLibrary}
                variant="secondary"
                fullWidth
                loading={loading}
              />
            </View>
          </Card>
        ) : (
          <Card>
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              {isLily ? 'What are we eating?' : 'Look up a restaurant dish'}
            </Text>
            <Text style={[styles.cardBody, { color: palette.textMuted }]}>
              {isLily
                ? 'Tell me the place and the food. I’ll see if it’s okay!'
                : 'Type the restaurant and dish. I’ll reason about likely ingredients and flag risks.'}
            </Text>

            <Text style={[styles.label, { color: palette.textMuted }]}>
              Restaurant <Text style={{ color: palette.textDim }}>(optional)</Text>
            </Text>
            <TextInput
              value={restaurant}
              onChangeText={setRestaurant}
              placeholder={isLily ? 'Pizza place, taco truck…' : 'e.g. Sweetgreen, Chipotle'}
              placeholderTextColor={palette.textDim}
              style={[
                styles.input,
                {
                  color: palette.text,
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                },
              ]}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: palette.textMuted }]}>Dish</Text>
            <TextInput
              value={dish}
              onChangeText={setDish}
              placeholder={isLily ? 'What you want to eat' : 'e.g. Chicken Caesar wrap'}
              placeholderTextColor={palette.textDim}
              style={[
                styles.input,
                {
                  color: palette.text,
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                },
              ]}
              autoCapitalize="sentences"
              returnKeyType="go"
              onSubmitEditing={runRestaurant}
            />

            <Button
              label={isLily ? '✨ Is it safe?' : '✨ Check this dish'}
              onPress={runRestaurant}
              fullWidth
              loading={loading}
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        <Text style={[styles.legend, { color: palette.textDim }]}>
          {isLily
            ? 'Always check with a grown-up before you eat something new.'
            : 'AI-assisted screening. For high-risk allergies, verify with the source.'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        {
          backgroundColor: active ? palette.card : 'transparent',
          borderColor: active ? palette.cardBorder : 'transparent',
        },
      ]}
    >
      <Text
        style={{
          color: active ? palette.text : palette.textMuted,
          fontWeight: '600',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function guessMediaType(
  uri: string,
  mimeType?: string | null,
): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' {
  if (mimeType === 'image/png' || mimeType === 'image/webp' || mimeType === 'image/gif') {
    return mimeType;
  }
  if (uri.toLowerCase().endsWith('.png')) return 'image/png';
  if (uri.toLowerCase().endsWith('.webp')) return 'image/webp';
  if (uri.toLowerCase().endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 14,
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  legend: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});
