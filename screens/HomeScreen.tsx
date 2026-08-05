import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import HeroCard from '../components/HeroCard';
import HorizontalCard from '../components/HorizontalCard';
import {
  Article,
  fetchLatestArticles,
  fetchArticlesByCategory,
} from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';
import {
  getSavedArticles,
  removeArticle,
  saveArticle,
  SavedArticle,
} from '../lib/savedArticles';

interface Props {
  navigation: any;
}

interface Section {
  key: string;
  title: string;
  articles: Article[];
}

const SECTION_DEFS: { key: string; title: string; fetch: () => Promise<Article[]> }[] = [
  { key: 'latest',        title: 'Latest',        fetch: () => fetchLatestArticles(6) },
  { key: 'royals',        title: 'Royals',        fetch: () => fetchArticlesByCategory('royals', 6) },
  { key: 'celebrity',     title: 'Celebrity',     fetch: () => fetchArticlesByCategory('celebrity', 6) },
  { key: 'entertainment', title: 'Entertainment', fetch: () => fetchArticlesByCategory('entertainment', 6) },
  { key: 'music',         title: 'Music',         fetch: () => fetchArticlesByCategory('music', 6) },
  { key: 'film',          title: 'Film',          fetch: () => fetchArticlesByCategory('film', 6) },
  { key: 'tv',            title: 'TV',            fetch: () => fetchArticlesByCategory('tv', 6) },
];

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.sectionHeaderWrapper, { borderBottomColor: colors.accent }]}>
      <Text style={[styles.sectionHeaderText, { color: colors.sectionHeader, fontFamily: Fonts.playfair }]}>
        {title}
      </Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Reload saved IDs whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getSavedArticles().then((saved) => {
        setSavedIds(new Set(saved.map((a) => a.id)));
      });
    }, [])
  );

  const handleSave = useCallback(
    async (article: Article) => {
      const id = article.id;
      if (savedIds.has(id)) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        await removeArticle(id);
      } else {
        setSavedIds((prev) => new Set(prev).add(id));
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
    },
    [savedIds]
  );

  const loadAllSections = useCallback(async () => {
    setError(null);
    try {
      const results = await Promise.all(
        SECTION_DEFS.map(async (def) => {
          const articles = await def.fetch();
          return { key: def.key, title: def.title, articles };
        })
      );
      // Skip sections with no articles
      setSections(results.filter((s) => s.articles.length > 0));
    } catch (e: any) {
      setError(e.message ?? 'Failed to load articles');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAllSections().finally(() => setLoading(false));
  }, [loadAllSections]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllSections();
    setRefreshing(false);
  }, [loadAllSections]);

  if (loading) {
    return (
      <View style={[styles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error && sections.length === 0) {
    return (
      <View style={[styles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={() => {
            setLoading(true);
            loadAllSections().finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      {sections.map((section) => (
        <View key={section.key}>
          <SectionHeader title={section.title} />
          {section.articles.map((article, idx) => {
            if (idx === 0) {
              return (
                <HeroCard
                  key={article.id}
                  article={article}
                  onPress={() => navigation.navigate('ArticleDetail', { slug: article.slug })}
                  showSaveButton
                  saved={savedIds.has(article.id)}
                  onSave={() => handleSave(article)}
                />
              );
            }
            return (
              <HorizontalCard
                key={article.id}
                article={article}
                onPress={() => navigation.navigate('ArticleDetail', { slug: article.slug })}
                showSaveButton
                saved={savedIds.has(article.id)}
                onSave={() => handleSave(article)}
              />
            );
          })}
          <View style={[styles.sectionDivider, { borderBottomColor: colors.border }]} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  sectionHeaderWrapper: {
    marginHorizontal: 12,
    marginTop: 18,
    marginBottom: 10,
    borderBottomWidth: 2,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 24,
    lineHeight: 30,
  },
  sectionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
  },
});
