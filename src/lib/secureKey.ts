import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'allergy-check.anthropicKey.v1';

// SecureStore is unavailable on web; fall back to AsyncStorage there so the
// developer flow still works in the browser.
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

export async function getApiKey(): Promise<string | null> {
  const s = await getStorage();
  return s.getItem(KEY);
}

export async function setApiKey(value: string): Promise<void> {
  const s = await getStorage();
  await s.setItem(KEY, value);
}

export async function clearApiKey(): Promise<void> {
  const s = await getStorage();
  await s.deleteItem(KEY);
}
