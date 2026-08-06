import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../lib/ThemeContext';

function SkeletonBlock() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Hero image placeholder */}
      <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]} />
      {/* Text lines */}
      <View style={styles.textBlock}>
        <View style={[styles.textLine, styles.textLineShort, { backgroundColor: colors.border }]} />
        <View style={[styles.textLine, styles.textLineFull, { backgroundColor: colors.border }]} />
        <View style={[styles.textLine, styles.textLineMedium, { backgroundColor: colors.border }]} />
      </View>
    </View>
  );
}

export default function SkeletonLoader() {
  return (
    <View style={styles.container}>
      <SkeletonBlock />
      <SkeletonBlock />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  textBlock: {
    padding: 12,
    paddingTop: 10,
    gap: 8,
  },
  textLine: {
    height: 14,
    borderRadius: 4,
  },
  textLineShort: {
    width: '30%',
  },
  textLineFull: {
    width: '100%',
    height: 22,
  },
  textLineMedium: {
    width: '70%',
    height: 22,
  },
});
