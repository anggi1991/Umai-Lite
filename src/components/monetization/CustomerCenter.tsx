/**
 * Customer Center Component
 * 
 * Provides subscription management UI using RevenueCat Customer Center
 * Allows users to manage subscriptions, view billing, and cancel/reactivate
 * 
 * @see https://www.revenuecat.com/docs/tools/customer-center
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, ActivityIndicator } from 'react-native-paper';
import RevenueCatUI from 'react-native-purchases-ui';
import { useRevenueCat } from '../../hooks/useRevenueCat';
import { restorePurchases } from '../../services/revenueCatService';
import { colors } from '../../theme/colors';
import { useTranslation } from '../../hooks/useTranslation';

export const CustomerCenter: React.FC = () => {
  const { t } = useTranslation();
  const { isPro, subscriptionStatus, isLoading, refresh } = useRevenueCat();
  const [actionLoading, setActionLoading] = useState(false);

  const handleOpenCustomerCenter = async () => {
    try {
      setActionLoading(true);
      await RevenueCatUI.presentCustomerCenter();
      
      // Refresh status after customer center is dismissed
      await refresh();
    } catch (error) {
      console.error('[CustomerCenter] Error opening:', error);
      Alert.alert(
        t('common.error'),
        t('subscription.customerCenterError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setActionLoading(true);
      await restorePurchases();
      
      Alert.alert(
        t('common.success'),
        t('subscription.purchasesRestored'),
        [{ text: t('common.ok') }]
      );
      
      await refresh();
    } catch (error) {
      console.error('[CustomerCenter] Restore error:', error);
      Alert.alert(
        t('common.error'),
        t('subscription.restoreFailed'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('subscription.loadingInfo')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{t('subscription.yourSubscription')}</Text>
          
          {isPro && subscriptionStatus ? (
            <>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>✨ {subscriptionStatus.tier.toUpperCase()}</Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.label}>{t('subscription.status')}:</Text>
                <Text style={styles.value}>
                  {subscriptionStatus.isActive ? `✅ ${t('subscription.active')}` : `❌ ${t('subscription.inactive')}`}
                </Text>
              </View>

              {subscriptionStatus.expiresAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>{t('subscription.validUntil')}:</Text>
                  <Text style={styles.value}>
                    {new Date(subscriptionStatus.expiresAt).toLocaleDateString('id-ID')}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.label}>{t('subscription.autoRenew')}:</Text>
                <Text style={styles.value}>
                  {subscriptionStatus.willRenew ? `✅ ${t('subscription.active')}` : `❌ ${t('subscription.inactive')}`}
                </Text>
              </View>

              {subscriptionStatus.isInTrial && subscriptionStatus.trialEndDate && (
                <View style={styles.trialBadge}>
                  <Text style={styles.trialText}>
                    {t('subscription.trialUntil', { 
                      date: new Date(subscriptionStatus.trialEndDate).toLocaleDateString('id-ID') 
                    })}
                  </Text>
                </View>
              )}

              <Button
                mode="outlined"
                onPress={handleOpenCustomerCenter}
                style={styles.button}
                disabled={actionLoading}
              >
                {t('subscription.manageSubscription')}
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.freeText}>
                {t('subscription.usingFreePlan')}
              </Text>
              
              <Text style={styles.description}>
                {t('subscription.upgradePremiumDesc')}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t('subscription.help')}</Text>
          
          <Button
            mode="text"
            onPress={handleRestorePurchases}
            style={styles.helpButton}
            disabled={actionLoading}
            icon="refresh"
          >
            {t('subscription.restorePurchases')}
          </Button>

          <Text style={styles.helpText}>
            {t('subscription.restorePurchasesHelp')}
          </Text>
        </Card.Content>
      </Card>

      <Text style={styles.footer}>
        {t('subscription.managedThrough')}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  divider: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  trialBadge: {
    backgroundColor: colors.info,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  trialText: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  freeText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  helpButton: {
    marginVertical: 8,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
  },
  footer: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 48,
  },
});
