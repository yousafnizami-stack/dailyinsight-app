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

function SectionHeading({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionHeading, { color: colors.text, borderBottomColor: colors.border }]}>
      {title}
    </Text>
  );
}

export default function PrivacyPolicyScreen({ navigation }: Props) {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.titleRow}>
          <View style={styles.titleAccent} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Privacy Policy</Text>
        </View>
        <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>
          Last updated: 27 July 2026
        </Text>

        {/* 1. Who We Are */}
        <SectionHeading title="1. Who We Are" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          Daily Insight ("we", "our", "us") operates the website <Text style={styles.bold}>dailyinsight.co.uk</Text>,
          a UK-based entertainment and Royal Family news publication. We are committed to protecting your privacy
          and handling your personal data in accordance with the UK General Data Protection Regulation (UK GDPR)
          and the Data Protection Act 2018.
        </Text>
        <Text style={[styles.body, { color: colors.text, marginTop: 10 }]}>
          For any privacy-related enquiries, please contact us at{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('mailto:contact@dailyinsight.co.uk')}
          >
            contact@dailyinsight.co.uk
          </Text>.
        </Text>

        {/* 2. Information We Collect */}
        <SectionHeading title="2. Information We Collect" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          We collect two types of information when you visit Daily Insight:
        </Text>
        <Text style={[styles.subHeading, { color: colors.text }]}>Automatically Collected Data</Text>
        {[
          'IP address and approximate geographic location',
          'Browser type and version',
          'Device type (mobile, tablet, desktop)',
          'Pages visited and time spent on each page',
          'Referring website or search query',
          'Date and time of your visit',
        ].map((item) => (
          <View key={item} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.textMuted }]}>{'\u2022'}</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
        <Text style={[styles.subHeading, { color: colors.text }]}>Information You Provide</Text>
        {[
          'Name and email address when you contact us via our contact form',
          'Any message content you submit',
        ].map((item) => (
          <View key={item} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.textMuted }]}>{'\u2022'}</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}

        {/* 3. How We Use Your Information */}
        <SectionHeading title="3. How We Use Your Information" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          We use the information we collect for the following purposes:
        </Text>
        {[
          { title: 'To deliver and improve our service:', body: 'Analysing how readers engage with our content helps us produce better articles.' },
          { title: 'To display personalised advertising:', body: 'We use Google AdSense to show relevant advertisements. This requires sharing certain data with Google.' },
          { title: 'To measure site performance:', body: 'Google Analytics 4 helps us understand traffic patterns and improve the site experience.' },
          { title: 'To respond to enquiries:', body: 'If you contact us, we use your details solely to reply to your message.' },
          { title: 'For security and fraud prevention:', body: 'Protecting the integrity of our site and our readers.' },
        ].map((item) => (
          <View key={item.title} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.textMuted }]}>{'\u2022'}</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>
              <Text style={styles.bold}>{item.title}</Text>{' '}{item.body}
            </Text>
          </View>
        ))}

        {/* 4. Cookies */}
        <SectionHeading title="4. Cookies" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          We use cookies — small text files stored on your device — to make our site work properly and to help
          us understand how you use it. By continuing to browse Daily Insight, you consent to the use of cookies
          as described in this policy.
        </Text>
        <View style={[styles.cookieTable, { borderColor: colors.border }]}>
          <View style={[styles.cookieHeaderRow, { backgroundColor: colors.card }]}>
            <Text style={[styles.cookieHeaderCell, { color: colors.text, flex: 1.2 }]}>Cookie</Text>
            <Text style={[styles.cookieHeaderCell, { color: colors.text, flex: 2.5 }]}>Purpose</Text>
            <Text style={[styles.cookieHeaderCell, { color: colors.text, flex: 1 }]}>Duration</Text>
          </View>
          {[
            { cookie: '_ga, _ga_*', purpose: 'Google Analytics — visitor tracking and analytics', duration: '2 years' },
            { cookie: '_gid', purpose: 'Google Analytics — distinguishes users', duration: '24 hours' },
            { cookie: 'IDE, DSID', purpose: 'Google AdSense — personalised advertising', duration: '1 year' },
            { cookie: 'NID, 1P_JAR', purpose: 'Google — ad preferences and security', duration: '6 months' },
          ].map((row, i) => (
            <View
              key={row.cookie}
              style={[
                styles.cookieDataRow,
                { backgroundColor: i % 2 === 0 ? 'transparent' : colors.card, borderTopColor: colors.border },
              ]}
            >
              <Text style={[styles.cookieCell, { color: colors.text, flex: 1.2 }]}>{row.cookie}</Text>
              <Text style={[styles.cookieCell, { color: colors.text, flex: 2.5 }]}>{row.purpose}</Text>
              <Text style={[styles.cookieCell, { color: colors.text, flex: 1 }]}>{row.duration}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.body, { color: colors.text, marginTop: 10 }]}>
          You can control and delete cookies via your browser settings. Disabling cookies may affect the
          functionality of some features on this site.
        </Text>

        {/* 5. Google AdSense */}
        <SectionHeading title="5. Google AdSense and Advertising" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          Daily Insight uses Google AdSense to display advertisements. Google, as a third-party vendor, uses
          cookies to serve ads based on your prior visits to this site and other sites on the internet.
        </Text>
        <Text style={[styles.body, { color: colors.text, marginTop: 10 }]}>
          Google's use of advertising cookies enables it and its partners to serve ads to you based on your
          visit to our site and/or other sites on the internet. You can opt out of personalised advertising by
          visiting{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://www.google.com/settings/ads')}
          >
            Google's Ads Settings
          </Text>.
        </Text>
        <Text style={[styles.body, { color: colors.text, marginTop: 10 }]}>
          For more information about how Google uses data from sites that use Google services, visit{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://policies.google.com/technologies/partner-sites')}
          >
            Google's privacy and terms
          </Text>.
        </Text>

        {/* 6. Google Analytics */}
        <SectionHeading title="6. Google Analytics" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          We use Google Analytics 4 to understand how visitors interact with Daily Insight. Google Analytics
          collects anonymised data about your visits, including pages viewed, time on site, and general location.
          This data is processed by Google in accordance with their privacy policy.
        </Text>
        <Text style={[styles.body, { color: colors.text, marginTop: 10 }]}>
          We have configured Google Analytics with IP anonymisation enabled. Your full IP address is never stored
          by Google Analytics. You can opt out of Google Analytics tracking by installing the{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://tools.google.com/dlpage/gaoptout')}
          >
            Google Analytics Opt-out Browser Add-on
          </Text>.
        </Text>

        {/* 7. Legal Basis */}
        <SectionHeading title="7. Legal Basis for Processing (UK GDPR)" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          We rely on the following legal bases to process your personal data:
        </Text>
        {[
          { title: 'Legitimate interests:', body: 'Analysing site traffic and improving content quality.' },
          { title: 'Consent:', body: 'For personalised advertising via Google AdSense, where required by law.' },
          { title: 'Contract:', body: 'To respond to your contact form enquiries.' },
        ].map((item) => (
          <View key={item.title} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.textMuted }]}>{'\u2022'}</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>
              <Text style={styles.bold}>{item.title}</Text>{' '}{item.body}
            </Text>
          </View>
        ))}

        {/* 8. Data Sharing */}
        <SectionHeading title="8. Data Sharing and Third Parties" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          We do not sell, trade, or rent your personal data to third parties. We share data only with:
        </Text>
        {[
          { title: 'Google LLC', body: '— for AdSense advertising and Analytics (data processed under Google\'s privacy policy)' },
          { title: 'Vercel Inc.', body: '— our website hosting provider (logs access data for security purposes)' },
          { title: 'Resend', body: '— email delivery service, used only when we send you a response to a contact form message' },
        ].map((item) => (
          <View key={item.title} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.textMuted }]}>{'\u2022'}</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>
              <Text style={styles.bold}>{item.title}</Text>{' '}{item.body}
            </Text>
          </View>
        ))}
        <Text style={[styles.body, { color: colors.text, marginTop: 10 }]}>
          Some of these providers may transfer data outside the UK/EEA. Where this occurs, appropriate
          safeguards (such as Standard Contractual Clauses) are in place.
        </Text>

        {/* 9. Data Retention */}
        <SectionHeading title="9. Data Retention" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          We retain personal data only for as long as necessary for the purposes described in this policy.
          Contact form submissions are retained for a maximum of 12 months. Analytics data is retained for
          26 months in Google Analytics. Server access logs are retained for 30 days.
        </Text>

        {/* 10. Your Rights */}
        <SectionHeading title="10. Your Rights Under UK GDPR" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          As a UK resident, you have the following rights regarding your personal data:
        </Text>
        {[
          { title: 'Right of access:', body: 'Request a copy of the personal data we hold about you.' },
          { title: 'Right to rectification:', body: 'Ask us to correct inaccurate data.' },
          { title: 'Right to erasure:', body: 'Request deletion of your personal data ("right to be forgotten").' },
          { title: 'Right to restriction:', body: 'Ask us to limit how we use your data.' },
          { title: 'Right to data portability:', body: 'Receive your data in a structured, machine-readable format.' },
          { title: 'Right to object:', body: 'Object to processing based on legitimate interests or for direct marketing.' },
          { title: 'Right to withdraw consent:', body: 'Where processing is based on consent, you may withdraw it at any time.' },
        ].map((item) => (
          <View key={item.title} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.textMuted }]}>{'\u2022'}</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>
              <Text style={styles.bold}>{item.title}</Text>{' '}{item.body}
            </Text>
          </View>
        ))}
        <Text style={[styles.body, { color: colors.text, marginTop: 10 }]}>
          To exercise any of these rights, please email{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('mailto:contact@dailyinsight.co.uk')}
          >
            contact@dailyinsight.co.uk
          </Text>. We will respond within 30 days.
        </Text>
        <Text style={[styles.body, { color: colors.text, marginTop: 10 }]}>
          You also have the right to lodge a complaint with the{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://ico.org.uk')}
          >
            Information Commissioner's Office (ICO)
          </Text>{' '}
          if you believe your data has been handled unlawfully.
        </Text>

        {/* 11. Children's Privacy */}
        <SectionHeading title="11. Children's Privacy" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          Daily Insight is not directed at children under the age of 13. We do not knowingly collect personal
          data from children. If you believe a child has provided us with personal information, please contact
          us immediately and we will delete it.
        </Text>

        {/* 12. Changes */}
        <SectionHeading title="12. Changes to This Policy" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal
          requirements. We will indicate the date of the latest revision at the top of this page. Continued
          use of Daily Insight after any changes constitutes your acceptance of the updated policy.
        </Text>

        {/* 13. Contact Us */}
        <SectionHeading title="13. Contact Us" colors={colors} />
        <Text style={[styles.body, { color: colors.text }]}>
          If you have any questions about this Privacy Policy or how we handle your data, please contact us:
        </Text>
        <View style={[styles.contactBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.bold, { color: colors.text }]}>Daily Insight</Text>
          <Text style={[styles.body, { color: colors.text, marginTop: 4 }]}>
            Email:{' '}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL('mailto:contact@dailyinsight.co.uk')}
            >
              contact@dailyinsight.co.uk
            </Text>
          </Text>
          <Text style={[styles.body, { color: colors.text, marginTop: 2 }]}>
            Website: dailyinsight.co.uk
          </Text>
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
  subHeading: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },
  body: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  bold: {
    fontFamily: 'SourceSerif4_600SemiBold',
    fontSize: 14,
  },
  link: {
    color: '#C8102E',
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingLeft: 4,
  },
  bullet: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
  },
  bulletText: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  cookieTable: {
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 12,
  },
  cookieHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cookieHeaderCell: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cookieDataRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  cookieCell: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  contactBox: {
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 6,
  },
});
