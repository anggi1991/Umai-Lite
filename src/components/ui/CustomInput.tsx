/**
 * Custom Input Component
 * Implements design system input styles
 */

import React, { memo } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string | React.ReactNode;
  rightIcon?: string | React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = memo(({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  disabled = false,
  ...textInputProps
}) => {
  const renderIcon = (icon: string | React.ReactNode) => {
    if (typeof icon === 'string') {
      return (
        <MaterialCommunityIcons 
          name={icon as any} 
          size={20} 
          color={disabled ? theme.colors.textLight : theme.colors.textSecondary} 
        />
      );
    }
    return icon;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        error && styles.inputError,
        disabled && styles.inputDisabled
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{renderIcon(leftIcon)}</View>}
        <TextInput
          style={[
            styles.input, 
            leftIcon ? styles.inputWithLeftIcon : undefined, 
            rightIcon ? styles.inputWithRightIcon : undefined, 
            disabled ? styles.textDisabled : undefined,
            textInputProps.multiline && styles.inputMultiline,
            style
          ]}
          placeholderTextColor={theme.colors.textLight}
          editable={!disabled}
          accessible={true}
          accessibilityLabel={label || textInputProps.placeholder || 'Text input'}
          accessibilityHint={error || undefined}
          accessibilityState={{ disabled: disabled || false }}
          {...textInputProps}
        />
        {rightIcon && (
          onRightIconPress ? (
            <TouchableOpacity 
              style={styles.rightIcon} 
              onPress={onRightIconPress}
              disabled={disabled}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Input action"
            >
              {renderIcon(rightIcon)}
            </TouchableOpacity>
          ) : (
            <View style={styles.rightIcon}>{renderIcon(rightIcon)}</View>
          )
        )}
      </View>
      {error && <Text style={styles.errorText} accessibilityLiveRegion="polite">{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.captionMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.components.input,
  },
  input: {
    flex: 1,
    height: 25,
    color: theme.colors.textPrimary,
    textAlign: 'left',
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    minHeight: 80,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.xs,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    backgroundColor: theme.colors.background,
    opacity: 0.6,
  },
  textDisabled: {
    color: theme.colors.textLight,
  },
  leftIcon: {
    marginLeft: theme.spacing.sm,
  },
  rightIcon: {
    marginRight: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.small,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default CustomInput;
