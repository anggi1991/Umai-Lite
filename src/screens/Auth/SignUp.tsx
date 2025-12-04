import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, Divider, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomCard } from '../../components/ui/CustomCard';
import theme from '../../theme';

export default function SignUpScreen() {
  const { signUp, signInWithGoogle, loading } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Password harus minimal 6 karakter dan mengandung minimal 1 huruf dan 1 angka
    const hasMinLength = password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasMinLength && hasLetter && hasNumber;
  };

  const handleSignUp = async () => {
    setError('');
    setSuccess('');
    
    // Validasi input
    if (!fullName.trim()) {
      setError(t('errors.fieldRequired'));
      return;
    }
    
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
    
    if (!validatePassword(password)) {
      setError(t('auth.passwordRequirements'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }
    
    if (!agreeToTerms) {
      setError(t('auth.mustAgreeTerms'));
      return;
    }

    try {
      await signUp(email.trim().toLowerCase(), password, fullName.trim());
      setSuccess(t('auth.registrationSuccess'));
      // Auto redirect setelah beberapa detik
      setTimeout(() => {
        router.replace('/signin');
      }, 2000);
    } catch (e: any) {
      const errorMessage = e.message || t('auth.registrationFailed');
      setError(errorMessage);
      Alert.alert(t('auth.registrationFailedTitle'), errorMessage);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!agreeToTerms) {
      setError(t('auth.mustAgreeTerms'));
      return;
    }

    setError('');
    setGoogleLoading(true);
    
    try {
      await signInWithGoogle();
      // Redirect akan dilakukan otomatis oleh AuthContext
      router.replace('/');
    } catch (e: any) {
      const errorMessage = e.message || t('auth.googleSignUpFailed');
      setError(errorMessage);
      Alert.alert(t('auth.googleSignUpFailedTitle'), errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.softPink, theme.colors.white, theme.colors.babyBlue]}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <CustomCard style={styles.card} noShadow={false}>
          <View style={styles.headerContainer}>
            <Image 
              source={require('../../assets/mascot/baby-buddy-register.png')} 
              style={styles.mascotIcon}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              {t('auth.joinUs')}
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('auth.signUpSubtitle')}
          </Text>
          
          <CustomInput
            label={t('auth.fullName')}
            value={fullName}
            onChangeText={setFullName}
            disabled={loading}
            error={error.includes('nama') || error.includes('Nama') ? error : undefined}
            leftIcon="account"
          />
          
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
          
          <CustomInput
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            disabled={loading}
            error={error.includes('Konfirmasi') ? error : undefined}
            leftIcon="lock-check"
            rightIcon={showConfirmPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
          
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => !loading && setAgreeToTerms(!agreeToTerms)}
            disabled={loading}
          >
            <Checkbox
              status={agreeToTerms ? 'checked' : 'unchecked'}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              disabled={loading}
              color={theme.colors.primary}
            />
            <Text variant="bodySmall" style={styles.checkboxText}>
              {t('auth.iAgree')}{' '}
              <Text style={styles.link}>{t('auth.termsAndConditions')}</Text>
              {' '}{t('auth.and')}{' '}
              <Text style={styles.link}>{t('auth.privacyPolicy')}</Text>
            </Text>
          </TouchableOpacity>
          
          {error && !error.includes('nama') && !error.includes('Nama') && !error.includes('email') && !error.includes('Email') && !error.includes('password') && !error.includes('Password') && !error.includes('Konfirmasi') ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
          
          {success ? (
            <Text style={styles.success}>{success}</Text>
          ) : null}
          
          <CustomButton
            title={loading ? t('auth.signingUp') : t('auth.signUp')}
            onPress={handleSignUp}
            variant="primary"
            loading={loading}
            disabled={loading || googleLoading || !email.trim() || !password.trim() || !fullName.trim() || !agreeToTerms}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          
          <Divider style={styles.divider} />
          
          <Text variant="bodySmall" style={styles.orText}>{t('auth.orSignUpWith')}</Text>
          
          <CustomButton
            title={googleLoading ? t('auth.google') : t('auth.signUpWithGoogle')}
            onPress={handleGoogleSignUp}
            variant="secondary"
            loading={googleLoading}
            disabled={loading || googleLoading || !agreeToTerms}
            leftIcon="google"
            style={styles.googleButton}
            textStyle={styles.buttonText}
          />
          
          <Divider style={styles.divider} />
          
          <View style={styles.linkContainer}>
            <Text variant="bodyMedium" style={styles.linkText}>{t('auth.haveAccount')}</Text>
            <Link href="/signin" asChild>
              <Text variant="bodyMedium" style={styles.link}>
                {t('auth.signIn')}
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
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  checkboxText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
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
  success: {
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontSize: 14,
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
