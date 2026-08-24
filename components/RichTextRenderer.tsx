import React, { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, Modal, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Fonts } from '../lib/fonts';
import { useTheme } from '../lib/ThemeContext';
import { useTextSize } from '../lib/TextSizeContext';

const { width: screenWidth } = Dimensions.get('window');

// Payload lexical format bitflags
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_UNDERLINE = 8;

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  tag?: string; // for heading: h1, h2, h3, etc.
  value?: any; // for upload nodes
  fields?: any; // for block nodes
  blockType?: string;
}

interface EmbedItem {
  id?: string;
  platform?: string;
  embedHtml: string;
  caption?: string;
  insertAfterParagraph?: number;
}

interface Props {
  body: any;
  embeds?: EmbedItem[];
}

function renderTextNode(node: LexicalNode, index: number, textColor: string) {
  const text = node.text ?? '';
  const format = node.format ?? 0;

  const isBold = (format & FORMAT_BOLD) !== 0;
  const isItalic = (format & FORMAT_ITALIC) !== 0;
  const isUnderline = (format & FORMAT_UNDERLINE) !== 0;

  return (
    <Text
      key={index}
      style={[
        { color: textColor },
        isBold && styles.bold,
        isItalic && styles.italic,
        isUnderline && styles.underline,
      ]}
    >
      {text}
    </Text>
  );
}

function renderInlineChildren(children: LexicalNode[] = [], textColor: string): React.ReactNode[] {
  return children.map((child, i) => {
    if (child.type === 'text' || child.text !== undefined) {
      return renderTextNode(child, i, textColor);
    }
    if (child.type === 'linebreak') {
      return <Text key={i}>{'\n'}</Text>;
    }
    if (child.children) {
      return (
        <Text key={i} style={{ color: textColor }}>
          {renderInlineChildren(child.children, textColor)}
        </Text>
      );
    }
    return null;
  });
}

/** Extract YouTube video ID from a youtube.com or youtu.be URL */
function extractYouTubeId(url: string): string | null {
  // ?v=VIDEO_ID (youtube.com/watch?v=..., including &t= suffix)
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  // youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  // youtube.com/v/VIDEO_ID
  const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];
  return null;
}

/** Extract Instagram post shortcode from an instagram.com/p/..., /reel/..., or /tv/... URL */
function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#]+)/);
  return match ? match[1] : null;
}

/** Return true if the URL is a Twitter/X tweet URL */
function isTwitterUrl(url: string): boolean {
  return /(?:twitter\.com|x\.com)\/.+\/status\/\d+/.test(url.trim());
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #000;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <iframe
    id="yt"
    src="https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&cc_lang_pref=en&enablejsapi=1&origin=https://www.dailyinsight.co.uk"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
  <script>
    function rnLog(tag, payload) {
      try {
        var msg = JSON.stringify({ tag: tag, payload: payload, ts: Date.now() });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(msg);
        }
      } catch (e) {}
    }

    rnLog('DIAG_INIT', 'injected script running');

    window.addEventListener('message', function(evt) {
      if (!evt.origin || evt.origin.indexOf('youtube.com') === -1) return;
      var raw = evt.data;
      var parsed = null;
      try { parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch(e) {}
      rnLog('YT_MESSAGE', { origin: evt.origin, raw: raw });
      if (!parsed) return;
      if (parsed.event === 'onReady' || parsed.info === 0) {
        var iframe = document.getElementById('yt');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'getOption', args: ['captions', 'track'] }),
            '*'
          );
        }
      }
      if (parsed.event === 'onApiChange') {
        var iframe2 = document.getElementById('yt');
        if (iframe2 && iframe2.contentWindow) {
          iframe2.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'getOption', args: ['captions', 'track'] }),
            '*'
          );
        }
      }
    });

    function handleFullscreenChange(evtName) {
      return function() {
        var isExiting = !document.fullscreenElement
          && !document.webkitFullscreenElement
          && !document.webkitCurrentFullScreenElement
          && !document.mozFullScreenElement
          && !document.msFullscreenElement;
        if (isExiting) {
          var iframe = document.getElementById('yt');
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              '{"event":"command","func":"playVideo","args":""}',
              '*'
            );
          }
        }
      };
    }

    document.addEventListener('fullscreenchange',       handleFullscreenChange('fullscreenchange'));
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange('webkitfullscreenchange'));
    document.addEventListener('mozfullscreenchange',    handleFullscreenChange('mozfullscreenchange'));
    document.addEventListener('msfullscreenchange',     handleFullscreenChange('msfullscreenchange'));
  </script>
</body>
</html>`;

  function handleWebViewMessage(event: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as {
        tag: string;
        payload: unknown;
        ts: number;
      };
      console.log(`[YT-DIAG][${msg.tag}]`, JSON.stringify(msg.payload), `@ ${msg.ts}`);
    } catch (e) {
      console.log('[YT-DIAG][RAW]', event.nativeEvent.data);
    }
  }

  return (
    <View style={styles.youtubeContainer}>
      <WebView
        ref={webViewRef}
        source={{ html, baseUrl: 'https://www.dailyinsight.co.uk' }}
        style={styles.webview}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        cacheEnabled={false}
        incognito={true}
        sharedCookiesEnabled={false}
        thirdPartyCookiesEnabled={false}
        androidLayerType="hardware"
        onMessage={handleWebViewMessage}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onShouldStartLoadWithRequest={(request) => {
          const url = request.url;
          if (url === 'about:blank' || url.startsWith('https://www.dailyinsight.co.uk')) {
            return true;
          }
          if (url.includes('youtube.com/embed')) {
            return true;
          }
          if (url.includes('google.com')) {
            return true;
          }
          if (
            url.includes('youtube.com') ||
            url.includes('youtu.be') ||
            url.includes('m.youtube.com')
          ) {
            Linking.openURL(url);
            return false;
          }
          return true;
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C8102E" />
        </View>
      )}
    </View>
  );
}

function InstagramEmbed({ shortcode }: { shortcode: string }) {
  const [loading, setLoading] = useState(true);
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; display: flex; justify-content: center; }
    .instagram-media { min-width: 100% !important; max-width: 100% !important; }
  </style>
</head>
<body>
  <blockquote
    class="instagram-media"
    data-instgrm-permalink="https://www.instagram.com/p/${shortcode}/"
    data-instgrm-version="14"
  ></blockquote>
  <script async src="https://www.instagram.com/embed.js"></script>
</body>
</html>`;
  return (
    <View style={styles.instagramContainer}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C8102E" />
        </View>
      )}
    </View>
  );
}

function TwitterEmbed({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  const [webviewHeight, setWebviewHeight] = useState(320);
  const tweetUrl = url.trim();
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; display: flex; justify-content: center; }
    .twitter-tweet { min-width: 100% !important; max-width: 100% !important; }
  </style>
</head>
<body>
  <blockquote class="twitter-tweet" data-dnt="true" data-conversation="none">
    <a href="${tweetUrl}">${tweetUrl}</a>
  </blockquote>
  <script>
    // Report real rendered height back to RN once the tweet widget finishes loading
    window.addEventListener("message", function(event) {
      try {
        var data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data["twttr.embed"] && data["twttr.embed"].method === "twttr.private.resize") {
          var h = data["twttr.embed"].params[0].height;
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ tag: "TW_RESIZE", payload: h })
          );
        }
      } catch(e) {}
    });
    // Console bridge — forwards errors to RN for diagnosis
    window.onerror = function(msg, src, line, col, err) {
      try {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ tag: 'TW_ERROR', payload: { msg: msg, src: src, line: line } })
        );
      } catch(e) {}
    };
    var _ce = console.error.bind(console);
    console.error = function() {
      try {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ tag: 'TW_CONSOLE_ERROR', payload: Array.prototype.slice.call(arguments).join(' ') })
        );
      } catch(e) {}
      _ce.apply(console, arguments);
    };
  </script>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</body>
</html>`;

  function handleWebViewMessage(event: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as { tag: string; payload: unknown };
      if (msg.tag === "TW_RESIZE" && typeof msg.payload === "number" && msg.payload > 0) {
        setWebviewHeight(msg.payload);
      }
      console.log(`[TW-DIAG][${msg.tag}]`, JSON.stringify(msg.payload));
    } catch (e) {
      console.log('[TW-DIAG][RAW]', event.nativeEvent.data);
    }
  }

  return (
    <View style={[styles.twitterContainer, { height: webviewHeight }]}>
      <WebView
        source={{ html, baseUrl: 'https://www.dailyinsight.co.uk' }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('[TW-DIAG][WEBVIEW_LOAD_ERROR]', JSON.stringify(nativeEvent));
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('[TW-DIAG][WEBVIEW_HTTP_ERROR]', nativeEvent.statusCode, nativeEvent.url);
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C8102E" />
        </View>
      )}
    </View>
  );
}

function isTikTokUrl(url: string): boolean {
  const trimmed = url.trim();
  return /tiktok\.com\/@[\w.]+\/video\/\d+/.test(trimmed) ||
    /tiktok\.com\/t\/[\w]+/.test(trimmed) ||
    /vm\.tiktok\.com\/[\w]+/.test(trimmed);
}

function TikTokEmbed({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  const rawUrl = url.trim();
  // Strip query params for the canonical cite URL (TikTok embed.js requires the clean URL)
  const embedUrl = rawUrl.split('?')[0];
  // Extract the numeric video ID from @user/video/ID paths
  const videoIdMatch = rawUrl.match(/\/video\/(\d+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : '';
  const dataVideoId = videoId ? ` data-video-id="${videoId}"` : '';
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; display: flex; justify-content: center; }
  </style>
</head>
<body>
  <blockquote class="tiktok-embed" cite="${embedUrl}"${dataVideoId} style="max-width:100%;min-width:100%;">
    <section></section>
  </blockquote>
  <script async src="https://www.tiktok.com/embed.js"></script>
</body>
</html>`;
  return (
    <View style={styles.tiktokContainer}>
      <WebView
        source={{ html, baseUrl: 'https://www.dailyinsight.co.uk' }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C8102E" />
        </View>
      )}
    </View>
  );
}

function detectEmbedType(html: string): { type: 'youtube' | 'instagram' | 'twitter' | 'tiktok' | 'unknown'; id: string } {
  // YouTube: iframe src contains youtube.com/embed/ or youtube-nocookie.com/embed/
  const ytMatch = html.match(/src="[^"]*(?:youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] };

  // Instagram: class="instagram-media", extract data-instgrm-permalink
  if (html.includes('instagram-media')) {
    const igMatch = html.match(/data-instgrm-permalink="([^"]+)"/);
    if (igMatch) {
      const shortcode = extractInstagramShortcode(igMatch[1]);
      if (shortcode) return { type: 'instagram', id: shortcode };
    }
  }

  // Twitter/X: class="twitter-tweet", extract anchor href
  if (html.includes('twitter-tweet')) {
    const twMatch = html.match(/href="(https?:\/\/(?:twitter|x)\.com\/[^"]+\/status\/\d+[^"]*)"/);
    if (twMatch) return { type: 'twitter', id: twMatch[1] };
  }

  // TikTok: class="tiktok-embed", extract cite attribute
  if (html.includes('tiktok-embed')) {
    const ttMatch = html.match(/cite="([^"]+)"/);
    if (ttMatch) return { type: 'tiktok', id: ttMatch[1] };
  }

  return { type: 'unknown', id: '' };
}

function EmbedBlock({ fields }: { fields: any }) {
  const url: string = fields?.url ?? '';

  if (!url) {
    return (
      <View style={styles.embedPlaceholder}>
        <Text style={styles.embedPlaceholderText}>📹 Video content — view on website</Text>
      </View>
    );
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return <YouTubeEmbed videoId={videoId} />;
    }
  }

  if (url.includes('instagram.com')) {
    const shortcode = extractInstagramShortcode(url);
    if (shortcode) {
      return <InstagramEmbed shortcode={shortcode} />;
    }
  }

  if (isTwitterUrl(url)) {
    return <TwitterEmbed url={url} />;
  }

  if (isTikTokUrl(url)) {
    return <TikTokEmbed url={url} />;
  }

  return (
    <View style={styles.embedPlaceholder}>
      <Text style={styles.embedPlaceholderText}>📹 Video content — view on website</Text>
    </View>
  );
}

const GOLD = '#D4AF37';

function CarouselBlock({ fields }: { fields: any }) {
  const images: any[] = fields?.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const carouselScrollRef = useRef<ScrollView>(null);
  const lightboxScrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Full screen width — carousel runs edge-to-edge (container has no horizontal padding for the block)
  const carouselWidth = screenWidth;
  // Lightbox uses full screen
  const lightboxWidth = screenWidth;
  const lightboxHeight = Dimensions.get('window').height;

  if (images.length === 0) return null;

  const total = images.length;

  function handleCarouselScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const page = Math.round(e.nativeEvent.contentOffset.x / carouselWidth);
    setActiveIndex(page);
  }

  function scrollCarouselTo(index: number) {
    const clamped = Math.max(0, Math.min(total - 1, index));
    carouselScrollRef.current?.scrollTo({ x: clamped * carouselWidth, animated: true });
  }

  function openLightbox() {
    setLightboxIndex(activeIndex);
    setLightboxOpen(true);
    // Scroll lightbox to match current carousel position after opening
    setTimeout(() => {
      lightboxScrollRef.current?.scrollTo({ x: activeIndex * lightboxWidth, animated: false });
    }, 50);
  }

  function handleLightboxScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const page = Math.round(e.nativeEvent.contentOffset.x / lightboxWidth);
    setLightboxIndex(page);
  }

  function scrollLightboxTo(index: number) {
    const clamped = Math.max(0, Math.min(total - 1, index));
    lightboxScrollRef.current?.scrollTo({ x: clamped * lightboxWidth, animated: true });
    setLightboxIndex(clamped);
  }

  const activeCaption: string =
    (images[activeIndex]?.caption ?? images[activeIndex]?.image?.caption ?? '').trim();
  const lightboxCaption: string =
    (images[lightboxIndex]?.caption ?? images[lightboxIndex]?.image?.caption ?? '').trim();

  return (
    <View style={carouselStyles.wrapper}>
      {/* ── Minimized carousel ── */}
      <View style={[carouselStyles.carouselContainer, { width: carouselWidth }]}>
        <ScrollView
          ref={carouselScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleCarouselScroll}
          style={{ width: carouselWidth }}
        >
          {images.map((item: any, idx: number) => {
            const media = item?.image;
            const imageUrl = media?.cloudinaryUrl ?? media?.url;
            return (
              <View
                key={item?.id ?? idx}
                style={[carouselStyles.slide, { width: carouselWidth }]}
              >
                {imageUrl ? (
                  <ExpoImage
                    source={{ uri: imageUrl }}
                    style={carouselStyles.slideImage}
                    contentFit="contain"
                  />
                ) : (
                  <View style={[carouselStyles.slideImage, { backgroundColor: '#2A2A2A' }]} />
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Expand badge — top-left */}
        <TouchableOpacity
          style={carouselStyles.expandBadge}
          onPress={openLightbox}
          activeOpacity={0.8}
          accessibilityLabel="Expand to fullscreen"
        >
          <Ionicons name="expand-outline" size={16} color={GOLD} />
        </TouchableOpacity>

        {/* Counter pill — top-right (only if multiple images) */}
        {total > 1 && (
          <View style={carouselStyles.counterPill}>
            <Text style={carouselStyles.counterText}>
              {activeIndex + 1} / {total}
            </Text>
          </View>
        )}

        {/* Caption overlay — grows upward from bottom, independent of dots */}
        {activeCaption ? (
          <View style={carouselStyles.captionOverlay}>
            <Text style={carouselStyles.captionText}>
              {activeCaption}
            </Text>
          </View>
        ) : null}

        {/* Dot pagination — absolutely anchored at fixed bottom position, never shifts with caption */}
        {total > 1 && (
          <View style={carouselStyles.dotsRow}>
            {images.map((_: any, i: number) => (
              <View
                key={i}
                style={[
                  carouselStyles.dot,
                  i === activeIndex ? carouselStyles.dotActive : carouselStyles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Prev arrow */}
        {total > 1 && activeIndex > 0 && (
          <TouchableOpacity
            style={[carouselStyles.arrowBtn, carouselStyles.arrowLeft]}
            onPress={() => scrollCarouselTo(activeIndex - 1)}
            activeOpacity={0.7}
            accessibilityLabel="Previous image"
          >
            <Ionicons name="chevron-back" size={18} color={GOLD} />
          </TouchableOpacity>
        )}

        {/* Next arrow */}
        {total > 1 && activeIndex < total - 1 && (
          <TouchableOpacity
            style={[carouselStyles.arrowBtn, carouselStyles.arrowRight]}
            onPress={() => scrollCarouselTo(activeIndex + 1)}
            activeOpacity={0.7}
            accessibilityLabel="Next image"
          >
            <Ionicons name="chevron-forward" size={18} color={GOLD} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Fullscreen lightbox modal ── */}
      <Modal
        visible={lightboxOpen}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setLightboxOpen(false)}
        statusBarTranslucent
      >
        <View style={lightboxStyles.container}>
          {/* Paged image scroll */}
          <ScrollView
            ref={lightboxScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleLightboxScroll}
            style={{ flex: 1 }}
          >
            {images.map((item: any, idx: number) => {
              const media = item?.image;
              const imageUrl = media?.cloudinaryUrl ?? media?.url;
              return (
                <View
                  key={item?.id ?? idx}
                  style={[lightboxStyles.page, { width: lightboxWidth, height: lightboxHeight }]}
                >
                  {imageUrl ? (
                    <ExpoImage
                      source={{ uri: imageUrl }}
                      style={{ width: lightboxWidth, height: lightboxHeight }}
                      contentFit="contain"
                    />
                  ) : (
                    <View style={{ width: lightboxWidth, height: lightboxHeight, backgroundColor: '#111' }} />
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Close button — top-right, safe-area aware */}
          <TouchableOpacity
            style={[lightboxStyles.closeBtn, { top: Math.max(insets.top, 50) }]}
            onPress={() => setLightboxOpen(false)}
            activeOpacity={0.8}
            accessibilityLabel="Close lightbox"
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Caption */}
          {lightboxCaption ? (
            <View style={[lightboxStyles.captionContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <Text style={lightboxStyles.captionText}>{lightboxCaption}</Text>
            </View>
          ) : null}

          {/* Lightbox counter pill */}
          {total > 1 && (
            <View style={[lightboxStyles.counterPill, { top: Math.max(insets.top, 50) }]}>
              <Text style={lightboxStyles.counterText}>
                {lightboxIndex + 1} / {total}
              </Text>
            </View>
          )}

          {/* Prev arrow */}
          {total > 1 && lightboxIndex > 0 && (
            <TouchableOpacity
              style={[lightboxStyles.arrowBtn, lightboxStyles.arrowLeft]}
              onPress={() => scrollLightboxTo(lightboxIndex - 1)}
              activeOpacity={0.7}
              accessibilityLabel="Previous image"
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Next arrow */}
          {total > 1 && lightboxIndex < total - 1 && (
            <TouchableOpacity
              style={[lightboxStyles.arrowBtn, lightboxStyles.arrowRight]}
              onPress={() => scrollLightboxTo(lightboxIndex + 1)}
              activeOpacity={0.7}
              accessibilityLabel="Next image"
            >
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

function BlockNode({
  node,
  index,
  colors,
  fontScale,
}: {
  node: LexicalNode;
  index: number;
  colors: {
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    accent: string;
    surface: string;
  };
  fontScale: number;
}) {
  if (node.type === 'paragraph') {
    const textContent = (node.children ?? [])
      .map((c) => c.text ?? '')
      .join('');
    if (!textContent.trim()) {
      return <View key={index} style={styles.paragraphSpacer} />;
    }
    return (
      <Text
        key={index}
        style={[styles.paragraph, { color: colors.text, fontFamily: Fonts.sourceSerif, fontSize: 17 * fontScale, lineHeight: 28 * fontScale }]}
      >
        {renderInlineChildren(node.children, colors.text)}
      </Text>
    );
  }

  if (node.type === 'heading') {
    const tag = node.tag ?? 'h2';
    const headingStyle =
      tag === 'h1'
        ? styles.h1
        : tag === 'h2'
        ? styles.h2
        : styles.h3;
    return (
      <Text
        key={index}
        style={[styles.heading, headingStyle, { color: colors.text, fontFamily: Fonts.playfair }]}
      >
        {renderInlineChildren(node.children, colors.text)}
      </Text>
    );
  }

  if (node.type === 'quote') {
    return (
      <View
        key={index}
        style={[
          styles.blockquoteContainer,
          { borderLeftColor: colors.accent, backgroundColor: colors.surface },
        ]}
      >
        <Text
          style={[
            styles.blockquoteText,
            { color: colors.textSecondary, fontFamily: Fonts.sourceSerif },
          ]}
        >
          {renderInlineChildren(node.children, colors.textSecondary)}
        </Text>
      </View>
    );
  }

  if (node.type === 'upload') {
    const media = node.value;
    if (!media) return null;
    const imageUrl = media.cloudinaryUrl ?? media.url;
    if (!imageUrl) return null;
    const naturalWidth: number | undefined = media.width;
    const naturalHeight: number | undefined = media.height;
    const aspectRatio =
      naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 16 / 9;
    return (
      <Image
        key={index}
        source={{ uri: imageUrl }}
        style={[styles.uploadImage, { aspectRatio }]}
        resizeMode="contain"
      />
    );
  }

  if (node.type === 'block') {
    const blockType = node.fields?.blockType ?? node.blockType;
    if (blockType === 'carousel') {
      return <CarouselBlock key={index} fields={node.fields} />;
    }
    if (blockType === 'embedBlock') {
      return <EmbedBlock key={index} fields={node.fields} />;
    }
    return null;
  }

  if (node.type === 'list') {
    const isOrdered = node.tag === 'ol';
    return (
      <View key={index} style={styles.list}>
        {(node.children ?? []).map((item, i) => (
          <Text
            key={i}
            style={[styles.listItem, { color: colors.text, fontFamily: Fonts.sourceSerif, fontSize: 17 * fontScale, lineHeight: 28 * fontScale }]}
          >
            {isOrdered ? `${i + 1}. ` : '• '}
            {renderInlineChildren(item.children, colors.text)}
          </Text>
        ))}
      </View>
    );
  }

  return null;
}

export default function RichTextRenderer({ body, embeds = [] }: Props) {
  const { colors } = useTheme();
  const { fontScale } = useTextSize();

  if (!body?.root?.children) {
    return null;
  }

  const nodes: LexicalNode[] = body.root.children;

  // Build a map of insertAfterParagraph → embed items so we can splice them in efficiently
  const embedsByPosition = new Map<number, EmbedItem[]>();
  for (const embed of embeds) {
    const pos = embed.insertAfterParagraph ?? -1;
    if (pos < 0) continue;
    if (!embedsByPosition.has(pos)) {
      embedsByPosition.set(pos, []);
    }
    embedsByPosition.get(pos)!.push(embed);
  }

  const output: React.ReactNode[] = [];

  nodes.forEach((node, i) => {
    output.push(<BlockNode key={`node-${i}`} node={node} index={i} colors={colors} fontScale={fontScale} />);

    const embedsHere = embedsByPosition.get(i);
    if (embedsHere) {
      for (const embed of embedsHere) {
        const detected = detectEmbedType(embed.embedHtml);
        const key = `embed-${i}-${embed.id ?? detected.id}`;
        if (detected.type === 'youtube') {
          output.push(<YouTubeEmbed key={key} videoId={detected.id} />);
        } else if (detected.type === 'instagram') {
          output.push(<InstagramEmbed key={key} shortcode={detected.id} />);
        } else if (detected.type === 'twitter') {
          output.push(<TwitterEmbed key={key} url={detected.id} />);
        } else if (detected.type === 'tiktok') {
          output.push(<TikTokEmbed key={key} url={detected.id} />);
        } else {
          console.warn('[RichTextRenderer] Unrecognised embed HTML, skipping render:', embed.embedHtml.slice(0, 120));
        }
      }
    }
  });

  return (
    <View style={styles.container}>
      {output}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 14,
  },
  paragraphSpacer: {
    height: 8,
  },
  heading: {
    marginBottom: 10,
    marginTop: 16,
  },
  h1: {
    fontSize: 26,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  blockquoteContainer: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginVertical: 12,
    paddingVertical: 8,
    paddingRight: 8,
    borderRadius: 2,
  },
  blockquoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  uploadImage: {
    width: '100%',
    borderRadius: 6,
    marginVertical: 12,
  },
  list: {
    marginBottom: 14,
  },
  listItem: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 4,
  },
  embedPlaceholder: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 12,
    alignItems: 'center',
  },
  embedPlaceholderText: {
    fontSize: 14,
    color: '#666',
  },
  youtubeContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginVertical: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  instagramContainer: {
    width: '100%',
    height: 600,
    marginVertical: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  twitterContainer: {
    width: '100%',
    height: 320,
    marginVertical: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  tiktokContainer: {
    width: '100%',
    height: 700,
    marginVertical: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});

const carouselStyles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
    // Negative horizontal margin to break out of the container's paddingHorizontal: 16
    marginHorizontal: -16,
  },
  carouselContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: '#1A1A1A',
    borderWidth: 4,
    borderColor: GOLD,
    overflow: 'hidden',
    position: 'relative',
  },
  slide: {
    aspectRatio: 3 / 4,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  expandBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  counterPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 10,
  },
  counterText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  captionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 6,
    paddingBottom: 30,
    paddingHorizontal: 12,
    zIndex: 5,
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    zIndex: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: GOLD,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  captionText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%' as any,
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
});

const lightboxStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  captionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    zIndex: 15,
  },
  captionText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  counterPill: {
    position: 'absolute',
    left: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 20,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%' as any,
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  arrowLeft: {
    left: 16,
  },
  arrowRight: {
    right: 16,
  },
});
