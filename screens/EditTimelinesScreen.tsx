import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
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
};

interface Props {
  navigation: any;
}

export default function EditTimelinesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [data, setData] = useState<string[]>([...DEFAULT_TAB_KEYS]);

  useEffect(() => {
    loadTabOrder().then(setData);
  }, []);

  const handleDragEnd = useCallback(({ data: newData }: { data: string[] }) => {
    setData(newData);
    saveTabOrder(newData);
  }, []);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<string>) => (
    <ScaleDecorator>
      <Pressable
        onLongPress={drag}
        style={[
          styles.row,
          {
            backgroundColor: isActive ? colors.surface : colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.rowLabel, { color: colors.text, fontFamily: Fonts.sourceSerif }]}>
          {LABEL_MAP[item] ?? item}
        </Text>
        <Ionicons name="menu" size={22} color={colors.textMuted} />
      </Pressable>
    </ScaleDecorator>
  ), [colors]);

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
          Drag to reorder how tabs appear across the app.
        </Text>

        <DraggableFlatList
          data={data}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item}
          renderItem={renderItem}
        />
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
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: 16,
  },
});
