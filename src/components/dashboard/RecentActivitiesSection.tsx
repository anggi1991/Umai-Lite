import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { CustomCard } from '../ui/CustomCard';
import { Activity } from '../../types/database';
import { getActivityIcon, getActivityLabel } from '../../utils/dashboardHelpers';
import theme from '../../theme';

interface RecentActivitiesSectionProps {
  activities: Activity[];
}

export function RecentActivitiesSection({ activities }: RecentActivitiesSectionProps) {
  const { t } = useTranslation();
  
  // Helper to translate activity values
  const getActivityValue = (activity: Activity): string => {
    const { type, value, metadata } = activity;
    
    if (type === 'feeding' && value) {
      const feedingTypeKey = value.toLowerCase();
      if (['breast', 'bottle', 'solid', 'both'].includes(feedingTypeKey)) {
        return t(`activities.feedingTypes.${feedingTypeKey}` as any);
      }
    }
    
    if (type === 'diaper' && value) {
      if (value === 'wet') return t('activities.wet');
      if (value === 'both') return t('activities.feedingTypes.both');
    }
    
    if (type === 'mood' && value) {
      const moodKey = value.toLowerCase() as 'happy' | 'crying' | 'sad' | 'angry' | 'sleepy' | 'excited' | 'calm' | 'fussy';
      return t(`activities.moodNames.${moodKey}` as any) || value;
    }
    
    if (type === 'growth') {
      const weight = metadata?.weight_kg;
      const height = metadata?.height_cm;
      if (weight && height) return `${weight} kg, ${height} cm`;
      if (weight) return `${weight} kg`;
      if (height) return `${height} cm`;
    }
    
    return value || '-';
  };
  
  return (
    <CustomCard style={styles.card} animated delay={500}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('dashboard.recentActivities')}
        </Text>
        <Button 
          mode="text" 
          onPress={() => router.push('/activities/history')} 
          compact
          textColor={theme.colors.primary}
        >
          {t('dashboard.viewChart')}
        </Button>
      </View>
      {activities.length === 0 ? (
        <Text variant="bodyMedium" style={styles.placeholderText}>
          {t('dashboard.noActivitiesLogged')}
        </Text>
      ) : (
        activities.slice(0, 5).map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <Image
                source={getActivityIcon(activity.type)}
                style={styles.activityIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.activityDetails}>
              <Text variant="bodyMedium" style={styles.activityType}>
                {getActivityLabel(activity.type)}
              </Text>
              <Text variant="bodySmall" style={styles.activityValue}>
                {getActivityValue(activity)}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.activityTime}>
              {new Date(activity.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))
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
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  activityIconContainer: {
    marginRight: theme.spacing.sm,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
  },
  activityIcon: {
    width: 24,
    height: 24,
  },
  activityDetails: {
    flex: 1,
  },
  activityType: {
    fontWeight: '600',
    marginBottom: 2,
    color: theme.colors.textPrimary,
  },
  activityValue: {
    color: theme.colors.textSecondary,
  },
  activityTime: {
    color: theme.colors.textLight,
  },
});
