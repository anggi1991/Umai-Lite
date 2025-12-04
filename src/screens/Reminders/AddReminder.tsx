import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { createReminder, updateReminder, getUpcomingReminders, ReminderInput } from '../../services/reminderService';
import { scheduleLocalReminder, cancelScheduledNotification } from '../../services/notificationService';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomCard } from '../../components/ui/CustomCard';
import { CustomInput } from '../../components/ui/CustomInput';
import theme from '../../theme';

export default function AddReminderScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const editId = params.id as string | undefined;

  const [type, setType] = useState('feeding');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 5 * 60 * 1000)); // +5 menit default
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // (Sederhana) kalau edit: fetch list & ambil data
    const loadEdit = async () => {
      if (!user || !editId) return;
      const list = await getUpcomingReminders(user.id);
      const target = list.find(r => r.id === editId);
      if (target) {
        setType(target.type);
        setDate(new Date(target.next_at));
        setNotes(target.metadata?.notes || '');
      }
    };
    loadEdit();
  }, [user, editId]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert(t('common.error'), t('auth.loginRequired'));
      return;
    }
    
    setLoading(true);
    try {
      // Prepare payload with notification details
      const reminderTitle = getReminderTitle(type);
      const reminderMessage = notes || getDefaultMessage(type);
      
      const payload: ReminderInput = {
        type,
        next_at: date.toISOString(),
        metadata: { 
          notes,
          notification: {
            title: reminderTitle,
            message: reminderMessage
          }
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notification_title: reminderTitle,
        notification_message: reminderMessage
      };

      if (editId) {
        try {
          // Ambil reminder lama untuk cancel notifikasi lokal jika ada
          const list = await getUpcomingReminders(user.id);
          const existing = list.find(r => r.id === editId);
          if (existing?.local_notification_id) {
            await cancelScheduledNotification(existing.local_notification_id);
          }
        } catch (e) {
          console.warn('Failed to cancel existing notification:', e);
        }

        // Update DB
        const updated = await updateReminder(editId, payload);
        
        // Schedule new notification
        try {
          const newLocalId = await scheduleLocalReminder(
            reminderTitle,
            reminderMessage,
            new Date(updated.next_at)
          );
          
          if (newLocalId) {
            await updateReminder(editId, { 
              local_notification_id: newLocalId,
              notification_title: reminderTitle,
              notification_message: reminderMessage
            });
          }
        } catch (e) {
          console.warn('Failed to schedule local notification:', e);
        }

      } else {
        // Create new reminder
        const created = await createReminder(user.id, payload);
        
        // Schedule notification
        try {
          const localId = await scheduleLocalReminder(
            reminderTitle,
            reminderMessage,
            new Date(created.next_at)
          );
          
          if (localId) {
            await updateReminder(created.id, { 
              local_notification_id: localId,
              notification_title: reminderTitle,
              notification_message: reminderMessage
            });
          }
        } catch (e) {
          console.warn('Failed to schedule local notification:', e);
        }
      }

      // Langsung navigate tanpa menunggu alert
      try {
        router.replace({
          pathname: '/reminders',
          params: { refresh: 'true' }
        });
      } catch (navError) {
        console.warn('Navigation error:', navError);
        router.push('/');
      }
      
      // Tampilkan alert setelah navigasi
      Alert.alert(t('common.success'), t('reminders.saveSuccess'));
    } catch (err: any) {
      console.error('Save reminder error:', err);
      
      let errorMessage = t('reminders.saveFailed');
      if (err.message?.includes('permission')) {
        errorMessage = t('reminders.permissionDenied');
      } else if (err.message?.includes('notification')) {
        errorMessage = t('reminders.notificationFailed');
      }
      
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getReminderTitle = (type: string): string => {
    switch (type) {
      case 'feeding': return t('reminders.feedingTitle');
      case 'sleep': return t('reminders.sleepTitle');
      case 'immunization': return t('reminders.immunizationTitle');
      default: return t('reminders.reminderTitle');
    }
  };

  const getDefaultMessage = (type: string): string => {
    switch (type) {
      case 'feeding': return t('reminders.feedingMessage');
      case 'sleep': return t('reminders.sleepMessage');
      case 'immunization': return t('reminders.immunizationMessage');
      default: return t('reminders.reminderMessage');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.babyBlue, theme.colors.softPink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <CustomButton
          title={t('reminders.backButton')}
          variant="tertiary"
          onPress={() => router.back()}
          textStyle={{ color: theme.colors.white }}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          {editId ? t('reminders.editReminder') : t('reminders.addReminder')}
        </Text>
        <View style={{ width: 100 }} />
      </LinearGradient>
      
      <ScrollView style={styles.content}>
        <CustomCard style={styles.card} animated>
          <Text variant="labelLarge" style={styles.label}>{t('reminders.typeLabel')}</Text>
          <RadioButton.Group value={type} onValueChange={setType}>
            <View style={styles.radioRow}>
              <View style={styles.radioItem}>
                <RadioButton value="feeding" color={theme.colors.babyBlue} />
                <Text style={styles.radioText}>{t('reminders.feedingLabel')}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="sleep" color={theme.colors.babyBlue} />
                <Text style={styles.radioText}>{t('reminders.sleepLabel')}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="immunization" color={theme.colors.babyBlue} />
                <Text style={styles.radioText}>{t('reminders.immunizationLabel')}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="custom" color={theme.colors.babyBlue} />
                <Text style={styles.radioText}>{t('reminders.customLabel')}</Text>
              </View>
            </View>
          </RadioButton.Group>

          <Text variant="labelLarge" style={styles.label}>{t('reminders.timeLabel')}</Text>
          <CustomButton 
            title={date.toLocaleString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit', 
              day: '2-digit', 
              month: 'short',
              year: 'numeric'
            })}
            variant="secondary" 
            onPress={() => setShowPicker(true)} 
            style={styles.dateBtn}
          />
          
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              minimumDate={new Date()}
              onChange={(e: DateTimePickerEvent, selected?: Date) => {
                setShowPicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}

          <CustomInput
            label={t('reminders.notesLabel')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Text variant="bodySmall" style={styles.info}>
            💡 {t('reminders.requiredNote')}
          </Text>

          <View style={styles.actions}>
            <CustomButton 
              title={t('common.cancel')}
              variant="secondary" 
              onPress={() => {
                try {
                  router.replace('/reminders');
                } catch (navError) {
                  console.warn('Navigation error:', navError);
                  router.push('/');
                }
              }} 
              style={styles.actionBtn} 
              disabled={loading}
            />
            <CustomButton 
              title={t('common.save')}
              variant="primary" 
              onPress={handleSave} 
              style={styles.actionBtn} 
              loading={loading} 
              disabled={loading}
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
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  headerTitle: { 
    color: theme.colors.white, 
    fontWeight: 'bold',
  },
  content: { 
    padding: theme.spacing.md,
  },
  card: { 
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  label: { 
    marginTop: theme.spacing.md, 
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  radioRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  radioItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: theme.spacing.lg, 
    marginBottom: theme.spacing.sm,
  },
  radioText: {
    color: theme.colors.textPrimary,
  },
  dateBtn: { 
    marginBottom: theme.spacing.lg,
    justifyContent: 'flex-start',
  },
  input: { 
    marginBottom: theme.spacing.lg,
  },
  info: { 
    color: theme.colors.textSecondary, 
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },
  actions: { 
    flexDirection: 'row', 
    gap: theme.spacing.md, 
    marginTop: theme.spacing.lg,
  },
  actionBtn: { 
    flex: 1,
  },
});
