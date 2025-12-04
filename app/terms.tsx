import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CustomButton } from '../src/components/ui/CustomButton';
import { CustomCard } from '../src/components/ui/CustomCard';
import { useTranslation } from '../src/hooks/useTranslation';
import theme from '../src/theme';

export default function TermsScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.babyBlue, theme.colors.softPink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <CustomButton
          title={t('terms.backButton')}
          variant="tertiary"
          onPress={() => router.back()}
          textStyle={{ color: theme.colors.white }}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          {t('terms.title')}
        </Text>
        <View style={{ width: 100 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <CustomCard style={styles.section} animated>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section1Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section1Intro')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={100}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section2Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section2Intro')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('terms.section2Point1')}</Text>
          <Text style={styles.bulletPoint}>• {t('terms.section2Point2')}</Text>
          <Text style={styles.bulletPoint}>• {t('terms.section2Point3')}</Text>
          <Text style={styles.bulletPoint}>• {t('terms.section2Point4')}</Text>
          <Text style={styles.bulletPoint}>• {t('terms.section2Point5')}</Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={200}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section3Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section3Intro')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('terms.section3Point1')}</Text>
          <Text style={styles.bulletPoint}>• {t('terms.section3Point2')}</Text>
          <Text style={styles.bulletPoint}>• {t('terms.section3Point3')}</Text>
          <Text style={styles.bulletPoint}>• {t('terms.section3Point4')}</Text>
          <Text style={styles.bulletPoint}>• {t('terms.section3Point5')}</Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={300}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section4Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section4Intro')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section4Point1')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section4Point2')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section4Point3')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section4Point4')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section4Point5')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={400}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section5Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section5Intro')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section5Point1')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section5Point2')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section5Point3')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section5Point4')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section5Point5')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={500}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section6Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section6Intro')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section6Point1')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section6Point2')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section6Point3')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section6Point4')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section6Point5')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={600}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section7Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section7Intro')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section7Point1')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section7Point2')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section7Point3')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section7Point4')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={700}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section8Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section8Intro')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section8Point1')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section8Point2')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section8Point3')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section8Point4')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section8Point5')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={800}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section9Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section9Intro')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section9Point1')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section9Point2')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section9Point3')}
          </Text>
          <Text style={styles.bulletPoint}>
            • {t('terms.section9Point4')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={900}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section10Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section10Intro')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={1000}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('terms.section11Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section11Intro')}
          </Text>
          <Text style={styles.contactInfo}>
            {t('terms.section11Content')}
          </Text>
        </CustomCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('terms.lastUpdated')}{'\n'}
            {t('terms.version')}{'\n\n'}
            {t('terms.footer')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  section: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
  },
  contactInfo: {
    fontSize: 15,
    lineHeight: 28,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.medium,
    marginTop: theme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
