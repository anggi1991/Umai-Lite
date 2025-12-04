/**
 * Skeleton Loader Component
 * Animated loading placeholder for content
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import theme from '../../theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borders.radius.medium,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={60} height={60} borderRadius={30} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="70%" height={16} style={styles.spacing} />
          <SkeletonLoader width="50%" height={14} />
        </View>
      </View>
      <View style={styles.cardContent}>
        <SkeletonLoader width="100%" height={14} style={styles.spacing} />
        <SkeletonLoader width="90%" height={14} style={styles.spacing} />
        <SkeletonLoader width="80%" height={14} />
      </View>
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 3,
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={styles.listItem} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.babyBlue,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.large,
    ...theme.shadows.medium,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  cardContent: {
    marginTop: theme.spacing.sm,
  },
  spacing: {
    marginBottom: theme.spacing.sm,
  },
  listItem: {
    marginBottom: theme.spacing.md,
  },
});
