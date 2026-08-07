import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';
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
    categoryName: saved.categoryName,
    categorySlug: saved.categorySlug,
  };
}

export default function SavedScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSavedArticles().then(setSavedArticles);
    }, [])
  );

  const handleUnsave = useCallback(async (id: string) => {
    setSavedArticles((prev) => prev.filter((a) => a.id !== id));
    await removeArticle(id);
  }, []);

  const renderHeader = () => (
    <View style={styles.masthead}>
      <Text style={styles.mastheadText}>
        <Text style={styles.mastheadDaily}>Daily</Text>
        <Text style={styles.mastheadInsight}>Insight</Text>
      </Text>
      <Pressable
        onPress={() => navigation.navigate('Legal')}
        hitSlop={8}
        style={styles.infoButton}
      >
        <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  if (savedArticles.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#C8102E' }} edges={['top']}>
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          {renderHeader()}
          <View style={[styles.empty, { backgroundColor: colors.background }]}>
            <Ionicons name="bookmark-outline" size={56} color={colors.textMuted} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: Fonts.playfair }]}>
              No saved articles yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontFamily: Fonts.sourceSerif }]}>
              Tap the bookmark icon on any article to save it for later.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#C8102E' }} edges={['top']}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <FlatList
          style={[styles.list, { backgroundColor: colors.background }]}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  masthead: {
    backgroundColor: '#C8102E',
    paddingBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  infoButton: {
    position: 'absolute',
    right: 16,
    bottom: 14,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
