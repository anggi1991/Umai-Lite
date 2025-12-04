import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, RadioButton, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { createChild } from '../../services/childService';
import { CustomButton, CustomCard, CustomInput, AppHeader } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

export default function AddChildScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(t('media.permissionRequired'), t('media.permissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // ✅ No cropping required
      quality: 1, // ✅ Full quality, no compression
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert(t('child.validation'), t('child.nameRequired'));
      return false;
    }

    const today = new Date();
    if (dob > today) {
      Alert.alert(t('child.validation'), t('child.dobFuture'));
      return false;
    }

    if (weight && (isNaN(Number(weight)) || Number(weight) <= 0 || Number(weight) > 50)) {
      Alert.alert(t('child.validation'), t('child.weightRange'));
      return false;
    }

    if (height && (isNaN(Number(height)) || Number(height) <= 0 || Number(height) > 200)) {
      Alert.alert(t('child.validation'), t('child.heightRange'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createChild(user.id, {
        name: name.trim(),
        dob: dob.toISOString().split('T')[0], // Format: YYYY-MM-DD
        gender,
        photo_url: photoUri || undefined,
        initial_weight_kg: weight ? Number(weight) : undefined,
        initial_height_cm: height ? Number(height) : undefined,
      });

      Alert.alert(t('common.success'), t('success.addChildSuccess'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating child:', error);
      Alert.alert(t('common.error'), t('errors.addChildFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader title={t('child.addChild')} showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomCard style={styles.card} animated>
          {/* Photo Picker */}
          <View style={styles.photoContainer}>
            {photoUri ? (
              <Avatar.Image size={120} source={{ uri: photoUri }} />
            ) : (
              <Avatar.Icon 
                size={120} 
                icon="account" 
                style={{ backgroundColor: theme.colors.babyBlue }}
              />
            )}
            <CustomButton 
              title={t('child.choosePhoto')}
              variant="secondary"
              onPress={pickImage} 
              style={styles.photoButton}
              disabled={loading}
            />
          </View>

          {/* Name */}
          <CustomInput
            label={`${t('child.name')} *`}
            value={name}
            onChangeText={setName}
            style={styles.input}
            disabled={loading}
          />

          {/* Date of Birth */}
          <Text variant="labelLarge" style={styles.label}>
            🎂 {t('child.birthDate')} *
          </Text>
          <CustomButton
            title={dob.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            variant="secondary"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            disabled={loading}
          />

          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDob(selectedDate);
                }
              }}
            />
          )}

          {/* Gender */}
          <Text variant="labelLarge" style={styles.label}>
            {t('child.genderLabel')}
          </Text>
          <RadioButton.Group onValueChange={(value) => setGender(value as any)} value={gender}>
            <View style={styles.radioContainer}>
              <View style={styles.radioItem}>
                <RadioButton value="male" disabled={loading} color={theme.colors.babyBlue} />
                <Text style={styles.radioText}>{t('child.boyLabel')}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="female" disabled={loading} color={theme.colors.softPink} />
                <Text style={styles.radioText}>{t('child.girlLabel')}</Text>
              </View>
            </View>
          </RadioButton.Group>

          {/* Weight */}
          <CustomInput
            label={t('child.initialWeightLabel')}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            style={styles.input}
            disabled={loading}
            placeholder={t('child.weightPlaceholder')}
          />

          {/* Height */}
          <CustomInput
            label={t('child.initialHeightLabel')}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            style={styles.input}
            disabled={loading}
            placeholder={t('child.heightPlaceholder')}
          />

          {/* Info */}
          <Text variant="bodySmall" style={styles.infoText}>
            {t('child.requiredFieldsNote')}
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            {t('child.initialDataNote')}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <CustomButton
              title={t('common.cancel')}
              variant="secondary"
              onPress={() => router.back()}
              style={styles.actionButton}
              disabled={loading}
            />
            <CustomButton
              title={t('common.save')}
              variant="primary"
              onPress={handleSubmit}
              style={styles.actionButton}
              loading={loading}
              disabled={loading || !name.trim()}
            />
          </View>
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
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2, // Extra space for keyboard
  },
  card: {
    padding: theme.spacing.lg,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  photoButton: {
    marginTop: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md, // Reduced from lg to md
  },
  label: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  dateButton: {
    marginBottom: theme.spacing.lg,
    justifyContent: 'flex-start',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
  },
  radioText: {
    color: theme.colors.textPrimary,
  },
  infoText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
