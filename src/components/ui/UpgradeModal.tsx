import React from 'react';
import { Modal, Portal, Button, Text, Divider, List } from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../../hooks/useTranslation';

interface UpgradeModalProps {
  visible: boolean;
  onDismiss: () => void;
  onUpgrade: (tier: 'premium' | 'family') => void;
  currentUsage?: {
    feature: string;
    used: number;
    limit: number;
  };
  source?: 'ai_tips' | 'chat' | 'media' | 'children' | 'general';
}

/**
 * UpgradeModal - Paywall component
 * Shows when user hits Free tier limits
 */
export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  visible,
  onDismiss,
  onUpgrade,
  currentUsage,
  source = 'general',
}) => {
  const { t } = useTranslation();
  
  const getTitle = () => {
    switch (source) {
      case 'ai_tips':
        return t('upgrade.aiTipsLimitTitle');
      case 'chat':
        return t('upgrade.chatLimitTitle');
      case 'media':
        return t('upgrade.storageLimitTitle');
      case 'children':
        return t('upgrade.childProfileLimitTitle');
      default:
        return t('upgrade.defaultTitle');
    }
  };

  const getMessage = () => {
    switch (source) {
      case 'ai_tips':
        return t('upgrade.aiTipsLimitMessage', { used: currentUsage?.used || 3, limit: currentUsage?.limit || 3 });
      case 'chat':
        return t('upgrade.chatLimitMessage', { used: currentUsage?.used || 10, limit: currentUsage?.limit || 10 });
      case 'media':
        return t('upgrade.storageLimitMessage');
      case 'children':
        return t('upgrade.childProfileLimitMessage');
      default:
        return t('upgrade.defaultMessage');
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="crown"
              size={48}
              color={colors.primary}
            />
            <Text variant="headlineMedium" style={styles.title}>
              {getTitle()}
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              {getMessage()}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Premium Plan */}
          <View style={styles.planContainer}>
            <View style={styles.planHeader}>
              <Text variant="titleLarge" style={styles.planTitle}>
                {t('upgrade.premiumPlan')}
              </Text>
              <View style={styles.priceContainer}>
                <Text variant="headlineSmall" style={styles.price}>
                  {t('upgrade.premiumPrice')}
                </Text>
                <Text variant="bodySmall" style={styles.priceLabel}>
                  {t('upgrade.perMonth')}
                </Text>
              </View>
            </View>

            <List.Section>
              <List.Item
                title={t('upgrade.unlimitedAITips')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.unlimitedChatMessages')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.upTo3ChildProfiles')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.storage10GB')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.noAds')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.prioritySupport')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
            </List.Section>

            <Button
              mode="contained"
              onPress={() => onUpgrade('premium')}
              style={styles.upgradeButton}
              labelStyle={styles.upgradeButtonLabel}
            >
              {t('upgrade.upgradeToPremiumBtn')}
            </Button>
          </View>

          <Divider style={styles.divider} />

          {/* Family Plan */}
          <View style={styles.planContainer}>
            <View style={styles.planHeader}>
              <View style={styles.familyTitleContainer}>
                <Text variant="titleLarge" style={styles.planTitle}>
                  {t('upgrade.familyPlan')}
                </Text>
                <View style={styles.popularBadge}>
                  <Text variant="labelSmall" style={styles.popularText}>
                    {t('upgrade.popular')}
                  </Text>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text variant="headlineSmall" style={styles.price}>
                  {t('upgrade.familyPrice')}
                </Text>
                <Text variant="bodySmall" style={styles.priceLabel}>
                  {t('upgrade.perMonth')}
                </Text>
              </View>
            </View>

            <List.Section>
              <List.Item
                title={t('upgrade.allPremiumFeatures')}
                left={() => <MaterialCommunityIcons name="star" size={24} color={colors.secondary} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.unlimitedChildProfiles')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.storage50GB')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.familySharing')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.customAIPersona')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
              <List.Item
                title={t('upgrade.exportAllData')}
                left={() => <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />}
                titleStyle={styles.featureText}
              />
            </List.Section>

            <Button
              mode="contained"
              onPress={() => onUpgrade('family')}
              style={[styles.upgradeButton, styles.familyButton]}
              labelStyle={styles.upgradeButtonLabel}
            >
              {t('upgrade.upgradeToFamilyBtn')}
            </Button>
          </View>

          {/* Trial Info */}
          <View style={styles.trialInfo}>
            <MaterialCommunityIcons
              name="information"
              size={16}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.trialText}>
              {t('upgrade.trialInfo')}
            </Text>
          </View>

          {/* Close Button */}
          <Button
            mode="text"
            onPress={onDismiss}
            style={styles.closeButton}
          >
            {t('upgrade.maybeLater')}
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: 16,
  },
  divider: {
    marginVertical: 16,
  },
  planContainer: {
    marginBottom: 8,
  },
  planHeader: {
    marginBottom: 12,
  },
  familyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planTitle: {
    fontWeight: 'bold',
  },
  popularBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    color: 'white',
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  price: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceLabel: {
    color: colors.textSecondary,
    marginLeft: 4,
  },
  featureText: {
    fontSize: 14,
  },
  upgradeButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  familyButton: {
    backgroundColor: colors.secondary,
  },
  upgradeButtonLabel: {
    paddingVertical: 4,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  trialText: {
    color: colors.textSecondary,
  },
  closeButton: {
    marginTop: 8,
  },
});
