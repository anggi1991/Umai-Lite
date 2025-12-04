/**
 * RevenueCat Paywall Component
 * 
 * Displays subscription offerings with RevenueCat's pre-built Paywall UI
 * Handles purchase flow, restoration, and customer info updates
 * 
 * @see https://www.revenuecat.com/docs/tools/paywalls
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  getSubscriptionStatus,
  type ProductInfo,
  type SubscriptionStatus,
} from '../../services/revenueCatService';
import { colors } from '../../theme/colors';
import { useTranslation } from '../../hooks/useTranslation';

interface RevenueCatPaywallProps {
  onPurchaseComplete?: () => void;
  onDismiss?: () => void;
  displayCloseButton?: boolean;
}

export const RevenueCatPaywall: React.FC<RevenueCatPaywallProps> = ({
  onPurchaseComplete,
  onDismiss,
  displayCloseButton = true,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [hasOfferings, setHasOfferings] = useState(false);

  useEffect(() => {
    checkOfferings();
  }, []);

  const checkOfferings = async () => {
    try {
      const offerings = await getOfferings();
      setHasOfferings(offerings !== null && offerings.current !== null);
    } catch (error) {
      console.error('[Paywall] Error checking offerings:', error);
      setHasOfferings(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePresentPaywall = async () => {
    try {
      setLoading(true);

      const result = await RevenueCatUI.presentPaywall({
        displayCloseButton,
      });

      console.log('[Paywall] Result:', result);

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          Alert.alert(
            t('subscription.congratulations'),
            t('subscription.subscriptionActivated'),
            [{ text: t('common.ok'), onPress: onPurchaseComplete }]
          );
          break;

        case PAYWALL_RESULT.CANCELLED:
          console.log('[Paywall] User cancelled');
          onDismiss?.();
          break;

        case PAYWALL_RESULT.ERROR:
          Alert.alert(
            t('common.error'),
            t('subscription.purchaseFailed'),
            [{ text: t('common.ok') }]
          );
          break;

        case PAYWALL_RESULT.NOT_PRESENTED:
          Alert.alert(
            t('subscription.notAvailable'),
            t('subscription.paywallNotAvailable'),
            [{ text: t('common.ok') }]
          );
          break;
      }
    } catch (error) {
      console.error('[Paywall] Error presenting:', error);
      Alert.alert(
        t('common.error'),
        t('subscription.openPaywallFailed'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      const customerInfo = await restorePurchases();

      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;

      if (hasActiveSubscription) {
        Alert.alert(
          t('common.success'),
          t('subscription.purchaseRestored'),
          [{ text: t('common.ok'), onPress: onPurchaseComplete }]
        );
      } else {
        Alert.alert(
          t('subscription.noPurchases'),
          t('subscription.noPurchasesFound'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('[Paywall] Restore error:', error);
      Alert.alert(
        t('common.error'),
        t('subscription.restoreFailed'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('subscription.loadingSubscription')}</Text>
      </View>
    );
  }

  if (!hasOfferings) {
    return (
      <Surface style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('subscription.notAvailable')}</Text>
        <Text style={styles.errorText}>
          {t('subscription.subscriptionNotAvailable')}
        </Text>
        {onDismiss && (
          <Button mode="contained" onPress={onDismiss} style={styles.button}>
            {t('common.close')}
          </Button>
        )}
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>{t('subscription.upgradeToPremium')}</Text>
      <Text style={styles.subtitle}>
        {t('subscription.unlimitedAccess')}
      </Text>

      <Button
        mode="contained"
        onPress={handlePresentPaywall}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        disabled={loading}
      >
        {t('subscription.viewPlans')}
      </Button>

      <Button
        mode="text"
        onPress={handleRestorePurchases}
        style={styles.restoreButton}
        disabled={loading}
      >
        {t('subscription.restorePurchases')}
      </Button>

      {onDismiss && (
        <Button mode="text" onPress={onDismiss} style={styles.closeButton}>
          {t('subscription.notNow')}
        </Button>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.error,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    marginTop: 8,
  },
  closeButton: {
    marginTop: 16,
  },
});
