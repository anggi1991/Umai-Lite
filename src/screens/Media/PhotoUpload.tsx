import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase } from '../../services/supabaseClient';
import * as mediaService from '../../services/mediaService';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  childId: string;
  onSuccess?: () => void;
}

export default function PhotoUpload({ childId, onSuccess }: Props) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      // Verify auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('auth.loginRequired'), t('media.loginToUpload'));
        return;
      }

      // Request permissions
      const permissionResult = await mediaService.requestMediaPermissions();
      if (!permissionResult) {
        Alert.alert(
          t('media.permissionRequired'),
          t('media.permissionMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.settings'), onPress: () => {/* TODO: Open settings */} }
          ]
        );
        return;
      }

      setUploading(true);

      // Pick image
      const imageAsset = await mediaService.pickImage();
      if (!imageAsset) {
        setUploading(false);
        return; // User cancelled
      }

      // Upload
      const _newMedia = await mediaService.uploadMedia({ childId }, imageAsset);
      
      // Success
      if (onSuccess) onSuccess();
      Alert.alert(t('common.success'), t('success.photoUploaded'));

    } catch (error: any) {
      console.error('Upload error:', error);
      
      let message = t('media.uploadFailed');
      if (error.message?.includes('permission')) {
        message = t('media.permissionDenied');
      } else if (error.message?.includes('authenticated')) {
        message = t('media.loginRequired');
      } else if (error.message?.includes('storage')) {
        message = t('media.storageError');
      }
      
      Alert.alert(t('media.uploadError'), message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        icon="camera-plus"
        loading={uploading}
        disabled={uploading}
        onPress={handleUpload}
      >
        {uploading ? t('media.uploading') : t('media.uploadButtonText')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});