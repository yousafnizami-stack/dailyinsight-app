import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Article } from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';
import { timeAgo } from '../lib/timeAgo';

interface Props {
  article: Article;
  onPress: () => void;
  showSaveButton?: boolean;
  saved?: boolean;
  onSave?: () => void;
}

export default function HorizontalCard({
  article,
  onPress,
  showSaveButton = false,
  saved = false,
  onSave,
}: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      onPress={onPress}
      android_ripple={{ color: colors.border }}
    >
      {/* Image column */}
      <View style={styles.imageWrapper}>
        {article.featuredImageUrl ? (
          <Image
            source={{ uri: article.featuredImageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.accent }]} />
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
                size={14}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Text column */}
      <View style={styles.body}>
        {article.category?.name ? (
          <Text
            style={[styles.eyebrow, { color: colors.eyebrow, fontFamily: Fonts.barlow }]}
          >
            {article.category.name.toUpperCase()}
          </Text>
        ) : null}
        <Text
          style={[styles.headline, { color: colors.text, fontFamily: Fonts.sourceSerifSemiBold }]}
          numberOfLines={2}
        >
          {article.title}
        </Text>
        <Text
          style={[styles.timestamp, { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold }]}
        >
          {timeAgo(article.publishedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageWrapper: {
    position: 'relative',
    width: '40%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  bookmarkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  headline: {
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
