import { Image } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Article, fetchArticles } from '../lib/api';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  navigation: any;
}

function CategoryBadge({ name }: { name: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{name.toUpperCase()}</Text>
    </View>
  );
}

function ArticleCard({
  article,
  onPress,
}: {
  article: Article;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#f0f0f0' }}>
      {article.featuredImageUrl ? (
        <Image
          source={{ uri: article.featuredImageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
      )}
      <View style={styles.cardBody}>
        {article.category?.name ? (
          <CategoryBadge name={article.category.name} />
        ) : null}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.cardTime}>{timeAgo(article.publishedAt)}</Text>
      </View>
    </Pressable>
  );
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
  const onEndReachedCalledDuringMomentum = useRef(false);

  const load = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const { docs, totalPages: tp } = await fetchArticles(pageNum);
      setArticles((prev) => (replace ? docs : [...prev, ...docs]));
      setTotalPages(tp);
      setPage(pageNum);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load articles');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load(1, true).finally(() => setLoading(false));
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(1, true);
    setRefreshing(false);
  }, [load]);

  const handleEndReached = useCallback(async () => {
    if (onEndReachedCalledDuringMomentum.current) return;
    if (loadingMore || page >= totalPages) return;
    onEndReachedCalledDuringMomentum.current = true;
    setLoadingMore(true);
    await load(page + 1, false);
    setLoadingMore(false);
  }, [load, loadingMore, page, totalPages]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C8102E" />
      </View>
    );
  }

  if (error && articles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            load(1, true).finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={articles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ArticleCard
          article={item}
          onPress={() =>
            navigation.navigate('ArticleDetail', { slug: item.slug })
          }
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
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  cardImagePlaceholder: {
    backgroundColor: '#C8102E',
  },
  cardBody: {
    padding: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C8102E',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 7,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C8102E',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 12,
    color: '#888',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
