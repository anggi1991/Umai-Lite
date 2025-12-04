import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Alert, Modal, TextInput } from 'react-native';
import { Text, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MascotIcon, MascotIconName } from '../../components/ui/MascotIcon';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getActivities, createActivity, deleteAllActivities } from '../../services/activityService';
import { getChildren } from '../../services/childService';
import { exportToCSV, exportToText } from '../../services/exportService';
import { Child } from '../../types/database';
import { ActivityInput } from '../../types/database';
import AddActivityModal from '../../components/activities/AddActivityModal';
import CalendarModal from '../../components/activities/CalendarModal';
import { CustomButton, AppHeader } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';
import { useInterstitialAd } from '../../components/ads';
import theme from '../../theme';

// Import mascot images
const mascotImages = {
  // Mood images
  happy: require('../../assets/mascot/Happy.png'),
  crying: require('../../assets/mascot/crying.png'),
  sad: require('../../assets/mascot/sad.png'),
  angry: require('../../assets/mascot/Angry.png'),
  sleepy: require('../../assets/mascot/Sleepy.png'),
  excited: require('../../assets/mascot/Excited.png'),
  calm: require('../../assets/mascot/calm.png'),
  fussy: require('../../assets/mascot/Fussy.png'),
  mood: require('../../assets/mascot/Mood.png'),
  
  // Activity-specific images
  sleep: require('../../assets/mascot/Sleep.png'),
  feeding: require('../../assets/mascot/feeding.png'),
  diaper: require('../../assets/mascot/diaper.png'),
  growth: require('../../assets/mascot/growth.png'),
};

export default function ActivityHistoryScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const preselectedChildId = params?.childId as string;
  const preselectedType = params?.type as string;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  
  // AdMob Interstitial
  const { showInterstitial } = useInterstitialAd();
  
  // Menu and modals
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [childSelectorVisible, setChildSelectorVisible] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all'); // all, feeding, sleep, diaper, mood, growth

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getActivities(user.id, selectedChildId || undefined, 100);
      setActivities(data);
      
      // Load children list for selector
      const childrenData = await getChildren(user.id);
      setChildren(childrenData);
      
      // Set preselected child from URL params
      if (preselectedChildId && !selectedChildId) {
        setSelectedChildId(preselectedChildId);
      }
      
      // Set preselected filter from URL params
      if (preselectedType && selectedFilter === 'all') {
        setSelectedFilter(preselectedType);
      }
    } catch (e) {
      console.error('Load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user, selectedChildId]);
  
  // Auto-open add modal if type is specified in URL params
  useEffect(() => {
    if (preselectedType && !addModalVisible && activities.length >= 0) {
      // Small delay to ensure screen is ready
      setTimeout(() => setAddModalVisible(true), 500);
    }
  }, [preselectedType]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleAddActivity = async (activityData: ActivityInput) => {
    if (!user) return;
    try {
      await createActivity(user.id, activityData);
      setAddModalVisible(false);
      await load(); // Reload activities
      
      // Show interstitial ad
      showInterstitial();
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert(t('common.error'), t('activities.addActivityFailed'));
    }
  };

  const handleViewCalendar = () => {
    setCalendarModalVisible(true);
  };

  // Menu handlers
  const handleSelectChild = (child: Child | null) => {
    setSelectedChildId(child ? child.id : null);
    setChildSelectorVisible(false);
    load();
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setFilterModalVisible(false);
  };

  const handleExportJournal = () => {
    
    if (activities.length === 0) {
      Alert.alert(t('activities.noData'), t('activities.noEntriesToExport'));
      return;
    }

    Alert.alert(
      t('activities.exportJournal'),
      t('activities.selectExportFormat'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('activities.textFormat'),
          onPress: async () => {
            try {
              await exportToText(
                activities,
                `parenting_journal_${selectedChildId ? children.find(c => c.id === selectedChildId)?.name : 'all'}`
              );
            } catch (_) {
              Alert.alert(t('common.error'), t('activities.exportFailed'));
            }
          },
        },
        {
          text: t('activities.csvFormat'),
          onPress: async () => {
            try {
              await exportToCSV(
                activities,
                `parenting_journal_${selectedChildId ? children.find(c => c.id === selectedChildId)?.name : 'all'}`
              );
            } catch (_) {
              Alert.alert(t('common.error'), t('activities.exportFailed'));
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllEntries = () => {
    
    if (activities.length === 0) {
      Alert.alert(t('activities.noData'), t('activities.noEntriesToDelete'));
      return;
    }

    const childName = selectedChildId 
      ? children.find(c => c.id === selectedChildId)?.name
      : undefined;
    
    const filterText = childName 
      ? t('activities.forChild', { name: childName })
      : t('activities.allChildren');

    Alert.alert(
      t('activities.deleteAllEntries'),
      t('activities.confirmDeleteAll', { count: activities.length.toString(), filter: filterText }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('activities.deleteAll'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;
              
              setLoading(true);
              const deletedCount = await deleteAllActivities(user.id, selectedChildId || undefined);
              
              Alert.alert(
                t('common.success'),
                t('activities.entriesDeleted', { count: deletedCount.toString() }),
                [{ text: t('common.ok'), onPress: () => load() }]
              );
            } catch (error) {
              console.error('Error deleting all activities:', error);
              Alert.alert(t('common.error'), t('activities.deleteEntriesFailed'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Helper functions untuk mapping aktivitas ke journal format
  const getActivityMood = (type: string, value?: string | null): keyof typeof mascotImages => {
    if (type === 'mood') {
      // Map mood text to mascot image key
      const moodKeys: Record<string, keyof typeof mascotImages> = {
        'happy': 'happy',
        'crying': 'crying',
        'sad': 'sad',
        'angry': 'angry',
        'sleepy': 'sleepy',
        'excited': 'excited',
        'calm': 'calm',
        'fussy': 'fussy'
      };
      return moodKeys[value?.toLowerCase() || ''] || 'happy';
    }
    if (type === 'sleep') return 'sleep';
    if (type === 'feeding') return 'feeding';
    if (type === 'diaper') return 'diaper';
    if (type === 'growth') return 'growth';
    return 'happy';
  };

  const getActivityTitle = (type: string, value?: string | null) => {
    const titles: Record<string, string> = {
      feeding: t('activities.feedingTime'),
      sleep: t('activities.sleepTime'),
      diaper: t('activities.diaperChange'),
      mood: t('activities.moodNote'),
      growth: t('activities.growthRecord')
    };
    
    // Untuk mood, gunakan translation
    if (type === 'mood' && value) {
      const moodKey = value.toLowerCase() as 'happy' | 'crying' | 'sad' | 'angry' | 'sleepy' | 'excited' | 'calm' | 'fussy';
      return t(`activities.moodNames.${moodKey}` as any) || value;
    }
    
    return titles[type] || t('activities.activityTag');
  };

  // Helper to format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return t('activities.minutesDuration', { minutes });
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return t('activities.hoursDuration', { hours });
    return t('activities.hoursMinutesDuration', { hours, minutes: remainingMinutes });
  };

  const getActivityContent = (activity: any) => {
    const { type, value, duration_seconds, metadata } = activity;
    let content = '';
    
    if (type === 'feeding') {
      // Translate feeding type value
      let feedingValue = t('activities.breastMilk');
      if (value) {
        const feedingTypeKey = value.toLowerCase();
        if (['breast', 'bottle', 'solid', 'both'].includes(feedingTypeKey)) {
          feedingValue = t(`activities.feedingTypes.${feedingTypeKey}` as any);
        } else {
          feedingValue = value;
        }
      }
      
      // Get amount from metadata if available
      const amount = metadata?.amount_ml ? ` - ${metadata.amount_ml}` : '';
      
      content = `${t('activities.feedingLabel')} ${feedingValue}${amount}${duration_seconds ? ` ${t('activities.durationFor')} ${formatDuration(duration_seconds)}` : ''}`;
    } else if (type === 'sleep') {
      content = `${t('activities.sleepLabel')} ${duration_seconds ? `${t('activities.durationFor')} ${formatDuration(duration_seconds)}` : ''}`;
    } else if (type === 'diaper') {
      // Translate diaper value if it's "both" or other special values
      let diaperValue = value || t('activities.wet');
      if (value === 'both') {
        diaperValue = t('activities.feedingTypes.both');
      }
      content = `${t('activities.diaperChanged')} (${diaperValue})`;
    } else if (type === 'growth') {
      const weight = metadata?.weight_kg;
      const height = metadata?.height_cm;
      content = `${t('activities.weightLabel')}: ${weight || '-'} kg, ${t('activities.heightLabel')}: ${height || '-'} cm`;
    } else if (type === 'mood') {
      content = metadata?.notes || t('activities.babyMoodNote');
    }
    
    return content;
  };

  const getActivityTags = (type: string): string[] => {
    const tagMap: Record<string, string[]> = {
      feeding: [t('activities.feedingTag'), t('activities.nutritionTag')],
      sleep: [t('activities.sleepTag'), t('activities.restTag')],
      diaper: [t('activities.diaperTag'), t('activities.hygieneTag')],
      mood: [t('activities.moodTag'), t('activities.emotionTag')],
      growth: [t('activities.growthTag'), t('activities.developmentTag')]
    };
    return tagMap[type] || [t('activities.activityTag')];
  };

  const formatActivityDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return t('activities.minutesAgo', { minutes: diffMins });
    if (diffHours < 24) return t('activities.hoursAgo', { hours: diffHours });
    if (diffDays === 0) return `${t('activities.todayAt')} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `${t('activities.yesterdayAt')} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    return t('activities.daysAgo', { days: diffDays });
  };

  // Hitung statistik real-time
  const calculateThisWeekCount = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activities.filter(a => new Date(a.created_at) >= weekAgo).length;
  };

  const calculateDayStreak = () => {
    if (activities.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedDates = activities
      .map(a => {
        const d = new Date(a.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a);

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sortedDates[i] === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const journalEntries = activities
    .filter((activity) => {
      // Filter by activity type
      if (selectedFilter === 'all') return true;
      return activity.type === selectedFilter;
    })
    .map((activity) => ({
      id: activity.id,
      mood: getActivityMood(activity.type, activity.value),
      title: getActivityTitle(activity.type, activity.value),
      content: getActivityContent(activity),
      tags: getActivityTags(activity.type),
      date: formatActivityDate(activity.created_at)
    }))
    .filter((entry) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

  // Prepare menu items
  const menuItems = [
    ...(children.length > 0 ? [{
      title: t('activities.filterByChild'),
      icon: 'account-child',
      onPress: () => setChildSelectorVisible(true),
    }] : []),
    {
      title: t('activities.filterByType'),
      icon: 'filter-variant',
      onPress: () => setFilterModalVisible(true),
      divider: children.length > 0,
    },
    {
      title: t('common.refresh'),
      icon: 'refresh',
      onPress: onRefresh,
    },
    {
      title: t('activities.exportJournal'),
      icon: 'download',
      onPress: handleExportJournal,
      divider: true,
    },
    {
      title: t('activities.deleteAll'),
      icon: 'delete',
      onPress: handleDeleteAllEntries,
    },
  ];

  // Guard: Block access if no children (defensive check for Android release)
  if (!loading && (!children || children.length === 0)) {
    return (
      <View style={styles.container}>
        <AppHeader title={t('activities.title')} showBackButton />
        <View style={styles.center}>
          <Image 
            source={mascotImages.happy} 
            style={{ width: 64, height: 64, marginBottom: 16 }} 
            resizeMode="contain" 
          />
          <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
            {t('child.noChildren')}
          </Text>
          <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 24, color: theme.colors.textSecondary }}>
            {t('activities.addChildFirst')}
          </Text>
          <CustomButton
            title={t('child.addChild')}
            variant="primary"
            onPress={() => router.push('/child/add')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader
        title={t('activities.title')}
        showBackButton
        menuItems={menuItems}
      />
      
      {/* Header Extension - Filter indicator */}
      <View>
        
        {/* Active Filter Indicator */}
        {!searchVisible && (selectedChildId || selectedFilter !== 'all') && (
          <View style={styles.filterIndicator}>
            {selectedChildId && (
              <View style={styles.filterChip}>
                <Image 
                  source={mascotImages.happy} 
                  style={{ width: 20, height: 20, marginRight: 4 }} 
                  resizeMode="contain" 
                />
                <Text style={styles.filterChipText}>
                  {children.find(c => c.id === selectedChildId)?.name || 'Child'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedChildId(null)}>
                  <Text style={styles.filterChipClose}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedFilter !== 'all' && (
              <View style={styles.filterChip}>
                <MascotIcon 
                  name={selectedFilter as MascotIconName} 
                  size={20} 
                  style={{ marginRight: 4 }} 
                />
                <Text style={styles.filterChipText}>
                  {selectedFilter === 'feeding' && t('activities.feedingTag')}
                  {selectedFilter === 'sleep' && t('activities.sleepTag')}
                  {selectedFilter === 'diaper' && t('activities.diaperTag')}
                  {selectedFilter === 'mood' && t('activities.moodTag')}
                  {selectedFilter === 'growth' && t('activities.growthTag')}
                </Text>
                <TouchableOpacity onPress={() => setSelectedFilter('all')}>
                  <Text style={styles.filterChipClose}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>{t('common.loading')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text variant="displaySmall" style={styles.statNumber}>{activities.length}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>{t('activities.totalRecords')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="displaySmall" style={styles.statNumber}>{calculateThisWeekCount()}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>{t('activities.thisWeek')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="displaySmall" style={styles.statNumber}>{calculateDayStreak()}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>{t('activities.dayStreak')}</Text>
            </View>
          </View>

            <View style={styles.todayContent}>
              <View>
                <Text variant="titleMedium" style={styles.todayTitle}>{t('activities.todayNoteTitle')}</Text>
                <Text variant="bodyMedium" style={styles.todaySubtitle}>{t('activities.recordMomentSubtitle')}</Text>
              </View>
              <Button mode="contained" onPress={() => setAddModalVisible(true)} style={styles.addButton} labelStyle={styles.addButtonLabel}>{t('activities.addNote')}</Button>
            </View>

          <Text variant="titleLarge" style={styles.sectionTitle}>{t('activities.recentNotes')}</Text>

          {journalEntries.map((entry) => (
            <TouchableOpacity key={entry.id} style={styles.entryCard} activeOpacity={0.7}>
              <View style={styles.entryHeader}>
                <View style={styles.moodIcon}>
                  <Image 
                    source={mascotImages[entry.mood]} 
                    style={styles.moodImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.entryInfo}>
                  <Text variant="titleMedium" style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryDate}>📅 {entry.date}</Text>
                </View>
              </View>
              <Text variant="bodyMedium" style={styles.entryContent}>{entry.content}</Text>
              <View style={styles.tagsContainer}>
                {entry.tags.map((tag: string, idx: number) => (
                  <View key={idx} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                ))}
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.calendarSection}>
            <View style={styles.calendarIcon}><Text style={styles.calendarEmoji}>📅</Text></View>
            <Text variant="titleMedium" style={styles.calendarTitle}>{t('activities.viewCalendar')}</Text>
            <Text variant="bodyMedium" style={styles.calendarSubtitle}>{t('activities.viewCalendarDescription')}</Text>
            <Button 
              mode="outlined" 
              onPress={handleViewCalendar} 
              style={styles.calendarButton} 
              labelStyle={styles.calendarButtonLabel}
            >
              {t('activities.openCalendarButton')}
            </Button>
          </View>
        </ScrollView>
      )}

      <AddActivityModal
        visible={addModalVisible}
        onDismiss={() => setAddModalVisible(false)}
        onSubmit={handleAddActivity}
        preselectedType={preselectedType as any}
      />

      <CalendarModal
        visible={calendarModalVisible}
        onDismiss={() => setCalendarModalVisible(false)}
        activities={activities}
      />

      {/* Child Selector Modal */}
      <Modal
        visible={childSelectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChildSelectorVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setChildSelectorVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Image 
                  source={mascotImages.happy} 
                  style={{ width: 32, height: 32, marginRight: 8 }} 
                  resizeMode="contain" 
                />
                <Text variant="titleLarge" style={{ ...styles.modalTitle, marginBottom: 0 }}>
                  {t('activities.filterByChild')}
                </Text>
              </View>
              
              {/* All Children Option */}
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  !selectedChildId && styles.modalItemActive,
                ]}
                onPress={() => handleSelectChild(null)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    !selectedChildId && styles.modalItemTextActive,
                  ]}
                >
                  {t('activities.allChildren')}
                </Text>
                {!selectedChildId && (
                  <Text style={styles.modalCheckmark}>✓</Text>
                )}
              </TouchableOpacity>

              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.modalItem,
                    selectedChildId === child.id && styles.modalItemActive,
                  ]}
                  onPress={() => handleSelectChild(child)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedChildId === child.id && styles.modalItemTextActive,
                    ]}
                  >
                    {child.name}
                  </Text>
                  {selectedChildId === child.id && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}

              <CustomButton
                title={t('common.close')}
                variant="secondary"
                onPress={() => setChildSelectorVisible(false)}
                style={styles.modalCloseButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Filter Type Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                🎯 {t('activities.filterByType')}
              </Text>
              
              {[
                { value: 'all', label: t('activities.allActivitiesFilter'), icon: 'home' as MascotIconName },
                { value: 'feeding', label: t('activities.feedingTag'), icon: 'feeding' as MascotIconName },
                { value: 'sleep', label: t('activities.sleepTag'), icon: 'sleep' as MascotIconName },
                { value: 'diaper', label: t('activities.diaperTag'), icon: 'diaper' as MascotIconName },
                { value: 'mood', label: t('activities.moodTag'), icon: 'mood' as MascotIconName },
                { value: 'growth', label: t('activities.growthTag'), icon: 'growth' as MascotIconName },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.modalItem,
                    selectedFilter === filter.value && styles.modalItemActive,
                  ]}
                  onPress={() => handleFilterSelect(filter.value)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MascotIcon 
                      name={filter.icon}
                      size={28}
                      tintColor={selectedFilter === filter.value ? theme.colors.babyBlue : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedFilter === filter.value && styles.modalItemTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </View>
                  {selectedFilter === filter.value && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}

              <CustomButton
                title={t('common.close')}
                variant="secondary"
                onPress={() => setFilterModalVisible(false)}
                style={styles.modalCloseButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={searchVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSearchVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setSearchVisible(false);
            setSearchQuery('');
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.searchModalContent}>
              <View style={styles.searchModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons 
                    name="magnify" 
                    size={24} 
                    color={theme.colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text variant="titleLarge" style={styles.modalTitle}>
                    {t('activities.searchJournal')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  setSearchVisible(false);
                  setSearchQuery('');
                }}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <Divider />
              
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('activities.searchActivities')}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {searchQuery.length > 0 && (
                <View style={styles.searchResults}>
                  <Text variant="bodyMedium" style={styles.searchResultsText}>
                    {t('activities.resultsFound', { count: journalEntries.length.toString() })}
                  </Text>
                  <CustomButton
                    title={t('activities.apply')}
                    variant="primary"
                    onPress={() => setSearchVisible(false)}
                    style={styles.applyButton}
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: 'white', paddingTop: 40, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { flex: 1, fontWeight: '600', color: theme.colors.textPrimary },
  headerRight: { flexDirection: 'row' },
  searchInput: { flex: 1, fontSize: 16, color: theme.colors.textPrimary, backgroundColor: theme.colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 24 },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statNumber: { fontWeight: 'bold', color: theme.colors.babyBlue, marginBottom: 4 },
  statLabel: { color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center' },
  todayCard: { borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  todayContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayTitle: { fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 4 },
  todaySubtitle: { color: theme.colors.textSecondary, fontSize: 13 },
  addButton: { backgroundColor: theme.colors.babyBlue, borderRadius: 12 },
  addButtonLabel: { color: 'white', fontWeight: '600' },
  sectionTitle: { fontWeight: '600', marginBottom: 16, color: theme.colors.textPrimary },
  entryCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  entryHeader: { flexDirection: 'row', marginBottom: 12 },
  moodIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  moodImage: { width: 52, height: 52 },
  moodEmoji: { fontSize: 28, textAlign: 'center', lineHeight: 32 },
  entryInfo: { flex: 1 },
  entryTitle: { fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 4 },
  entryDate: { color: theme.colors.textSecondary, fontSize: 13 },
  entryContent: { color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#E8F4F8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { color: theme.colors.babyBlue, fontSize: 12, fontWeight: '500' },
  calendarSection: { backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 12, shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  calendarIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  calendarEmoji: { fontSize: 32 },
  calendarTitle: { fontWeight: '600', marginBottom: 8, color: theme.colors.textPrimary },
  calendarSubtitle: { color: theme.colors.textSecondary, marginBottom: 16, textAlign: 'center' },
  calendarButton: { borderColor: theme.colors.babyBlue, borderRadius: 12 },
  calendarButtonLabel: { color: theme.colors.babyBlue, fontWeight: '600' },
  menuContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginTop: 50,
  },
  filterIndicator: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.babyBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipClose: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
  },
  modalItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalItemActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: theme.colors.babyBlue,
  },
  modalItemText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  modalItemTextActive: {
    color: theme.colors.babyBlue,
    fontWeight: '600',
  },
  modalCheckmark: {
    color: theme.colors.babyBlue,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 16,
  },
  searchModalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '50%',
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    fontSize: 28,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  searchInputContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  searchResults: {
    marginTop: 16,
    alignItems: 'center',
  },
  searchResultsText: {
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  applyButton: {
    marginTop: 8,
    width: '100%',
  },
});
