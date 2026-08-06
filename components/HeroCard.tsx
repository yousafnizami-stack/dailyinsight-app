import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

export default function HeroCard({
  article,
  onPress,
}: Props) {
  const { colors } = useTheme();

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
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.accent }]} />
        )}
      </View>

      <View style={[styles.body, { borderTopWidth: 2, borderTopColor: colors.accent, marginTop: 16 }]}>
        {article.category?.name ? (
          <Text style={[styles.eyebrow, { color: colors.eyebrow, fontFamily: Fonts.barlowSemiBold }]}>
            {article.category.name.toUpperCase()}
          </Text>
        ) : null}
        <Text
          style={[styles.headline, { color: colors.text, fontFamily: Fonts.playfair }]}
          numberOfLines={3}
        >
          {article.title}
        </Text>
        <Text style={[styles.timestamp, { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold }]}>
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
    borderRadius: 4,
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
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  body: {
    padding: 12,
    paddingTop: 10,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 5,
  },
  headline: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 7,
  },
  timestamp: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
