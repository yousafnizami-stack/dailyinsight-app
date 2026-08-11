import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
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
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../lib/fonts';
import { DEFAULT_TAB_KEYS, loadTabOrder, saveTabOrder } from '../lib/tabOrder';
import { useTheme } from '../lib/ThemeContext';

const LABEL_MAP: Record<string, string> = {
  latest: 'Latest',
  royals: 'Royals',
  celebrity: 'Celebrity',
  entertainment: 'Entertainment',
  music: 'Music',
  film: 'Film',
  tv: 'TV',
  fashion: 'Fashion',
  horoscopes: 'Horoscopes',
};

const ROW_HEIGHT = 54; // paddingVertical 16*2 + fontSize 16 + border 1 + ~5 line height

interface Props {
  navigation: any;
}

// ---------------------------------------------------------------------------
// DraggableRow
// ---------------------------------------------------------------------------
interface DraggableRowProps {
  item: string;
  index: number;
  count: number;
  draggedIndex: Animated.SharedValue<number>;
  dragOffsetY: Animated.SharedValue<number>;
  colors: ReturnType<typeof useTheme>['colors'];
  onDragStart: (index: number) => void;
  onDragEnd: (from: number, to: number) => void;
}

function DraggableRow({
  item,
  index,
  count,
  draggedIndex,
  dragOffsetY,
  colors,
  onDragStart,
  onDragEnd,
}: DraggableRowProps) {
  const longPressActivated = useSharedValue(false);

  const gesture = Gesture.Pan()
    .activateAfterLongPress(350)
    .onStart(() => {
      'worklet';
      longPressActivated.value = true;
      draggedIndex.value = index;
      dragOffsetY.value = 0;
      runOnJS(onDragStart)(index);
    })
    .onUpdate((e) => {
      'worklet';
      if (!longPressActivated.value) return;
      dragOffsetY.value = e.translationY;
    })
    .onEnd(() => {
      'worklet';
      if (!longPressActivated.value) return;
      const to = Math.min(
        count - 1,
        Math.max(0, Math.round((index * ROW_HEIGHT + dragOffsetY.value) / ROW_HEIGHT)),
      );
      runOnJS(onDragEnd)(index, to);
      draggedIndex.value = -1;
      dragOffsetY.value = 0;
      longPressActivated.value = false;
    })
    .onFinalize(() => {
      'worklet';
      longPressActivated.value = false;
    });

  const animStyle = useAnimatedStyle(() => {
    const isDragged = draggedIndex.value === index;
    if (isDragged) {
      return {
        transform: [{ translateY: dragOffsetY.value }],
        zIndex: 999,
        elevation: 8,
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      };
    }

    // Shift other rows to make room for the dragged item
    if (draggedIndex.value < 0) {
      return { transform: [{ translateY: withSpring(0, SPRING) }] };
    }

    const currentY = index * ROW_HEIGHT;
    const draggedOriginalY = draggedIndex.value * ROW_HEIGHT;
    const draggedCurrentY = draggedOriginalY + dragOffsetY.value;

    // Where the dragged item "would" land
    const targetIndex = Math.min(
      count - 1,
      Math.max(0, Math.round(draggedCurrentY / ROW_HEIGHT)),
    );

    let shift = 0;
    if (draggedIndex.value < index && index <= targetIndex) {
      // Dragged item moved past this row from above → shift this row up
      shift = -ROW_HEIGHT;
    } else if (draggedIndex.value > index && index >= targetIndex) {
      // Dragged item moved past this row from below → shift this row down
      shift = ROW_HEIGHT;
    }

    return { transform: [{ translateY: withSpring(shift, SPRING) }] };
  });

  const bgStyle = useAnimatedStyle(() => {
    const isDragged = draggedIndex.value === index;
    return {
      backgroundColor: isDragged ? colors.surface : colors.card,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.row, { borderBottomColor: colors.border }, animStyle, bgStyle]}>
        <Text style={[styles.rowLabel, { color: colors.text, fontFamily: Fonts.sourceSerif }]}>
          {LABEL_MAP[item] ?? item}
        </Text>
        <Ionicons name="menu" size={22} color={colors.textMuted} />
      </Animated.View>
    </GestureDetector>
  );
}

const SPRING = { damping: 20, stiffness: 200, mass: 0.5 };

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function EditTimelinesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [data, setData] = useState<string[]>([...DEFAULT_TAB_KEYS]);

  // Shared values for gesture coordination — one pair for the whole list
  const draggedIndex = useSharedValue(-1);
  const dragOffsetY = useSharedValue(0);

  useEffect(() => {
    loadTabOrder().then(setData);
  }, []);

  const handleDragStart = useCallback((_index: number) => {
    // Could add haptic here
  }, []);

  const handleDragEnd = useCallback((from: number, to: number) => {
    if (from === to) return;
    setData((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      saveTabOrder(next);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    const defaults = [...DEFAULT_TAB_KEYS];
    setData(defaults);
    saveTabOrder(defaults);
  }, []);

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
        <Text style={styles.headerTitle}>Edit timelines</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerButton}
        >
          <Text style={styles.doneButton}>Done</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={[styles.instruction, { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold }]}>
          Hold and drag to reorder how tabs appear across the app.
        </Text>
        <Pressable
          onPress={handleReset}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.resetButton}
        >
          <Text style={[styles.resetButtonText, { color: colors.accent }]}>Reset to default order</Text>
        </Pressable>

        {/* Plain View — only 8 items, no FlatList needed */}
        <View>
          {data.map((item, index) => (
            <DraggableRow
              key={item}
              item={item}
              index={index}
              count={data.length}
              draggedIndex={draggedIndex}
              dragOffsetY={dragOffsetY}
              colors={colors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
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
  instruction: {
    fontSize: 13,
    letterSpacing: 0.3,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  resetButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resetButtonText: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  rowLabel: {
    fontSize: 16,
  },
});
