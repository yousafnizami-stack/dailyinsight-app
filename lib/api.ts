const BASE_URL = 'https://admin.dailyinsight.co.uk/api';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  category?: {
    slug: string;
    name: string;
  };
  featuredImageUrl?: string;
  body?: any; // Payload lexical JSON
}

export interface ArticlesResponse {
  docs: Article[];
  totalPages: number;
  totalDocs: number;
  page: number;
}

export async function fetchArticles(
  page: number = 1,
  categorySlug?: string
): Promise<{ docs: Article[]; totalPages: number }> {
  let url =
    `${BASE_URL}/articles?where[status][equals]=published&sort=-publishedAt&limit=20&depth=1&page=${page}`;

  if (categorySlug) {
    url += `&where[category.slug][equals]=${encodeURIComponent(categorySlug)}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data: ArticlesResponse = await res.json();
  return { docs: data.docs, totalPages: data.totalPages };
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const url = `${BASE_URL}/articles?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data: ArticlesResponse = await res.json();
  return data.docs[0] ?? null;
}
