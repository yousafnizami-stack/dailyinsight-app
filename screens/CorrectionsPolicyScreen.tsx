import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
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

function SectionHeading({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionHeading, { color: colors.text, borderBottomColor: colors.border }]}>
      {title}
    </Text>
  );
}

export default function CorrectionsPolicyScreen({ navigation }: Props) {
  const { colors } = useTheme();

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
        <Text style={styles.headerTitle}>Corrections Policy</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.titleRow}>
          <View style={styles.titleAccent} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Corrections Policy</Text>
        </View>
        <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>
          Last updated: 27 July 2026
        </Text>

        <Text style={[styles.body, { color: colors.text }]}>
          Daily Insight is committed to accuracy. If you believe an article contains a factual error,
          here's how we handle it:
        </Text>

        <SectionHeading title="1. Requesting a Correction" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          Use the "Correction Request" option on our Contact page, including the article URL and a clear
          description of the error.
        </Text>

        <SectionHeading title="2. Review Process" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          Every correction request is reviewed against the original sourcing before any change is made.
          We aim to respond within 2 working days.
        </Text>

        <SectionHeading title="3. How Corrections Are Made" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          Confirmed factual errors are corrected directly in the article as soon as possible. Significant
          corrections are noted at the bottom of the piece, stating what was changed and when.
        </Text>

        <SectionHeading title="4. What We Correct" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          Factual errors — incorrect names, dates, quotes, or figures. We do not remove accurate but
          unflattering coverage at a subject's request.
        </Text>
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
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleAccent: {
    width: 4,
    height: 30,
    backgroundColor: '#C8102E',
    marginRight: 12,
    borderRadius: 2,
  },
  pageTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
  },
  lastUpdated: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  sectionHeading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    marginTop: 24,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  body: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
});
