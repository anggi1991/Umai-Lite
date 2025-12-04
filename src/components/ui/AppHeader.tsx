import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Menu, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import theme from '../../theme';

export interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
  menuItems?: Array<{
    title: string;
    icon: string;
    onPress: () => void;
    divider?: boolean;
  }>;
  subtitle?: string;
  customRight?: React.ReactNode;
  variant?: 'gradient' | 'white';
}

/**
 * AppHeader - Komponen header yang konsisten untuk seluruh aplikasi
 * 
 * @example
 * ```tsx
 * <AppHeader 
 *   title="Pantau Pertumbuhan"
 *   showBackButton
 *   menuItems={[
 *     { title: 'Refresh', icon: 'refresh', onPress: handleRefresh },
 *     { title: 'Export', icon: 'download', onPress: handleExport }
 *   ]}
 * />
 * ```
 */
export function AppHeader({
  title,
  onBack,
  showBackButton = true,
  rightIcon,
  onRightPress,
  menuItems,
  subtitle,
  customRight,
  variant = 'gradient',
}: AppHeaderProps) {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const headerContent = (
    <View style={styles.headerContent}>
      {/* Left: Back Button or Spacer */}
      {showBackButton ? (
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
          iconColor={variant === 'gradient' ? theme.colors.white : theme.colors.textPrimary}
          style={styles.iconButton}
        />
      ) : (
        <View style={styles.iconButtonSpacer} />
      )}

      {/* Center: Title & Subtitle */}
      <View style={styles.headerCenter}>
        <Text 
          variant="headlineSmall" 
          style={[
            styles.headerTitle,
            variant === 'white' && styles.headerTitleWhite
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            variant="bodySmall" 
            style={[
              styles.headerSubtitle,
              variant === 'white' && styles.headerSubtitleWhite
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right: Custom, Icon, Menu, or Spacer */}
      {customRight ? (
        customRight
      ) : menuItems ? (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
              iconColor={variant === 'gradient' ? theme.colors.white : theme.colors.textPrimary}
              style={styles.iconButton}
            />
          }
          contentStyle={styles.menuContent}
        >
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider && index > 0 && <Divider />}
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  item.onPress();
                }}
                title={item.title}
                leadingIcon={item.icon}
              />
            </React.Fragment>
          ))}
        </Menu>
      ) : rightIcon && onRightPress ? (
        <IconButton
          icon={rightIcon}
          size={24}
          onPress={onRightPress}
          iconColor={variant === 'gradient' ? theme.colors.white : theme.colors.textPrimary}
          style={styles.iconButton}
        />
      ) : (
        <View style={styles.iconButtonSpacer} />
      )}
    </View>
  );

  if (variant === 'white') {
    return (
      <View style={[styles.header, styles.headerWhite]}>
        {headerContent}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.babyBlue, theme.colors.softPink]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      {headerContent}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 30,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerWhite: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerTitleWhite: {
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
  },
  headerSubtitleWhite: {
    color: theme.colors.textSecondary,
    opacity: 1,
  },
  iconButton: {
    margin: 0,
  },
  iconButtonSpacer: {
    width: 48,
    height: 48,
  },
  menuContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginTop: 50,
  },
});
