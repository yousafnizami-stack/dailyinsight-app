import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, NavigationState, SceneRendererProps } from 'react-native-tab-view';
import HeroCard from '../components/HeroCard';
import HorizontalCard from '../components/HorizontalCard';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  Article,
  fetchFeaturedArticle,
  fetchLatestArticles,
  fetchArticlesByCategory,
} from '../lib/api';
import { HoroscopeScene } from './HoroscopeScreen';
import { Fonts } from '../lib/fonts';
import { useMarkLatestReady } from '../lib/SplashContext';
import { loadTabOrder } from '../lib/tabOrder';
import { useTheme } from '../lib/ThemeContext';

interface Props {
  navigation: any;
}

interface Section {
  key: string;
  title: string;
  articles: Article[];
}

const ALL_SECTION_DEFS: Record<string, { title: string; fetch: () => Promise<Article[]> }> = {
  latest: {
    title: 'Latest',
    fetch: async () => {
      const featured = await fetchFeaturedArticle();
      if (!featured) return fetchLatestArticles(6);
      const params = new URLSearchParams({
        'where[status][equals]': 'published',
        'where[slug][not_equals]': featured.slug,
        sort: '-publishedAt',
        limit: '5',
        depth: '0',
      });
      const res = await fetch(`https://admin.dailyinsight.co.uk/api/articles?${params.toString()}`);
      if (!res.ok) return fetchLatestArticles(6);
      const data = await res.json();
      return [featured, ...data.docs];
    },
  },
  royals:        { title: 'Royals',        fetch: () => fetchArticlesByCategory('royals', 6) },
  celebrity:     { title: 'Celebrity',     fetch: () => fetchArticlesByCategory('celebrity', 6) },
  fashion:       { title: 'Fashion',       fetch: () => fetchArticlesByCategory('fashion', 6) },
  entertainment: { title: 'Entertainment', fetch: () => fetchArticlesByCategory('entertainment', 6) },
  film:          { title: 'Film',          fetch: () => fetchArticlesByCategory('film', 6) },
  tv:            { title: 'TV',            fetch: () => fetchArticlesByCategory('tv', 6) },
  music:         { title: 'Music',         fetch: () => fetchArticlesByCategory('music', 6) },
  horoscopes:    { title: 'Horoscopes',    fetch: async () => [] },
};

const DEFAULT_KEYS = ['latest', 'royals', 'celebrity', 'fashion', 'entertainment', 'film', 'tv', 'music', 'horoscopes'];

function buildRoutes(keys: string[]) {
  return keys
    .filter((k) => ALL_SECTION_DEFS[k])
    .map((k) => ({ key: k, title: ALL_SECTION_DEFS[k].title }));
}

// Initial routes using default order (replaced after AsyncStorage loads)
const INITIAL_TAB_ROUTES = buildRoutes(DEFAULT_KEYS);

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
function LatestScene({
  navigation,
  scrollRef,
}: {
  navigation: any;
  scrollRef?: React.RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const markLatestReady = useMarkLatestReady();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionYPositions = useRef<Record<string, number>>({});

  const handleSectionLayout = useCallback((key: string, y: number) => {
    sectionYPositions.current[key] = y;
  }, []);

  const loadAllSections = useCallback(async () => {
    setError(null);
    try {
      const results = await Promise.all(
        Object.entries(ALL_SECTION_DEFS).map(async ([key, def]) => {
          const articles = await def.fetch();
          return { key, title: def.title, articles };
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
      ref={scrollRef}
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
                    navigation.push('ArticleDetail', {
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
                  navigation.push('ArticleDetail', {
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
function CategoryScene({
  slug,
  navigation,
  scrollRef,
}: {
  slug: string;
  navigation: any;
  scrollRef?: React.RefObject<ScrollView | null>;
}) {
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
      ref={scrollRef}
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
              navigation.push('ArticleDetail', {
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
                navigation.push('ArticleDetail', {
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
  const { colors, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const initialScreenWidth = useRef(screenWidth);
  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes, setTabRoutes] = useState(INITIAL_TAB_ROUTES);

  // Refs that always mirror the latest state values so event-handler closures
  // (which only close over their deps) can read current values without re-subscribing.
  const tabIndexRef = useRef(tabIndex);
  tabIndexRef.current = tabIndex;
  const tabRoutesRef = useRef(tabRoutes);
  tabRoutesRef.current = tabRoutes;

  // Load persisted tab order on mount and whenever the screen is focused
  // (so changes from EditTimelines are reflected immediately on back-navigation)
  useEffect(() => {
    const refresh = () => {
      loadTabOrder().then((keys) => {
        const newRoutes = buildRoutes(keys);
        const currentKeys = tabRoutesRef.current.map((r) => r.key).join(',');
        const newKeys = newRoutes.map((r) => r.key).join(',');
        setTabRoutes(newRoutes);
        if (newKeys !== currentKeys) {
          setTabIndex(0); // reset to first tab only when order genuinely changed
        }
      });
    };
    refresh();
    const unsubscribeFocus = navigation.addListener('focus', refresh);
    return unsubscribeFocus;
  }, [navigation]);

  // When already on the Latest tab (index 0) and the home button is pressed again,
  // scroll Latest back to the top. Otherwise just navigate to Latest.
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      // Only act when the screen is already focused — this distinguishes a
      // deliberate tab-bar tap (screen focused) from gaining focus via back
      // navigation (screen not yet focused when the event fires).
      if (!navigation.isFocused()) return;
      if (tabIndexRef.current === 0) {
        const key = tabRoutesRef.current[0]?.key;
        if (key) {
          sceneScrollRefs.current[key]?.current?.scrollTo({ y: 0, animated: true });
        }
      } else {
        setTabIndex(0);
      }
    });
    return unsubscribe;
  }, [navigation]);

  // One ScrollView ref per tab — rebuilt whenever route order changes
  const sceneScrollRefs = useRef<Record<string, React.RefObject<ScrollView | null>>>(
    Object.fromEntries(INITIAL_TAB_ROUTES.map((r) => [r.key, React.createRef<ScrollView>()]))
  );
  useEffect(() => {
    // Ensure all current route keys have a ref
    tabRoutes.forEach((r) => {
      if (!sceneScrollRefs.current[r.key]) {
        sceneScrollRefs.current[r.key] = React.createRef<ScrollView>();
      }
    });
  }, [tabRoutes]);

  // Track previous tab so we can reset its scroll when leaving
  const prevTabIndexRef = useRef(0);

  // Chip row auto-scroll: track each chip's x position and width
  const chipScrollRef = useRef<ScrollView>(null);
  const chipScrollWidth = useRef<number>(0); // visible width of the chip ScrollView
  const chipLayouts = useRef<Array<{ x: number; width: number }>>([]);

  // Whenever tabIndex changes (tap or swipe): reset PREVIOUS tab scroll to top, scroll chip row
  useEffect(() => {
    const prevKey = tabRoutes[prevTabIndexRef.current]?.key;
    if (prevKey && prevTabIndexRef.current !== tabIndex) {
      // Instant, invisible reset — user is looking at a different scene
      sceneScrollRefs.current[prevKey]?.current?.scrollTo({ y: 0, animated: false });
    }
    prevTabIndexRef.current = tabIndex;

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
    const scrollRef = sceneScrollRefs.current[route.key];
    if (route.key === 'latest') return <LatestScene navigation={navigation} scrollRef={scrollRef} />;
    if (route.key === 'horoscopes') return <HoroscopeScene scrollRef={scrollRef} />;
    return <CategoryScene slug={route.key} navigation={navigation} scrollRef={scrollRef} />;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background : '#C8102E' }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Masthead */}
        <View style={[shellStyles.masthead, { backgroundColor: isDark ? colors.background : '#C8102E' }]}>
          {navigation.canGoBack() ? (
            <Pressable
              onPress={() => navigation.goBack()}
              style={[
                shellStyles.mastheadIconBtn,
                { borderColor: isDark ? colors.border : 'rgba(255,255,255,0.3)' },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={isDark ? colors.text : '#FFFFFF'}
              />
            </Pressable>
          ) : (
            <View style={shellStyles.mastheadIconBtn} />
          )}

          <Text style={[shellStyles.mastheadText, shellStyles.mastheadTextAbsolute]} pointerEvents="none">
            <Text style={shellStyles.mastheadDaily}>Daily</Text>
            <Text style={shellStyles.mastheadInsight}>Insight</Text>
          </Text>

          <Pressable
            onPress={() =>
              Share.share({
                message:
                  'Check out the Daily Insight app — Royal, Celebrity & Entertainment news, updated daily.',
                url:
                  Platform.OS === 'ios'
                    ? 'https://apps.apple.com/app/dailyinsight/id6799170199'
                    : 'https://play.google.com/store/apps/details?id=com.dailyinsight.app',
              })
            }
            style={[
              shellStyles.mastheadIconBtn,
              { borderColor: isDark ? colors.border : 'rgba(255,255,255,0.3)' },
            ]}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={isDark ? colors.text : '#FFFFFF'}
            />
          </Pressable>
        </View>

        {/* TabView fills remaining height; chip row is rendered via renderTabBar */}
        <TabView
          navigationState={{ index: tabIndex, routes: tabRoutes }}
          renderScene={renderScene}
          onIndexChange={handleIndexChange}
          renderTabBar={renderTabBar}
          lazy
          renderLazyPlaceholder={() => <SkeletonLoader />}
          style={{ flex: 1 }}
          initialLayout={{ width: initialScreenWidth.current }}
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mastheadText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
  },
  mastheadTextAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  mastheadIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexGrow: 1,
    justifyContent: 'center' as const,
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
