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
import { TabView } from 'react-native-tab-view';
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

const TAB_ROUTES = SECTION_DEFS.map((s) => ({ key: s.key, title: s.title }));

// ---------------------------------------------------------------------------
// SectionHeader (used only in LatestScene)
// ---------------------------------------------------------------------------
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
      style={[
        latestStyles.sectionHeaderWrapper,
        sectionKey !== 'latest'
          ? { borderBottomWidth: 2, borderBottomColor: colors.accent }
          : { borderBottomWidth: 0 },
      ]}
      onLayout={(e) => onLayout(sectionKey, e.nativeEvent.layout.y)}
    >
      {sectionKey !== 'latest' ? (
        <Text
          style={[
            latestStyles.sectionHeaderText,
            { color: colors.sectionHeader, fontFamily: Fonts.playfair },
          ]}
        >
          {title}
        </Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// LatestScene — the mixed multi-section feed (tab index 0)
// ---------------------------------------------------------------------------
function LatestScene({ navigation }: { navigation: any }) {
  const { colors } = useTheme();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
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
        }),
      );
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
    try {
      await loadAllSections();
    } finally {
      setRefreshing(false);
    }
  }, [loadAllSections]);

  if (loading) {
    return (
      <View style={[sharedStyles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error && sections.length === 0) {
    return (
      <View style={[sharedStyles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <Text style={[sharedStyles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <Pressable
          style={[sharedStyles.retryButton, { backgroundColor: colors.accent }]}
          onPress={() => {
            setLoading(true);
            loadAllSections().finally(() => setLoading(false));
          }}
        >
          <Text style={sharedStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{ flex: 1, backgroundColor: colors.background }}
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
                  onPress={() =>
                    navigation.navigate('ArticleDetail', { slug: article.slug })
                  }
                  showAccentBorder={section.key !== 'latest'}
                />
              );
            }
            return (
              <HorizontalCard
                key={article.id}
                article={article}
                onPress={() =>
                  navigation.navigate('ArticleDetail', { slug: article.slug })
                }
              />
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// CategoryScene — repeating hero+3 block, no title, per-tab independent scroll
// ---------------------------------------------------------------------------
function CategoryScene({ slug, navigation }: { slug: string; navigation: any }) {
  const { colors } = useTheme();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchArticlesByCategory(slug, 40)
      .then((data) => {
        if (!cancelled) {
          const displayCount = Math.floor(data.length / 4) * 4;
          setArticles(data.slice(0, displayCount));
        }
      })
      .catch((e: any) => {
        if (!cancelled) setError(e.message ?? 'Failed to load articles');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <View style={[sharedStyles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[sharedStyles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <Text style={[sharedStyles.errorText, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  if (articles.length === 0) {
    return (
      <View style={[sharedStyles.centered, { flex: 1, backgroundColor: colors.background }]}>
        <Text style={[sharedStyles.errorText, { color: colors.textSecondary }]}>
          Not enough stories yet
        </Text>
      </View>
    );
  }

  const blocks: Article[][] = [];
  for (let i = 0; i < articles.length; i += 4) {
    blocks.push(articles.slice(i, i + 4));
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {blocks.map((block, blockIdx) => (
        <View key={blockIdx}>
          <HeroCard
            article={block[0]}
            onPress={() =>
              navigation.navigate('ArticleDetail', { slug: block[0].slug })
            }
            showTopDivider={true}
            showAccentBorder={true}
          />
          {block.slice(1).map((article) => (
            <HorizontalCard
              key={article.id}
              article={article}
              onPress={() =>
                navigation.navigate('ArticleDetail', { slug: article.slug })
              }
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// HomeScreen — persistent shell: masthead + chip row + TabView
// ---------------------------------------------------------------------------
export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [tabIndex, setTabIndex] = useState(0);

  const renderScene = ({ route }: { route: { key: string; title: string } }) => {
    if (route.key === 'latest') return <LatestScene navigation={navigation} />;
    return <CategoryScene slug={route.key} navigation={navigation} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#C8102E' }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Masthead */}
        <View style={shellStyles.masthead}>
          <Text style={shellStyles.mastheadText}>
            <Text style={shellStyles.mastheadDaily}>Daily</Text>
            <Text style={shellStyles.mastheadInsight}>Insight</Text>
          </Text>
        </View>

        {/* Chip row — drives TabView index */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[shellStyles.chipRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
          contentContainerStyle={shellStyles.chipRowContent}
        >
          {TAB_ROUTES.map((route, chipIndex) => {
            const isSelected = tabIndex === chipIndex;
            return (
              <Pressable
                key={route.key}
                onPress={() => setTabIndex(chipIndex)}
                style={[shellStyles.chip, isSelected && shellStyles.chipSelected]}
              >
                <Text
                  style={[
                    shellStyles.chipText,
                    { color: isSelected ? '#C8102E' : colors.textMuted },
                  ]}
                >
                  {route.title.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* TabView fills remaining height; default tab bar suppressed */}
        <TabView
          navigationState={{ index: tabIndex, routes: TAB_ROUTES }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          renderTabBar={() => null}
          lazy
          renderLazyPlaceholder={() => (
            <View style={[sharedStyles.centered, { flex: 1, backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          )}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const shellStyles = StyleSheet.create({
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
});

const latestStyles = StyleSheet.create({
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
});

const sharedStyles = StyleSheet.create({
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
});
