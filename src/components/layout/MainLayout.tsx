import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomNavigation } from '../ui/BottomNavigation';
import { usePathname } from 'expo-router';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Pages yang tidak perlu bottom navigation
  const hideBottomNavRoutes = [
    '/signin',
    '/signup',
    '/auth-callback',
    '/privacy-policy',
    '/terms',
    '/',
  ];
  
  const shouldShowBottomNav = !hideBottomNavRoutes.some(route => 
    pathname === route || pathname.startsWith('/(auth)')
  );
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.content,
        shouldShowBottomNav && styles.contentWithBottomNav
      ]}>
        {children}
      </View>
      {shouldShowBottomNav && <BottomNavigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentWithBottomNav: {
    paddingBottom: Platform.OS === 'ios' ? 90 : 80, // Space for bottom navigation
  },
});
