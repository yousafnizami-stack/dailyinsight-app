import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image as ExpoImage } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RichTextRenderer from '../components/RichTextRenderer';
import { Article, fetchArticleBySlug, fetchRelatedArticles } from '../lib/api';
import { timeAgo } from '../lib/timeAgo';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';
import { useTextSize } from '../lib/TextSizeContext';
import {
  isSaved,
  removeArticle,
  saveArticle,
  SavedArticle,
} from '../lib/savedArticles';

interface Props {
  route: {
    params: {
      slug: string;
      title?: string;
      featuredImageUrl?: string;
      categoryName?: string;
      publishedAt?: string;
      author?: string;
    };
  };
  navigation: any;
}

// Map author select values to display labels
const AUTHOR_LABELS: Record<string, string> = {
  'di-royal-reporter': 'Royal Correspondent',
  'di-entertainment-desk': 'Entertainment Desk',
  'di-music-desk': 'Music Desk',
  'di-film-desk': 'Film Desk',
  'web-desk': 'Web Desk',
  'news-desk': 'News Desk',
  'celebrity-desk': 'Celebrity Desk',
  'royal-family-desk': 'Royal Family News Desk',
  'sophie-marshall': 'Sophie Marshall',
  'james-okafor': 'James Okafor',
  'claire-dennison': 'Claire Dennison',
  'tom-everett': 'Tom Everett',
  'rachel-hinds': 'Rachel Hinds',
  'priya-nair': 'Priya Nair',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ArticleDetailScreen({ route, navigation }: Props) {
  const {
    slug,
    title: previewTitle,
    featuredImageUrl: previewImage,
    categoryName: previewCategory,
    publishedAt: previewDate,
    author: previewAuthor,
  } = route.params;

  const hasPreview = Boolean(previewTitle);
  const { colors } = useTheme();
  const { fontScale } = useTextSize();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [related, setRelated] = useState<Article[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (article) {
        isSaved(article.id).then(setSaved);
      }
    }, [article])
  );

  const handleSave = useCallback(async () => {
    if (!article) return;
    if (saved) {
      setSaved(false);
      await removeArticle(article.id);
    } else {
      setSaved(true);
      const toSave: SavedArticle = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        publishedAt: article.publishedAt,
        featuredImageUrl: article.featuredImageUrl,
        categoryName: article.categoryName,
        categorySlug: article.categorySlug,
      };
      await saveArticle(toSave);
    }
  }, [article, saved]);

  const handleShare = useCallback(async () => {
    if (!article) return;
    const categorySlug = article.categorySlug ?? '';
    const articleUrl = `https://www.dailyinsight.co.uk/${categorySlug}/${article.slug}`;
    await Share.share(
      Platform.OS === 'ios'
        ? { url: articleUrl, title: article.title }
        : { title: article.title, message: `${article.title} ${articleUrl}` }
    );
  }, [article]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchArticleBySlug(slug);
      setArticle(data);
      if (data) {
        isSaved(data.id).then(setSaved);
        if (data.categorySlug) {
          fetchRelatedArticles(data.categorySlug, data.slug).then(setRelated).catch(() => {});
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load article');
    } finally {
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    fetchArticleBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setArticle(data);
          if (data) {
            isSaved(data.id).then(setSaved);
            if (data.categorySlug) {
              fetchRelatedArticles(data.categorySlug, data.slug).then((rel) => {
                if (!cancelled) setRelated(rel);
              }).catch(() => {});
            }
          }
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Failed to load article');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Derived display values: prefer real article data, fall back to preview params
  const displayTitle = article?.title ?? previewTitle ?? '';
  const displayImage = article?.featuredImageUrl ?? previewImage;
  const displayCategory = article?.categoryName ?? previewCategory;
  const displayDate = article?.publishedAt ?? previewDate;
  const displayAuthor = article?.author ?? previewAuthor;
  const displayExcerpt = article?.excerpt;

  const authorLabel = displayAuthor ? (AUTHOR_LABELS[displayAuthor] ?? displayAuthor) : null;

  // Only show full-page loading spinner if no preview data available (e.g. deep links)
  if (loading && !hasPreview) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#C8102E' }]} edges={['top']}>
        <View style={styles.customHeader}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerButton}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </Pressable>
          <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center', pointerEvents: 'none' }}>
            <Text style={{ fontFamily: Fonts.playfair, fontSize: 20, fontWeight: '700' }}>
              <Text style={{ color: '#fff' }}>Daily</Text><Text style={{ color: '#D4AF37' }}>Insight</Text>
            </Text>
          </View>
          <View style={styles.headerActions} />
        </View>
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state — only show if we also have no article and no preview to show
  if ((error || (!loading && !article)) && !hasPreview) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#C8102E' }]} edges={['top']}>
        <View style={styles.customHeader}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerButton}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </Pressable>
          <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center', pointerEvents: 'none' }}>
            <Text style={{ fontFamily: Fonts.playfair, fontSize: 20, fontWeight: '700' }}>
              <Text style={{ color: '#fff' }}>Daily</Text><Text style={{ color: '#D4AF37' }}>Insight</Text>
            </Text>
          </View>
          <View style={styles.headerActions} />
        </View>
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {error ?? 'Article not found.'}
          </Text>
          <Pressable
            style={[styles.backButton, { backgroundColor: colors.accent }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#C8102E' }]} edges={['top']}>
      {/* Custom header — renders immediately, no article dependency for back button */}
      <View style={styles.customHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
        <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center', pointerEvents: 'none' }}>
          <Text style={{ fontFamily: Fonts.playfair, fontSize: 20, fontWeight: '700' }}>
            <Text style={{ color: '#fff' }}>Daily</Text><Text style={{ color: '#D4AF37' }}>Insight</Text>
          </Text>
        </View>
        <View style={styles.headerActions}>
          {article && (
            <Pressable
              onPress={handleShare}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.headerButton}
            >
              <Ionicons name="share-outline" size={22} color="#fff" />
            </Pressable>
          )}
          {article && (
            <Pressable
              onPress={handleSave}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.headerButton, { marginLeft: 8 }]}
            >
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Featured image — shown immediately from preview params */}
        {displayImage ? (
          <ExpoImage
            source={{ uri: displayImage }}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: colors.accent }]} />
        )}

        <View style={styles.header}>
          {/* Eyebrow: category */}
          {displayCategory ? (
            <Text style={[styles.eyebrow, { color: colors.eyebrow, fontFamily: Fonts.barlowSemiBold }]}>
              {displayCategory.toUpperCase()}
            </Text>
          ) : null}

          {/* H1: headline */}
          <Text style={[styles.headline, { color: colors.text, fontFamily: Fonts.playfair, fontSize: 30 * fontScale, lineHeight: 38 * fontScale }]}>
            {displayTitle}
          </Text>

          {/* Dek: excerpt — only available once real article loads */}
          {displayExcerpt ? (
            <Text style={[styles.dek, { color: colors.textSecondary, fontFamily: Fonts.sourceSerif, fontSize: 16 * fontScale, lineHeight: 24 * fontScale }]}>
              {displayExcerpt}
            </Text>
          ) : null}

          {/* Byline + date row */}
          {displayDate ? (
            <Text style={[styles.byline, { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold }]}>
              {authorLabel
                ? `${authorLabel} · ${formatDate(displayDate)}`
                : formatDate(displayDate)}
            </Text>
          ) : null}

          {/* Horizontal divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* Body content — show skeleton placeholder while loading, real content when ready */}
        {loading && hasPreview ? (
          <View style={styles.bodyPlaceholder}>
            <View style={[styles.bodyPlaceholderLine, styles.bodyPlaceholderFull, { backgroundColor: colors.border }]} />
            <View style={[styles.bodyPlaceholderLine, styles.bodyPlaceholderFull, { backgroundColor: colors.border }]} />
            <View style={[styles.bodyPlaceholderLine, styles.bodyPlaceholderMedium, { backgroundColor: colors.border }]} />
          </View>
        ) : article ? (
          <RichTextRenderer body={article.body} embeds={article.embeds} />
        ) : null}

        {/* You may also like */}
        {related.length > 0 && (
          <View style={[styles.relatedSection, { borderTopColor: colors.border }]}>
            <View style={[styles.relatedHeaderRow, { borderBottomColor: colors.accent }]}>
              <Text style={[styles.relatedHeader, { color: colors.text, fontFamily: Fonts.playfair }]}>
                You may also like
              </Text>
            </View>
            <View style={styles.relatedGrid}>
              {related.map((rel) => (
                <Pressable
                  key={rel.id}
                  style={styles.relatedCard}
                  onPress={() => navigation.push('ArticleDetail', {
                    slug: rel.slug,
                    title: rel.title,
                    featuredImageUrl: rel.featuredImageUrl,
                    categoryName: rel.categoryName,
                    publishedAt: rel.publishedAt,
                  })}
                >
                  {rel.featuredImageUrl ? (
                    <ExpoImage
                      source={{ uri: rel.featuredImageUrl }}
                      style={styles.relatedCardImage}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View style={[styles.relatedCardImage, { backgroundColor: colors.accent }]} />
                  )}
                  {rel.categoryName ? (
                    <Text style={[styles.relatedCardEyebrow, { color: colors.accent, fontFamily: Fonts.barlowSemiBold }]}>
                      {rel.categoryName.toUpperCase()}
                    </Text>
                  ) : null}
                  <Text style={[styles.relatedCardHeadline, { color: colors.text, fontFamily: Fonts.sourceSerif, fontSize: 14 * fontScale, lineHeight: 19 * fontScale }]} numberOfLines={3}>
                    {rel.title}
                  </Text>
                  <Text style={[styles.relatedCardTimestamp, { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold }]}>
                    {timeAgo(rel.publishedAt)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  customHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: '#C8102E',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  headline: {
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 10,
  },
  dek: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  byline: {
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 4,
  },
  bodyPlaceholder: {
    padding: 16,
    gap: 12,
  },
  bodyPlaceholderLine: {
    height: 16,
    borderRadius: 4,
  },
  bodyPlaceholderFull: {
    width: '100%',
  },
  bodyPlaceholderMedium: {
    width: '65%',
  },
  relatedSection: {
    borderTopWidth: 1,
    marginTop: 24,
    paddingTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  relatedHeaderRow: {
    borderBottomWidth: 2,
    paddingBottom: 8,
    marginBottom: 16,
  },
  relatedHeader: {
    fontSize: 21,
    lineHeight: 26,
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  relatedCard: {
    width: '47.5%',
  },
  relatedCardImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 2,
    marginBottom: 6,
  },
  relatedCardEyebrow: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  relatedCardHeadline: {
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 5,
  },
  relatedCardTimestamp: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
