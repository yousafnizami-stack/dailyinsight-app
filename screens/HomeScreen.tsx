import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeroCard from '../components/HeroCard';
import HorizontalCard from '../components/HorizontalCard';
import {
  Article,
  fetchLatestArticles,
  fetchArticlesByCategory,
} from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';

interface Props {
  navigation: any;
}

interface Section {
  key: string;
  title: string;
  articles: Article[];
}

const SECTION_DEFS: { key: string; title: string; fetch: () => Promise<Article[]> }[] = [
  { key: 'latest',        title: 'Latest',        fetch: () => fetchLatestArticles(6) },
  { key: 'royals',        title: 'Royals',        fetch: () => fetchArticlesByCategory('royals', 6) },
  { key: 'celebrity',     title: 'Celebrity',     fetch: () => fetchArticlesByCategory('celebrity', 6) },
  { key: 'entertainment', title: 'Entertainment', fetch: () => fetchArticlesByCategory('entertainment', 6) },
  { key: 'music',         title: 'Music',         fetch: () => fetchArticlesByCategory('music', 6) },
  { key: 'film',          title: 'Film',          fetch: () => fetchArticlesByCategory('film', 6) },
  { key: 'tv',            title: 'TV',            fetch: () => fetchArticlesByCategory('tv', 6) },
];

const CHIPS = SECTION_DEFS.map((s) => ({ key: s.key, label: s.title }));

function SectionHeader({
  title,
  sectionKey,
  onLayout,
}: {
  title: string;
  sectionKey: string;
  onLayout: (key: string, y: number) => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.sectionHeaderWrapper, { borderBottomColor: colors.accent }]}
      onLayout={(e) => onLayout(sectionKey, e.nativeEvent.layout.y)}
    >
      <Text style={[styles.sectionHeaderText, { color: colors.sectionHeader, fontFamily: Fonts.playfair }]}>
        {title}
      </Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState<string>('latest');

  // Ref for the main vertical ScrollView
  const scrollViewRef = useRef<ScrollView>(null);
  // Map of sectionKey -> Y position within the ScrollView content
  const sectionYPositions = useRef<Record<string, number>>({});

  const handleSectionLayout = useCallback((key: string, y: number) => {
    sectionYPositions.current[key] = y;
  }, []);

  const loadAllSections = useCallback(async () => {
    setError(null);
    try {
      const results = await Promise.all(
        SECTION_DEFS.map(async (def) => {
          const articles = await def.fetch();
          return { key: def.key, title: def.title, articles };
        })
      );
      // Skip sections with no articles
      setSections(results.filter((s) => s.articles.length > 0));
    } catch (e: any) {
      setError(e.message ?? 'Failed to load articles');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAllSections().finally(() => setLoading(false));
  }, [loadAllSections]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllSections();
    setRefreshing(false);
  }, [loadAllSections]);

  const handleChipPress = useCallback((chipKey: string) => {
    setSelectedChip(chipKey);
    if (chipKey === 'latest') {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      const y = sectionYPositions.current[chipKey];
      if (y !== undefined) {
        scrollViewRef.current?.scrollTo({ y, animated: true });
      }
    }
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error && sections.length === 0) {
    return (
      <View style={[styles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={() => {
            setLoading(true);
            loadAllSections().finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#C8102E' }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Masthead — full-bleed crimson wordmark bar */}
      <View style={styles.masthead}>
        <Text style={styles.mastheadText}>
          <Text style={styles.mastheadDaily}>Daily</Text>
          <Text style={styles.mastheadInsight}>Insight</Text>
        </Text>
      </View>
      {/* Chip row — fixed above scroll content */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.chipRowContent}
      >
        {CHIPS.map((chip) => {
          const isSelected = selectedChip === chip.key;
          return (
            <Pressable
              key={chip.key}
              onPress={() => handleChipPress(chip.key)}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? '#C8102E' : colors.textMuted },
                ]}
              >
                {chip.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Main content scroll view */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {sections.map((section) => (
          <View key={section.key}>
            <SectionHeader
              title={section.title}
              sectionKey={section.key}
              onLayout={handleSectionLayout}
            />
            {section.articles.map((article, idx) => {
              if (idx === 0) {
                return (
                  <HeroCard
                    key={article.id}
                    article={article}
                    onPress={() => navigation.navigate('ArticleDetail', { slug: article.slug })}
                  />
                );
              }
              return (
                <HorizontalCard
                  key={article.id}
                  article={article}
                  onPress={() => navigation.navigate('ArticleDetail', { slug: article.slug })}
                />
              );
            })}
            <View style={[styles.sectionDivider, { borderBottomColor: colors.border }]} />
          </View>
        ))}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  masthead: {
    backgroundColor: '#C8102E',
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
    color: '#FFFFFF',
  },
  mastheadInsight: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#D4AF37',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  chipRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexGrow: 0,
  },
  chipRowContent: {
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 2,
  },
  chipSelected: {
    borderBottomWidth: 2,
    borderBottomColor: '#C8102E',
  },
  chipText: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionHeaderWrapper: {
    marginHorizontal: 12,
    marginTop: 18,
    marginBottom: 10,
    borderBottomWidth: 2,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 24,
    lineHeight: 30,
  },
  sectionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
  },
});
