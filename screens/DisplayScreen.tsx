import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';

const OPTIONS = [
  { label: 'System', value: 'system' as const },
  { label: 'Light', value: 'light' as const },
  { label: 'Dark', value: 'dark' as const },
];

interface Props {
  navigation: any;
}

export default function DisplayScreen({ navigation }: Props) {
  const { colors, isDark, themeOverride, setThemeOverride } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background : '#C8102E' }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.background : '#C8102E' }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Display</Text>
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
          Choose how the app appearance is determined.
        </Text>

        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setThemeOverride(opt.value)}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text
              style={[
                styles.rowLabel,
                { color: colors.text, fontFamily: Fonts.sourceSerif },
              ]}
            >
              {opt.label}
            </Text>
            {themeOverride === opt.value && (
              <Ionicons name="checkmark" size={22} color={colors.accent} />
            )}
          </Pressable>
        ))}
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
