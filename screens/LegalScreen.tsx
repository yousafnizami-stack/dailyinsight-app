import { Ionicons } from '@expo/vector-icons';
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

interface Props {
  navigation: any;
}

const INFO_ROWS = [
  { label: 'About', url: 'https://www.dailyinsight.co.uk/about' },
  { label: 'Contact', url: 'https://www.dailyinsight.co.uk/contact' },
  { label: 'Privacy policy', url: 'https://www.dailyinsight.co.uk/privacy-policy' },
  { label: 'Corrections policy', url: 'https://www.dailyinsight.co.uk/corrections-policy' },
];

export default function LegalScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#C8102E' }} edges={['top']}>
      {/* Custom header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]}>
        {/* Info rows */}
        {INFO_ROWS.map((row, index) => (
          <Pressable
            key={row.label}
            onPress={() => Linking.openURL(row.url)}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 44,
    backgroundColor: '#C8102E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 4,
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
  },
});
