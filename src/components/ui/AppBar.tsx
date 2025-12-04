/**
 * AppBar Component
 * Consistent header bar dengan back button, title, subtitle, dan actions
 * Based on Figma design from MASCOT folder
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import theme from '../../theme';

interface AppBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: ('search' | 'bell' | 'menu')[];
  transparent?: boolean;
  onBellPress?: () => void;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions = [],
  transparent = false,
  onBellPress,
  onMenuPress,
  onSearchPress,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleActionPress = (action: string) => {
    console.log(`AppBar action clicked: ${action}`);
    
    if (action === 'bell' && onBellPress) {
      onBellPress();
    } else if (action === 'menu' && onMenuPress) {
      onMenuPress();
    } else if (action === 'search' && onSearchPress) {
      onSearchPress();
    }
  };

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparent,
        Platform.OS === 'ios' && styles.iosContainer,
      ]}
    >
      <View style={styles.content}>
        {/* Left Section - Back Button + Title */}
        <View style={styles.leftSection}>
          {showBack && (
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor={theme.colors.textPrimary}
              onPress={handleBack}
              style={styles.backButton}
            />
          )}
          <View style={styles.titleContainer}>
            {subtitle && (
              <Text variant="bodySmall" style={styles.subtitle}>
                {subtitle}
              </Text>
            )}
            {title && (
              <Text variant="titleMedium" style={styles.title}>
                {title}
              </Text>
            )}
          </View>
        </View>

        {/* Right Section - Action Buttons */}
        <View style={styles.rightSection}>
          {actions.map((action) => (
            <IconButton
              key={action}
              icon={
                action === 'search'
                  ? 'magnify'
                  : action === 'bell'
                  ? 'bell-outline'
                  : 'dots-vertical'
              }
              size={22}
              iconColor={theme.colors.textPrimary}
              onPress={() => handleActionPress(action)}
              style={styles.actionButton}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: Platform.OS === 'android' ? 40 : 44, // Android & iOS status bar
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  iosContainer: {
    // Already handled by container paddingTop
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: theme.spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    margin: 0,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionButton: {
    margin: 0,
  },
});

export default AppBar;
