import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  Card,
  Divider,
  ActivityIndicator,
  RadioButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getSubscriptionStatus,
  getAvailableTiers,
  getPricing,
  upgradeTier,
  startTrial,
  cancelSubscription,
  reactivateSubscription,
  SubscriptionStatusInfo,
  SubscriptionTierInfo,
} from '../../services/subscriptionService';

/**
 * SubscriptionScreen - Manage subscription and view pricing
 */
export const SubscriptionScreen: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<SubscriptionStatusInfo | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTierInfo[]>([]);
  const [selectedTier, setSelectedTier] = useState<'premium' | 'family'>('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const pricing = getPricing();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [statusData, tiersData] = await Promise.all([
        getSubscriptionStatus(),
        getAvailableTiers(),
      ]);
      setStatus(statusData);
      setTiers(tiersData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setUpgrading(true);
      const success = await startTrial(3);
      if (success) {
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Error starting trial:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      const checkoutUrl = await upgradeTier(selectedTier, billingPeriod);
      // TODO: Navigate to checkout (RevenueCat)
      console.log('Checkout URL:', checkoutUrl);
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setUpgrading(true);
      await cancelSubscription();
      await loadSubscriptionData();
      // Show success message (could use a toast/snackbar component)
      console.log('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      // Show error message to user
      Alert.alert('Error', 'Gagal membatalkan langganan. Silakan coba lagi.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      const success = await reactivateSubscription();
      if (success) {
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentTierInfo = tiers.find((t) => t.id === status?.tier);
  const isFreeTier = status?.tier === 'free';
  const isPremiumOrFamily = status?.tier === 'premium' || status?.tier === 'family';

  return (
    <ScrollView style={styles.container}>
      {/* Current Plan Section */}
      {currentTierInfo && (
        <Surface style={styles.currentPlanCard} elevation={2}>
          <View style={styles.currentPlanHeader}>
            <View>
              <Text variant="labelMedium" style={styles.currentPlanLabel}>
                {t('subscription.currentPlan')}
              </Text>
              <Text variant="headlineSmall" style={styles.currentPlanTitle}>
                {currentTierInfo.name}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={isPremiumOrFamily ? 'crown' : 'account'}
              size={48}
              color={isPremiumOrFamily ? colors.secondary : colors.textSecondary}
            />
          </View>

          {status?.isActive && status.daysRemaining > 0 && (
            <View style={styles.expiryInfo}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={16}
                color={colors.textSecondary}
              />
              <Text variant="bodySmall" style={styles.expiryText}>
                {status.status === 'trialing'
                  ? t('subscription.trialEndsIn', { days: status.daysRemaining.toString() })
                  : t('subscription.renewsIn', { days: status.daysRemaining.toString() })}
              </Text>
            </View>
          )}

          {status?.cancelAtPeriodEnd && (
            <View style={styles.warningBanner}>
              <MaterialCommunityIcons
                name="alert"
                size={20}
                color={colors.warning}
              />
              <Text variant="bodySmall" style={styles.warningText}>
                {t('subscription.willEndOn', { date: new Date(status.nextBillingDate!).toLocaleDateString() })}
              </Text>
            </View>
          )}
        </Surface>
      )}

      {/* Free Tier - Show Trial CTA */}
      {isFreeTier && (
        <Card style={styles.trialCard}>
          <Card.Content>
            <View style={styles.trialHeader}>
              <MaterialCommunityIcons
                name="star-circle"
                size={48}
                color={colors.primary}
              />
              <Text variant="headlineSmall" style={styles.trialTitle}>
                {t('subscription.tryPremiumFree')}
              </Text>
              <Text variant="bodyMedium" style={styles.trialSubtitle}>
                {t('subscription.trialDescription')}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={handleStartTrial}
              loading={upgrading}
              disabled={upgrading}
              style={styles.trialButton}
            >
              {t('subscription.startFreeTrial')}
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Billing Period Toggle */}
      {isFreeTier && (
        <View style={styles.billingToggle}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('subscription.chooseYourPlan')}
          </Text>
          <View style={styles.billingButtons}>
            <TouchableOpacity
              style={[
                styles.billingButton,
                billingPeriod === 'monthly' && styles.billingButtonActive,
              ]}
              onPress={() => setBillingPeriod('monthly')}
            >
              <Text
                style={[
                  styles.billingButtonText,
                  billingPeriod === 'monthly' && styles.billingButtonTextActive,
                ]}
              >
                {t('subscription.monthly')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.billingButton,
                billingPeriod === 'yearly' && styles.billingButtonActive,
              ]}
              onPress={() => setBillingPeriod('yearly')}
            >
              <Text
                style={[
                  styles.billingButtonText,
                  billingPeriod === 'yearly' && styles.billingButtonTextActive,
                ]}
              >
                {t('subscription.yearly')}
              </Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{t('subscription.save15')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pricing Cards */}
      {isFreeTier && (
        <View style={styles.pricingSection}>
          {/* Premium Plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedTier === 'premium' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedTier('premium')}
          >
            <RadioButton
              value="premium"
              status={selectedTier === 'premium' ? 'checked' : 'unchecked'}
              color={colors.primary}
            />
            <View style={styles.pricingCardContent}>
              <Text variant="titleLarge" style={styles.pricingTitle}>
                {t('subscription.premiumPlan')}
              </Text>
              <Text variant="headlineSmall" style={styles.pricingPrice}>
                Rp{' '}
                {billingPeriod === 'monthly'
                  ? pricing.premium.monthly.toLocaleString()
                  : pricing.premium.yearly.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={styles.pricingPeriod}>
                /{billingPeriod === 'monthly' ? t('subscription.perMonth') : t('subscription.perYear')}
              </Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>✓ {t('subscription.unlimitedAITips')}</Text>
                <Text style={styles.featureItem}>✓ {t('subscription.unlimitedChat')}</Text>
                <Text style={styles.featureItem}>✓ {t('subscription.childProfiles', { count: '3' })}</Text>
                <Text style={styles.featureItem}>✓ {t('subscription.noAds')}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Family Plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedTier === 'family' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedTier('family')}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>{t('subscription.popular')}</Text>
            </View>
            <RadioButton
              value="family"
              status={selectedTier === 'family' ? 'checked' : 'unchecked'}
              color={colors.secondary}
            />
            <View style={styles.pricingCardContent}>
              <Text variant="titleLarge" style={styles.pricingTitle}>
                {t('subscription.familyPlan')}
              </Text>
              <Text variant="headlineSmall" style={styles.pricingPrice}>
                Rp{' '}
                {billingPeriod === 'monthly'
                  ? pricing.family.monthly.toLocaleString()
                  : pricing.family.yearly.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={styles.pricingPeriod}>
                /{billingPeriod === 'monthly' ? t('subscription.perMonth') : t('subscription.perYear')}
              </Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>✓ {t('subscription.allPremiumFeatures')}</Text>
                <Text style={styles.featureItem}>✓ {t('subscription.unlimitedProfiles')}</Text>
                <Text style={styles.featureItem}>✓ {t('subscription.storage50GB')}</Text>
                <Text style={styles.featureItem}>✓ {t('subscription.familySharing')}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleUpgrade}
            loading={upgrading}
            disabled={upgrading}
            style={styles.upgradeButton}
          >
            {billingPeriod === 'yearly' ? t('subscription.subscribeAndSave') : t('subscription.subscribeNow')}
          </Button>
        </View>
      )}

      {/* Manage Subscription (for Premium/Family users) */}
      {isPremiumOrFamily && (
        <View style={styles.manageSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('subscription.manageSubscription')}
          </Text>

          {status?.cancelAtPeriodEnd ? (
            <Button
              mode="contained"
              onPress={handleReactivate}
              style={styles.manageButton}
              icon="reload"
            >
              {t('subscription.reactivate')}
            </Button>
          ) : (
            <Button
              mode="outlined"
              onPress={handleCancelSubscription}
              style={styles.manageButton}
              textColor={colors.error}
              loading={upgrading}
              disabled={upgrading}
            >
              {t('subscription.cancelSubscription')}
            </Button>
          )}
        </View>
      )}

      {/* Features Comparison */}
      <View style={styles.comparisonSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('subscription.comparePlans')}
        </Text>
        <View style={styles.comparisonTable}>
          {tiers.map((tier) => (
            <Surface key={tier.id} style={styles.comparisonCard} elevation={1}>
              <Text variant="titleMedium" style={styles.comparisonTierName}>
                {tier.name}
              </Text>
              <Divider style={styles.comparisonDivider} />
              {tier.features.map((feature, index) => (
                <View key={index} style={styles.comparisonFeature}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text variant="bodySmall" style={styles.comparisonFeatureText}>
                    {t(feature)}
                  </Text>
                </View>
              ))}
            </Surface>
          ))}
        </View>
      </View>

      {/* Terms */}
      <Text variant="bodySmall" style={styles.termsText}>
        {t('subscription.terms')}
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
  currentPlanCard: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPlanLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  currentPlanTitle: {
    fontWeight: 'bold',
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  expiryText: {
    color: colors.textSecondary,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warning,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    color: colors.textPrimary,
  },
  trialCard: {
    margin: 16,
    backgroundColor: colors.surface,
  },
  trialHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  trialTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  trialSubtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  trialButton: {
    marginTop: 8,
  },
  billingToggle: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  billingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  billingButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  billingButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#E3F5FC',
  },
  billingButtonText: {
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  billingButtonTextActive: {
    color: colors.primary,
  },
  savingsBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  savingsText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pricingSection: {
    padding: 16,
  },
  pricingCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
  },
  pricingCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  pricingCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  pricingTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pricingPrice: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  pricingPeriod: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  featuresList: {
    gap: 4,
  },
  featureItem: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  upgradeButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  manageSection: {
    padding: 16,
  },
  manageButton: {
    marginTop: 8,
  },
  comparisonSection: {
    padding: 16,
  },
  comparisonTable: {
    gap: 12,
  },
  comparisonCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  comparisonTierName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comparisonDivider: {
    marginBottom: 12,
  },
  comparisonFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  comparisonFeatureText: {
    flex: 1,
    color: colors.textSecondary,
  },
  termsText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
    fontStyle: 'italic',
  },
});
