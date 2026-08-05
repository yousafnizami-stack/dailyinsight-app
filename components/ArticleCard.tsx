import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Article } from '../lib/api';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  article: Article;
  onPress: () => void;
  /** Show the bookmark toggle button over the image */
  showSaveButton?: boolean;
  /** Whether the article is currently saved */
  saved?: boolean;
  /** Called when the bookmark button is tapped */
  onSave?: () => void;
}

function CategoryBadge({ name }: { name: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{name.toUpperCase()}</Text>
    </View>
  );
}

export default function ArticleCard({
  article,
  onPress,
  showSaveButton = false,
  saved = false,
  onSave,
}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#f0f0f0' }}>
      {/* Image wrapper — needs position:relative so the bookmark button can be
          absolutely positioned inside it */}
      <View style={styles.imageWrapper}>
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

        {showSaveButton && (
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={(e) => {
              // Prevent the touch from propagating to the card's Pressable
              e.stopPropagation();
              onSave?.();
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.bookmarkCircle}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

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
  imageWrapper: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  cardImagePlaceholder: {
    backgroundColor: '#C8102E',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bookmarkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
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
