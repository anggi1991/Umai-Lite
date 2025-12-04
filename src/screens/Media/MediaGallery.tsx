// Media Gallery Screen - Display and manage child photos
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import {
  Text,
  FAB,
  ActivityIndicator,
  IconButton,
  Portal,
  Dialog,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabaseClient';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as mediaService from '../../services/mediaService';
import type { Media } from '../../services/mediaService';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomCard } from '../../components/ui/CustomCard';
import { CustomInput } from '../../components/ui/CustomInput';
import { BabyBuddyEmptyState } from '../../components/mascot';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3; // 3 columns with padding

export default function MediaGallery({ route }: any) {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const childIdFromRoute = route?.params?.childId;
  const childIdFromParams = params?.childId as string;
  const childId = childIdFromParams || childIdFromRoute;

  console.log('MediaGallery mounted with childId:', childId);

  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [captionDialogVisible, setCaptionDialogVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [hasChildren, setHasChildren] = useState(false);
  const [selectChildModalVisible, setSelectChildModalVisible] = useState(false);
  const [addChildModalVisible, setAddChildModalVisible] = useState(false);
  const [uploadPromptVisible, setUploadPromptVisible] = useState(false); // prompt user instead of auto invoke picker
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const checkUserChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;
      return (data && data.length > 0);
    } catch (error) {
      console.error('Error checking children:', error);
      return false;
    }
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = childId
        ? await mediaService.getMediaByChild(childId)
        : await mediaService.getAllUserMedia();
      console.log('=== LOADED MEDIA ===');
      console.log('Media count:', data.length);
      if (data.length > 0) {
        console.log('Sample media URL:', data[0].url);
        console.log('URL starts with http:', data[0].url.startsWith('http'));
      }
      setMedia(data);
    } catch (error) {
      console.error('Load media error:', error);
      Alert.alert(t('common.error'), t('media.uploadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFailedImages(new Set()); // Clear failed images on refresh
    await loadMedia();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadMedia();
      checkUserChildren().then(setHasChildren);

      // Instead of auto starting picker (which hangs on web), show a prompt modal
      if (childId && params?.autoUpload === 'true') {
        console.log('Showing upload prompt instead of auto-trigger for childId:', childId);
        router.setParams({ autoUpload: undefined }); // clear param
        setUploadPromptVisible(true);
      }
    }, [childId, params?.autoUpload])
  );

  const handleAddPhoto = async () => {
    console.log('=== HANDLE ADD PHOTO CLICKED ===');
    console.log('Current childId:', childId);
    console.log('Current uploading state:', uploading);
    
    try {
      // Check if user has any children
      console.log('Checking if user has children...');
      const hasAnyChildren = await checkUserChildren();
      console.log('Has children:', hasAnyChildren);
      
      if (!hasAnyChildren) {
        console.log('No children found, showing modal...');
        setAddChildModalVisible(true);
        return;
      }

      // If no specific childId from route, ask user to select
      if (!childId) {
        console.log('No childId from route, showing select modal...');
        setSelectChildModalVisible(true);
        return;
      }

      console.log('Starting upload process...');
      setUploading(true);
      console.log('Picking image (with timeout)...');

      // Wrap picker in timeout to avoid indefinite hanging on web
      const PICKER_TIMEOUT_MS = 15000; // 15s safeguard
      const imageAsset = await Promise.race([
        mediaService.pickImage(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), PICKER_TIMEOUT_MS)),
      ]);

      if (imageAsset === null) {
        console.warn('Image picker timed out or user cancelled.');
        Alert.alert(t('media.cancelled'), t('media.selectionCancelled'));
        setUploading(false);
        return;
      }

      console.log('Image picked:', imageAsset);
      
      if (!imageAsset) {
        console.log('No image selected');
        setUploading(false);
        return;
      }

      console.log('Uploading media...');
      const newMedia = await mediaService.uploadMedia({ childId }, imageAsset);
      console.log('Upload successful:', newMedia);
      console.log('New media URL:', newMedia.url);
      console.log('URL is valid HTTP:', newMedia.url.startsWith('http'));
      
      // Only add to state if URL is valid
      if (newMedia.url && newMedia.url.startsWith('http')) {
        console.log('Adding new media to state and reloading...');
        // Reload entire gallery to ensure consistency
        await loadMedia();
        Alert.alert(t('common.success'), t('media.uploadSuccess'));
      } else {
        console.error('Invalid media URL returned:', newMedia.url);
        Alert.alert(t('common.error'), t('media.invalidUrlError'));
      }
    } catch (error: any) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Error details:', error);
      Alert.alert(
        t('media.uploadError'),
        error.message === 'User not authenticated'
          ? t('media.loginRequired')
          : error.message || t('media.uploadFailed')
      );
    } finally {
      console.log('Upload process finished, setting uploading to false');
      setUploading(false);
      setUploadPromptVisible(false); // ensure prompt closes if it was open
    }
  };

  const handleDeletePhoto = (item: Media) => {
    Alert.alert(t('media.deletePhoto'), t('media.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await mediaService.deleteMedia(item.id);
            setMedia((prev) => prev.filter((m) => m.id !== item.id));
            Alert.alert(t('common.success'), t('media.photoDeleted'));
          } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('media.deleteFailed'));
          }
        },
      },
    ]);
  };

  const handleEditCaption = (item: Media) => {
    setSelectedMedia(item);
    setCaption(item.caption || '');
    setCaptionDialogVisible(true);
  };

  const handleSaveCaption = async () => {
    if (!selectedMedia) return;
    try {
      const updated = await mediaService.updateMediaCaption(
        selectedMedia.id,
        caption
      );
      setMedia((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      setCaptionDialogVisible(false);
      Alert.alert(t('common.success'), t('media.captionUpdated'));
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('media.updateCaptionFailed'));
    }
  };

  const renderItem = ({ item }: { item: Media }) => {
    console.log('Rendering item with URL:', item.url);
    const imageFailedToLoad = failedImages.has(item.id);
    
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onLongPress={() => handleEditCaption(item)}
      >
        {imageFailedToLoad ? (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <IconButton icon="image-off" size={40} iconColor="#999" />
            <Text style={styles.placeholderText}>Failed to load</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: item.url }} 
            style={styles.image}
            onError={(error) => {
              console.error('Image load error for URL:', item.url);
              console.error('Error:', error.nativeEvent.error);
              setFailedImages(prev => new Set([...prev, item.id]));
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', item.url);
            }}
          />
        )}
        <IconButton
          icon="delete"
          size={20}
          iconColor="#fff"
          style={styles.deleteButton}
          onPress={() => handleDeletePhoto(item)}
        />
        {item.caption && (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionText} numberOfLines={2}>
              {item.caption}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[theme.colors.babyBlue, theme.colors.softPink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text variant="headlineMedium" style={styles.headerTitle}>
          📸 Galeri Foto
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {t('media.subtitle')}
        </Text>
      </LinearGradient>

      {media.length === 0 ? (
        <View style={styles.emptyState}>
          <BabyBuddyEmptyState
            message={t('media.noPhotos')}
            submessage={t('media.uploadFirst')}
            expression="waving"
          />
        </View>
      ) : (
        <FlatList
          data={media}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      <FAB
        icon="camera-plus"
        style={styles.fab}
        color={theme.colors.white}
        onPress={() => {
          console.log('FAB button clicked!');
          handleAddPhoto();
        }}
        loading={uploading}
        disabled={uploading}
      />

      {/* Edit Caption Modal */}
      <Portal>
        <Modal
          visible={captionDialogVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCaptionDialogVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <CustomCard style={styles.modalContainer}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                ✏️ Edit Caption
              </Text>
              
              <CustomInput
                label="Caption"
                value={caption}
                onChangeText={setCaption}
                placeholder="Tulis caption untuk foto ini..."
                multiline
                numberOfLines={3}
                style={styles.captionInput}
              />
              
              <View style={styles.modalButtons}>
                <CustomButton
                  title={t('common.cancel')}
                  onPress={() => setCaptionDialogVisible(false)}
                  variant="tertiary"
                  style={styles.modalButton}
                />
                <CustomButton
                  title={t('common.save')}
                  onPress={handleSaveCaption}
                  variant="primary"
                  style={styles.modalButton}
                />
              </View>
            </CustomCard>
          </View>
        </Modal>
      </Portal>

      {/* Modal Pilih Anak */}
      <Modal
        visible={selectChildModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectChildModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <CustomCard style={styles.modalContainer}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {t('media.selectChild')}
            </Text>
            <Text variant="bodyMedium" style={styles.modalMessage}>
              {t('media.selectChildMessage')}
            </Text>
            <View style={styles.modalButtons}>
              <CustomButton
                title={t('common.cancel')}
                variant="tertiary"
                onPress={() => {
                  console.log('User cancelled select child');
                  setSelectChildModalVisible(false);
                }}
                style={styles.modalButton}
              />
              <CustomButton
                title={t('media.selectChildButton')}
                variant="primary"
                onPress={() => {
                  console.log('Navigating to /child with select mode');
                  setSelectChildModalVisible(false);
                  router.push('/child?selectMode=true&returnTo=media');
                }}
                style={styles.modalButton}
              />
            </View>
          </CustomCard>
        </View>
      </Modal>

      {/* Modal Tambah Anak */}
      <Modal
        visible={addChildModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddChildModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <CustomCard style={styles.modalContainer}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {t('media.addChildFirst')}
            </Text>
            <Text variant="bodyMedium" style={styles.modalMessage}>
              {t('media.addChildMessage')}
            </Text>
            <View style={styles.modalButtons}>
              <CustomButton
                title={t('common.cancel')}
                variant="tertiary"
                onPress={() => {
                  console.log('User cancelled add child');
                  setAddChildModalVisible(false);
                }}
                style={styles.modalButton}
              />
              <CustomButton
                title={t('child.addChild')}
                variant="primary"
                onPress={() => {
                  console.log('Navigating to /child/add');
                  setAddChildModalVisible(false);
                  router.push('/child/add');
                }}
                style={styles.modalButton}
              />
            </View>
          </CustomCard>
        </View>
      </Modal>

      {/* Modal Prompt Upload (shown after selecting child) */}
      <Modal
        visible={uploadPromptVisible && !!childId && !uploading}
        transparent
        animationType="fade"
        onRequestClose={() => setUploadPromptVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <CustomCard style={styles.modalContainer}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {t('media.uploadPhoto')}
            </Text>
            <Text variant="bodyMedium" style={styles.modalMessage}>
              {t('media.uploadPrompt')}
            </Text>
            <View style={styles.modalButtons}>
              <CustomButton
                title={t('common.cancel')}
                variant="tertiary"
                onPress={() => {
                  console.log('User cancelled upload prompt');
                  setUploadPromptVisible(false);
                }}
                style={styles.modalButton}
              />
              <CustomButton
                title={t('media.selectPhoto')}
                variant="primary"
                disabled={uploading}
                onPress={() => {
                  console.log('User confirmed upload prompt');
                  setUploadPromptVisible(false);
                  handleAddPhoto();
                }}
                style={styles.modalButton}
              />
            </View>
          </CustomCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 48,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.white,
    opacity: 0.9,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    padding: theme.spacing.sm,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: theme.spacing.xs,
    borderRadius: theme.borders.radius.medium,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    position: 'relative',
    ...theme.shadows.small,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  placeholderText: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    margin: theme.spacing.xs,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: theme.spacing.xs,
  },
  captionText: {
    color: theme.colors.white,
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  modalMessage: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
  captionInput: {
    marginBottom: theme.spacing.md,
  },
});
