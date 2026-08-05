import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Article } from '../lib/api';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  article: Article;
  onPress: () => void;
}

function CategoryBadge({ name }: { name: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{name.toUpperCase()}</Text>
    </View>
  );
}

export default function ArticleCard({ article, onPress }: Props) {
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

const styles = StyleSheet.create({
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
});
