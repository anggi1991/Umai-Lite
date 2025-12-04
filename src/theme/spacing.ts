/**
 * Parenting AI Assistant - Spacing System
 * Based on 4px grid system
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borders = {
  radius: {
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    full: 9999,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
} as const;

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const sizes = {
  // Touch targets (minimum 44x44)
  touchTarget: 44,
  
  // Common heights
  inputHeight: 48,
  buttonHeight: 48,
  buttonHeightSmall: 40,
  headerHeight: 64,
  bottomNavHeight: 64,
  
  // Icon sizes
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  iconXL: 48,
  
  // Avatar sizes
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
  avatarXL: 96,
} as const;

export type SpacingKeys = keyof typeof spacing;
export type BorderRadiusKeys = keyof typeof borders.radius;
export type ShadowKeys = keyof typeof shadows;
