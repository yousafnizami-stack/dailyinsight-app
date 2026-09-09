import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';

const SETTINGS_ROWS = [
  { label: 'Edit Timelines', action: 'EditTimelines' },
  { label: 'Text size', action: 'TextSize' },
  { label: 'Display', action: 'Display' },
];

const INFO_ROWS = [
  { label: 'About', action: 'About' },
  { label: 'Contact', action: 'Contact' },
  { label: 'Privacy policy', action: 'PrivacyPolicy' },
  { label: 'Corrections policy', action: 'CorrectionsPolicy' },
];

interface Props {
  navigation: any;
}


export default function SettingsScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background : '#C8102E' }} edges={['top']}>
      {/* DI wordmark masthead */}
      <View style={[styles.masthead, { backgroundColor: isDark ? colors.background : '#C8102E' }]}>
        <Text style={styles.mastheadText}>
          <Text style={styles.mastheadDaily}>Daily</Text>
          <Text style={styles.mastheadInsight}>Insight</Text>
        </Text>
      </View>

      <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]}>
        {/* Settings rows */}
        {SETTINGS_ROWS.map((row) => (
          <Pressable
            key={row.label}
            onPress={row.action ? () => navigation.navigate(row.action!) : undefined}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.rowLabel, { color: colors.text, fontFamily: Fonts.sourceSerif }]}>
              {row.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}

        {/* Policy/info rows */}
        {INFO_ROWS.map((row) => (
          <Pressable
            key={row.label}
            onPress={() => navigation.navigate(row.action)}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.rowLabel, { color: colors.text, fontFamily: Fonts.sourceSerif }]}>
              {row.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}

        {/* Follow us section */}
        <Text style={[styles.followLabel, { color: colors.textMuted, fontFamily: Fonts.barlowSemiBold }]}>
          Follow us
        </Text>
        <View style={styles.socialRow}>
          <Pressable
            onPress={() => Linking.openURL('https://www.facebook.com/DailyInsightUK')}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="logo-facebook" size={28} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('https://twitter.com/DailyInsightUK')}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="logo-twitter" size={28} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('https://www.instagram.com/dailyinsightuk/')}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="logo-instagram" size={28} color={colors.text} />
          </Pressable>
        </View>
        <Text style={{ textAlign: 'left', fontSize: 11, color: colors.textMuted, fontFamily: Fonts.barlow, letterSpacing: 0.3, marginTop: 12, paddingHorizontal: 20 }}>
          Daily Insight · Version {version}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  masthead: {
    paddingBottom: 12,
    alignItems: 'center',
  },
  mastheadText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
  },
  mastheadDaily: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#ffffff',
  },
  mastheadInsight: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#D4AF37',
  },
  scroll: {
    flex: 1,
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
  followLabel: {
    fontSize: 12,
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 12,
    textTransform: 'uppercase',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 24,
    paddingBottom: 32,
  },
});
