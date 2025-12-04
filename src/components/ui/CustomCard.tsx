/**
 * Custom Card Component
 * Implements design system card styles with animations
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import theme from '../../theme';

interface CustomCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animated?: boolean;
  delay?: number;
  noPadding?: boolean;
  noShadow?: boolean;
}

export const CustomCard: React.FC<CustomCardProps> = memo(({
  children,
  style,
  noPadding = false,
  noShadow = false,
  animated = false,
  delay = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 20 : 0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, delay, fadeAnim, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        noPadding && styles.noPadding,
        noShadow && styles.noShadow,
        style,
        animated && {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
      accessible={true}
      accessibilityRole="none"
    >
      {children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    ...theme.components.card,
  },
  noPadding: {
    padding: 0,
  },
  noShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default CustomCard;
