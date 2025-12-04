import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface FeatureLockBadgeProps {
  featureName: string;
  message?: string;
  onUpgradePress?: () => void;
  variant?: 'banner' | 'badge' | 'inline';
  showIcon?: boolean;
}

/**
 * FeatureLockBadge - Shows feature is locked for Free tier
 * Variants:
 * - banner: Full-width banner at top of screen
 * - badge: Compact badge for UI elements
 * - inline: Inline text with icon
 */
export const FeatureLockBadge: React.FC<FeatureLockBadgeProps> = ({
  featureName,
  message,
  onUpgradePress,
  variant = 'badge',
  showIcon = true,
}) => {
  const defaultMessage = `${featureName} is a Premium feature`;

  if (variant === 'banner') {
    return (
      <Surface style={styles.bannerContainer} elevation={2}>
        <View style={styles.bannerContent}>
          {showIcon && (
            <MaterialCommunityIcons
              name="lock"
              size={24}
              color={colors.primary}
            />
          )}
          <View style={styles.bannerTextContainer}>
            <Text variant="titleSmall" style={styles.bannerTitle}>
              {featureName} - Premium Only
            </Text>
            <Text variant="bodySmall" style={styles.bannerMessage}>
              {message || 'Upgrade to unlock this feature'}
            </Text>
          </View>
        </View>
        {onUpgradePress && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgradePress}
          >
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </Surface>
    );
  }

  if (variant === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        {showIcon && (
          <MaterialCommunityIcons
            name="lock-outline"
            size={16}
            color={colors.textSecondary}
          />
        )}
        <Text variant="bodySmall" style={styles.inlineText}>
          {message || defaultMessage}
        </Text>
        {onUpgradePress && (
          <TouchableOpacity onPress={onUpgradePress}>
            <Text style={styles.inlineUpgradeText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default: badge variant
  return (
    <TouchableOpacity
      style={styles.badgeContainer}
      onPress={onUpgradePress}
      disabled={!onUpgradePress}
    >
      {showIcon && (
        <MaterialCommunityIcons
          name="crown"
          size={16}
          color={colors.primary}
        />
      )}
      <Text variant="labelSmall" style={styles.badgeText}>
        Premium
      </Text>
    </TouchableOpacity>
  );
};

/**
 * UsageLimitBadge - Shows usage progress
 */
interface UsageLimitBadgeProps {
  used: number;
  limit: number;
  featureName: string;
  onUpgradePress?: () => void;
}

export const UsageLimitBadge: React.FC<UsageLimitBadgeProps> = ({
  used,
  limit,
  featureName,
  onUpgradePress,
}) => {
  const percentage = (used / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;

  return (
    <Surface style={styles.usageBadgeContainer} elevation={1}>
      <View style={styles.usageHeader}>
        <Text variant="labelMedium" style={styles.usageTitle}>
          {featureName} Today
        </Text>
        <Text
          variant="labelSmall"
          style={[
            styles.usageCount,
            isAtLimit && styles.usageCountLimit,
          ]}
        >
          {used}/{limit}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isAtLimit
                ? colors.error
                : isNearLimit
                ? colors.warning
                : colors.primary,
            },
          ]}
        />
      </View>

      {/* Warning or Upgrade Message */}
      {isNearLimit && (
        <View style={styles.warningContainer}>
          <MaterialCommunityIcons
            name={isAtLimit ? 'alert-circle' : 'information'}
            size={14}
            color={isAtLimit ? colors.error : colors.warning}
          />
          <Text variant="bodySmall" style={styles.warningText}>
            {isAtLimit
              ? 'Limit reached. Upgrade for unlimited access.'
              : 'Almost at your daily limit.'}
          </Text>
        </View>
      )}

      {onUpgradePress && isAtLimit && (
        <TouchableOpacity
          style={styles.smallUpgradeButton}
          onPress={onUpgradePress}
        >
          <MaterialCommunityIcons
            name="crown"
            size={16}
            color="white"
          />
          <Text style={styles.smallUpgradeButtonText}>
            Upgrade Now
          </Text>
        </TouchableOpacity>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  // Banner variant
  bannerContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerMessage: {
    color: colors.textSecondary,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F5FC', // Light blue variant
    padding: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  // Badge variant
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F5FC', // Light blue variant
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  inlineText: {
    color: colors.textSecondary,
  },
  inlineUpgradeText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Usage Limit Badge
  usageBadgeContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageTitle: {
    fontWeight: '600',
  },
  usageCount: {
    color: colors.textSecondary,
  },
  usageCountLimit: {
    color: colors.error,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  warningText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  smallUpgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  smallUpgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
