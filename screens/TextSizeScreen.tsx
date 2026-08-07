import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
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

  const toPercent = (scale: number) =>
    (scale - TEXT_SIZE_MIN) / (TEXT_SIZE_MAX - TEXT_SIZE_MIN);

  // Track width as a shared value so it's readable in worklets
  const trackWidthSV = useSharedValue(1);

  // Normalized position (0..1) on the UI thread — drives all visual updates
  // Initialized from the persisted fontScale so the thumb starts at the right place
  const normalizedPos = useSharedValue(toPercent(fontScale));

  // Called once on gesture end to commit to React state + AsyncStorage
  const commitScale = (pos: number) => {
    const raw = TEXT_SIZE_MIN + pos * (TEXT_SIZE_MAX - TEXT_SIZE_MIN);
    setFontScale(parseFloat(raw.toFixed(2)));
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      const w = trackWidthSV.value;
      if (w <= 0) return;
      normalizedPos.value = Math.max(0, Math.min(1, e.x / w));
    })
    .onUpdate((e) => {
      'worklet';
      const w = trackWidthSV.value;
      if (w <= 0) return;
      normalizedPos.value = Math.max(0, Math.min(1, e.x / w));
    })
    .onEnd(() => {
      'worklet';
      runOnJS(commitScale)(normalizedPos.value);
    });

  // Thumb position — runs on UI thread, zero JS re-renders during drag
  const thumbStyle = useAnimatedStyle(() => ({
    left: normalizedPos.value * trackWidthSV.value - THUMB_SIZE / 2,
  }));

  // Track fill width — also UI thread
  const trackFillStyle = useAnimatedStyle(() => ({
    width: normalizedPos.value * trackWidthSV.value,
  }));

  // Preview text scales — UI thread, live during drag
  const previewHeadlineStyle = useAnimatedStyle(() => {
    const scale = TEXT_SIZE_MIN + normalizedPos.value * (TEXT_SIZE_MAX - TEXT_SIZE_MIN);
    return {
      fontSize: 22 * scale,
      lineHeight: 28 * scale,
    };
  });

  const previewBodyStyle = useAnimatedStyle(() => {
    const scale = TEXT_SIZE_MIN + normalizedPos.value * (TEXT_SIZE_MAX - TEXT_SIZE_MIN);
    return {
      fontSize: 17 * scale,
      lineHeight: 26 * scale,
    };
  });

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

          <GestureDetector gesture={gesture}>
            <View
              style={styles.trackContainer}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                trackWidthSV.value = w;
                // Recompute thumb position now that we know real track width
                normalizedPos.value = toPercent(fontScale);
              }}
            >
              {/* Track background */}
              <View style={[styles.trackBg, { backgroundColor: colors.border }]} />
              {/* Filled portion — Animated.View, updated on UI thread */}
              <Animated.View
                style={[
                  styles.trackFill,
                  { backgroundColor: colors.accent },
                  trackFillStyle,
                ]}
              />
              {/* Thumb — Animated.View, updated on UI thread */}
              <Animated.View
                style={[
                  styles.thumb,
                  {
                    backgroundColor: colors.accent,
                    borderColor: colors.background,
                  },
                  thumbStyle,
                ]}
              />
            </View>
          </GestureDetector>

          <Text style={[styles.aLarge, { color: colors.textSecondary }]}>A</Text>
        </View>

        {/* Live preview — Animated.Text so fontSize updates on UI thread during drag */}
        <View style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.previewLabel,
              { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold },
            ]}
          >
            PREVIEW
          </Text>
          <Animated.Text
            style={[
              styles.previewHeadline,
              { color: colors.text, fontFamily: Fonts.playfair },
              previewHeadlineStyle,
            ]}
          >
            Royal family attends ceremony
          </Animated.Text>
          <Animated.Text
            style={[
              styles.previewBody,
              { color: colors.textSecondary, fontFamily: Fonts.sourceSerif },
              previewBodyStyle,
            ]}
          >
            Article body text will appear at this size. The quick brown fox jumps over the lazy dog.
          </Animated.Text>
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
