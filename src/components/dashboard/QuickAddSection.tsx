import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { CustomCard } from '../ui/CustomCard';
import { useTranslation } from '../../hooks/useTranslation';
import { ActivityType } from '../../types/database';
import theme from '../../theme';
import { router } from 'expo-router';
import { CustomButton } from '../ui/CustomButton';

const activityIcons = {
  feeding: require('../../assets/mascot/feeding.png'),
  sleep: require('../../assets/mascot/Sleep.png'),
  diaper: require('../../assets/mascot/diaper.png'),
  mood: require('../../assets/mascot/Mood.png'),
};

interface QuickAddSectionProps {
  onQuickAdd: (type: ActivityType) => void;
  hasChildren: boolean;
}

interface ActivityButton {
  type: ActivityType;
  label: string;
  icon: any;
  color: string;
}

export function QuickAddSection({ onQuickAdd, hasChildren }: QuickAddSectionProps) {
  const { t } = useTranslation();
  
  const activities: ActivityButton[] = [
    {
      type: 'feeding',
      label: t('dashboard.feedingLabel'),
      icon: activityIcons.feeding,
      color: theme.colors.babyBlue + '30',
    },
    {
      type: 'sleep',
      label: t('dashboard.sleepLabel'),
      icon: activityIcons.sleep,
      color: '#8B7AAA30',
    },
    {
      type: 'diaper',
      label: t('dashboard.diaperLabel'),
      icon: activityIcons.diaper,
      color: theme.colors.softPink + '30',
    },
    {
      type: 'mood',
      label: t('dashboard.moodLabel'),
      icon: activityIcons.mood,
      color: '#FFD70030',
    },
  ];

  return (
    <CustomCard style={styles.card} animated delay={200}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t('dashboard.quickAdd')}
      </Text>
      
      {!hasChildren ? (
        <View style={styles.emptyStateContainer}>
          <Image 
            source={require('../../assets/mascot/Happy.png')} 
            style={styles.mascotImage} 
            resizeMode="contain" 
          />
          <Text variant="bodyMedium" style={styles.emptyStateText}>
            {t('activities.addChildFirst')}
          </Text>
          <CustomButton
            title={t('child.addChild')}
            variant="primary"
            onPress={() => router.push('/child/add')}
            style={styles.addChildButton}
          />
        </View>
      ) : (
        <View style={styles.quickAddContainer}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.type}
              style={[styles.activityButton, { backgroundColor: activity.color }]}
              onPress={() => onQuickAdd(activity.type)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={activity.icon}
                  style={styles.activityIcon}
                  resizeMode="contain"
                />
              </View>
              <Text variant="bodySmall" style={styles.activityLabel}>
                {activity.label}
              </Text>
            </TouchableOpacity>
          ))}
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
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
  },
  activityButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borders.radius.medium,
    gap: theme.spacing.xs,
    minHeight: 85,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
  },
  activityLabel: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  mascotImage: {
    width: 60,
    height: 60,
    marginBottom: theme.spacing.xs,
  },
  emptyStateText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  addChildButton: {
    minWidth: 150,
  },
});
