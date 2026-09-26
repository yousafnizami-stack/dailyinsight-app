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

export default function HorizontalCard({
  article,
  onPress,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.cardWrapper, { backgroundColor: colors.card }]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        android_ripple={{ color: colors.border }}
      >
        {/* Image column */}
        <View style={styles.imageWrapper}>
          {article.featuredImageUrl ? (
            <Image
              source={{ uri: article.featuredImageUrl }}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <View style={[styles.image, { backgroundColor: colors.accent }]} />
          )}
        </View>

        {/* Text column */}
        <View style={styles.body}>
          {article.categoryName ? (
            <Text
              style={[styles.eyebrow, { color: colors.eyebrow, fontFamily: Fonts.barlow }]}
            >
              {article.categoryName.toUpperCase()}
            </Text>
          ) : null}
          <Text
            style={[styles.headline, { color: colors.text, fontFamily: Fonts.sourceSerifSemiBold }]}
            numberOfLines={5}
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
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    flexDirection: 'row',
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
