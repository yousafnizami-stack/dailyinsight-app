import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

const CATEGORIES = [
  {
    name: 'Royals',
    icon: 'crown' as const,
    iconFamily: 'MaterialCommunityIcons' as const,
    description:
      'The definitive source for British Royal Family news. From official engagements and state occasions to the personal stories behind the Crown.',
  },
  {
    name: 'Celebrity',
    icon: 'star' as const,
    description:
      "Britain's biggest stars, their lives, their relationships, and the moments everyone is talking about.",
  },
  {
    name: 'TV & Streaming',
    icon: 'tv' as const,
    description:
      'Reviews, recaps, casting news, and everything you need to know about what to watch — from soap operas to prestige drama.',
  },
  {
    name: 'Music',
    icon: 'musical-notes' as const,
    description:
      'From Glastonbury to BRIT Awards, new releases to reunion tours — all the music news that matters to UK fans.',
  },
  {
    name: 'Film',
    icon: 'videocam' as const,
    description:
      'Box office news, trailers, BAFTA coverage, and honest takes on what is and is not worth your time at the cinema.',
  },
  {
    name: 'Entertainment',
    icon: 'film' as const,
    description:
      'The broader entertainment landscape — from award shows and red carpets to viral moments and cultural conversations.',
  },
  {
    name: 'Fashion',
    icon: 'shirt' as const,
    description:
      'Style, beauty, and trends — from catwalk to high street, covering the looks and brands that define British fashion culture.',
  },
];

const EDITORIAL_PILLARS = [
  {
    title: 'Accuracy First',
    body: 'Every story is grounded in verified facts from credible sources. We do not publish rumour as fact.',
  },
  {
    title: 'Warm, Not Cruel',
    body: 'We cover celebrities as human beings. Our tone is curious and warm — never nasty.',
  },
  {
    title: 'UK Perspective',
    body: 'Written by and for UK readers. We cover what matters here, in the way it matters here.',
  },
];

interface Props {
  navigation: any;
}

export default function AboutScreen({ navigation }: Props) {
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: '#111111' }]}>
          <Text style={[styles.heroEyebrow, { color: '#C8102E' }]}>About Us</Text>
          <Text style={styles.heroTitle}>
            Britain's Home for{'\n'}Royal and Entertainment News
          </Text>
          <Text style={styles.heroBody}>
            Daily Insight is the UK's dedicated destination for Royal Family coverage, celebrity news,
            and entertainment — written for people who want the story, not the filler.
          </Text>
        </View>

        <View style={styles.sections}>
          {/* What We Do */}
          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionHeadingAccent} />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>What We Do</Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              Daily Insight was built for UK readers who love keeping up with the Royal Family, celebrities,
              and the best in entertainment — but are tired of wading through click-bait headlines and
              padded-out articles to find the actual story.
            </Text>
            <Text style={[styles.bodyText, { color: colors.text, marginTop: 12 }]}>
              We cover the news that matters to a UK mobile audience: Royal engagements, celebrity
              relationships, must-watch TV, new music releases, and the films worth getting off the sofa
              for. Every story is written to be read on the bus, on a lunch break, or at the end of a long
              day — punchy, warm, and always worth your time.
            </Text>
            <Text style={[styles.bodyText, { color: colors.text, marginTop: 12 }]}>
              Our editorial approach is inspired by the best of British tabloid journalism: the warmth of
              Hello! Magazine, the directness of The Mirror, and the cultural savvy of Digital Spy —
              without the cruelty or the filler.
            </Text>
          </View>

          {/* Editorial Approach */}
          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionHeadingAccent} />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Our Editorial Approach</Text>
            </View>
            {EDITORIAL_PILLARS.map((pillar) => (
              <View
                key={pillar.title}
                style={[styles.pillarCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.pillarTitle, { color: '#C8102E' }]}>{pillar.title}</Text>
                <Text style={[styles.pillarBody, { color: colors.text }]}>{pillar.body}</Text>
              </View>
            ))}
          </View>

          {/* What We Cover */}
          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionHeadingAccent} />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>What We Cover</Text>
            </View>
            {CATEGORIES.map((cat) => (
              <View
                key={cat.name}
                style={[styles.categoryRow, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                {cat.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons name={cat.icon} size={24} color="#C8102E" style={styles.categoryIcon} />
                ) : (
                  <Ionicons name={cat.icon} size={24} color="#C8102E" style={styles.categoryIcon} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.textMuted }]}>
                    {cat.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: 'center',
  },
  heroEyebrow: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroBody: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 23,
  },
  sections: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 32,
  },
  section: {
    gap: 0,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeadingAccent: {
    width: 4,
    height: 22,
    backgroundColor: '#C8102E',
    marginRight: 12,
    borderRadius: 2,
  },
  sectionHeading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
  },
  bodyText: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  pillarCard: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },
  pillarTitle: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  pillarBody: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },
  categoryIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  categoryName: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  categoryDesc: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
});
