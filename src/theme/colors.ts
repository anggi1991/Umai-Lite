/**
 * Parenting AI Assistant - Color Palette
 * Based on design system: Baby Blue & Soft Pink theme
 */

export const colors = {
  // Primary Colors
  babyBlue: '#AEE1F9',
  softPink: '#FADADD',
  white: '#FFFFFF',
  
  // Gradients
  gradientStart: '#AEE1F9',
  gradientEnd: '#FADADD',
  
  // Semantic Colors
  primary: '#AEE1F9',
  secondary: '#FADADD',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  accent: '#FFB6C1',
  
  // Text Colors
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#2C3E50',
  
  // Status Colors
  success: '#A8E6CF',
  warning: '#FFD3B6',
  error: '#FFAAA5',
  info: '#AEE1F9',
  
  // UI Elements
  border: '#E0E0E0',
  divider: '#EEEEEE',
  disabled: '#BDBDBD',
  overlay: 'rgba(0, 0, 0, 0.3)',
  
  // Chat Bubbles
  userBubble: '#FADADD',  // Keep light for bubbles
  aiBubble: '#AEE1F9',    // Keep light for bubbles
  
  // Navigation
  navigationActive: '#AEE1F9',
  navigationInactive: '#9E9E9E',
} as const;

export type ColorKeys = keyof typeof colors;
