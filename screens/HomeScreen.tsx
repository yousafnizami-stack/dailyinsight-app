import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, NavigationState, SceneRendererProps } from 'react-native-tab-view';
import HeroCard from '../components/HeroCard';
import HorizontalCard from '../components/HorizontalCard';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  Article,
  fetchLatestArticles,
  fetchArticlesByCategory,
} from '../lib/api';
import { Fonts } from '../lib/fonts';
import { useMarkLatestReady } from '../lib/SplashContext';
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
// ChipTabBar — module-level so it's not recreated on every HomeScreen render.
// Receives tabBarProps from TabView's renderTabBar plus parent refs/callbacks.
// ---------------------------------------------------------------------------
type ChipTabBarProps = SceneRendererProps & {
  navigationState: NavigationState<{ key: string; title: string }>;
  chipScrollRef: React.RefObject<ScrollView | null>;
  chipLayouts: React.MutableRefObject<Array<{ x: number; width: number }>>;
  chipScrollWidth: React.MutableRefObject<number>;
  onChipPress: (index: number) => void;
};

function ChipTabBar({
  position,
  navigationState,
  jumpTo,
  chipScrollRef,
  chipLayouts,
  chipScrollWidth,
  onChipPress,
}: ChipTabBarProps) {
  const { colors } = useTheme();
  const { routes } = navigationState;
  const inputRange = routes.map((_, i) => i);

  return (
    <ScrollView
      ref={chipScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[shellStyles.chipRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
      contentContainerStyle={shellStyles.chipRowContent}
      onLayout={(e) => { chipScrollWidth.current = e.nativeEvent.layout.width; }}
    >
      {routes.map((route, chipIndex) => {
        // Use opacity crossfade instead of color interpolation — opacity runs on the native
        // driver; color interpolation falls back to the JS thread and lags during gestures.
        const activeOpacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map((idx) => (idx === chipIndex ? 1 : 0)),
          extrapolate: 'clamp',
        });
        const inactiveOpacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map((idx) => (idx === chipIndex ? 0 : 1)),
          extrapolate: 'clamp',
        });

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              jumpTo(route.key);
              onChipPress(chipIndex);
            }}
            style={shellStyles.chip}
            onLayout={(e) => {
              chipLayouts.current[chipIndex] = {
                x: e.nativeEvent.layout.x,
                width: e.nativeEvent.layout.width,
              };
            }}
          >
            {/* Two text layers at fixed colors, crossfaded via opacity — never interpolate color directly */}
            <View style={shellStyles.chipTextWrapper}>
              <Animated.Text style={[shellStyles.chipText, { color: colors.textMuted, opacity: inactiveOpacity }]}>
                {route.title.toUpperCase()}
              </Animated.Text>
              <Animated.Text style={[shellStyles.chipText, shellStyles.chipTextActive, { opacity: activeOpacity }]}>
                {route.title.toUpperCase()}
              </Animated.Text>
            </View>
            <Animated.View
              style={[shellStyles.chipUnderline, { opacity: activeOpacity }]}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

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
  const markLatestReady = useMarkLatestReady();

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
      const filtered = results.filter((s) => s.articles.length > 0);
      setSections(filtered);
      markLatestReady();
    } catch (e: any) {
      setError(e.message ?? 'Failed to load articles');
      // Still mark ready so the splash doesn't hang on error
      markLatestReady();
    }
  }, [markLatestReady]);

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
    return <SkeletonLoader />;
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
                    navigation.navigate('ArticleDetail', {
                      slug: article.slug,
                      title: article.title,
                      featuredImageUrl: article.featuredImageUrl,
                      categoryName: article.categoryName,
                      publishedAt: article.publishedAt,
                      author: article.author,
                    })
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
                  navigation.navigate('ArticleDetail', {
                    slug: article.slug,
                    title: article.title,
                    featuredImageUrl: article.featuredImageUrl,
                    categoryName: article.categoryName,
                    publishedAt: article.publishedAt,
                    author: article.author,
                  })
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setError(null);
    const data = await fetchArticlesByCategory(slug, 40);
    const displayCount = Math.floor(data.length / 4) * 4;
    setArticles(data.slice(0, displayCount));
  }, [slug]);

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadArticles();
    } finally {
      setRefreshing(false);
    }
  }, [loadArticles]);

  if (loading) {
    return <SkeletonLoader />;
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      {blocks.map((block, blockIdx) => (
        <View key={blockIdx}>
          <HeroCard
            article={block[0]}
            onPress={() =>
              navigation.navigate('ArticleDetail', {
                slug: block[0].slug,
                title: block[0].title,
                featuredImageUrl: block[0].featuredImageUrl,
                categoryName: block[0].categoryName,
                publishedAt: block[0].publishedAt,
                author: block[0].author,
              })
            }
            showTopDivider={true}
            showAccentBorder={true}
          />
          {block.slice(1).map((article) => (
            <HorizontalCard
              key={article.id}
              article={article}
              onPress={() =>
                navigation.navigate('ArticleDetail', {
                  slug: article.slug,
                  title: article.title,
                  featuredImageUrl: article.featuredImageUrl,
                  categoryName: article.categoryName,
                  publishedAt: article.publishedAt,
                  author: article.author,
                })
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

  // Reset to Latest (index 0) when user taps the Home tab while already on Home
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setTabIndex(0);
    });
    return unsubscribe;
  }, [navigation]);

  // Chip row auto-scroll: track each chip's x position and width
  const chipScrollRef = useRef<ScrollView>(null);
  const chipScrollWidth = useRef<number>(0); // visible width of the chip ScrollView
  const chipLayouts = useRef<Array<{ x: number; width: number }>>([]);

  // Whenever tabIndex changes (tap or swipe), scroll the chip row to keep active chip visible
  useEffect(() => {
    const layout = chipLayouts.current[tabIndex];
    if (!layout || !chipScrollRef.current) return;
    const visibleWidth = chipScrollWidth.current;
    if (visibleWidth === 0) return;

    const PADDING = 40;
    const targetX = Math.max(0, layout.x - PADDING);
    chipScrollRef.current.scrollTo({ x: targetX, animated: true });
  }, [tabIndex]);

  const handleIndexChange = useCallback((index: number) => {
    setTabIndex(index);
  }, []);

  const handleChipPress = useCallback((index: number) => {
    setTabIndex(index);
  }, []);

  const renderScene = ({ route }: { route: { key: string; title: string } }) => {
    if (route.key === 'latest') return <LatestScene navigation={navigation} />;
    return <CategoryScene slug={route.key} navigation={navigation} />;
  };

  const renderTabBar = useCallback(
    (tabBarProps: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string }> }) => (
      <ChipTabBar
        {...tabBarProps}
        chipScrollRef={chipScrollRef}
        chipLayouts={chipLayouts}
        chipScrollWidth={chipScrollWidth}
        onChipPress={handleChipPress}
      />
    ),
    [handleChipPress],
  );

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

        {/* TabView fills remaining height; chip row is rendered via renderTabBar */}
        <TabView
          navigationState={{ index: tabIndex, routes: TAB_ROUTES }}
          renderScene={renderScene}
          onIndexChange={handleIndexChange}
          renderTabBar={renderTabBar}
          lazy
          renderLazyPlaceholder={() => <SkeletonLoader />}
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
    paddingTop: 10,
    paddingBottom: 0,
    marginHorizontal: 2,
  },
  chipUnderline: {
    height: 2,
    backgroundColor: '#C8102E',
    marginTop: 8,
  },
  chipTextWrapper: {
    position: 'relative',
  },
  chipText: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: '#C8102E',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
