import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The "family code" is the shared secret each installed app sends to the
// proxy in `x-api-key`. The proxy validates it and swaps in the real
// Anthropic key. Stored in SecureStore on device; on web (Expo dev) we fall
// back to AsyncStorage.

const KEY = 'allergy-check.familyCode.v1';

async function getStorage(): Promise<{
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  deleteItem: (k: string) => Promise<void>;
}> {
  if (Platform.OS === 'web') {
    return {
      getItem: (k) => AsyncStorage.getItem(k),
      setItem: (k, v) => AsyncStorage.setItem(k, v),
      deleteItem: (k) => AsyncStorage.removeItem(k),
    };
  }
  return {
    getItem: (k) => SecureStore.getItemAsync(k),
    setItem: (k, v) => SecureStore.setItemAsync(k, v),
    deleteItem: (k) => SecureStore.deleteItemAsync(k),
  };
}

export async function getFamilyCode(): Promise<string | null> {
  const s = await getStorage();
  return s.getItem(KEY);
}

export async function setFamilyCode(value: string): Promise<void> {
  const s = await getStorage();
  await s.setItem(KEY, value);
}

export async function clearFamilyCode(): Promise<void> {
  const s = await getStorage();
  await s.deleteItem(KEY);
}
