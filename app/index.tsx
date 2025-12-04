import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function IndexPage() {
  const { user, loading: _loading } = useAuth();

  useEffect(() => {
    if (!_loading) {
      if (user) {
        // User sudah login, redirect ke dashboard
        router.replace('/dashboard');
      } else {
        // User belum login, redirect ke signin
        router.replace('/signin');
      }
    }
  }, [user, _loading]);

  // Tampilkan loading sementara mengecek auth status
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Memuat...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});
