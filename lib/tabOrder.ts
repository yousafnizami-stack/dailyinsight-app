import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tab_order';

export const DEFAULT_TAB_KEYS = [
  'latest',
  'royals',
  'celebrity',
  'entertainment',
  'music',
  'film',
  'tv',
] as const;

export type TabKey = typeof DEFAULT_TAB_KEYS[number];

export async function saveTabOrder(keys: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export async function loadTabOrder(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_TAB_KEYS];
    const parsed: string[] = JSON.parse(raw);
    // Ensure all default keys are present (guards against future additions)
    const missing = DEFAULT_TAB_KEYS.filter((k) => !parsed.includes(k));
    return [...parsed, ...missing];
  } catch {
    return [...DEFAULT_TAB_KEYS];
  }
}
