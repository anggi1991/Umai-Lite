/**
 * Parenting AI Assistant - Main Theme
 * Combines all theme tokens into a single exportable theme object
 */

import { colors, ColorKeys } from './colors';
import { typography } from './typography';
import { spacing, borders, shadows, sizes } from './spacing';
import { MD3LightTheme, MD3Theme } from 'react-native-paper';
import type { MD3Colors } from 'react-native-paper/lib/typescript/types';

// Extend MD3Colors to include our custom colors
type ExtendedColors = MD3Colors & typeof colors;

// Define custom theme properties that extend MD3Theme
type CustomTheme = Omit<MD3Theme, 'colors'> & {
  colors: ExtendedColors;
  spacing: typeof spacing;
  borders: typeof borders;
  shadows: typeof shadows;
  sizes: typeof sizes;
  typography: typeof typography;
  customColors: typeof colors;
  customAnimation: {
    fast: number;
    normal: number;
    slow: number;
  };
  components: typeof components;
};

// Common component styles
const components = {
  button: {
    primary: {
      backgroundColor: colors.babyBlue,
      borderRadius: borders.radius.large,
      minHeight: sizes.buttonHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    secondary: {
      backgroundColor: colors.softPink,
      borderRadius: borders.radius.large,
      minHeight: sizes.buttonHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    tertiary: {
      backgroundColor: 'transparent',
      borderWidth: borders.width.medium,
      borderColor: colors.babyBlue,
      borderRadius: borders.radius.large,
      minHeight: sizes.buttonHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borders.radius.large,
    padding: spacing.lg,
    ...shadows.card,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borders.radius.large,
    borderWidth: borders.width.thin,
    borderColor: colors.border,
    minHeight: sizes.inputHeight,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
  },
  chatBubble: {
    user: {
      backgroundColor: colors.userBubble,
      borderRadius: borders.radius.large,
      padding: spacing.md,
      maxWidth: '80%',
      alignSelf: 'flex-end' as const,
    },
    ai: {
      backgroundColor: colors.aiBubble,
      borderRadius: borders.radius.large,
      padding: spacing.md,
      maxWidth: '80%',
      alignSelf: 'flex-start' as const,
    },
  },
};

// Extend React Native Paper theme with custom colors
export const theme: CustomTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Add all custom colors first
    ...colors,
    // Then override with specific Paper theme mappings
    primary: colors.babyBlue,
    primaryContainer: colors.babyBlue,
    secondary: colors.softPink,
    secondaryContainer: colors.softPink,
    tertiary: colors.accent,
    onPrimary: colors.textOnPrimary,
    onSecondary: colors.textOnSecondary,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
  } as ExtendedColors,
  spacing,
  borders,
  shadows,
  sizes,
  typography,
  customColors: colors,
  
  // Animation durations (custom property)
  customAnimation: {
    fast: 200,
    normal: 300,
    slow: 400,
  },
  
  components,
};

export type Theme = CustomTheme;

// Helper function to get theme values
export const getColor = (key: keyof typeof colors) => colors[key];
export const getSpacing = (key: keyof typeof spacing) => spacing[key];
export const getBorderRadius = (key: keyof typeof borders.radius) => borders.radius[key];

export default theme;
