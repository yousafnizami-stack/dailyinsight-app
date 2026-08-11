const BASE_URL = 'https://admin.dailyinsight.co.uk/api';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author?: string;
  publishedAt: string;
  // At depth=0 Payload returns the raw relationship ID string, not the populated object.
  category?: string;
  // Scalar fields backfilled on the CMS — available at depth=0.
  categoryName?: string;
  categorySlug?: string;
  featuredImageUrl?: string;
  body?: any; // Payload lexical JSON
  embeds?: Array<{
    id?: string;
    platform?: string;
    embedHtml: string;
    caption?: string;
    insertAfterParagraph?: number;
  }>;
}

export interface ArticlesResponse {
  docs: Article[];
  totalPages: number;
  totalDocs: number;
  page: number;
}

// Curated category order mirroring the website's getNavCategories.ts logic.
// Excludes 'film', 'other'; renames 'tv' to 'TV & Film'.
const NAV_CATEGORY_ORDER = ['royals', 'celebrity', 'tv', 'music', 'entertainment', 'fashion'];
const NAV_EXCLUDED_SLUGS = new Set(['film', 'other', 'horoscopes']);

export async function fetchArticles(
  page: number = 1,
  categorySlug?: string
): Promise<{ docs: Article[]; totalPages: number }> {
  const params = new URLSearchParams({
    'where[status][equals]': 'published',
    sort: '-publishedAt',
    limit: '20',
    depth: '0',
    page: String(page),
  });

  if (categorySlug) {
    params.set('where[category.slug][equals]', categorySlug);
  }

  const res = await fetch(`${BASE_URL}/articles?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data: ArticlesResponse = await res.json();
  return { docs: data.docs, totalPages: data.totalPages };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories?limit=20&depth=0`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();

  const allCats: Category[] = (data.docs ?? [])
    .filter((c: any) => !NAV_EXCLUDED_SLUGS.has(c.slug))
    .map((c: any) => ({
      id: c.id,
      name: c.slug === 'tv' ? 'TV & Film' : c.name.trim(),
      slug: c.slug,
    }));

  // Sort by curated order; any unknown slugs go to the end
  const ordered = [
    ...NAV_CATEGORY_ORDER
      .map(slug => allCats.find(c => c.slug === slug))
      .filter((c): c is Category => c !== undefined),
    ...allCats.filter(c => !NAV_CATEGORY_ORDER.includes(c.slug)),
  ];

  return ordered;
}

export async function searchArticles(
  query: string,
  page: number = 1
): Promise<{ docs: Article[]; totalPages: number }> {
  // Lowercase the query for consistent case-insensitive matching, and use
  // URLSearchParams so every value (including multi-word terms with spaces)
  // is correctly percent-encoded before being appended to the URL.
  const normalised = query.trim().toLowerCase();

  const params = new URLSearchParams({
    'where[title][contains]': normalised,
    'where[status][equals]': 'published',
    sort: '-publishedAt',
    limit: '20',
    depth: '0',
    page: String(page),
  });

  const res = await fetch(`${BASE_URL}/articles?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data: ArticlesResponse = await res.json();
  return { docs: data.docs, totalPages: data.totalPages };
}

export async function fetchLatestArticles(limit: number = 6): Promise<Article[]> {
  const params = new URLSearchParams({
    'where[status][equals]': 'published',
    sort: '-publishedAt',
    limit: String(limit),
    depth: '0',
  });

  const res = await fetch(`${BASE_URL}/articles?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data: ArticlesResponse = await res.json();
  return data.docs;
}

export async function fetchArticlesByCategory(
  categorySlug: string,
  limit: number = 6
): Promise<Article[]> {
  const params = new URLSearchParams({
    'where[category.slug][equals]': categorySlug,
    'where[status][equals]': 'published',
    sort: '-publishedAt',
    limit: String(limit),
    depth: '0',
  });

  const res = await fetch(`${BASE_URL}/articles?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data: ArticlesResponse = await res.json();
  return data.docs;
}

export async function fetchRelatedArticles(
  categorySlug: string,
  excludeSlug: string,
  limit: number = 4
): Promise<Article[]> {
  const params = new URLSearchParams({
    'where[category.slug][equals]': categorySlug,
    'where[status][equals]': 'published',
    'where[slug][not_equals]': excludeSlug,
    sort: '-publishedAt',
    limit: String(limit),
    depth: '0',
  });

  const res = await fetch(`${BASE_URL}/articles?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data: ArticlesResponse = await res.json();
  return data.docs;
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const params = new URLSearchParams({
    'where[slug][equals]': slug,
    depth: '1', // body-embedded Media nodes need relationship expansion to render images
    limit: '1',
  });

  const res = await fetch(`${BASE_URL}/articles?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data: ArticlesResponse = await res.json();
  return data.docs[0] ?? null;
}

export interface HoroscopeSign {
  sign: string;
  reading: string;
  love: number;
  career: number;
  luckyColour: string;
  luckyNumber: number;
  luckyDay: string;
}

export interface HoroscopeData {
  date: string;
  signs: HoroscopeSign[];
  isFallback?: boolean;
}

export async function fetchHoroscope(): Promise<HoroscopeData | null> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const BASE = 'https://admin.dailyinsight.co.uk/api/horoscopes';
  try {
    // Try today first
    const res = await fetch(`${BASE}?where[date][equals]=${dateStr}&limit=1`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.docs && data.docs.length > 0) {
        return { ...data.docs[0], isFallback: false };
      }
    }
    // Fallback to most recent
    const fallbackRes = await fetch(`${BASE}?sort=-date&limit=1`, { cache: 'no-store' });
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      if (fallbackData.docs && fallbackData.docs.length > 0) {
        return { ...fallbackData.docs[0], isFallback: true };
      }
    }
    return null;
  } catch {
    return null;
  }
}
