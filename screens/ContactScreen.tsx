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

export default function ContactScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background : '#C8102E' }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.background : '#C8102E' }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingAccent} />
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Contact Us</Text>
        </View>

        <Text style={[styles.intro, { color: colors.text }]}>
          Have a news tip, press enquiry, or feedback? We'd love to hear from you. Drop us a message
          and we'll get back to you as soon as possible.
        </Text>

        {/* Email box */}
        <Pressable
          onPress={() => Linking.openURL('mailto:contact@dailyinsight.co.uk')}
          style={({ pressed }) => [
            styles.emailBox,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.emailIconWrap}>
            <Ionicons name="mail" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.emailLabel, { color: colors.textMuted }]}>Email us directly</Text>
            <Text style={styles.emailAddress}>contact@dailyinsight.co.uk</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {/* Subject options */}
        <View style={[styles.subjectBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.subjectHeading, { color: colors.text }]}>We can help with:</Text>
          {[
            'News tips',
            'Press enquiries',
            'Advertising',
            'Correction requests',
            'General feedback',
          ].map((item) => (
            <View key={item} style={styles.subjectRow}>
              <Ionicons name="checkmark" size={16} color="#C8102E" style={{ marginRight: 10 }} />
              <Text style={[styles.subjectItem, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.privacyNote, { color: colors.textMuted }]}>
          We will only use your details to respond to your message, in accordance with our Privacy Policy.
          We aim to respond within 2 working days.
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeadingAccent: {
    width: 4,
    height: 26,
    backgroundColor: '#C8102E',
    marginRight: 12,
    borderRadius: 2,
  },
  sectionHeading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
  },
  intro: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  emailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C8102E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailLabel: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  emailAddress: {
    fontFamily: 'SourceSerif4_600SemiBold',
    fontSize: 15,
    color: '#C8102E',
  },
  subjectBox: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  subjectHeading: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectItem: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  privacyNote: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
});
