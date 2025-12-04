/**
 * Custom Button Component
 * Implements design system button styles with variants
 */

import React, { useRef, memo } from 'react';
import { Animated, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Pressable, Image } from 'react-native';
import theme from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'small' | 'medium' | 'large';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: string; // Icon name for left side (e.g., 'google')
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  leftIcon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = theme.components.button[variant];
    const sizeStyle = size === 'small' ? styles.small : size === 'large' ? styles.large : {};
    const widthStyle = fullWidth ? styles.fullWidth : {};
    const disabledStyle = disabled ? styles.disabled : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...widthStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.disabled;
    // Use white text for both primary and secondary buttons
    if (variant === 'primary') return theme.colors.textOnPrimary; // white
    if (variant === 'secondary') return theme.colors.textOnPrimary; // white (changed from textOnSecondary)
    return theme.colors.primary;
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityHint={loading ? 'Loading, please wait' : undefined}
    >
      <Animated.View
        style={[
          styles.button,
          getButtonStyle(),
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <>
            {icon && <>{icon}</>}
            {leftIcon && (
              <>
                {leftIcon === 'google' ? (
                  <Image
                    source={require('../../assets/google.png')}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={[styles.text, { color: getTextColor() }]}>
                    {leftIcon}
                  </Text>
                )}
              </>
            )}
            <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  text: {
    ...theme.typography.button,
    textAlign: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  small: {
    minHeight: theme.sizes.buttonHeightSmall,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  large: {
    minHeight: theme.sizes.buttonHeight + 8,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomButton;
