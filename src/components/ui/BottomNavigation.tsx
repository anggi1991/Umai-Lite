import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router, usePathname } from 'expo-router';
import { MascotIcon, MascotIconName } from './MascotIcon';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

export interface BottomNavigationProps {
  onTabChange?: (tab: string) => void;
}

interface TabItem {
  id: string;
  icon: MascotIconName;
  labelKey: string;
  route: string;
}

const TABS: TabItem[] = [
  { id: 'home', icon: 'home', labelKey: 'navigation.home', route: '/dashboard' },
  { id: 'journal', icon: 'journal', labelKey: 'navigation.journal', route: '/activities/history' },
  { id: 'chat', icon: 'chat', labelKey: 'navigation.chat', route: '/chat' },
  { id: 'stats', icon: 'stats', labelKey: 'navigation.stats', route: '/statistics' },
  { id: 'profile', icon: 'profile', labelKey: 'navigation.profile', route: '/settings' },
];

export function BottomNavigation({ onTabChange }: BottomNavigationProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  
  const getActiveTab = (): string => {
    if (pathname === '/dashboard') return 'home';
    if (pathname.startsWith('/activities')) return 'journal';
    if (pathname.startsWith('/chat')) return 'chat';
    if (pathname.startsWith('/statistics') || pathname.startsWith('/growth-tracker')) return 'stats';
    if (pathname.startsWith('/settings') || pathname.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabPress = (tab: TabItem) => {
    if (onTabChange) {
      onTabChange(tab.id);
    }
    router.push(tab.route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {/* Active Indicator */}
              {isActive && <View style={styles.activeIndicator} />}
              
              {/* Icon */}
              <View style={[styles.iconWrapper, isActive && styles.iconActive]}>
                <MascotIcon
                  name={tab.icon}
                  size={28}
                  // tintColor removed to show full color icon
                />
              </View>
              
              {/* Label */}
              <Text
                variant="labelSmall"
                style={[styles.label, isActive && styles.labelActive]}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    // Add shadow for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.sm : 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    height: '100%',
    gap: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: theme.colors.babyBlue,
    borderRadius: 2,
  },
  iconWrapper: {
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: theme.colors.babyBlue,
    fontWeight: '600',
  },
});
