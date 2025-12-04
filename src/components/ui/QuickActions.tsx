/**
 * QuickActions Component
 * Grid of quick action buttons with gradient backgrounds
 * Based on Figma HomeScreen design
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { MascotIcon, MascotIconName } from './MascotIcon';
import theme from '../../theme';

interface QuickAction {
  icon: MascotIconName;
  label: string;
  gradientColors: [string, string];
  route?: string;
  onPress?: () => void;
}

interface QuickActionsProps {
  onTipsPress?: () => void;
  hasChildren?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onTipsPress, hasChildren = true }) => {
  const { t } = useTranslation();
  
  const QUICK_ACTIONS: QuickAction[] = [
    {
      icon: 'growth',
      label: t('dashboard.growthLabel'),
      gradientColors: [theme.colors.babyBlue, '#87CEEB'],
      route: '/statistics',
    },
    {
      icon: 'buddyWaving',
      label: t('dashboard.chatAILabel'),
      gradientColors: [theme.colors.softPink, '#FFB6C1'],
      route: '/chat',
    },
    {
      icon: 'mood',
      label: t('dashboard.journalLabel'),
      gradientColors: ['#E0BBE4', '#D8A7D8'],
      route: '/activities/history',
    },
    {
      icon: 'buddyThumbsUp',
      label: t('dashboard.childProfileLabel'),
      gradientColors: ['#A8E6CF', '#7FD8BE'],
      // 🩹 FIX: Route to /child/add if no children, else /child list
      route: hasChildren ? '/child' : '/child/add',
    },
    {
      icon: 'happy',
      label: t('dashboard.tipsLabel'),
      gradientColors: ['#FFE5B4', '#FFD699'],
      onPress: onTipsPress,
    },
  ];

  const handleActionPress = (action: QuickAction) => {
    if (action.onPress) {
      action.onPress();
    } else if (action.route) {
      router.push(action.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {t('dashboard.quickActions')}
      </Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionWrapper}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={action.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButton}
            >
              <MascotIcon 
                name={action.icon}
                size={32}
                style={{ tintColor: 'white' }}
              />
            </LinearGradient>
            <Text variant="bodySmall" style={styles.label}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md, // Better padding control
  },
  title: {
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // More even distribution
    gap: theme.spacing.sm, // Increased gap for better spacing
  },
  actionWrapper: {
    width: '18%',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs, // Add bottom margin for better vertical spacing
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: theme.borders.radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  label: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: 11, // Slightly smaller for better fit
    lineHeight: 14,
  },
});

export default QuickActions;
