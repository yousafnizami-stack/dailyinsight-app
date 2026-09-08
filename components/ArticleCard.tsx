import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Article } from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';
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

export default function ArticleCard({
  article,
  onPress,
  showSaveButton = false,
  saved = false,
  onSave,
}: Props) {
  const { colors } = useTheme();
  const [contentFit, setContentFit] = useState<'cover' | 'contain'>('cover');

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      android_ripple={{ color: colors.border }}
    >
      <View style={styles.imageWrapper}>
        {article.featuredImageUrl ? (
          <Image
            source={{ uri: article.featuredImageUrl }}
            style={styles.cardImage}
            contentFit={contentFit}
            transition={200}
            onLoad={(e) => {
              const { width, height } = e.source;
              if (width / height > 1.9) setContentFit('contain');
            }}
          />
        ) : (
          <View style={[styles.cardImage, { backgroundColor: colors.accent }]} />
        )}

        {showSaveButton && (
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={(e) => {
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
        {article.categoryName ? (
          <Text style={[styles.badgeText, { color: colors.eyebrow, fontFamily: Fonts.barlow }]}>
            {article.categoryName.toUpperCase()}
          </Text>
        ) : null}
        <Text
          style={[styles.cardTitle, { color: colors.text, fontFamily: Fonts.sourceSerifSemiBold }]}
          numberOfLines={2}
        >
          {article.title}
        </Text>
        <Text style={[styles.cardTime, { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold }]}>
          {timeAgo(article.publishedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 6,
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
  badgeText: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
