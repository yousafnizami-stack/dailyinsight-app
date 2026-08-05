import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'saved_articles';

/**
 * Minimal shape stored in AsyncStorage — enough to render an ArticleCard
 * without a network call. Mirrors the fields ArticleCard actually reads from
 * Article: featuredImageUrl, category.name, title, publishedAt — plus slug
 * and id for navigation and deduplication.
 */
export interface SavedArticle {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  featuredImageUrl?: string;
  category?: {
    slug: string;
    name: string;
  };
}

export async function getSavedArticles(): Promise<SavedArticle[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedArticle[];
  } catch {
    return [];
  }
}

export async function saveArticle(article: SavedArticle): Promise<void> {
  const current = await getSavedArticles();
  // Remove any existing entry with the same id to avoid duplicates
  const filtered = current.filter((a) => a.id !== article.id);
  // Prepend so newest-saved comes first
  const updated = [article, ...filtered];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function removeArticle(id: string): Promise<void> {
  const current = await getSavedArticles();
  const updated = current.filter((a) => a.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function isSaved(id: string): Promise<boolean> {
  const current = await getSavedArticles();
  return current.some((a) => a.id === id);
}
