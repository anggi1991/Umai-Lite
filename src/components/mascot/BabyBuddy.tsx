/**
 * Baby Buddy Mascot Component
 * Enhanced mascot with glowing halo and sparkle effect (Figma design)
 * Reusable component with different expressions and animations
 */

import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';

type BabyBuddyExpression = 'happy' | 'waving' | 'thumbs-up' | 'sleeping';

interface BabyBuddyProps {
  expression?: BabyBuddyExpression;
  size?: number;
  animated?: boolean;
  showHalo?: boolean;
  showSparkle?: boolean;
  style?: ViewStyle;
}

const MASCOT_IMAGES = {
  happy: require('../../assets/mascot/Happy.png'),
  waving: require('../../assets/mascot/baby-buddy-waving.png'),
  'thumbs-up': require('../../assets/mascot/baby-buddy-thumbs-up.png'),
  sleeping: require('../../assets/mascot/baby-buddy-sleeping.png'),
};

export const BabyBuddy: React.FC<BabyBuddyProps> = ({
  expression = 'happy',
  size = 80,
  animated = false,
  showHalo = true,
  showSparkle = true,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(1)).current;
  const haloAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Floating animation (smooth up-down)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scale pulse animation (subtle)
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Sparkle ping animation (always active if showSparkle)
    if (showSparkle) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Halo pulse animation (subtle glow)
    if (showHalo) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(haloAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(haloAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, bounceAnim, scaleAnim, sparkleAnim, haloAnim, showSparkle, showHalo]);

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      {/* Glowing Halo (Background) */}
      {showHalo && (
        <Animated.View
          style={[
            styles.haloContainer,
            {
              width: size,
              height: size,
              transform: [{ scale: haloAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.babyBlue, theme.colors.softPink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.halo}
          />
        </Animated.View>
      )}

      {/* Mascot Image */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: animated
              ? [{ translateY: bounceAnim }, { scale: scaleAnim }]
              : [],
          },
        ]}
      >
        <Image
          source={MASCOT_IMAGES[expression]}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
        />
      </Animated.View>

      {/* AI Sparkle (Top-right corner) */}
      {showSparkle && (
        <View style={[styles.sparkleContainer, { top: -2, right: -2 }]}>
          <View style={styles.sparkle}>
            <Animated.View
              style={[
                styles.sparklePing,
                {
                  transform: [{ scale: sparkleAnim }],
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    opacity: 0.3,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  image: {
    width: 80,
    height: 80,
  },
  sparkleContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  sparkle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.babyBlue,
    ...theme.shadows.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklePing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.babyBlue,
    opacity: 0.75,
  },
});

export default BabyBuddy;
