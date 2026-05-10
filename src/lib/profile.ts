import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProfileAllergen = {
  // 'eggs', 'tree-nuts', or 'custom-<uuid>'.
  id: string;
  label: string;
  hiddenNames: string[];
  notes?: string;
};

export type ProfileTrigger = {
  label: string;
  notes?: string;
};

export type Profile = {
  // Bumped if we ever change the shape — keeps phase-2 server sync sane.
  schemaVersion: 1;
  childName: string;
  childAge: number | null;
  confirmedAllergens: ProfileAllergen[];
  potentialTriggers: ProfileTrigger[];
};

const STORAGE_KEY = 'allergy-check.profile.v1';

// Defaults seeded with Lily's setup so the app keeps working out of the box
// for the original family. Other families edit on first run.
export function defaultProfile(): Profile {
  return {
    schemaVersion: 1,
    childName: 'Lily',
    childAge: 7,
    confirmedAllergens: [
      {
        id: 'tree-nuts',
        label: 'Tree nuts',
        hiddenNames: [
          'almond',
          'cashew',
          'walnut',
          'pistachio',
          'pecan',
          'hazelnut',
          'macadamia',
          'marzipan',
          'praline',
          'nougat',
          'nut butter',
          'mixed nuts',
        ],
        notes: 'Coconut is fine.',
      },
      {
        id: 'peanuts',
        label: 'Peanuts',
        hiddenNames: ['peanut butter', 'groundnut', 'arachis oil'],
      },
      {
        id: 'eggs',
        label: 'Eggs',
        hiddenNames: [
          'albumin',
          'albumen',
          'mayonnaise',
          'meringue',
          'egg wash',
          'ovalbumin',
          'lecithin (egg)',
        ],
      },
      {
        id: 'green-peas',
        label: 'Green peas / pea protein',
        hiddenNames: ['pea flour', 'pea starch', 'pea protein', 'snap peas', 'snow peas'],
      },
      {
        id: 'mustard',
        label: 'Mustard',
        hiddenNames: ['mustard powder', 'mustard oil', 'mustard greens', 'mustard seed'],
      },
      {
        id: 'shellfish',
        label: 'Shellfish',
        hiddenNames: [
          'shrimp',
          'crab',
          'lobster',
          'clam',
          'oyster',
          'scallop',
          'mussel',
          'surimi',
          'imitation crab',
        ],
      },
    ],
    potentialTriggers: [
      { label: 'Raw onion', notes: 'Cooked onion is generally fine.' },
      { label: 'Raw garlic', notes: 'Cooked garlic is generally fine.' },
      { label: '"Spices" or "natural flavors"', notes: 'Vague labels can hide mustard, onion, garlic.' },
    ],
  };
}

export async function getStoredProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Profile;
    // Light migration shim: if schema doesn't match, fall back to defaults.
    if (parsed?.schemaVersion !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function newCustomAllergenId(): string {
  // RN doesn't have crypto.randomUUID() everywhere; this is good enough for
  // a local-only id.
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
