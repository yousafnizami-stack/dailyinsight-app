import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { fetchHoroscope, HoroscopeData } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';

const ZODIAC_SIGNS = [
  { key: 'aries',       name: 'Aries',       symbol: '♈', dates: 'Mar 21 – Apr 19' },
  { key: 'taurus',      name: 'Taurus',      symbol: '♉', dates: 'Apr 20 – May 20' },
  { key: 'gemini',      name: 'Gemini',      symbol: '♊', dates: 'May 21 – Jun 20' },
  { key: 'cancer',      name: 'Cancer',      symbol: '♋', dates: 'Jun 21 – Jul 22' },
  { key: 'leo',         name: 'Leo',         symbol: '♌', dates: 'Jul 23 – Aug 22' },
  { key: 'virgo',       name: 'Virgo',       symbol: '♍', dates: 'Aug 23 – Sep 22' },
  { key: 'libra',       name: 'Libra',       symbol: '♎', dates: 'Sep 23 – Oct 22' },
  { key: 'scorpio',     name: 'Scorpio',     symbol: '♏', dates: 'Oct 23 – Nov 21' },
  { key: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 – Dec 21' },
  { key: 'capricorn',   name: 'Capricorn',   symbol: '♑', dates: 'Dec 22 – Jan 19' },
  { key: 'aquarius',    name: 'Aquarius',    symbol: '♒', dates: 'Jan 20 – Feb 18' },
  { key: 'pisces',      name: 'Pisces',      symbol: '♓', dates: 'Feb 19 – Mar 20' },
];

function DotRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: i < value ? '#D4AF37' : 'rgba(212,175,55,0.25)',
          }}
        />
      ))}
    </View>
  );
}

export function HoroscopeScene({
  scrollRef,
}: {
  scrollRef?: React.RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSign, setSelectedSign] = useState('aries');

  useEffect(() => {
    fetchHoroscope()
      .then((data) => {
        setHoroscope(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color="#C8102E" />
      </View>
    );
  }

  if (!horoscope) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
          padding: 20,
        }}
      >
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          Unable to load today's horoscope. Please try again later.
        </Text>
      </View>
    );
  }

  const currentSignData = horoscope.signs?.find(
    (s) => s.sign.toLowerCase() === selectedSign,
  );
  const currentZodiac = ZODIAC_SIGNS.find((z) => z.key === selectedSign);

  const fallbackDateFormatted = horoscope.date
    ? new Date(horoscope.date + 'T12:00:00Z').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : horoscope.date;

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Fallback notice */}
      {horoscope.isFallback && (
        <View
          style={{
            backgroundColor: 'rgba(245,158,11,0.15)',
            borderLeftWidth: 3,
            borderLeftColor: '#F59E0B',
            margin: 16,
            padding: 12,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: '#F59E0B', fontSize: 13 }}>
            Showing {fallbackDateFormatted}'s reading — today's will be along shortly
          </Text>
        </View>
      )}

      {/* Sign selector grid (4 columns x 3 rows) */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: horoscope.isFallback ? 8 : 16,
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ZODIAC_SIGNS.map((zodiac) => {
            const isSelected = selectedSign === zodiac.key;
            return (
              <Pressable
                key={zodiac.key}
                onPress={() => setSelectedSign(zodiac.key)}
                style={{
                  width: '22%',
                  aspectRatio: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  backgroundColor: isSelected ? '#C8102E' : colors.card,
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: 'rgba(200,16,46,0.2)',
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: isSelected ? 'white' : colors.text,
                  }}
                >
                  {zodiac.symbol}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: isSelected ? 'rgba(255,255,255,0.9)' : colors.textMuted,
                    marginTop: 3,
                  }}
                >
                  {zodiac.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Reading card */}
      {currentSignData && currentZodiac && (
        <View
          style={{
            margin: 16,
            borderRadius: 16,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: 'rgba(200,16,46,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <View
            style={{
              backgroundColor: '#C8102E',
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 36, color: 'white' }}>{currentZodiac.symbol}</Text>
            <View>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                {currentZodiac.name}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {currentZodiac.dates}
              </Text>
            </View>
          </View>

          {/* Reading content */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                lineHeight: 24,
                fontStyle: 'italic',
              }}
            >
              {currentSignData.reading}
            </Text>

            {/* Ratings */}
            <View style={{ marginTop: 20, gap: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Love
                </Text>
                <DotRating value={currentSignData.love} />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Career
                </Text>
                <DotRating value={currentSignData.career} />
              </View>
            </View>

            {/* Lucky pills */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(212,175,55,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(212,175,55,0.4)',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700' }}>
                  🎨 {currentSignData.luckyColour}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(212,175,55,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(212,175,55,0.4)',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700' }}>
                  🔢 {currentSignData.luckyNumber}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(212,175,55,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(212,175,55,0.4)',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700' }}>
                  📅 {currentSignData.luckyDay}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
