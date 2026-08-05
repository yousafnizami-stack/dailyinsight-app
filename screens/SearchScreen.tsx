import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import HorizontalCard from '../components/HorizontalCard';
import { Article, searchArticles } from '../lib/api';
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

export default function SearchScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setArticles([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { docs } = await searchArticles(q.trim(), 1);
      setArticles(docs);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const renderEmpty = () => {
    if (loading) return null;
    if (!searched) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: Fonts.sourceSerif }]}>
            Search for articles
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: Fonts.sourceSerif }]}>
          No articles found for "{query}"
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBarWrapper, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              fontFamily: Fonts.sourceSerif,
            },
          ]}
          placeholder="Search articles..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HorizontalCard
              article={item}
              onPress={() => navigation.navigate('ArticleDetail', { slug: item.slug })}
              showSaveButton
              saved={savedIds.has(item.id)}
              onSave={() => handleSave(item)}
            />
          )}
          contentContainerStyle={
            articles.length === 0 ? styles.listEmpty : styles.listContent
          }
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  listEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
