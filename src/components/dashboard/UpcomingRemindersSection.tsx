import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { CustomCard } from '../ui/CustomCard';
import theme from '../../theme';

export function UpcomingRemindersSection() {
  const { t } = useTranslation();
  return (
    <CustomCard style={styles.card} animated delay={400}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.sectionTitle}>⏰ {t('dashboard.upcomingReminders')}</Text>
        <Button 
          mode="text" 
          onPress={() => router.push('/reminders')} 
          compact
          textColor={theme.colors.primary}
        >
          {t('dashboard.manageReminders')}
        </Button>
      </View>
      <Text variant="bodyMedium" style={styles.placeholderText}>
        {t('dashboard.noReminders')}
      </Text>
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
});
