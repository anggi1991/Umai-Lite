import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { useTranslation } from '../../hooks/useTranslation';
import { CustomCard } from '../ui/CustomCard';
import theme from '../../theme';

interface AITipsSectionProps {
  dailyTip: string | null;
  tipLoading: boolean;
  onGenerateTip: () => Promise<void>;
  usageStatus: { used: number; limit: number };
  onUpgradePress: () => void;
  onWatchAd?: () => void; // New prop for watching ad
}

interface StaticTip {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

// Moved to translation function below to support i18n
const getStaticTips = (t: any): StaticTip[] => [
  {
    id: '1',
    emoji: '😴',
    title: t('tips.sleepSchedule'),
    description: t('tips.sleepScheduleDesc'),
  },
  {
    id: '2',
    emoji: '🤸',
    title: t('tips.tummyTime'),
    description: t('tips.tummyTimeDesc'),
  },
  {
    id: '3',
    emoji: '💕',
    title: t('tips.bondingTime'),
    description: t('tips.bondingTimeDesc'),
  },
];

export function AITipsSection({ 
  dailyTip, 
  tipLoading, 
  onGenerateTip, 
  usageStatus,
  onUpgradePress,
  onWatchAd
}: AITipsSectionProps) {
  const { t } = useTranslation();
  const hasReachedLimit = usageStatus.used >= usageStatus.limit;
  const STATIC_TIPS = getStaticTips(t);
  
  return (
    <CustomCard style={styles.card} animated delay={300}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>💡 {t('dashboard.aiTips')}</Text>
          {/* Usage indicator */}
          <Chip 
            mode="outlined" 
            style={styles.usageChip}
            textStyle={styles.usageText}
            onPress={hasReachedLimit ? onUpgradePress : undefined}
          >
            {usageStatus.used}/{usageStatus.limit} tips
          </Chip>
        </View>
        <Button 
          mode="contained" 
          onPress={onGenerateTip} 
          loading={tipLoading} 
          disabled={tipLoading || hasReachedLimit}
          buttonColor={theme.colors.babyBlue}
          textColor={theme.colors.white}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          compact
        >
          {t('dashboard.generateTip')}
        </Button>
      </View>

      {/* AI Generated Tip (if available) */}
      {dailyTip && dailyTip !== t('tips.tapRefresh') && (
        <View style={[styles.tipContainer, styles.aiTipContainer]}>
          <Text variant="labelSmall" style={styles.aiLabel}>{t('dashboard.generatedByAI')}</Text>
          <Text variant="bodyMedium" style={styles.tipText}>{dailyTip}</Text>
        </View>
      )}

      {/* Static Tips - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STATIC_TIPS.map((tip) => (
          <View key={tip.id} style={styles.staticTipCard}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <Text variant="titleSmall" style={styles.tipTitle}>
              {tip.title}
            </Text>
            <Text variant="bodySmall" style={styles.tipDescription}>
              {tip.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Upgrade prompt or Watch Ad if limit reached */}
      {hasReachedLimit && (
        <View style={styles.upgradePrompt}>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" style={styles.upgradeText}>
              {t('subscription.upgradeForUnlimitedTips')}
            </Text>
            {/* Watch Ad Option */}
            {onWatchAd && (
              <Button 
                mode="outlined" 
                onPress={onWatchAd}
                textColor={theme.colors.primary}
                style={{ marginTop: 8, borderColor: theme.colors.primary }}
                icon="play-circle-outline"
                compact
              >
                {t('common.watchAdForTip')}
              </Button>
            )}
          </View>
          <Button 
            mode="text" 
            onPress={onUpgradePress}
            textColor={theme.colors.primary}
            compact
          >
            {t('subscription.upgrade')}
          </Button>
        </View>
      )}
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: theme.spacing.md,
    marginBottom: 0,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  usageChip: {
    height: 24,
    backgroundColor: theme.colors.babyBlue + '20',
  },
  usageText: {
    fontSize: 11,
    lineHeight: 14,
  },
  tipContainer: {
    backgroundColor: theme.colors.babyBlue + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.medium,
    marginBottom: theme.spacing.md,
  },
  aiTipContainer: {
    backgroundColor: theme.colors.softPink + '20',
    borderWidth: 1,
    borderColor: theme.colors.softPink,
  },
  aiLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    lineHeight: 22,
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    paddingRight: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  staticTipCard: {
    width: 180,
    backgroundColor: theme.colors.babyBlue + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.medium,
    marginRight: theme.spacing.sm,
  },
  tipEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  tipTitle: {
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  tipDescription: {
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  upgradePrompt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.accent + '10',
    borderRadius: theme.borders.radius.small,
  },
  upgradeText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  buttonContent: {
    paddingHorizontal: theme.spacing.xs,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
