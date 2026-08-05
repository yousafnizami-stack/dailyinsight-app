import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RichTextRenderer from '../components/RichTextRenderer';
import { Article, fetchArticleBySlug } from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';
import {
  isSaved,
  removeArticle,
  saveArticle,
  SavedArticle,
} from '../lib/savedArticles';

interface Props {
  route: { params: { slug: string } };
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
  const { slug } = route.params;
  const { colors } = useTheme();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
        category: article.category,
      };
      await saveArticle(toSave);
    }
  }, [article, saved]);

  const handleShare = useCallback(async () => {
    if (!article) return;
    const categorySlug = article.category?.slug ?? '';
    const articleUrl = `https://www.dailyinsight.co.uk/${categorySlug}/${article.slug}`;
    await Share.share(
      Platform.OS === 'ios'
        ? { url: articleUrl, title: article.title }
        : { title: article.title, message: `${article.title} ${articleUrl}` }
    );
  }, [article]);

  useEffect(() => {
    if (!article) return;
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <Pressable
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ backgroundColor: 'transparent' }}
          >
            <Ionicons name="share-outline" size={22} color="#fff" />
          </Pressable>
          <Pressable
            onPress={handleSave}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ backgroundColor: 'transparent' }}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color="#fff"
            />
          </Pressable>
        </View>
      ),
    });
  }, [article, saved, handleSave, handleShare, navigation]);

  useEffect(() => {
    let cancelled = false;
    fetchArticleBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setArticle(data);
          if (data?.title) {
            navigation.setOptions({ title: data.title });
          }
          if (data) {
            isSaved(data.id).then(setSaved);
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
  }, [slug, navigation]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !article) {
    return (
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
    );
  }

  const authorLabel = article.author ? (AUTHOR_LABELS[article.author] ?? article.author) : null;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {article.featuredImageUrl ? (
        <Image
          source={{ uri: article.featuredImageUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.heroImage, { backgroundColor: colors.accent }]} />
      )}

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {/* Eyebrow: category */}
        {article.category?.name ? (
          <Text style={[styles.eyebrow, { color: colors.eyebrow, fontFamily: Fonts.barlowSemiBold }]}>
            {article.category.name.toUpperCase()}
          </Text>
        ) : null}

        {/* H1: headline */}
        <Text style={[styles.headline, { color: colors.text, fontFamily: Fonts.playfair }]}>
          {article.title}
        </Text>

        {/* Dek: excerpt */}
        {article.excerpt ? (
          <Text style={[styles.dek, { color: colors.textSecondary, fontFamily: Fonts.sourceSerif }]}>
            {article.excerpt}
          </Text>
        ) : null}

        {/* Byline + date row */}
        <Text style={[styles.byline, { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold }]}>
          {authorLabel
            ? `${authorLabel} · ${formatDate(article.publishedAt)}`
            : formatDate(article.publishedAt)}
        </Text>

        {/* Horizontal divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>

      <RichTextRenderer body={article.body} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    borderBottomWidth: 1,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginRight: 4,
  },
  headerBookmark: {
    // no additional style needed
  },
});
