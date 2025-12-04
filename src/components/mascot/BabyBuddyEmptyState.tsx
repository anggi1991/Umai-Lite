/**
 * Baby Buddy Empty State Component
 * Displays Baby Buddy with custom message for empty states
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BabyBuddy from './BabyBuddy';
import theme from '../../theme';

interface BabyBuddyEmptyStateProps {
  message: string;
  submessage?: string;
  expression?: 'happy' | 'waving' | 'thumbs-up';
}

export const BabyBuddyEmptyState: React.FC<BabyBuddyEmptyStateProps> = ({
  message,
  submessage,
  expression = 'waving',
}) => {
  return (
    <View style={styles.container}>
      <BabyBuddy expression={expression} size={150} animated={true} />
      <Text style={styles.message}>{message}</Text>
      {submessage && <Text style={styles.submessage}>{submessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  message: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  },
  submessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default BabyBuddyEmptyState;
