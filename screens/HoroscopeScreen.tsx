import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Circle, G, Path, Svg } from 'react-native-svg';
import { fetchHoroscope, HoroscopeData } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';

// ─── Zodiac icon definitions (paths ported from website's zodiacSigns.tsx) ───

function ZodiacIcon({ sign, color, size }: { sign: string; color: string; size: number }) {
  switch (sign) {
    case 'aries':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Circle cx={18} cy={28} r={2} fill={color} stroke="none" />
            <Circle cx={30} cy={28} r={2} fill={color} stroke="none" />
            <Path d="M11 20H7a6 6 0 0 1-6-6h14" />
            <Path d="M37 20h4a6 6 0 0 0 6-6H33" />
            <Path d="M15 14l-2.6 12.145a4 4 0 0 0 .787 3.337L16 33l2.824 9.177a5.415 5.415 0 0 0 10.352 0L32 33l2.815-3.518a4 4 0 0 0 .787-3.337L33 14a41 41 0 0 0-18 0z" />
            <Path d="M27 38.677a3.1 3.1 0 0 1-6 0" />
            <Path d="M24 41v5" />
            <Path d="M2.444 17.9A40.055 40.055 0 0 0 2.25 22c0 11.984 3.34 17.148 5.626 17.813 1.791.52 3.748-.521 5.457-2.73-4.333.25-6.5-3.333-6.818-8.57a46.2 46.2 0 0 1 .018-6.261" />
            <Path d="M24 13C22.4 7.054 18.863 2 12 2 8.214 2 4.588 6.629 3.036 14" />
            <Path d="M15 14c-3.208-4.375-8.5-4.25-12 0" />
            <Path d="M45.556 17.9a40.055 40.055 0 0 1 .194 4.1c0 11.984-3.34 17.148-5.626 17.813-1.791.52-3.748-.521-5.457-2.73 4.333.25 6.5-3.333 6.818-8.57a46.2 46.2 0 0 0-.018-6.261" />
            <Path d="M24 13c1.605-5.946 5.137-11 12-11 3.786 0 7.412 4.629 8.964 12" />
            <Path d="M33 14c3.208-4.375 8.5-4.25 12 0" />
          </G>
        </Svg>
      );

    case 'taurus':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Circle cx={19.5} cy={36.5} r={1.5} fill={color} stroke="none" />
            <Circle cx={28.5} cy={36.5} r={1.5} fill={color} stroke="none" />
            <Path d="M18 31l2-8" />
            <Path d="M20 24h-2.037a3.178 3.178 0 0 1-2.841-1.755L14 20h4.72A2.28 2.28 0 0 1 21 22.28V23a1 1 0 0 1-1 1z" fill={color} stroke="none" />
            <Path d="M30 31l-2-8" />
            <Path d="M28 24h2.037a3.178 3.178 0 0 0 2.841-1.755L34 20h-4.72A2.28 2.28 0 0 0 27 22.28V23a1 1 0 0 0 1 1z" fill={color} stroke="none" />
            <Path d="M15 35l-3.118-4.988a7 7 0 0 1-.563-6.31L12 22l-2-6 4-8h20l4 8-2 6 .681 1.7a7 7 0 0 1-.563 6.31L33 35" />
            <Path d="M31 41v1a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3v-1" />
            <Path strokeLinecap="square" d="M18.459 31h11.082a3 3 0 0 1 2.941 2.412l.8 4A3 3 0 0 1 30.341 41H17.659a3 3 0 0 1-2.941-3.588l.8-4A3 3 0 0 1 18.459 31z" />
            <Path d="M9 23H7a6 6 0 0 1-6-6h9" />
            <Path d="M39 23h2a6 6 0 0 0 6-6h-9" />
            <Path strokeLinecap="square" d="M38 16h2a7 7 0 0 0 7-7V2h-.08A6.994 6.994 0 0 1 40 8h-6" />
            <Path strokeLinecap="square" d="M14 8H8a6.994 6.994 0 0 1-6.92-6H1v7a7 7 0 0 0 7 7h2" />
          </G>
        </Svg>
      );

    case 'gemini':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M2 2C8.16 5.69 15.84 5.69 22 2" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M2 22C8.16 18.31 15.84 18.31 22 22" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5.3 3.58L5.43 3.82C8.17 9.03 8.12 15.25 5.33 20.41" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
          <Path d="M18.67 20.41C15.89 15.25 15.84 9.03 18.57 3.82L18.7 3.58" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
        </Svg>
      );

    case 'cancer':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Circle cx={17} cy={22} r={2} fill={color} stroke="none" />
            <Circle cx={31} cy={22} r={2} fill={color} stroke="none" />
            <Path strokeLinecap="square" d="M9.331 12C8.25 8 9 5.312 12.071 2.613A8.02 8.02 0 1 0 16.6 7.5 12.219 12.219 0 0 1 9.331 12z" />
            <Path strokeLinecap="square" d="M24 26c-7.236 0-13.414 3.192-15.867 7.69a1.982 1.982 0 0 0 .979 2.732l14.08 6.221a2 2 0 0 0 1.616 0l14.08-6.221a1.982 1.982 0 0 0 .979-2.732C37.414 29.192 31.236 26 24 26z" />
            <Path d="M16 46a7.97 7.97 0 0 1 2.236-5.547" />
            <Path d="M10 46a13.937 13.937 0 0 1 2.548-8.055" />
            <Path d="M32 46a7.97 7.97 0 0 0-2.236-5.547" />
            <Path d="M38 46a13.937 13.937 0 0 0-2.548-8.055" />
            <Path d="M5 17s-2 8 5 10" />
            <Path strokeLinecap="square" d="M38.669 12c1.081-4 .331-6.687-2.74-9.387A8.02 8.02 0 1 1 31.4 7.5a12.219 12.219 0 0 0 7.269 4.5z" />
            <Path d="M43 17s2 8-5 10" />
          </G>
        </Svg>
      );

    case 'leo':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Path fill={color} stroke="none" d="M21 23h-2.037a3.178 3.178 0 0 1-2.841-1.755L15 19h4.72A2.28 2.28 0 0 1 22 21.28V22a1 1 0 0 1-1 1z" />
            <Path fill={color} stroke="none" d="M27 23h2.037a3.178 3.178 0 0 0 2.841-1.755L33 19h-4.72A2.28 2.28 0 0 0 26 21.28V22a1 1 0 0 0 1 1z" />
            <Path d="M19 30l2-8" />
            <Path d="M29 30l-2-8" />
            <Path d="M19.425 29h9.15a.5.5 0 0 1 .312.89l-3.613 2.891a1 1 0 0 1-.625.219h-1.3a1 1 0 0 1-.625-.219l-3.611-2.891a.5.5 0 0 1 .312-.89z" />
            <Path d="M30 38v1a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-1" />
            <Path d="M24 35v-2" />
            <Path d="M24 33v1a4 4 0 0 1-4 4h-2.983a4 4 0 0 1-3.846-2.9l-.363-1.27a5 5 0 0 1 1.272-4.91L16 27" />
            <Path d="M24 33v1a4 4 0 0 0 4 4h2.983a4 4 0 0 0 3.846-2.9l.363-1.27a5 5 0 0 0-1.272-4.91L32 27" />
            <Path d="M34.548 29.688l3.94-5.571a5 5 0 0 0 .646-4.57l-2.744-7.776a6.339 6.339 0 0 0-8.812-3.56 8 8 0 0 1-7.156 0 6.339 6.339 0 0 0-8.812 3.56l-2.744 7.776a5 5 0 0 0 .646 4.57l3.941 5.571" />
            <Path d="M24 46.833C27.583 43.5 35.833 46.5 38.667 38a18.447 18.447 0 0 1 .752 4.167s12-10.167 3.248-28.584a5.984 5.984 0 0 1 2.833 1.334c-.333-5.667-5.458-5-8.5-10 0 0 1.5.125 2-1.917-2.333.013-5-3-10-1a12.133 12.133 0 0 0-5-1 12.133 12.133 0 0 0-5 1c-5-2-7.667 1.013-10 1 .5 2.042 2 1.917 2 1.917-3.042 5-8.167 4.333-8.5 10a5.984 5.984 0 0 1 2.833-1.334C-3.417 32 8.581 42.167 8.581 42.167A18.447 18.447 0 0 1 9.333 38c2.834 8.5 11.084 5.5 14.667 8.833z" />
          </G>
        </Svg>
      );

    case 'virgo':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Path fill={color} stroke="none" d="M18.681 19.924l3.848 1.924a4.165 4.165 0 0 0 0-3.848z" />
            <Path strokeLinecap="square" d="M17 46a14.211 14.211 0 0 1-1.952-7.453H20.6a3.086 3.086 0 0 0 3.055-2.65l.65-4.552 4.108-1.645a1.028 1.028 0 0 0 .538-1.415l-3.615-7.23c0-6.454-1.077-10.884-4.506-13.289 0 0-.638 5.058-6.811 9.173A13.292 13.292 0 0 0 7.846 27.23C.387 21.057-.385 12.826 2.7 7.682S11.19.823 17.106 1.337c7.559.658 12.419 8 13.632 18.005C33 38 45 34 45 34s-2 16-28 12z" />
            <Circle cx={41} cy={17} r={1} fill={color} stroke="none" />
            <Path fill={color} stroke="none" d="M38.719 8.328A9.51 9.51 0 0 1 37 6a9.5 9.5 0 0 1-4 4 9.5 9.5 0 0 1 4 4 9.5 9.5 0 0 1 4-4 9.509 9.509 0 0 1-2.281-1.672z" />
            <Path d="M32.485 26.672c3 2 6.1 1.828 10.1-.172a6.213 6.213 0 0 1-2.166 5.208" />
          </G>
        </Svg>
      );

    case 'libra':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Path strokeLinecap="square" d="M24 10v24" />
            <Circle cx={24} cy={7} r={3} strokeLinecap="square" />
            <Path strokeLinecap="square" d="M17 24a8 8 0 0 1-16 0l8-10z" />
            <Path d="M1 24h16" />
            <Path d="M24 38a6 6 0 0 1 6 6H18a6 6 0 0 1 6-6z" />
            <Path strokeLinecap="square" d="M21.058 7.588l-9.316 1.864a6 6 0 0 1-4.925-1.2L4 6" />
            <Path strokeLinecap="square" d="M31 24a8 8 0 0 0 16 0l-8-10z" />
            <Path d="M47 24H31" />
            <Path strokeLinecap="square" d="M26.942 7.588l9.316 1.864a6 6 0 0 0 4.925-1.2L44 6" />
          </G>
        </Svg>
      );

    case 'scorpio':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Path strokeLinecap="square" d="M7.923 10.589C5.839 7.081 5.431 4.367 6.577 1.08a4.312 4.312 0 0 0-2.27.165C1.339 2.313.149 6.555 1.648 10.719s5.121 6.674 8.089 5.605 4.157-5.31 2.658-9.474a10.991 10.991 0 0 0-1.118-2.257c-.561 2.861-1.566 4.687-3.354 5.996z" />
            <Path strokeLinecap="square" d="M37.319 37.056a3 3 0 0 1 1.332-4.028c.687-.345 2.231-2.241 1.332-4.028l2.7 5.36a3 3 0 1 1-5.36 2.7z" />
            <Path strokeLinecap="square" d="M22.626 38.515a2.067 2.067 0 0 0 2.661 0c2.019-1.787 5.626-5.791 5.626-11.581A36.909 36.909 0 0 0 28.062 13.4a2.3 2.3 0 0 0-2.137-1.4h-3.937a2.3 2.3 0 0 0-2.137 1.4A36.909 36.909 0 0 0 17 26.934c0 5.79 3.607 9.794 5.626 11.581z" />
            <Path strokeLinecap="square" d="M40 39a8 8 0 0 1-16 0" />
            <Path strokeLinecap="square" d="M22 12v-2" />
            <Path strokeLinecap="square" d="M26 12v-2" />
            <Path d="M20.284 12.734c-4.659 4.974-9.306 10.331-17.118.819" />
            <Path strokeLinecap="square" d="M40.077 10.589c2.084-3.508 2.492-6.222 1.346-9.509a4.312 4.312 0 0 1 2.27.165c2.968 1.068 4.158 5.31 2.659 9.474s-5.121 6.674-8.089 5.605-4.157-5.31-2.663-9.474a10.991 10.991 0 0 1 1.118-2.257c.566 2.861 1.571 4.687 3.359 5.996z" />
            <Path d="M27.716 12.734c4.659 4.974 9.306 10.331 17.118.819" />
            <Path d="M18.6 33.4l-1.472 1.472A7.265 7.265 0 0 1 11.991 37H10" />
            <Path d="M17.076 28.374L15.6 29.691a7.267 7.267 0 0 1-6.023 1.738L7 31" />
            <Path d="M30.924 28.374l1.48 1.317A7.264 7.264 0 0 0 36 31.422" />
            <Path d="M17.4 22l-2.945 1.84a7.262 7.262 0 0 1-7.1.338L5 23" />
            <Path d="M29.4 33.4l1.472 1.472A7.269 7.269 0 0 0 34 36.717" />
            <Path d="M30.6 22l2.945 1.84a7.262 7.262 0 0 0 7.1.338L43 23" />
          </G>
        </Svg>
      );

    case 'sagittarius':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Path strokeLinecap="square" d="M44.987 40.8c-1.3.122-1.933-.27-2.912-1.982-2.884-5.047-4.527-14.27-11.575-21.318S14.229 8.809 9.185 5.925C7.473 4.946 7.081 4.31 7.2 3.013" />
            <Path d="M14 38h27.637" />
            <Path d="M10 6.363V38" />
            <Path d="M3 45l34-34" />
            <Path strokeLinecap="square" d="M4 38h6v6" />
            <Path strokeLinecap="square" d="M44 4l-4 13-3-6-6-3 13-4z" />
          </G>
        </Svg>
      );

    case 'capricorn':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Circle cx={18} cy={29} r={2} fill={color} stroke="none" />
            <Circle cx={30} cy={29} r={2} fill={color} stroke="none" />
            <Path d="M13 19v10.343a4 4 0 0 0 1.172 2.829L17 35l2.03 8.119A5.123 5.123 0 0 0 24 47a5.123 5.123 0 0 0 4.97-3.881L31 35l2.828-2.828A4 4 0 0 0 35 29.343V19a31.25 31.25 0 0 0-22 0z" />
            <Path d="M27 39.677a3.1 3.1 0 0 1-6 0" />
            <Path d="M24 42v5" />
            <Path d="M10 21.8A10 10 0 0 1 2 12h6a5 5 0 0 1 5 5v5" />
            <Path d="M38 21.8a10 10 0 0 0 8-9.8h-6a5 5 0 0 0-5 5v5" />
            <Path d="M23 17C22 11 19 1 9 1 4 1 3 3 3 3c12 1 11 15 11 15" />
            <Path d="M25 17c1-6 4-16 14-16 5 0 6 2 6 2-12 1-11 15-11 15" />
          </G>
        </Svg>
      );

    case 'aquarius':
      return (
        <Svg width={size} height={size} viewBox="4 11 40 26" fill="none">
          <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M6 14C9 11 12 11 15 14C18 17 21 17 24 14C27 11 30 11 33 14C36 17 39 17 42 14" />
            <Path d="M6 24C9 21 12 21 15 24C18 27 21 27 24 24C27 21 30 21 33 24C36 27 39 27 42 24" />
            <Path d="M6 34C9 31 12 31 15 34C18 37 21 37 24 34C27 31 30 31 33 34C36 37 39 37 42 34" />
          </G>
        </Svg>
      );

    case 'pisces':
      return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <G stroke={color} strokeMiterlimit={10} strokeWidth={2}>
            <Path strokeLinecap="square" d="M13 37s9-7.75 9-19a16.1 16.1 0 0 0-9-15 16.1 16.1 0 0 0-9 15c0 11.25 9 19 9 19z" />
            <Path fill={color} stroke="none" transform="rotate(180 9 41)" d="M13 36v2a8 8 0 0 1-8 8v-2a8 8 0 0 1 8-8z" />
            <Path fill={color} stroke="none" d="M13 36a8 8 0 0 1 8 8v2a8 8 0 0 1-8-8v-2z" />
            <Path fill={color} stroke="none" d="M43 2v2a8 8 0 0 1-8 8v-2a8 8 0 0 1 8-8z" />
            <Path fill={color} stroke="none" transform="rotate(180 31 7)" d="M27 2a8 8 0 0 1 8 8v2a8 8 0 0 1-8-8V2z" />
            <Circle cx={11} cy={11} r={2} fill={color} stroke="none" />
            <Path d="M4.151 15.651a9.994 9.994 0 0 0 17.7 0" />
            <Path fill={color} stroke="none" d="M3 18v12h5c-3-5-4-12-4-12z" />
            <Path strokeLinecap="square" d="M35 11s-9 7.75-9 19a16.1 16.1 0 0 0 9 15 16.1 16.1 0 0 0 9-15c0-11.25-9-19-9-19z" />
            <Circle cx={37} cy={37} r={2} fill={color} stroke="none" />
            <Path d="M43.849 32.349a9.994 9.994 0 0 0-17.7 0" />
            <Path fill={color} stroke="none" d="M45 30V18h-5c3 5 4 12 4 12z" />
          </G>
        </Svg>
      );

    default:
      return null;
  }
}

// ─── Zodiac sign metadata ─────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  { key: 'aries',       name: 'Aries',       dates: 'Mar 21 – Apr 19' },
  { key: 'taurus',      name: 'Taurus',      dates: 'Apr 20 – May 20' },
  { key: 'gemini',      name: 'Gemini',      dates: 'May 21 – Jun 20' },
  { key: 'cancer',      name: 'Cancer',      dates: 'Jun 21 – Jul 22' },
  { key: 'leo',         name: 'Leo',         dates: 'Jul 23 – Aug 22' },
  { key: 'virgo',       name: 'Virgo',       dates: 'Aug 23 – Sep 22' },
  { key: 'libra',       name: 'Libra',       dates: 'Sep 23 – Oct 22' },
  { key: 'scorpio',     name: 'Scorpio',     dates: 'Oct 23 – Nov 21' },
  { key: 'sagittarius', name: 'Sagittarius', dates: 'Nov 22 – Dec 21' },
  { key: 'capricorn',   name: 'Capricorn',   dates: 'Dec 22 – Jan 19' },
  { key: 'aquarius',    name: 'Aquarius',    dates: 'Jan 20 – Feb 18' },
  { key: 'pisces',      name: 'Pisces',      dates: 'Feb 19 – Mar 20' },
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

  const readingDateFormatted = horoscope.date
    ? new Date(horoscope.date + 'T12:00:00Z').toLocaleDateString('en-GB', {
        weekday: 'long',
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
      {/* Date / fallback notice — always shown, amber styling when fallback */}
      <View
        style={{
          backgroundColor: horoscope.isFallback
            ? 'rgba(245,158,11,0.15)'
            : 'rgba(200,16,46,0.08)',
          borderLeftWidth: 3,
          borderLeftColor: horoscope.isFallback ? '#F59E0B' : '#C8102E',
          margin: 16,
          padding: 12,
          borderRadius: 6,
        }}
      >
        {horoscope.isFallback ? (
          <Text style={{ color: '#F59E0B', fontSize: 13 }}>
            Showing {readingDateFormatted}'s reading — today's will be along shortly
          </Text>
        ) : (
          <Text style={{ color: '#C8102E', fontSize: 13, fontWeight: '600' }}>
            {readingDateFormatted}
          </Text>
        )}
      </View>

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
                <ZodiacIcon
                  sign={zodiac.key}
                  color={isSelected ? 'white' : colors.text}
                  size={28}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: isSelected ? 'rgba(255,255,255,0.9)' : colors.textMuted,
                    marginTop: 4,
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
            <ZodiacIcon sign={selectedSign} color="white" size={40} />
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
                  Lucky Colour: {currentSignData.luckyColour}
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
                  Lucky Number: {currentSignData.luckyNumber}
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
                  Lucky Day: {currentSignData.luckyDay}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
