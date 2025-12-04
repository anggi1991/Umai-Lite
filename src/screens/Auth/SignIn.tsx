import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomCard } from '../../components/ui/CustomCard';
import theme from '../../theme';

export default function SignInScreen() {
  const { signIn, signInWithGoogle, loading } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    setError('');
    
    // Validasi input
    if (!email.trim()) {
      setError(t('errors.fieldRequired'));
      return;
    }
    
    if (!validateEmail(email)) {
      setError(t('errors.emailInvalid'));
      return;
    }
    
    if (!password.trim()) {
      setError(t('errors.fieldRequired'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    try {
      await signIn(email.trim().toLowerCase(), password);
      // Redirect ke dashboard akan dilakukan otomatis oleh AuthContext
      router.replace('/');
    } catch (e: any) {
      const errorMessage = e.message || t('auth.loginFailed');
      setError(errorMessage);
      Alert.alert(t('auth.loginFailedTitle'), errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    
    try {
      await signInWithGoogle();
      // Redirect akan dilakukan otomatis oleh AuthContext
      router.replace('/');
    } catch (e: any) {
      const errorMessage = e.message || t('auth.googleSignInFailed');
      setError(errorMessage);
      Alert.alert(t('auth.googleSignInFailedTitle'), errorMessage);
    } finally {
      setGoogleLoading(false);
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
              source={require('../../assets/mascot/baby-buddy-welcome.png')} 
              style={styles.mascotIcon}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              {t('auth.welcomeBack')}
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('auth.signInSubtitle')}
          </Text>
          
          <CustomInput
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            disabled={loading}
            error={error.includes('email') || error.includes('Email') ? error : undefined}
            leftIcon="email"
          />
          
          <CustomInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            disabled={loading}
            error={error.includes('password') || error.includes('Password') ? error : undefined}
            leftIcon="lock"
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
          
          {error && !error.includes('email') && !error.includes('Email') && !error.includes('password') && !error.includes('Password') ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
          
          <View style={styles.forgotPasswordContainer}>
            <Link href="/(auth)/reset-password" asChild>
              <Text variant="bodySmall" style={styles.forgotPasswordLink}>
                {t('auth.forgotPassword')}
              </Text>
            </Link>
          </View>
          
          <CustomButton
            title={loading ? t('auth.signingIn') : t('auth.signIn')}
            onPress={handleSignIn}
            variant="primary"
            loading={loading}
            disabled={loading || googleLoading || !email.trim() || !password.trim()}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          
          <Divider style={styles.divider} />
          
          <Text variant="bodySmall" style={styles.orText}>{t('auth.orSignInWith')}</Text>
          
          <CustomButton
            title={googleLoading ? t('auth.google') : t('auth.signInWithGoogle')}
            onPress={handleGoogleSignIn}
            variant="secondary"
            loading={googleLoading}
            disabled={loading || googleLoading}
            leftIcon="google"
            style={styles.googleButton}
            textStyle={styles.buttonText}
          />
          
          <Divider style={styles.divider} />
          
          <View style={styles.linkContainer}>
            <Text variant="bodyMedium" style={styles.linkText}>{t('auth.noAccount')}</Text>
            <Link href="/signup" asChild>
              <Text variant="bodyMedium" style={styles.link}>
                {t('auth.signUp')}
              </Text>
            </Link>
          </View>
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
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  mascotIcon: {
    width: 64,
    height: 64,
    marginBottom: theme.spacing.sm,
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
  buttonText: {
    color: '#000000',
  },
  divider: {
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.divider,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  forgotPasswordLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  googleButton: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
});
