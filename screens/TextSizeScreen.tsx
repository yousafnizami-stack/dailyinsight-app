import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../lib/fonts';
import { TEXT_SIZE_MAX, TEXT_SIZE_MIN, useTextSize } from '../lib/TextSizeContext';
import { useTheme } from '../lib/ThemeContext';

const THUMB_SIZE = 24;

interface Props {
  navigation: any;
}

export default function TextSizeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { fontScale, setFontScale } = useTextSize();
  const [trackWidth, setTrackWidth] = useState(1);

  const trackWidthRef = useRef(1);

  const toPercent = (scale: number) =>
    (scale - TEXT_SIZE_MIN) / (TEXT_SIZE_MAX - TEXT_SIZE_MIN);

  // Keep this ref up-to-date so the stable panResponder can call the latest logic
  const updateRef = useRef<(x: number) => void>(() => {});
  updateRef.current = (locationX: number) => {
    const w = trackWidthRef.current;
    if (w <= 0) return;
    const clamped = Math.max(0, Math.min(1, locationX / w));
    const raw = TEXT_SIZE_MIN + clamped * (TEXT_SIZE_MAX - TEXT_SIZE_MIN);
    setFontScale(parseFloat(raw.toFixed(2)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => updateRef.current(e.nativeEvent.locationX),
      onPanResponderMove: (e) => updateRef.current(e.nativeEvent.locationX),
    }),
  ).current;

  const percent = toPercent(fontScale);
  const thumbLeft = percent * trackWidth - THUMB_SIZE / 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#C8102E' }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Text size</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerButton}
        >
          <Text style={styles.doneButton}>Done</Text>
        </Pressable>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text
          style={[
            styles.instruction,
            { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold },
          ]}
        >
          Adjust the text size for article content.
        </Text>

        {/* Slider */}
        <View style={styles.sliderRow}>
          <Text style={[styles.aSmall, { color: colors.textSecondary }]}>A</Text>

          <View
            style={styles.trackContainer}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              trackWidthRef.current = w;
              setTrackWidth(w);
            }}
            {...panResponder.panHandlers}
          >
            {/* Track background */}
            <View
              style={[styles.trackBg, { backgroundColor: colors.border }]}
            />
            {/* Filled portion */}
            <View
              style={[
                styles.trackFill,
                { width: percent * trackWidth, backgroundColor: colors.accent },
              ]}
            />
            {/* Thumb */}
            <View
              style={[
                styles.thumb,
                {
                  left: thumbLeft,
                  backgroundColor: colors.accent,
                  borderColor: colors.background,
                },
              ]}
            />
          </View>

          <Text style={[styles.aLarge, { color: colors.textSecondary }]}>A</Text>
        </View>

        {/* Live preview */}
        <View style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.previewLabel,
              { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold },
            ]}
          >
            PREVIEW
          </Text>
          <Text
            style={[
              styles.previewHeadline,
              {
                color: colors.text,
                fontFamily: Fonts.playfair,
                fontSize: 22 * fontScale,
                lineHeight: 28 * fontScale,
              },
            ]}
          >
            Royal family attends ceremony
          </Text>
          <Text
            style={[
              styles.previewBody,
              {
                color: colors.textSecondary,
                fontFamily: Fonts.sourceSerif,
                fontSize: 17 * fontScale,
                lineHeight: 26 * fontScale,
              },
            ]}
          >
            Article body text will appear at this size. The quick brown fox jumps over the lazy dog.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 44,
    backgroundColor: '#C8102E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerButton: {
    width: 72,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  doneButton: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 16,
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  instruction: {
    fontSize: 13,
    letterSpacing: 0.3,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  aSmall: {
    fontSize: 13,
    fontFamily: 'SourceSerif4_400Regular',
    width: 20,
    textAlign: 'center',
  },
  aLarge: {
    fontSize: 22,
    fontFamily: 'SourceSerif4_400Regular',
    width: 28,
    textAlign: 'center',
  },
  trackContainer: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    top: (40 - THUMB_SIZE) / 2,
  },
  preview: {
    marginHorizontal: 20,
    marginTop: 4,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  previewLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  previewHeadline: {
    marginBottom: 4,
  },
  previewBody: {
  },
});
