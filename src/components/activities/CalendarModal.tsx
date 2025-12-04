import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

interface Activity {
  id: string;
  type: string;
  value?: string | null;
  created_at: string;
  metadata?: Record<string, any> | null;
  duration_seconds?: number | null;
}

interface CalendarModalProps {
  visible: boolean;
  onDismiss: () => void;
  activities: Activity[];
  onDateSelect?: (date: Date) => void;
}

export default function CalendarModal({ visible, onDismiss, activities, onDateSelect }: CalendarModalProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar days
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Previous month days to show
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from(
      { length: firstDayOfWeek },
      (_, i) => ({
        day: prevMonthLastDay - firstDayOfWeek + i + 1,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - firstDayOfWeek + i + 1)
      })
    );
    
    // Current month days
    const currentMonthDays = Array.from(
      { length: lastDay.getDate() },
      (_, i) => ({
        day: i + 1,
        isCurrentMonth: true,
        date: new Date(year, month, i + 1)
      })
    );
    
    // Next month days to fill grid
    const totalCells = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days
    const nextMonthDays = Array.from(
      { length: remainingCells },
      (_, i) => ({
        day: i + 1,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i + 1)
      })
    );
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate]);

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.created_at);
      return (
        activityDate.getDate() === date.getDate() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Check if date has activities
  const hasActivities = (date: Date) => {
    return getActivitiesForDate(date).length > 0;
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Selected date for showing entries
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateActivities = useMemo(() => 
    getActivitiesForDate(selectedDate), 
    [selectedDate, activities]
  );

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthYearString = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const selectedDateString = selectedDate.toLocaleString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' });

  const getActivityTitle = (activity: Activity) => {
    const titles: Record<string, string> = {
      feeding: t('activities.activityTitles.feeding'),
      sleep: t('activities.activityTitles.sleep'),
      diaper: t('activities.activityTitles.diaper'),
      mood: activity.value || t('activities.activityTitles.mood'),
      growth: t('activities.activityTitles.growth')
    };
    return titles[activity.type] || t('activities.activityTitles.activity');
  };

  // Helper to format duration with translation
  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} ${t('sleep.minutes')}`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} ${t('sleep.hours')}`;
    return `${hours} ${t('sleep.hours')} ${remainingMinutes} ${t('sleep.minutes')}`;
  };

  const getActivityContent = (activity: Activity) => {
    const { type, value, duration_seconds, metadata } = activity;
    if (type === 'feeding') {
      // Translate feeding type value
      let feedValue = t('activities.activityContent.breastMilk');
      if (value) {
        const feedingTypeKey = value.toLowerCase();
        if (['breast', 'bottle', 'solid', 'both'].includes(feedingTypeKey)) {
          feedValue = t(`activities.feedingTypes.${feedingTypeKey}` as any);
        } else {
          feedValue = value;
        }
      }
      
      // Get amount from metadata if available
      const amount = metadata?.amount_ml ? ` - ${metadata.amount_ml}` : '';
      const durationText = duration_seconds ? ` ${t('activities.activityContent.recorded')} ${formatDuration(duration_seconds)}` : '';
      
      return `${t('activities.activityTags.feeding')} ${feedValue}${amount}${durationText}`;
    } else if (type === 'sleep') {
      const durationText = duration_seconds ? ` - ${formatDuration(duration_seconds)}` : '';
      return `${t('activities.activityTags.sleep')}${durationText}`;
    } else if (type === 'diaper') {
      // Translate diaper value if it's "both" or other special values
      let diaperValue = value || t('activities.activityContent.wet');
      if (value === 'both') {
        diaperValue = t('activities.feedingTypes.both');
      }
      return `${t('activities.activityTags.diaper')} (${diaperValue})`;
    } else if (type === 'mood') {
      return metadata?.notes || value || t('activities.activityTitles.mood');
    } else if (type === 'growth') {
      const weight = metadata?.weight_kg;
      const height = metadata?.height_cm;
      if (weight && height) return t('activities.activityContent.weightHeight', { weight, height });
      if (weight) return t('activities.activityContent.weight', { weight });
      if (height) return t('activities.activityContent.height', { height });
    }
    return t('activities.activityContent.recorded');
  };

  const getActivityTags = (activity: Activity) => {
    const tagMap: Record<string, string[]> = {
      feeding: [t('activities.activityTags.feeding'), t('activities.activityTags.nutrition')],
      sleep: [t('activities.activityTags.sleep'), t('activities.activityTags.rest')],
      diaper: [t('activities.activityTags.diaper'), t('activities.activityTags.hygiene')],
      mood: [t('activities.activityTags.mood'), t('activities.activityTags.emotion')],
      growth: [t('activities.activityTags.growth'), t('activities.activityTags.development')]
    };
    return tagMap[activity.type] || [];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.headerTitle}>{t('activities.calendarJournal')}</Text>
            <IconButton icon="close" size={24} onPress={onDismiss} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Calendar */}
            <View style={styles.calendarContainer}>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <IconButton icon="chevron-left" size={24} onPress={previousMonth} />
                <Text variant="titleMedium" style={styles.monthText}>{monthYearString}</Text>
                <IconButton icon="chevron-right" size={24} onPress={nextMonth} />
              </View>

              {/* Day Headers */}
              <View style={styles.dayHeaders}>
                {[
                  t('calendar.sun'), t('calendar.mon'), t('calendar.tue'), 
                  t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat')
                ].map((day, index) => (
                  <Text key={index} style={styles.dayHeader}>{day}</Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {calendarData.map((dayData, index) => {
                  const isCurrentDate = isToday(dayData.date);
                  const hasActivity = hasActivities(dayData.date);
                  const isSelected = selectedDate.getDate() === dayData.date.getDate() &&
                                   selectedDate.getMonth() === dayData.date.getMonth() &&
                                   selectedDate.getFullYear() === dayData.date.getFullYear();

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCell,
                        isCurrentDate && styles.todayCell,
                        isSelected && styles.selectedCell
                      ]}
                      onPress={() => handleDatePress(dayData.date)}
                      disabled={!dayData.isCurrentMonth}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !dayData.isCurrentMonth && styles.otherMonthText,
                          isCurrentDate && styles.todayText,
                          isSelected && styles.selectedText
                        ]}
                      >
                        {dayData.day}
                      </Text>
                      {hasActivity && dayData.isCurrentMonth && (
                        <View style={styles.activityDot} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Entries for Selected Date */}
            <View style={styles.entriesSection}>
              <Text variant="titleMedium" style={styles.entriesTitle}>
                {t('activities.notesFor', { date: selectedDateString })}
              </Text>

              {selectedDateActivities.length === 0 ? (
                <Text style={styles.noEntriesText}>{t('activities.noNotesForDate')}</Text>
              ) : (
                selectedDateActivities.map((activity) => (
                  <View key={activity.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryIcon}>
                        <Text style={styles.entryEmoji}>😊</Text>
                      </View>
                      <Text variant="titleMedium" style={styles.entryTitle}>
                        {getActivityTitle(activity)}
                      </Text>
                    </View>
                    <Text style={styles.entryContent}>
                      {getActivityContent(activity)}
                    </Text>
                    <View style={styles.tagsContainer}>
                      {getActivityTags(activity).map((tag, idx) => (
                        <View key={idx} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>{t('activities.dayWithNotes')}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  calendarContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    margin: 20,
    marginBottom: 10,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthText: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dayHeader: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: theme.colors.babyBlue,
    borderRadius: 20,
  },
  selectedCell: {
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  otherMonthText: {
    color: '#CCCCCC',
  },
  todayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedText: {
    color: theme.colors.babyBlue,
    fontWeight: 'bold',
  },
  activityDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.babyBlue,
  },
  entriesSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  entriesTitle: {
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  noEntriesText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    paddingVertical: 20,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryEmoji: {
    fontSize: 18,
  },
  entryTitle: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  entryContent: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  legend: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.babyBlue,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});
