import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../lib/api';
import {
  getSavedArticles,
  removeArticle,
  SavedArticle,
} from '../lib/savedArticles';

interface Props {
  navigation: any;
}

/**
 * Convert a SavedArticle to the Article shape ArticleCard expects.
 * The two types are compatible — SavedArticle is a strict subset of Article.
 */
function savedToArticle(saved: SavedArticle): Article {
  return {
    id: saved.id,
    title: saved.title,
    slug: saved.slug,
    publishedAt: saved.publishedAt,
    featuredImageUrl: saved.featuredImageUrl,
    category: saved.category,
  };
}

export default function SavedScreen({ navigation }: Props) {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  // Reload every time the tab is focused so removals from other screens reflect immediately
  useFocusEffect(
    useCallback(() => {
      getSavedArticles().then(setSavedArticles);
    }, [])
  );

  const handleUnsave = useCallback(async (id: string) => {
    // Optimistic update
    setSavedArticles((prev) => prev.filter((a) => a.id !== id));
    await removeArticle(id);
  }, []);

  if (savedArticles.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bookmark-outline" size={56} color="#ccc" style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>No saved articles yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the bookmark icon on any article to save it for later.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={savedArticles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ArticleCard
          article={savedToArticle(item)}
          onPress={() => navigation.navigate('ArticleDetail', { slug: item.slug })}
          showSaveButton
          saved
          onSave={() => handleUnsave(item.id)}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
