import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HorizontalCard from '../components/HorizontalCard';
import { Article, searchArticles } from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';

interface Props {
  navigation: any;
}

export default function SearchScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

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

  const handleCancel = useCallback(() => {
    Keyboard.dismiss();
    setQuery('');
    setArticles([]);
    setSearched(false);
  }, []);

  const handleArticlePress = useCallback(
    (item: Article) => {
      Keyboard.dismiss();
      navigation.navigate('ArticleDetail', { slug: item.slug });
    },
    [navigation],
  );

  const showCancel = query.length > 0 || searched;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background : '#C8102E' }} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* DI Masthead */}
        <View style={[styles.masthead, { backgroundColor: isDark ? colors.background : '#C8102E' }]}>
          <Text style={styles.mastheadText}>
            <Text style={styles.mastheadDaily}>Daily</Text>
            <Text style={styles.mastheadInsight}>Insight</Text>
          </Text>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBarWrapper, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TextInput
            ref={inputRef}
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
            onSubmitEditing={Keyboard.dismiss}
          />
          {showCancel && (
            <Pressable onPress={handleCancel} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: colors.accent }]}>Cancel</Text>
            </Pressable>
          )}
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
                onPress={() => handleArticlePress(item)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  masthead: {
    paddingBottom: 12,
    alignItems: 'center',
  },
  mastheadText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
  },
  mastheadDaily: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  mastheadInsight: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#D4AF37',
  },
  searchBarWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'BarlowCondensed_600SemiBold',
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
