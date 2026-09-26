import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import HeroCard from '../components/HeroCard';
import HorizontalCard from '../components/HorizontalCard';
import { Article, fetchArticlesByCategory } from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';

interface Props {
  route: { params: { slug: string; title: string } };
  navigation: any;
}

export default function CategoryScreen({ route, navigation }: Props) {
  const { slug, title } = route.params;
  const { colors } = useTheme();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchArticlesByCategory(slug, 40)
      .then((data) => {
        if (!cancelled) {
          // Floor to nearest multiple of 4
          const displayCount = Math.floor(data.length / 4) * 4;
          setArticles(data.slice(0, displayCount));
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Failed to load articles');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  if (articles.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Not enough stories yet</Text>
      </View>
    );
  }

  // Render repeating blocks of 4: HeroCard + 3 HorizontalCards
  const blocks: Article[][] = [];
  for (let i = 0; i < articles.length; i += 4) {
    blocks.push(articles.slice(i, i + 4));
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Category header */}
      <View style={[styles.categoryHeader, { borderBottomColor: colors.accent }]}>
        <Text style={[styles.categoryTitle, { color: colors.sectionHeader, fontFamily: Fonts.playfair }]}>
          {title}
        </Text>
      </View>

      {blocks.map((block, blockIdx) => (
        <View key={blockIdx}>
          {/* First article in block = HeroCard */}
          <HeroCard
            article={block[0]}
            onPress={() => navigation.push('ArticleDetail', { slug: block[0].slug })}
            showAccentBorder={false}
          />
          {/* Remaining 3 = HorizontalCards */}
          {block.slice(1).map((article) => (
            <HorizontalCard
              key={article.id}
              article={article}
              onPress={() => navigation.push('ArticleDetail', { slug: article.slug })}
            />
          ))}
        </View>
      ))}
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
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  categoryHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 28,
    lineHeight: 36,
  },
});
