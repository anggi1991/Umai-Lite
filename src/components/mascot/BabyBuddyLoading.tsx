/**
 * Baby Buddy Loading Component
 * Animated loading state with Baby Buddy sleeping
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import BabyBuddy from './BabyBuddy';
import theme from '../../theme';

interface BabyBuddyLoadingProps {
  message?: string;
}

export const BabyBuddyLoading: React.FC<BabyBuddyLoadingProps> = ({
  message = 'Loading...',
}) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Breathing animation for sleeping baby
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <BabyBuddy expression="sleeping" size={120} animated={false} />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.dotsContainer}>
        <Animated.Text style={[styles.dot, { opacity: fadeAnim }]}>●</Animated.Text>
        <Animated.Text style={[styles.dot, { opacity: fadeAnim }]}>●</Animated.Text>
        <Animated.Text style={[styles.dot, { opacity: fadeAnim }]}>●</Animated.Text>
      </View>
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
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  dot: {
    ...theme.typography.h3,
    color: theme.colors.babyBlue,
  },
});

export default BabyBuddyLoading;
