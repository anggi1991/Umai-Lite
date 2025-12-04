import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  Card,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import {
  getReferralStats,
  shareReferral,
  ReferralStats,
} from '../../services/referralService';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * ReferralScreen - Share referral code and track rewards
 */
export const ReferralScreen: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      setLoading(true);
      const data = await getReferralStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!stats?.referral_code) return;

    try {
      setCopying(true);
      Clipboard.setString(stats.referral_code);
      // Show success toast (you can add Toast component)
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
      setCopying(false);
    }
  };

  const handleSharePlatform = async (
    platform: 'whatsapp' | 'instagram' | 'facebook' | 'copy'
  ) => {
    try {
      const message = await shareReferral(platform);

      if (platform === 'copy') {
        Clipboard.setString(message);
        return;
      }

      // For WhatsApp, Facebook - use Share API
      if (platform === 'whatsapp' || platform === 'facebook') {
        await Share.share({
          message,
        });
      }

      // For Instagram - copy to clipboard and show instruction
      if (platform === 'instagram') {
        Clipboard.setString(message);
        // Show toast: "Message copied! Paste in Instagram"
      }
    } catch (error) {
      console.error('Error sharing referral:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <Surface style={styles.heroSection} elevation={2}>
        <MaterialCommunityIcons
          name="gift"
          size={64}
          color={colors.primary}
        />
        <Text variant="headlineMedium" style={styles.heroTitle}>
          {t('referral.heroTitle')}
        </Text>
        <Text variant="bodyMedium" style={styles.heroSubtitle}>
          {t('referral.heroSubtitle')}
        </Text>
      </Surface>

      {/* Referral Code Card */}
      <Card style={styles.codeCard}>
        <Card.Content>
          <Text variant="labelMedium" style={styles.codeLabel}>
            {t('referral.yourCode')}
          </Text>
          <View style={styles.codeContainer}>
            <Text variant="headlineLarge" style={styles.codeText}>
              {stats?.referral_code || '--------'}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
            >
              <MaterialCommunityIcons
                name={copying ? 'check' : 'content-copy'}
                size={24}
                color={copying ? colors.success : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Share Buttons */}
      <View style={styles.shareSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('referral.shareVia')}
        </Text>
        <View style={styles.shareButtonsRow}>
          <TouchableOpacity
            style={[styles.shareButton, styles.whatsappButton]}
            onPress={() => handleSharePlatform('whatsapp')}
          >
            <MaterialCommunityIcons name="whatsapp" size={32} color="white" />
            <Text style={styles.shareButtonText}>{t('referral.whatsapp')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, styles.facebookButton]}
            onPress={() => handleSharePlatform('facebook')}
          >
            <MaterialCommunityIcons name="facebook" size={32} color="white" />
            <Text style={styles.shareButtonText}>{t('referral.facebook')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, styles.instagramButton]}
            onPress={() => handleSharePlatform('instagram')}
          >
            <MaterialCommunityIcons name="instagram" size={32} color="white" />
            <Text style={styles.shareButtonText}>{t('referral.instagram')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, styles.copyLinkButton]}
            onPress={() => handleSharePlatform('copy')}
          >
            <MaterialCommunityIcons name="link" size={32} color="white" />
            <Text style={styles.shareButtonText}>{t('referral.copyLink')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('referral.yourRewards')}
        </Text>

        <View style={styles.statsGrid}>
          <Surface style={styles.statCard} elevation={1}>
            <MaterialCommunityIcons
              name="account-multiple"
              size={32}
              color={colors.primary}
            />
            <Text variant="headlineMedium" style={styles.statValue}>
              {stats?.total_referrals || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {t('referral.totalInvites')}
            </Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <MaterialCommunityIcons
              name="account-check"
              size={32}
              color={colors.success}
            />
            <Text variant="headlineMedium" style={styles.statValue}>
              {stats?.completed_referrals || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {t('referral.successful')}
            </Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <MaterialCommunityIcons
              name="gift-outline"
              size={32}
              color={colors.secondary}
            />
            <Text variant="headlineMedium" style={styles.statValue}>
              {stats?.total_rewards_earned || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {t('referral.rewardsEarned')}
            </Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={32}
              color={colors.warning}
            />
            <Text variant="headlineMedium" style={styles.statValue}>
              {stats?.pending_referrals || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {t('referral.pending')}
            </Text>
          </Surface>
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* How It Works */}
      <View style={styles.howItWorksSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('referral.howItWorks')}
        </Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text variant="titleSmall" style={styles.stepTitle}>
              {t('referral.step1Title')}
            </Text>
            <Text variant="bodySmall" style={styles.stepDescription}>
              {t('referral.step1Desc')}
            </Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text variant="titleSmall" style={styles.stepTitle}>
              {t('referral.step2Title')}
            </Text>
            <Text variant="bodySmall" style={styles.stepDescription}>
              {t('referral.step2Desc')}
            </Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text variant="titleSmall" style={styles.stepTitle}>
              {t('referral.step3Title')}
            </Text>
            <Text variant="bodySmall" style={styles.stepDescription}>
              {t('referral.step3Desc')}
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <Button
        mode="contained"
        onPress={() => handleSharePlatform('whatsapp')}
        style={styles.ctaButton}
        icon="share-variant"
      >
        {t('referral.shareNow')}
      </Button>

      {/* Terms */}
      <Text variant="bodySmall" style={styles.termsText}>
        {t('referral.terms')}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  heroSubtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: 16,
  },
  codeCard: {
    margin: 16,
    backgroundColor: 'white',
  },
  codeLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  codeText: {
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 4,
  },
  copyButton: {
    padding: 8,
  },
  shareSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  copyLinkButton: {
    backgroundColor: colors.primary,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    marginVertical: 16,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  howItWorksSection: {
    padding: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ctaButton: {
    margin: 16,
    paddingVertical: 8,
  },
  termsText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
    fontStyle: 'italic',
  },
});
