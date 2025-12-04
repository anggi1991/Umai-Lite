import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CustomButton } from '../src/components/ui/CustomButton';
import { CustomCard } from '../src/components/ui/CustomCard';
import { useTranslation } from '../src/hooks/useTranslation';
import theme from '../src/theme';

export default function PrivacyPolicyScreen() {
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
          title={t('privacy.backButton')}
          variant="tertiary"
          onPress={() => router.back()}
          textStyle={{ color: theme.colors.white }}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          {t('privacy.title')}
        </Text>
        <View style={{ width: 100 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <CustomCard style={styles.section} animated>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('privacy.section1Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.section1Intro')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section1Point1')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section1Point2')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section1Point3')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section1Point4')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section1Point5')}</Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={100}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('privacy.section2Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.section2Intro')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section2Point1')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section2Point2')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section2Point3')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section2Point4')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section2Point5')}</Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={200}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('privacy.section3Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.section3Intro')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section3Point1')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section3Point2')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section3Point3')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section3Point4')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section3Point5')}</Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={300}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('privacy.section4Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.section4Intro')}
          </Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section4Point1')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section4Point2')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section4Point3')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section4Point4')}</Text>
          <Text style={styles.bulletPoint}>• {t('privacy.section4Point5')}</Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={400}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('privacy.section5Title')}
          </Text>
          <Text style={styles.paragraph}>
            • {t('privacy.section5Point1')}{'\n'}
            • {t('privacy.section5Point2')}{'\n'}
            • {t('privacy.section5Point3')}{'\n'}
            • {t('privacy.section5Point4')}
          </Text>
        </CustomCard>

        <CustomCard style={styles.section} animated delay={500}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('privacy.section8Title')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.section8Intro')}
          </Text>
          <Text style={styles.contactInfo}>
            {t('privacy.section8Content')}
          </Text>
        </CustomCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('privacy.lastUpdated')}{'\n'}
            {t('privacy.version')}
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
