import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomCard } from '../../components/ui/CustomCard';
import theme from '../../theme';

export default function ResetPasswordScreen() {
  const { resetPassword, loading } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);
    
    // Validasi input
    if (!email.trim()) {
      setError(t('errors.fieldRequired'));
      return;
    }
    
    if (!validateEmail(email)) {
      setError(t('errors.emailInvalid'));
      return;
    }

    try {
      await resetPassword(email.trim().toLowerCase());
      setSuccess(true);
      Alert.alert(
        t('auth.resetPasswordSuccessTitle'),
        t('auth.resetPasswordSuccess'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (e: any) {
      const errorMessage = e.message || t('auth.resetPasswordFailed');
      setError(errorMessage);
      Alert.alert(t('auth.resetPasswordFailedTitle'), errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.babyBlue, theme.colors.white, theme.colors.softPink]}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <CustomCard style={styles.card} noShadow={false}>
          <View style={styles.headerContainer}>
            <Image 
              source={require('../../assets/mascot/buddy-concise.png')} 
              style={styles.mascotIcon}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              {t('auth.resetPasswordTitle')}
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('auth.resetPasswordSubtitle')}
          </Text>
          
          <CustomInput
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            disabled={loading || success}
            error={error}
            leftIcon="email"
          />
          
          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                {t('auth.resetPasswordSuccess')}
              </Text>
            </View>
          )}
          
          <CustomButton
            title={loading ? t('auth.sendingResetLink') : t('auth.sendResetLink')}
            onPress={handleResetPassword}
            variant="primary"
            loading={loading}
            disabled={loading || success || !email.trim()}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          
          <CustomButton
            title={t('common.backToLogin')}
            onPress={() => router.back()}
            variant="secondary"
            disabled={loading}
            style={styles.backButton}
          />
        </CustomCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    padding: theme.spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  mascotIcon: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  button: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    color: '#000000',
  },
  successContainer: {
    backgroundColor: theme.colors.success + '20',
    padding: theme.spacing.md,
    borderRadius: 8,
    marginTop: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  successText: {
    color: theme.colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
});
