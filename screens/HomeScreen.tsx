import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import HeroCard from '../components/HeroCard';
import HorizontalCard from '../components/HorizontalCard';
import { Article, Category, fetchArticles, fetchArticlesByCategory, fetchCategories } from '../lib/api';
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

// Categories shown in the "All" mixed section feed, in order
const SECTION_CATEGORY_SLUGS = ['royals', 'celebrity', 'entertainment', 'music'];

interface Section {
  categorySlug: string;
  categoryName: string;
  articles: Article[];
}

function FooterLoader({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color="#C8102E" />
    </View>
  );
}

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

function SectionFeed({
  sections,
  savedIds,
  onArticlePress,
  onSave,
}: {
  sections: Section[];
  savedIds: Set<string>;
  onArticlePress: (slug: string) => void;
  onSave: (article: Article) => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {sections.map((section) => (
        <View key={section.categorySlug}>
          <SectionHeader title={section.categoryName} />
          {section.articles.map((article, idx) => {
            if (idx === 0) {
              return (
                <HeroCard
                  key={article.id}
                  article={article}
                  onPress={() => onArticlePress(article.slug)}
                  showSaveButton
                  saved={savedIds.has(article.id)}
                  onSave={() => onSave(article)}
                />
              );
            }
            return (
              <HorizontalCard
                key={article.id}
                article={article}
                onPress={() => onArticlePress(article.slug)}
                showSaveButton
                saved={savedIds.has(article.id)}
                onSave={() => onSave(article)}
              />
            );
          })}
          <View style={[styles.sectionDivider, { borderBottomColor: colors.border }]} />
        </View>
      ))}
    </ScrollView>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();

  // Flat list state for individual category tabs
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section feed state for "All" tab
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const onEndReachedCalledDuringMomentum = useRef(false);

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

  // Load flat article list (for individual category tabs)
  const load = useCallback(
    async (pageNum: number, replace: boolean, categorySlug?: string) => {
      try {
        const { docs, totalPages: tp } = await fetchArticles(pageNum, categorySlug);
        setArticles((prev) => (replace ? docs : [...prev, ...docs]));
        setTotalPages(tp);
        setPage(pageNum);
        setError(null);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load articles');
      }
    },
    []
  );

  // Load multi-category sections for "All" tab
  const loadSections = useCallback(async (cats: Category[]) => {
    setSectionsLoading(true);
    setSectionsError(null);
    try {
      // Fetch from the curated slugs, filtered to what's available in cats
      const available = SECTION_CATEGORY_SLUGS.filter(
        (slug) => cats.find((c) => c.slug === slug)
      );
      const results = await Promise.all(
        available.map(async (slug) => {
          const cat = cats.find((c) => c.slug === slug)!;
          const articles = await fetchArticlesByCategory(slug, 6);
          return { categorySlug: slug, categoryName: cat.name, articles };
        })
      );
      // Only keep sections that have at least one article
      setSections(results.filter((s) => s.articles.length > 0));
    } catch (e: any) {
      setSectionsError(e.message ?? 'Failed to load sections');
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  // Load categories once on mount
  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        setCategories(cats);
        // Trigger section load now that we have category names
        loadSections(cats);
      })
      .catch(() => {
        // If categories fail, try sections with display names from slug
        loadSections([]);
      });
  }, [loadSections]);

  // Load articles when selectedSlug changes (only for non-All tabs)
  useEffect(() => {
    if (selectedSlug === undefined) return; // "All" tab uses sections
    setLoading(true);
    load(1, true, selectedSlug).finally(() => setLoading(false));
  }, [load, selectedSlug]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedSlug === undefined) {
      // Refresh sections
      await loadSections(categories);
    } else {
      await load(1, true, selectedSlug);
    }
    setRefreshing(false);
  }, [load, loadSections, selectedSlug, categories]);

  const handleEndReached = useCallback(async () => {
    if (selectedSlug === undefined) return; // sections don't paginate
    if (onEndReachedCalledDuringMomentum.current) return;
    if (loadingMore || page >= totalPages) return;
    onEndReachedCalledDuringMomentum.current = true;
    setLoadingMore(true);
    await load(page + 1, false, selectedSlug);
    setLoadingMore(false);
  }, [load, loadingMore, page, totalPages, selectedSlug]);

  const handleChipPress = useCallback((slug: string | undefined) => {
    setSelectedSlug(slug);
  }, []);

  // Underline tab navigation (Part C)
  const CategoryTabs = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.tabsScroll, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
      contentContainerStyle={styles.tabsContent}
    >
      {/* "All" tab */}
      <Pressable
        style={styles.tab}
        onPress={() => handleChipPress(undefined)}
      >
        <Text
          style={[
            styles.tabText,
            { fontFamily: Fonts.barlow },
            selectedSlug === undefined
              ? { color: colors.accent }
              : { color: colors.textMuted },
          ]}
        >
          ALL
        </Text>
        {selectedSlug === undefined && (
          <View style={[styles.tabUnderline, { backgroundColor: colors.accent }]} />
        )}
      </Pressable>

      {categories.map((cat) => {
        const isSelected = selectedSlug === cat.slug;
        return (
          <Pressable
            key={cat.id}
            style={styles.tab}
            onPress={() => handleChipPress(cat.slug)}
          >
            <Text
              style={[
                styles.tabText,
                { fontFamily: Fonts.barlow },
                isSelected ? { color: colors.accent } : { color: colors.textMuted },
              ]}
            >
              {cat.name.trim().toUpperCase()}
            </Text>
            {isSelected && (
              <View style={[styles.tabUnderline, { backgroundColor: colors.accent }]} />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // --- "All" tab: sections view ---
  if (selectedSlug === undefined) {
    if (sectionsLoading) {
      return (
        <View style={[styles.flex, { backgroundColor: colors.background }]}>
          {CategoryTabs}
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        </View>
      );
    }
    if (sectionsError && sections.length === 0) {
      return (
        <View style={[styles.flex, { backgroundColor: colors.background }]}>
          {CategoryTabs}
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>{sectionsError}</Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.accent }]}
              onPress={() => loadSections(categories)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        {CategoryTabs}
        <SectionFeed
          sections={sections}
          savedIds={savedIds}
          onArticlePress={(slug) => navigation.navigate('ArticleDetail', { slug })}
          onSave={handleSave}
        />
      </View>
    );
  }

  // --- Individual category tab: flat FlatList ---
  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        {CategoryTabs}
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (error && articles.length === 0) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        {CategoryTabs}
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => {
              setLoading(true);
              load(1, true, selectedSlug).finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {CategoryTabs}
      <FlatList
        style={[styles.list, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.listContent}
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          if (index === 0) {
            return (
              <HeroCard
                article={item}
                onPress={() => navigation.navigate('ArticleDetail', { slug: item.slug })}
                showSaveButton
                saved={savedIds.has(item.id)}
                onSave={() => handleSave(item)}
              />
            );
          }
          return (
            <HorizontalCard
              article={item}
              onPress={() => navigation.navigate('ArticleDetail', { slug: item.slug })}
              showSaveButton
              saved={savedIds.has(item.id)}
              onSave={() => handleSave(item)}
            />
          );
        }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        ListFooterComponent={<FooterLoader loading={loadingMore} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
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
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  // Underline tabs
  tabsScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
  },
  tabsContent: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tab: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 0,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  // Section feed
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
