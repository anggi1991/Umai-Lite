import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, Linking } from 'react-native';
import { Text, Avatar, Switch, Divider, RadioButton, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useUserPreferences, MascotExpression } from '../../contexts/UserPreferencesContext';
import { supabase } from '../../services/supabaseClient';
import { getChildren } from '../../services/childService';
import { setDefaultChild, getDefaultChild } from '../../services/userPreferencesService';
import { Child } from '../../types/database';
import { CustomButton, CustomCard, AppHeader } from '../../components/ui';
import { BabyBuddy } from '../../components/mascot';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

// AI Persona Mascot Icons
const personaIcons = {
  friendly: require('../../assets/mascot/buddy-friendly.png'),
  professional: require('../../assets/mascot/buddy-professional.png'),
  encouraging: require('../../assets/mascot/buddy-encouraging.png'),
  concise: require('../../assets/mascot/buddy-concise.png'),
};

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { 
    mascotExpression, 
    aiPersona, 
    setMascotExpression, 
    setAIPersona,
    loading: preferencesLoading 
  } = useUserPreferences();
  
  const [notifications, setNotifications] = useState(true);
  const [dailyTips, setDailyTips] = useState(true);
  const [reminderAlerts, setReminderAlerts] = useState(true);
  
  // Default Child States
  const [children, setChildren] = useState<Child[]>([]);
  const [defaultChildId, setDefaultChildId] = useState<string | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(false);
  
  // Change Password States
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Settings] ⚙️ Screen mounted and ready');
    console.log('[Settings] User email:', user?.email);
    console.log('[Settings] User ID:', user?.id);
    console.log('[Settings] Current route: /settings');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [user]);

  // Load children and default child preference
  useEffect(() => {
    const loadChildrenData = async () => {
      if (!user?.id) return;
      
      setLoadingChildren(true);
      try {
        const [childrenData, defaultChild] = await Promise.all([
          getChildren(user.id),
          getDefaultChild(user.id)
        ]);
        
        setChildren(childrenData);
        setDefaultChildId(defaultChild);
        console.log('[Settings] Loaded children:', childrenData.length);
        console.log('[Settings] Default child:', defaultChild);
      } catch (error) {
        console.error('[Settings] Error loading children:', error);
      } finally {
        setLoadingChildren(false);
      }
    };

    loadChildrenData();
  }, [user]);

  const handleSignOut = () => {
    Alert.alert(
      t('auth.signOut'),
      t('settings.confirmSignOut'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[Settings] Starting sign out...');
              await signOut();
              console.log('[Settings] Sign out complete, redirecting...');
              // Use replace to prevent going back
              router.replace('/(auth)/signin');
            } catch (error) {
              console.error('[Settings] Sign out error:', error);
              Alert.alert(t('common.error'), t('settings.signOutFailed'));
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[Settings] Starting account deletion...');
              
              // Call Edge Function to delete account
              const { error } = await supabase.functions.invoke('delete-account');

              if (error) {
                console.error('[Settings] Delete account error:', error);
                throw error;
              }

              console.log('[Settings] Account deleted, signing out...');
              await signOut();
              router.replace('/(auth)/signin');
              
              Alert.alert(t('common.success'), t('auth.accountDeleted'));
            } catch (error: any) {
              console.error('[Settings] Error deleting account:', error);
              Alert.alert(t('common.error'), t('settings.deleteAccountFailed') || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('errors.fieldRequired'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('errors.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('errors.passwordMismatch'));
      return;
    }

    setChangingPassword(true);

    try {
      // First, verify current password by attempting to sign in
      console.log('[Settings] Verifying current password...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        console.error('[Settings] Current password verification failed:', signInError.message);
        Alert.alert(t('common.error'), t('settings.currentPasswordWrong'));
        setChangingPassword(false);
        return;
      }

      // Update password
      console.log('[Settings] Updating password...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('[Settings] Password update failed:', updateError.message);
        Alert.alert(t('common.error'), t('settings.changePasswordFailed', { error: updateError.message }));
      } else {
        console.log('[Settings] Password updated successfully');
        Alert.alert(
          t('common.success'),
          t('success.passwordChanged'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                // Clear form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordSection(false);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('[Settings] Error changing password:', error);
      Alert.alert(t('common.error'), t('settings.errorChangingPassword', { error: error.message }));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSetDefaultChild = async (childId: string | null) => {
    if (!user?.id) return;

    try {
      await setDefaultChild(user.id, childId);
      setDefaultChildId(childId);
      
      const childName = children.find(c => c.id === childId)?.name || t('common.none');
      Alert.alert(
        t('common.success'),
        childId 
          ? t('settings.defaultChildSet', { name: childName })
          : t('settings.defaultChildRemoved')
      );
      console.log('[Settings] Default child updated to:', childId);
    } catch (error: any) {
      console.error('[Settings] Error setting default child:', error);
      Alert.alert(t('common.error'), error.message || t('settings.saveDefaultChildFailed'));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title={t('common.settings')} 
        showBackButton
        onBack={() => {
          console.log('[Settings] Back button clicked');
          console.log('[Settings] Navigating back to previous screen');
          router.back();
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <CustomCard style={styles.profileCard} animated>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label={user?.email?.substring(0, 2).toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.babyBlue }}
            />
            <View style={styles.profileInfo}>
              <Text variant="titleLarge" style={styles.profileName}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text variant="bodyMedium" style={styles.profileEmail}>
                {user?.email}
              </Text>
            </View>
          </View>
          <CustomButton
            title={t('settings.editProfile')}
            variant="secondary"
            onPress={() => {
              console.log('[Settings]  button clicked');
              console.log('[Settings] Navigating to profile edit');
              try {
                router.push('/profile/edit');
                console.log('[Settings] Navigation to /profile/edit initiated');
              } catch (error) {
                console.error('[Settings] Navigation error:', error);
                Alert.alert(t('common.info'), t('settings.editProfileComingSoon'));
              }
            }}
            style={styles.editButton}
          />
        </CustomCard>

        {/* Language Selection */}
        <CustomCard style={styles.section} animated delay={45}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🌐 {t('settings.language')}
          </Text>
          <RadioButton.Group value={language} onValueChange={(value) => setLanguage(value as 'id' | 'en' | 'jp' | 'zh')}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🇮🇩 {t('settings.indonesian')}</Text>
                <Text style={styles.settingDescription}>Bahasa Indonesia</Text>
              </View>
              <RadioButton value="id" />
            </View>
            <Divider style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🇬🇧 {t('settings.english')}</Text>
                <Text style={styles.settingDescription}>English Language</Text>
              </View>
              <RadioButton value="en" />
            </View>
            <Divider style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🇯🇵 {t('settings.japanese')}</Text>
                <Text style={styles.settingDescription}>日本語</Text>
              </View>
              <RadioButton value="jp" />
            </View>
            <Divider style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🇨🇳 {t('settings.chinese')}</Text>
                <Text style={styles.settingDescription}>中文（简体）</Text>
              </View>
              <RadioButton value="zh" />
            </View>
          </RadioButton.Group>
        </CustomCard>

        {/* Change Password Section */}
        <CustomCard style={styles.section} animated delay={50}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🔐 {t('settings.security')}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.changePassword')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.changePasswordDesc')}
              </Text>
            </View>
          </View>

          <CustomButton
            title={showPasswordSection ? t('common.close') : t('settings.changePassword')}
            variant="secondary"
            onPress={() => {
              console.log('[Settings] Change Password toggle clicked');
              setShowPasswordSection(!showPasswordSection);
              if (showPasswordSection) {
                // Clear form when closing
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }
            }}
            style={styles.upgradeButton}
          />

          {showPasswordSection && (
            <View style={styles.passwordForm}>
              <Divider style={styles.divider} />
              
              <TextInput
                label={t('settings.currentPassword')}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                mode="outlined"
                style={styles.passwordInput}
                outlineColor={theme.colors.divider}
                activeOutlineColor={theme.colors.primary}
                disabled={changingPassword}
              />

              <TextInput
                label={t('settings.newPassword')}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                mode="outlined"
                style={styles.passwordInput}
                outlineColor={theme.colors.divider}
                activeOutlineColor={theme.colors.primary}
                disabled={changingPassword}
                placeholder={t('settings.minPasswordLength')}
              />

              <TextInput
                label={t('settings.confirmNewPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                mode="outlined"
                style={styles.passwordInput}
                outlineColor={theme.colors.divider}
                activeOutlineColor={theme.colors.primary}
                disabled={changingPassword}
              />

              <CustomButton
                title={changingPassword ? t('common.saving') : t('settings.savePassword')}
                variant="primary"
                onPress={handleChangePassword}
                style={styles.savePasswordButton}
                disabled={changingPassword}
              />
            </View>
          )}
        </CustomCard>

        {/* Default Child Settings */}
        {children.length > 0 && (
          <CustomCard style={styles.section} animated delay={75}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('settings.defaultChildTitle')}
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('settings.defaultChild')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.defaultChildDesc')}
                </Text>
              </View>
            </View>

            {loadingChildren ? (
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            ) : (
              <View style={styles.defaultChildOptions}>
                {/* Option: No Default (Auto-select first child) */}
                <TouchableOpacity
                  style={[
                    styles.childOption,
                    defaultChildId === null && styles.childOptionSelected,
                  ]}
                  onPress={() => handleSetDefaultChild(null)}
                >
                  <View style={styles.childOptionContent}>
                    <Text style={styles.childOptionEmoji}>🤖</Text>
                    <View style={styles.childOptionInfo}>
                      <Text style={styles.childOptionName}>{t('settings.autoFirstChild')}</Text>
                      <Text style={styles.childOptionDescription}>
                        {t('settings.autoFirstChildDesc')}
                      </Text>
                    </View>
                  </View>
                  {defaultChildId === null && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>

                {/* List of children */}
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.childOption,
                      defaultChildId === child.id && styles.childOptionSelected,
                    ]}
                    onPress={() => handleSetDefaultChild(child.id)}
                  >
                    <View style={styles.childOptionContent}>
                      <Image 
                        source={require('../../assets/mascot/Happy.png')} 
                        style={{ width: 32, height: 32, marginRight: 12 }} 
                        resizeMode="contain" 
                      />
                      <View style={styles.childOptionInfo}>
                        <Text style={styles.childOptionName}>{child.name}</Text>
                        <Text style={styles.childOptionDescription}>
                          {t('settings.yearsOld', { years: (new Date().getFullYear() - new Date(child.dob).getFullYear()).toString() })}
                        </Text>
                      </View>
                    </View>
                    {defaultChildId === child.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.defaultChildHint}>
              <Text style={styles.defaultChildHintText}>
                {t('settings.defaultChildTip')}
              </Text>
            </View>
          </CustomCard>
        )}

        {/* Notifications Settings */}
        <CustomCard style={styles.section} animated delay={100}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🔔 {t('settings.notificationsTitle')}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.enableNotifications')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.enableNotificationsDesc')}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              color={theme.colors.babyBlue}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.dailyTips')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.dailyTipsDesc')}
              </Text>
            </View>
            <Switch
              value={dailyTips}
              onValueChange={setDailyTips}
              color={theme.colors.babyBlue}
              disabled={!notifications}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.reminderAlerts')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.reminderAlertsDesc')}
              </Text>
            </View>
            <Switch
              value={reminderAlerts}
              onValueChange={setReminderAlerts}
              color={theme.colors.babyBlue}
              disabled={!notifications}
            />
          </View>
        </CustomCard>

        {/* Mascot Customization */}
        <CustomCard style={styles.section} animated delay={200}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('settings.mascotTitle')}
          </Text>
          <Text style={styles.settingDescription}>
            {t('settings.mascotDescription')}
          </Text>
          
          <View style={styles.mascotPreview}>
            <BabyBuddy expression={mascotExpression} size={120} animated />
          </View>

          <View style={styles.mascotOptions}>
            {(['happy', 'waving', 'thumbs-up', 'sleeping'] as MascotExpression[]).map((expression) => (
              <TouchableOpacity
                key={expression}
                style={[
                  styles.mascotOption,
                  mascotExpression === expression && styles.mascotOptionSelected,
                ]}
                onPress={async () => {
                  try {
                    await setMascotExpression(expression);
                  } catch (error) {
                    Alert.alert(t('common.error'), t('settings.saveMascotFailed'));
                  }
                }}
                disabled={preferencesLoading}
              >
                <BabyBuddy expression={expression} size={60} />
                <Text style={styles.mascotOptionLabel}>
                  {expression === 'happy' && t('settings.mascotHappy')}
                  {expression === 'waving' && t('settings.mascotWaving')}
                  {expression === 'thumbs-up' && t('settings.mascotThumbsUp')}
                  {expression === 'sleeping' && t('settings.mascotSleeping')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </CustomCard>

        {/* AI Persona Settings */}
        <CustomCard style={styles.section} animated delay={250}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('settings.aiPersonalityTitle')}
          </Text>
          <Text style={styles.settingDescription}>
            {t('settings.personalityDescriptionLong')}
          </Text>

          <View style={styles.personaOptions}>
            <TouchableOpacity
              style={[
                styles.personaCard,
                aiPersona === 'friendly' && styles.personaCardSelected,
              ]}
              onPress={async () => {
                try {
                  await setAIPersona('friendly');
                } catch (error) {
                  Alert.alert(t('common.error'), t('settings.savePersonaFailed'));
                }
              }}
              disabled={preferencesLoading}
            >
              <View style={styles.personaIconContainer}>
                <Image 
                  source={personaIcons.friendly} 
                  style={styles.personaIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.personaTitle}>{t('settings.personaFriendly')}</Text>
              <Text style={styles.personaDescription}>
                {t('settings.personaFriendlyDesc')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.personaCard,
                aiPersona === 'professional' && styles.personaCardSelected,
              ]}
              onPress={async () => {
                try {
                  await setAIPersona('professional');
                } catch (error) {
                  Alert.alert(t('common.error'), t('settings.savePersonaFailed'));
                }
              }}
              disabled={preferencesLoading}
            >
              <View style={styles.personaIconContainer}>
                <Image 
                  source={personaIcons.professional} 
                  style={styles.personaIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.personaTitle}>{t('settings.personaProfessional')}</Text>
              <Text style={styles.personaDescription}>
                {t('settings.personaProfessionalDesc')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.personaCard,
                aiPersona === 'encouraging' && styles.personaCardSelected,
              ]}
              onPress={async () => {
                try {
                  await setAIPersona('encouraging');
                } catch (error) {
                  Alert.alert(t('common.error'), t('settings.savePersonaFailed'));
                }
              }}
              disabled={preferencesLoading}
            >
              <View style={styles.personaIconContainer}>
                <Image 
                  source={personaIcons.encouraging} 
                  style={styles.personaIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.personaTitle}>{t('settings.personaEncouraging')}</Text>
              <Text style={styles.personaDescription}>
                {t('settings.personaEncouragingDesc')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.personaCard,
                aiPersona === 'concise' && styles.personaCardSelected,
              ]}
              onPress={async () => {
                try {
                  await setAIPersona('concise');
                } catch (error) {
                  Alert.alert(t('common.error'), t('settings.savePersonaFailed'));
                }
              }}
              disabled={preferencesLoading}
            >
              <View style={styles.personaIconContainer}>
                <Image 
                  source={personaIcons.concise} 
                  style={styles.personaIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.personaTitle}>{t('settings.personaConcise')}</Text>
              <Text style={styles.personaDescription}>
                {t('settings.personaConciseDesc')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.personaSample}>
            <Text style={styles.personaSampleLabel}>{t('settings.sampleResponse')}</Text>
            <View style={styles.personaSampleBubble}>
              <Text style={styles.personaSampleText}>
                {aiPersona === 'friendly' && t('settings.sampleResponseFriendly')}
                {aiPersona === 'professional' && t('settings.sampleResponseProfessional')}
                {aiPersona === 'encouraging' && t('settings.sampleResponseEncouraging')}
                {aiPersona === 'concise' && t('settings.sampleResponseConcise')}
              </Text>
            </View>
          </View>
        </CustomCard>

        {/* Appearance Settings */}
        <CustomCard style={styles.section} animated delay={300}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🎨 {t('settings.appearanceTitle')}
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>{t('common.comingSoon')}</Text>
            </View>
          </View>
          <View style={[styles.settingRow, styles.settingRowDisabled]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.settingLabelDisabled]}>
                {t('settings.darkMode')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.darkModeDesc')}
              </Text>
            </View>
            <Switch
              value={false}
              disabled={true}
              color={theme.colors.disabled}
            />
          </View>
        </CustomCard>

        {/* Subscription Settings */}
        <CustomCard style={styles.section} animated delay={300}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            💎 {t('subscription.title')}
          </Text>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionPlan}>{t('subscription.freePlan')}</Text>
            <Text style={styles.subscriptionDescription}>
              {t('subscription.upgradePrompt')}
            </Text>
          </View>
          <CustomButton
            title={t('subscription.manageSubscription')}
            variant="primary"
            onPress={() => {
              console.log('[Settings] Kelola Langganan button clicked');
              console.log('[Settings] Navigating to /subscription');
              try {
                router.push('/subscription');
                console.log('[Settings] Navigation to /subscription initiated');
              } catch (error) {
                console.error('[Settings] Navigation error:', error);
              }
            }}
            style={styles.upgradeButton}
          />
        </CustomCard>

        {/* Referral & Rewards */}
        <CustomCard style={styles.section} animated delay={350}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🎁 {t('settings.referralTitle')}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.inviteFriends')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.inviteFriendsDesc')}
              </Text>
            </View>
          </View>
          <CustomButton
            title={t('settings.shareReferralCode')}
            variant="secondary"
            onPress={() => {
              console.log('[Settings] Bagikan Kode Referral button clicked');
              console.log('[Settings] Navigating to /referral');
              try {
                router.push('/referral');
                console.log('[Settings] Navigation to /referral initiated');
              } catch (error) {
                console.error('[Settings] Navigation error:', error);
              }
            }}
            style={styles.upgradeButton}
          />
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.achievements')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.achievementsDesc')}
              </Text>
            </View>
          </View>
          <CustomButton
            title={t('settings.viewMyBadges')}
            variant="secondary"
            onPress={() => {
              console.log('[Settings] Lihat Badge Saya button clicked');
              console.log('[Settings] Navigating to /badges');
              try {
                router.push('/badges');
                console.log('[Settings] Navigation to /badges initiated');
              } catch (error) {
                console.error('[Settings] Navigation error:', error);
              }
            }}
            style={styles.upgradeButton}
          />
        </CustomCard>

        {/* Developer Tools (Testing Only) */}
        {__DEV__ && (
          <CustomCard style={styles.section} animated delay={350}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🧪 Developer Tools
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Test Usage Limits</Text>
                <Text style={styles.settingDescription}>
                  Run integration tests for monetization
                </Text>
              </View>
            </View>
            <CustomButton
              title="Run Tests"
              variant="secondary"
              onPress={() => router.push('/test-usage-limits')}
              style={styles.upgradeButton}
            />
          </CustomCard>
        )}

        {/* About Section */}
        <CustomCard style={styles.section} animated delay={400}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            ℹ️ {t('settings.aboutTitle')}
          </Text>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>{t('settings.appVersion')}</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>{t('settings.buildNumber')}</Text>
            <Text style={styles.aboutValue}>2024.11.07</Text>
          </View>
          <CustomButton
            title={t('settings.privacyPolicy')}
            variant="secondary"
            onPress={() => {
              console.log('[Settings] Privacy Policy button clicked');
              Linking.openURL('https://parentingai.netlify.app/privacy-policy')
                .catch((error) => {
                  console.error('[Settings] Failed to open URL:', error);
                  Alert.alert(t('common.error'), 'Could not open Privacy Policy');
                });
            }}
            style={styles.aboutButton}
          />
          <CustomButton
            title={t('settings.termsAndConditions')}
            variant="secondary"
            onPress={() => {
              console.log('[Settings] Terms & Conditions button clicked');
              Linking.openURL('https://parentingai.netlify.app/terms')
                .catch((error) => {
                  console.error('[Settings] Failed to open URL:', error);
                  Alert.alert(t('common.error'), 'Could not open Terms & Conditions');
                });
            }}
            style={styles.aboutButton}
          />
        </CustomCard>

        {/* Account Actions */}
        <CustomCard style={styles.section} animated delay={500}>
          <CustomButton
            title={t('auth.signOut')}
            variant="secondary"
            onPress={handleSignOut}
            style={styles.actionButton}
          />
          <CustomButton
            title={t('settings.deleteAccount')}
            variant="secondary"
            onPress={handleDeleteAccount}
            textStyle={{ color: theme.colors.error }}
            style={styles.actionButton}
          />
        </CustomCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  profileCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileInfo: {
    marginLeft: theme.spacing.lg,
    flex: 1,
  },
  profileName: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  profileEmail: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  editButton: {
    marginTop: theme.spacing.md,
  },
  section: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  subscriptionInfo: {
    marginBottom: theme.spacing.lg,
  },
  subscriptionPlan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  upgradeButton: {
    marginTop: theme.spacing.sm,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  aboutLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  aboutValue: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  aboutButton: {
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    marginBottom: theme.spacing.sm,
  },
  // Mascot Customization
  mascotPreview: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  mascotOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-around',
    marginTop: theme.spacing.lg,
  },
  mascotOption: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.medium,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.white,
    minWidth: 100,
  },
  mascotOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.babyBlue + '20',
  },
  mascotOptionLabel: {
    marginTop: theme.spacing.sm,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  // AI Persona
  personaOptions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  personaCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borders.radius.medium,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.white,
  },
  personaCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.babyBlue + '15',
  },
  personaIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.babyBlue + '20',
    borderRadius: 40,
  },
  personaIcon: {
    width: 60,
    height: 60,
  },
  personaEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  personaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  personaDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  personaSample: {
    marginTop: theme.spacing.xl,
  },
  personaSampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  personaSampleBubble: {
    backgroundColor: theme.colors.babyBlue,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.medium,
    ...theme.shadows.small,
  },
  personaSampleText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textPrimary,
  },
  // Change Password Styles
  passwordForm: {
    marginTop: theme.spacing.md,
  },
  passwordInput: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  savePasswordButton: {
    marginTop: theme.spacing.sm,
  },
  // Default Child Styles
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  defaultChildOptions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  childOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.medium,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.white,
  },
  childOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.babyBlue + '15',
  },
  childOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  childOptionEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  childOptionInfo: {
    flex: 1,
  },
  childOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  childOptionDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  checkmark: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  defaultChildHint: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.babyBlue + '10',
    borderRadius: theme.borders.radius.medium,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  defaultChildHintText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  // Dark Mode Coming Soon Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.babyBlue + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borders.radius.small,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingLabelDisabled: {
    color: theme.colors.textSecondary,
  },
});
