import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Avatar, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { CustomButton } from '../../src/components/ui/CustomButton';
import { CustomCard } from '../../src/components/ui/CustomCard';
import { supabase } from '../../src/services/supabaseClient';
import { useTranslation } from '../../src/hooks/useTranslation';
import { compressProfilePhoto } from '../../src/utils/imageCompression';
import theme from '../../src/theme';

interface ProfileData {
  full_name: string;
  avatar_url: string | null;
  phone: string;
  bio: string;
}

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    avatar_url: null,
    phone: '',
    bio: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      console.log('[EditProfile] Loading profile...');
      setLoading(true);
      
      if (!user) {
        console.log('[EditProfile] No user found');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[EditProfile] Error loading profile:', error);
        throw error;
      }

      console.log('[EditProfile] Profile loaded:', data);
      setProfile({
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || null,
        phone: data.phone || '',
        bio: data.bio || '',
      });
    } catch (error) {
      console.error('[EditProfile] Error:', error);
      Alert.alert('Error', 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      console.log('[EditProfile] Requesting media library permission...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', t('profile.selectPhoto'));
        return;
      }

      console.log('[EditProfile] Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // ✅ No cropping required
        quality: 1, // ✅ Full quality, no compression
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[EditProfile] Image selected, uploading...');
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[EditProfile] Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploadingImage(true);
      console.log('[EditProfile] Uploading image to Supabase Storage...');

      // ✅ Compress to WebP using utility function
      const compressedUri = await compressProfilePhoto(uri);

      // Convert compressed WebP to blob
      const response = await fetch(compressedUri);
      const blob = await response.blob();
      
      // Create unique filename with .webp extension
      const fileName = `${user?.id}-${Date.now()}.webp`;
      const filePath = `avatars/${fileName}`;

      console.log('📤 Uploading WebP to Supabase...');
      console.log('File size (bytes):', blob.size);
      console.log('File size (KB):', (blob.size / 1024).toFixed(2));

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) {
        console.error('[EditProfile] Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log('[EditProfile] Image uploaded, URL:', publicUrl);
      
      // Update profile with new avatar URL
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      Alert.alert(t('profile.photoUploaded'), t('profile.photoUploaded'));
    } catch (error) {
      console.error('[EditProfile] Error uploading image:', error);
      Alert.alert('Error', t('profile.photoUploadFailed'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('[EditProfile] Saving profile...');
      setSaving(true);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate
      if (!profile.full_name.trim()) {
        Alert.alert('Validasi', t('profile.fullName'));
        return;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name.trim(),
          avatar_url: profile.avatar_url,
          phone: profile.phone.trim(),
          bio: profile.bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('[EditProfile] Save error:', error);
        throw error;
      }

      console.log('[EditProfile] Profile saved successfully');
      Alert.alert(t('profile.profileUpdated'), t('profile.profileUpdated'), [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('[EditProfile] Error saving:', error);
      Alert.alert('Error', t('profile.profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('profile.uploadingPhoto')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.babyBlue, theme.colors.softPink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <CustomButton
          title={t('common.cancel')}
          variant="tertiary"
          onPress={() => router.back()}
          textStyle={{ color: theme.colors.white }}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          ✏️ {t('profile.editTitle')}
        </Text>
        <View style={{ width: 100 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <CustomCard style={styles.section} animated>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  size={120}
                  label={profile.full_name?.substring(0, 2).toUpperCase() || 'U'}
                  style={styles.avatar}
                />
              )}
              
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color={theme.colors.white} />
                </View>
              )}

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={24}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.avatarHint}>
              {t('profile.changePhoto')}
            </Text>
          </View>
        </CustomCard>

        {/* Personal Info */}
        <CustomCard style={styles.section} animated delay={100}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            👤 {t('profile.fullName')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.fullName')} *</Text>
            <TextInput
              mode="outlined"
              value={profile.full_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
              placeholder={t('profile.fullNamePlaceholder')}
              style={styles.input}
              outlineColor={theme.colors.divider}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.email')}</Text>
            <TextInput
              mode="outlined"
              value={user?.email || ''}
              editable={false}
              style={styles.input}
              outlineColor={theme.colors.divider}
              disabled
            />
            <Text style={styles.inputHint}>Email tidak dapat diubah</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.phone')}</Text>
            <TextInput
              mode="outlined"
              value={profile.phone}
              onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
              placeholder={t('profile.phonePlaceholder')}
              keyboardType="phone-pad"
              style={styles.input}
              outlineColor={theme.colors.divider}
              activeOutlineColor={theme.colors.primary}
            />
          </View>
        </CustomCard>

        {/* Bio Section */}
        <CustomCard style={styles.section} animated delay={200}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📝 {t('profile.bio')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.bio')}</Text>
            <TextInput
              mode="outlined"
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              placeholder={t('profile.bioPlaceholder')}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
              outlineColor={theme.colors.divider}
              activeOutlineColor={theme.colors.primary}
            />
            <Text style={styles.inputHint}>
              {profile.bio.length}/200 karakter
            </Text>
          </View>
        </CustomCard>

        {/* Save Button */}
        <CustomCard style={styles.section} animated delay={300}>
          <CustomButton
            title={saving ? t('profile.saving') : t('profile.saveChanges')}
            variant="primary"
            onPress={handleSave}
            disabled={saving || uploadingImage}
            style={styles.saveButton}
          />
          
          <CustomButton
            title={t('common.cancel')}
            variant="secondary"
            onPress={() => router.back()}
            disabled={saving}
            style={styles.cancelButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
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
  section: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.babyBlue,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  avatarHint: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.white,
  },
  inputHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginBottom: theme.spacing.sm,
  },
  cancelButton: {
    marginTop: theme.spacing.xs,
  },
});
