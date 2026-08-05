import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RichTextRenderer from '../components/RichTextRenderer';
import { Article, fetchArticleBySlug } from '../lib/api';

interface Props {
  route: { params: { slug: string } };
  navigation: any;
}

function CategoryBadge({ name }: { name: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{name.toUpperCase()}</Text>
    </View>
  );
}

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
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchArticleBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setArticle(data);
          if (data?.title) {
            navigation.setOptions({ title: data.title });
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C8102E" />
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Article not found.'}</Text>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      {article.featuredImageUrl ? (
        <Image
          source={{ uri: article.featuredImageUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]} />
      )}

      <View style={styles.header}>
        {article.category?.name ? (
          <CategoryBadge name={article.category.name} />
        ) : null}
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
      </View>

      <RichTextRenderer body={article.body} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#C8102E',
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
  heroPlaceholder: {
    backgroundColor: '#C8102E',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C8102E',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C8102E',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    lineHeight: 32,
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: '#888',
  },
});
