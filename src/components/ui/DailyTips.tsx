/**
 * DailyTips Component
 * Horizontal scrollable cards dengan daily parenting tips
 * Based on Figma HomeScreen design
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { CustomCard } from './CustomCard';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

interface DailyTip {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image?: string;
}

const DAILY_TIPS_TEMPLATE: DailyTip[] = [
  {
    id: '1',
    titleKey: 'tips.sleepSchedule',
    descriptionKey: 'tips.sleepScheduleDesc',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
  },
  {
    id: '2',
    titleKey: 'tips.tummyTime',
    descriptionKey: 'tips.tummyTimeDesc',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400',
  },
  {
    id: '3',
    titleKey: 'tips.bondingTime',
    descriptionKey: 'tips.bondingTimeDesc',
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=400',
  },
];

export const DailyTips: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {t('tips.dailyTips')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DAILY_TIPS_TEMPLATE.map((tip, index) => (
          <TouchableOpacity
            key={tip.id}
            activeOpacity={0.8}
            style={[styles.tipCard, index === 0 && styles.firstCard]}
          >
            <CustomCard style={styles.card}>
              {tip.image && (
                <Image
                  source={{ uri: tip.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
              <View style={styles.content}>
                <Text variant="titleSmall" style={styles.tipTitle}>
                  {t(tip.titleKey)}
                </Text>
                <Text variant="bodySmall" style={styles.tipDescription}>
                  {t(tip.descriptionKey)}
                </Text>
              </View>
            </CustomCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  tipCard: {
    width: 280,
  },
  firstCard: {
    marginLeft: 0,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.babyBlue + '20',
  },
  content: {
    padding: theme.spacing.md,
  },
  tipTitle: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  tipDescription: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default DailyTips;
