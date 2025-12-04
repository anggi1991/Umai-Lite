import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, RadioButton, Avatar, ActivityIndicator } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { getChildById, updateChild } from '../../services/childService';
import { CustomButton, CustomCard, CustomInput, AppHeader } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

export default function EditChildScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const childId = Array.isArray(id) ? id[0] : id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!childId) return;
      try {
        const data = await getChildById(childId);
        setName(data.name);
        setDob(new Date(data.dob));
        setGender((data.gender as 'male' | 'female') || 'male');
        setPhotoUri(data.photo_url || null);
        if (data.initial_weight_kg) setWeight(String(data.initial_weight_kg));
        if (data.initial_height_cm) setHeight(String(data.initial_height_cm));
      } catch (err) {
        console.error('Error load child', err);
        Alert.alert(t('common.error'), t('errors.loadChildFailed'));
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
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

  const validate = () => {
    if (!name.trim()) {
      Alert.alert(t('child.validation'), t('child.nameRequired'));
      return false;
    }
    if (dob > new Date()) {
      Alert.alert(t('child.validation'), t('child.dobInvalid'));
      return false;
    }
    if (weight && (isNaN(Number(weight)) || Number(weight) <= 0 || Number(weight) > 50)) {
      Alert.alert(t('child.validation'), t('child.weightInvalid'));
      return false;
    }
    if (height && (isNaN(Number(height)) || Number(height) <= 0 || Number(height) > 200)) {
      Alert.alert(t('child.validation'), t('child.heightInvalid'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!childId) return;
    if (!validate()) return;
    setSaving(true);
    try {
      await updateChild(childId, {
        name: name.trim(),
        dob: dob.toISOString().split('T')[0],
        gender,
        photo_url: photoUri || undefined,
        initial_weight_kg: weight ? Number(weight) : undefined,
        initial_height_cm: height ? Number(height) : undefined,
      });
      
      // Langsung redirect tanpa alert untuk UX yang lebih smooth
      console.log('Child updated successfully, redirecting...');
      router.back();
      
      // Show success toast setelah redirect
      setTimeout(() => {
        Alert.alert(t('common.success'), t('success.updateChildSuccess'));
      }, 300);
    } catch (err: any) {
      console.error('Update child error', err);
      Alert.alert(t('common.error'), err.message || t('errors.updateChildFailed'));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator size="large" color={theme.colors.babyBlue} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={`✏️ ${t('child.editChild')}`} showBackButton />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <CustomCard style={styles.card} animated>
          <View style={styles.photoWrap}>
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
              title={`📷 ${t('child.changePhoto')}`}
              variant="secondary"
              onPress={pickImage} 
              style={styles.photoBtn}
              disabled={saving}
            />
          </View>

          <CustomInput 
            label={`${t('child.name')} *`}
            value={name} 
            onChangeText={setName} 
            style={styles.input} 
            disabled={saving} 
          />

          {/* Tanggal Lahir */}
          <Text variant="labelLarge" style={styles.label}>🎂 {t('child.birthDate')} *</Text>
          <CustomButton
            title={dob.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            variant="secondary"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            disabled={saving}
          />
          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setDob(selectedDate);
              }}
            />
          )}

          {/* Gender */}
          <Text variant="labelLarge" style={styles.label}>{t('child.gender')} *</Text>
          <RadioButton.Group onValueChange={(val) => setGender(val as 'male' | 'female')} value={gender}>
            <View style={styles.radioRow}>
              <View style={styles.radioItem}>
                <RadioButton value="male" disabled={saving} color={theme.colors.babyBlue} />
                <Text style={styles.radioText}>👦 {t('child.male')}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="female" disabled={saving} color={theme.colors.softPink} />
                <Text style={styles.radioText}>👧 {t('child.female')}</Text>
              </View>
            </View>
          </RadioButton.Group>

          {/* Weight */}
          <CustomInput
            label={`⚖️ ${t('child.initialWeight')}`}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            style={styles.input}
            disabled={saving}
            placeholder={t('child.weightPlaceholder')}
          />

          {/* Height */}
          <CustomInput
            label={`📏 ${t('child.initialHeight')}`}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            style={styles.input}
            disabled={saving}
            placeholder={t('child.heightPlaceholder')}
          />

          <Text variant="bodySmall" style={styles.infoText}>💡 {t('child.requiredFields')}</Text>

          <View style={styles.actions}>
            <CustomButton 
              title={t('common.cancel')}
              variant="secondary"
              onPress={() => router.back()} 
              style={styles.actionBtn} 
              disabled={saving}
            />
            <CustomButton 
              title={t('common.save')}
              variant="primary"
              onPress={handleSave} 
              style={styles.actionBtn} 
              loading={saving} 
              disabled={saving || !name.trim()}
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
  scroll: { 
    padding: theme.spacing.lg,
  },
  card: { 
    padding: theme.spacing.lg,
  },
  photoWrap: { 
    alignItems: 'center', 
    marginBottom: theme.spacing.xl,
  },
  photoBtn: { 
    marginTop: theme.spacing.md,
  },
  input: { 
    marginBottom: theme.spacing.lg,
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
  radioRow: { 
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
  actionBtn: { 
    flex: 1,
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
});