/**
 * TodaysSummary Component
 * Displays today's activity statistics (Feeding, Sleep, Diapers)
 * Based on Figma HomeScreen design
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { CustomCard } from './CustomCard';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

interface TodayStat {
  icon: any; // Image source
  label: string;
  value: string;
  color: string;
}

interface TodaysSummaryProps {
  feedingCount?: number;
  sleepHours?: number;
  diaperCount?: number;
}

export const TodaysSummary: React.FC<TodaysSummaryProps> = ({ 
  feedingCount = 0,
  sleepHours = 0,
  diaperCount = 0,
}) => {
  const { t } = useTranslation();
  const stats: TodayStat[] = [
    {
      icon: require('../../assets/mascot/feeding.png'),
      label: t('dashboard.feedingLabel'),
      value: feedingCount.toString(),
      color: theme.colors.babyBlue,
    },
    {
      icon: require('../../assets/mascot/Sleep.png'),
      label: t('dashboard.sleepLabel'),
      value: `${sleepHours}${t('dashboard.hourShort')}`,
      color: '#8B7AAA',
    },
    {
      icon: require('../../assets/mascot/diaper.png'),
      label: t('dashboard.diaperLabel'),
      value: diaperCount.toString(),
      color: theme.colors.softPink,
    },
  ];

  return (
    <CustomCard style={styles.card}>
      <Text variant="titleMedium" style={styles.title}>
        {t('dashboard.todaySummary')}
      </Text>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
              <Image 
                source={stat.icon} 
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Text variant="headlineSmall" style={[styles.value, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text variant="bodySmall" style={styles.label}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </CustomCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  value: {
    fontWeight: 'bold',
  },
  label: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default TodaysSummary;
