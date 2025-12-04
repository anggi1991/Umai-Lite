import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

const mascotImages = {
  happy: require('../../assets/mascot/baby-buddy-happy.png'),
  waving: require('../../assets/mascot/baby-buddy-waving.png'),
  'thumbs-up': require('../../assets/mascot/baby-buddy-thumbs-up.png'),
  sleeping: require('../../assets/mascot/baby-buddy-sleeping.png'),
};

interface AnimatedBuddyLoadingProps {
  visible: boolean;
  expression?: 'happy' | 'waving' | 'thumbs-up' | 'sleeping';
}

export const AnimatedBuddyLoading: React.FC<AnimatedBuddyLoadingProps> = ({ 
  visible, 
  expression = 'happy' 
}) => {
  const { t } = useTranslation();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Bounce animation
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      // Breathing effect (scale)
      const breathingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Subtle rotation
      const rotateAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      // Typing dots animation
      const dotsAnimation = Animated.loop(
        Animated.stagger(200, [
          Animated.sequence([
            Animated.timing(dot1Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot1Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot2Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot3Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      bounceAnimation.start();
      breathingAnimation.start();
      rotateAnimation.start();
      dotsAnimation.start();

      return () => {
        bounceAnimation.stop();
        breathingAnimation.stop();
        rotateAnimation.stop();
        dotsAnimation.stop();
      };
    }
  }, [visible, bounceAnim, scaleAnim, rotateAnim, dot1Anim, dot2Anim, dot3Anim]);

  if (!visible) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.mascotContainer,
          {
            transform: [
              { translateY: bounceAnim },
              { scale: scaleAnim },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <View style={styles.avatarCircle}>
          <Image
            source={mascotImages[expression]}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot1Anim,
              transform: [{ scale: dot1Anim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot2Anim,
              transform: [{ scale: dot2Anim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot3Anim,
              transform: [{ scale: dot3Anim }],
            },
          ]}
        />
      </View>

      <Text style={styles.loadingText}>{t('chat.buddyThinking')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  mascotContainer: {
    marginBottom: 8,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  mascotImage: {
    width: 44,
    height: 44,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.babyBlue,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});
