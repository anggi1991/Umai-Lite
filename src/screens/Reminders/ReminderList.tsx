import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, RefreshControl, Modal, StyleSheet } from 'react-native';
import { styles } from './ReminderList.styles';
import { Text, FAB, Switch, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getUpcomingReminders, updateReminder, deleteReminder, Reminder } from '../../services/reminderService';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomCard } from '../../components/ui/CustomCard';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { BabyBuddyEmptyState } from '../../components/mascot';
import theme from '../../theme';

export default function ReminderList({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getUpcomingReminders(user.id);
      setReminders(data);
    } catch (err) {
      console.error('Load reminders error', err);
      Alert.alert(t('common.error'), t('reminders.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const toggleEnabled = async (r: Reminder) => {
    try {
      await updateReminder(r.id, { enabled: !r.enabled });
      await load();
    } catch (err) {
      Alert.alert(t('common.error'), t('reminders.updateFailed'));
    }
  };

  const performDelete = async (reminder: Reminder) => {
    if (!user) return;

    try {
      // 1. Set loading state
      console.log('Set deleting state untuk reminder:', reminder.id);
      setDeletingIds(prev => [...prev, reminder.id]);
      
      // 2. Cancel notification if exists
      if (reminder.local_notification_id) {
        try {
          console.log('Membatalkan notifikasi:', reminder.local_notification_id);
          const { cancelScheduledNotification } = await import('../../services/notificationService');
          await cancelScheduledNotification(reminder.local_notification_id);
          console.log('Notifikasi berhasil dibatalkan');
        } catch (e) {
          console.error('Gagal membatalkan notifikasi:', e);
        }
      }
      
      // 3. Delete from database
      console.log('Menghapus dari database...', { reminderId: reminder.id, userId: user.id });
      await deleteReminder(reminder.id, user.id);
      
      // 4. Update local state
      console.log('Memperbarui state lokal...');
      setReminders(current => {
        const filtered = current.filter(r => r.id !== reminder.id);
        console.log('Jumlah reminder setelah filter:', filtered.length);
        return filtered;
      });
      
      console.log('Reminder berhasil dihapus');
      Alert.alert(t('common.success'), t('reminders.deleteSuccess'));
      
    } catch (error: any) {
      console.error('Error saat menghapus reminder:', error);
      Alert.alert(t('common.error'), t('reminders.deleteFailed', { message: error.message }));
      
      // Reload data on error
      await load();
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== reminder.id));
      console.log('=== PROSES HAPUS SELESAI ===');
    }
  };

  const handleDelete = (reminder: Reminder) => {
    if (!user) {
      Alert.alert(t('common.error'), t('auth.loginRequired'));
      return;
    }

    console.log('=== MULAI PROSES HAPUS REMINDER ===');
    console.log('Setting reminderToDelete untuk reminder:', reminder.id);
    setReminderToDelete(reminder);
  };

  const confirmDelete = () => {
    if (reminderToDelete) {
      console.log('User mengkonfirmasi penghapusan');
      performDelete(reminderToDelete);
      setReminderToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('User membatalkan penghapusan');
    setReminderToDelete(null);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString('id-ID', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.babyBlue, theme.colors.softPink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <CustomButton
          title="Kembali"
          variant="tertiary"
          onPress={() => router.back()}
          textStyle={{ color: theme.colors.white }}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>⏰ Reminder</Text>
        <View style={{ width: 100 }} />
      </LinearGradient>
      {loading ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {[0, 1, 2].map((index) => (
            <CustomCard key={index} style={styles.reminderCard}>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <SkeletonLoader width={150} height={20} borderRadius={8} />
                  <SkeletonLoader width={120} height={14} borderRadius={6} style={{ marginTop: 8 }} />
                </View>
                <SkeletonLoader width={50} height={30} borderRadius={15} />
              </View>
              <View style={styles.actions}>
                <SkeletonLoader width="48%" height={40} borderRadius={20} />
                <SkeletonLoader width="48%" height={40} borderRadius={20} />
              </View>
            </CustomCard>
          ))}
        </ScrollView>
      ) : (
        <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} 
          contentContainerStyle={styles.scroll}
        >
          {reminders.length === 0 ? (
            <BabyBuddyEmptyState
              message={t('dashboard.noReminders')}
              submessage={t('reminders.createFirst')}
              expression="waving"
            />
          ) : (
            reminders.map((r, index) => (
            <CustomCard key={r.id} style={styles.reminderCard} animated delay={index * 100}>
              <View style={styles.row}> 
                <View style={styles.flex}>
                  <Text variant="titleMedium" style={styles.reminderType}>
                    {getTypeEmoji(r.type)} {formatType(r.type, t)}
                  </Text>
                  <Text variant="bodySmall" style={styles.reminderTime}>{formatDate(r.next_at)}</Text>
                  {r.metadata?.notes && (
                    <Text variant="bodySmall" style={styles.reminderNotes}>{r.metadata.notes}</Text>
                  )}
                </View>
                <Switch 
                  value={r.enabled} 
                  onValueChange={() => toggleEnabled(r)}
                  color={theme.colors.babyBlue}
                />
              </View>
              <View style={styles.actions}>
                <CustomButton 
                  title="Ubah"
                  variant="secondary" 
                  onPress={() => router.push(`/reminders/add?edit=${r.id}`)} 
                  style={styles.actionButton}
                  disabled={loading}
                />
                {deletingIds.includes(r.id) ? (
                  <View style={styles.deleteButtonLoading}>
                    <ActivityIndicator size="small" color={theme.colors.error} />
                    <Text style={styles.deleteLoadingText}>{t('reminders.deleting')}</Text>
                  </View>
                ) : (
                  <CustomButton 
                    title={t('common.delete')}
                    variant="secondary" 
                    onPress={() => handleDelete(r)}
                    textStyle={{ color: theme.colors.error }}
                    style={styles.deleteButton}
                  />
                )}
              </View>
            </CustomCard>
            ))
          )}
        </ScrollView>
      )}
      <FAB 
        icon="plus" 
        style={styles.fab} 
        onPress={() => router.push('/reminders/add')} 
        label={t('reminders.add')}
        color={theme.colors.white}
      />

      {/* Modal Konfirmasi Hapus */}
      <Modal
        visible={reminderToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text variant="titleLarge" style={modalStyles.title}>{t('reminders.deleteReminder')}</Text>
            <Text variant="bodyMedium" style={modalStyles.message}>
              {t('reminders.deleteConfirm')}
            </Text>
            <View style={modalStyles.buttons}>
              <CustomButton
                title={t('common.cancel')}
                variant="secondary"
                onPress={cancelDelete}
                style={modalStyles.button}
              />
              <CustomButton
                title={t('common.delete')}
                variant="primary"
                onPress={confirmDelete}
                style={modalStyles.deleteButton}
                textStyle={{ color: theme.colors.white }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getTypeEmoji = (type: string): string => {
  switch (type) {
    case 'feeding': return '🍼';
    case 'sleep': return '😴';
    case 'immunization': return '💉';
    default: return '⏰';
  }
};

const formatType = (type: string, t: any): string => {
  switch (type) {
    case 'feeding': return t('activities.feeding');
    case 'sleep': return t('activities.sleep');
    case 'immunization': return t('reminders.immunizationTitle');
    default: return type;
  }
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borders.radius.large,
    padding: theme.spacing.xl,
    margin: theme.spacing.lg,
    minWidth: 280,
    maxWidth: 400,
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
  },
});

// Styles are imported from ReminderList.styles.ts
