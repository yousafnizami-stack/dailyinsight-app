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
import ArticleCard from '../components/ArticleCard';
import { Article, Category, fetchArticles, fetchCategories } from '../lib/api';
import {
  getSavedArticles,
  removeArticle,
  saveArticle,
  SavedArticle,
} from '../lib/savedArticles';

interface Props {
  navigation: any;
}

function FooterLoader({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color="#C8102E" />
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Optimistic UI update
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

  // Load categories once on mount
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {}); // silently ignore category errors
  }, []);

  // Load articles when selectedSlug changes
  useEffect(() => {
    setLoading(true);
    load(1, true, selectedSlug).finally(() => setLoading(false));
  }, [load, selectedSlug]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(1, true, selectedSlug);
    setRefreshing(false);
  }, [load, selectedSlug]);

  const handleEndReached = useCallback(async () => {
    if (onEndReachedCalledDuringMomentum.current) return;
    if (loadingMore || page >= totalPages) return;
    onEndReachedCalledDuringMomentum.current = true;
    setLoadingMore(true);
    await load(page + 1, false, selectedSlug);
    setLoadingMore(false);
  }, [load, loadingMore, page, totalPages, selectedSlug]);

  const handleChipPress = useCallback((slug: string | undefined) => {
    setSelectedSlug(slug);
    // The useEffect on selectedSlug will trigger a fresh load
  }, []);

  const CategoryChips = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsScroll}
      contentContainerStyle={styles.chipsContent}
    >
      {/* "All" chip */}
      <Pressable
        style={[
          styles.chip,
          selectedSlug === undefined ? styles.chipSelected : styles.chipUnselected,
        ]}
        onPress={() => handleChipPress(undefined)}
      >
        <Text
          style={[
            styles.chipText,
            selectedSlug === undefined ? styles.chipTextSelected : styles.chipTextUnselected,
          ]}
        >
          All
        </Text>
      </Pressable>

      {categories.map((cat) => {
        const isSelected = selectedSlug === cat.slug;
        return (
          <Pressable
            key={cat.id}
            style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
            onPress={() => handleChipPress(cat.slug)}
          >
            <Text
              style={[
                styles.chipText,
                isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
              ]}
            >
              {cat.name.trim()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.flex}>
        {CategoryChips}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#C8102E" />
        </View>
      </View>
    );
  }

  if (error && articles.length === 0) {
    return (
      <View style={styles.flex}>
        {CategoryChips}
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
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
    <View style={styles.flex}>
      {CategoryChips}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => navigation.navigate('ArticleDetail', { slug: item.slug })}
            showSaveButton
            saved={savedIds.has(item.id)}
            onSave={() => handleSave(item)}
          />
        )}
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
            tintColor="#C8102E"
            colors={['#C8102E']}
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
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#C8102E',
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
  // Category chips
  chipsScroll: {
    flexGrow: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chipsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#C8102E',
  },
  chipUnselected: {
    backgroundColor: '#ebebeb',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  chipTextUnselected: {
    color: '#444',
  },
});
