import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  Divider,
  Chip,
  RadioButton,
} from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ActivityType, ActivityInput } from '../../types/database';
import { useTranslation } from '../../hooks/useTranslation';

interface AddActivityModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (activity: ActivityInput) => Promise<void>;
  preselectedType?: ActivityType;
}

export default function AddActivityModal({
  visible,
  onDismiss,
  onSubmit,
  preselectedType,
}: AddActivityModalProps) {
  const { t } = useTranslation();
  const [activityType, setActivityType] = useState<ActivityType>(
    preselectedType || 'feeding'
  );
  const [startTime, setStartTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Feeding specific
  const [feedingType, setFeedingType] = useState<'breast' | 'bottle' | 'solid'>('breast');
  const [amount, setAmount] = useState('');
  const [feedingDuration, setFeedingDuration] = useState(''); // For breast feeding (minutes)

  // Sleep specific
  const [sleepDuration, setSleepDuration] = useState('');

  // Diaper specific
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both'>('wet');

  // Mood specific
  const [moodType, setMoodType] = useState<'happy' | 'neutral' | 'fussy' | 'crying'>('happy');

  const resetForm = () => {
    setActivityType(preselectedType || 'feeding');
    setStartTime(new Date());
    setValue('');
    setNotes('');
    setFeedingType('breast');
    setAmount('');
    setFeedingDuration('');
    setSleepDuration('');
    setDiaperType('wet');
    setMoodType('happy');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const metadata: Record<string, any> = { notes };

      let activityValue = value;

      switch (activityType) {
        case 'feeding':
          metadata.feeding_type = feedingType;
          
          // For breast feeding: use duration in minutes
          if (feedingType === 'breast') {
            const durationMinutes = parseInt(feedingDuration) || 0;
            metadata.duration_minutes = durationMinutes;
            activityValue = `${t('feeding.breast')} - ${durationMinutes} ${t('sleep.minutes')}`;
          } 
          // For bottle/formula: use volume in ml
          else if (feedingType === 'bottle') {
            metadata.amount = amount;
            activityValue = `${t('feeding.bottle')} - ${amount || '0'} ml`;
          }
          // For solid food: use weight in gram
          else if (feedingType === 'solid') {
            metadata.amount = amount;
            activityValue = `${t('feeding.solid')} - ${amount || '0'} ${t('feeding.gram')}`;
          }
          break;
        case 'sleep':
          const durationMinutes = parseInt(sleepDuration) || 0;
          metadata.duration_minutes = durationMinutes;
          activityValue = `${sleepDuration} ${t('sleep.minutes')}`;
          break;
        case 'diaper':
          metadata.diaper_type = diaperType;
          activityValue = diaperType;
          break;
        case 'mood':
          metadata.mood_type = moodType;
          activityValue = moodType;
          break;
      }

      // Prepare duration_seconds for sleep and breast feeding activities
      let durationSeconds: number | undefined;
      
      if (activityType === 'sleep' && sleepDuration) {
        durationSeconds = parseInt(sleepDuration) * 60; // Convert minutes to seconds
      } else if (activityType === 'feeding' && feedingType === 'breast' && feedingDuration) {
        durationSeconds = parseInt(feedingDuration) * 60; // Convert minutes to seconds for breast feeding
      }

      const activityData: ActivityInput = {
        type: activityType,
        start_time: startTime.toISOString(),
        value: activityValue,
        duration_seconds: durationSeconds,
        metadata,
      };

      await onSubmit(activityData);
      resetForm();
      onDismiss();
    } catch (error) {
      console.error('Error submitting activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActivitySpecificFields = () => {
    switch (activityType) {
      case 'feeding':
        return (
          <View>
            <Text variant="labelLarge" style={styles.label}>
              {t('feeding.type')}
            </Text>
            <View style={styles.chipContainer}>
              <Chip
                selected={feedingType === 'breast'}
                onPress={() => setFeedingType('breast')}
                style={styles.chip}
              >
                {t('feeding.breast')}
              </Chip>
              <Chip
                selected={feedingType === 'bottle'}
                onPress={() => setFeedingType('bottle')}
                style={styles.chip}
              >
                {t('feeding.bottle')}
              </Chip>
              <Chip
                selected={feedingType === 'solid'}
                onPress={() => setFeedingType('solid')}
                style={styles.chip}
              >
                {t('feeding.solid')}
              </Chip>
            </View>
            
            {/* Dynamic input based on feeding type */}
            {feedingType === 'breast' ? (
              <TextInput
                label={t('feeding.duration')}
                value={feedingDuration}
                onChangeText={setFeedingDuration}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                placeholder={t('feeding.durationPlaceholder')}
              />
            ) : feedingType === 'bottle' ? (
              <TextInput
                label={t('feeding.volume')}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                placeholder={t('feeding.volumePlaceholder')}
              />
            ) : (
              <TextInput
                label={t('feeding.weight')}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                placeholder={t('feeding.weightPlaceholder')}
              />
            )}
          </View>
        );

      case 'sleep':
        return (
          <TextInput
            label={t('sleep.duration')}
            value={sleepDuration}
            onChangeText={setSleepDuration}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
        );

      case 'diaper':
        return (
          <View>
            <Text variant="labelLarge" style={styles.label}>
              {t('diaper.type')}
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setDiaperType(value as any)}
              value={diaperType}
            >
              <View style={styles.radioItem}>
                <RadioButton value="wet" />
                <Text>{t('diaper.wet')}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="dirty" />
                <Text>{t('diaper.dirty')}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="both" />
                <Text>{t('diaper.both')}</Text>
              </View>
            </RadioButton.Group>
          </View>
        );

      case 'mood':
        return (
          <View>
            <Text variant="labelLarge" style={styles.label}>
              {t('mood.title')}
            </Text>
            <View style={styles.chipContainer}>
              <Chip
                selected={moodType === 'happy'}
                onPress={() => setMoodType('happy')}
                style={styles.chip}
                icon="emoticon-happy"
              >
                {t('mood.happy')}
              </Chip>
              <Chip
                selected={moodType === 'neutral'}
                onPress={() => setMoodType('neutral')}
                style={styles.chip}
                icon="emoticon-neutral"
              >
                {t('mood.neutral')}
              </Chip>
              <Chip
                selected={moodType === 'fussy'}
                onPress={() => setMoodType('fussy')}
                style={styles.chip}
                icon="emoticon-sad"
              >
                {t('mood.fussy')}
              </Chip>
              <Chip
                selected={moodType === 'crying'}
                onPress={() => setMoodType('crying')}
                style={styles.chip}
                icon="emoticon-cry"
              >
                {t('mood.crying')}
              </Chip>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            {t('activities.addActivity')}
          </Text>

          <Divider style={styles.divider} />

          {/* Activity Type Selection */}
          <Text variant="labelLarge" style={styles.label}>
            {t('activities.activityType')}
          </Text>
          <View style={styles.chipContainer}>
            <Chip
              selected={activityType === 'feeding'}
              onPress={() => setActivityType('feeding')}
              icon="bottle-soda"
              style={styles.chip}
            >
              {t('activities.feeding')}
            </Chip>
            <Chip
              selected={activityType === 'sleep'}
              onPress={() => setActivityType('sleep')}
              icon="sleep"
              style={styles.chip}
            >
              {t('activities.sleep')}
            </Chip>
            <Chip
              selected={activityType === 'diaper'}
              onPress={() => setActivityType('diaper')}
              icon="baby-carriage"
              style={styles.chip}
            >
              {t('activities.diaper')}
            </Chip>
            <Chip
              selected={activityType === 'mood'}
              onPress={() => setActivityType('mood')}
              icon="emoticon-happy"
              style={styles.chip}
            >
              {t('activities.mood')}
            </Chip>
          </View>

          {/* Time Selection */}
          <Button
            mode="outlined"
            onPress={() => setShowTimePicker(true)}
            style={styles.timeButton}
            icon="clock"
          >
            {t('activities.time')}: {startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </Button>

          {showTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setStartTime(selectedDate);
                }
              }}
            />
          )}

          <Divider style={styles.divider} />

          {/* Activity-specific fields */}
          {renderActivitySpecificFields()}

          {/* Notes */}
          <TextInput
            label={t('activities.notesOptional')}
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => {
                resetForm();
                onDismiss();
              }}
              style={styles.actionButton}
            >
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.actionButton}
            >
              {t('common.save')}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  timeButton: {
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});
