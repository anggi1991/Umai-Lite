import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Text, ActivityIndicator, IconButton, FAB, Divider } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getChildren, getChildById } from '../../services/childService';
import { getActivities } from '../../services/activityService';
import { Child } from '../../types/database';
import {
  getComprehensiveStats,
  getSleepDurationChart,
  getGrowthChartData,
  ComprehensiveStats,
  ChartDataPoint,
} from '../../services/statisticsService';
import { 
  getCurrentGrowthStats,
  getGrowthRecords,
  addGrowthRecord,
  deleteGrowthRecord,
  GrowthRecord,
} from '../../services/growthService';
import { CustomCard } from '../../components/ui/CustomCard';
import { CustomButton } from '../../components/ui/CustomButton';
import { CustomInputModal } from '../../components/ui';
import { AppHeader } from '../../components/ui/AppHeader';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 60;

type TabType = 'weight' | 'height' | 'sleep';

export default function StatisticsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const preselectedChildId = params?.childId as string;

  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childName, setChildName] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('weight');
  
  // Stats data
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [currentHeight, setCurrentHeight] = useState<number | null>(null);
  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  
  // Chart data
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [hasData, setHasData] = useState(false);
  
  // Recent activities from history
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Growth records (NEW - for unified screen)
  const [recentGrowthRecords, setRecentGrowthRecords] = useState<GrowthRecord[]>([]);
  const [addRecordModalVisible, setAddRecordModalVisible] = useState(false);

  // Menu and modals
  const [menuVisible, setMenuVisible] = useState(false);
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [statsPeriod, setStatsPeriod] = useState(7); // Default 7 days

  // Helper to translate activity values
  const getTranslatedActivityValue = (activity: any): string => {
    const { type, value, metadata } = activity;
    
    if (type === 'feeding' && value) {
      const feedingTypeKey = value.toLowerCase();
      if (['breast', 'bottle', 'solid', 'both'].includes(feedingTypeKey)) {
        return t(`activities.feedingTypes.${feedingTypeKey}` as any);
      }
    }
    
    if (type === 'diaper' && value) {
      if (value === 'wet') return t('activities.wet');
      if (value === 'both') return t('activities.feedingTypes.both');
    }
    
    if (type === 'mood' && value) {
      const moodKey = value.toLowerCase() as 'happy' | 'crying' | 'sad' | 'angry' | 'sleepy' | 'excited' | 'calm' | 'fussy';
      return t(`activities.moodNames.${moodKey}` as any) || value;
    }
    
    if (type === 'growth') {
      const weight = metadata?.weight_kg;
      const height = metadata?.height_cm;
      if (weight && height) return `${weight} kg, ${height} cm`;
      if (weight) return `${weight} kg`;
      if (height) return `${height} cm`;
    }
    
    return value || '';
  };

  // Load children and select first one or preselected
  const loadChildren = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getChildren(user.id);
      setChildren(data); // Save all children for selector

      if (data.length === 0) {
        setLoading(false);
        return;
      }

      // Select child: preselected > first
      const childToSelect = preselectedChildId
        ? data.find((c) => c.id === preselectedChildId) || data[0]
        : data[0];

      setSelectedChildId(childToSelect.id);
      setSelectedChild(childToSelect);
      setChildName(childToSelect.name);
      
      // Load stats for selected child
      await loadStats(childToSelect.id);
    } catch (err) {
      console.error('Error loading children:', err);
    } finally {
      setLoading(false);
    }
  }, [user, preselectedChildId]);

  // Load comprehensive stats (optionally override period)
  const loadStats = async (childId: string, periodOverride?: number) => {
    try {
      setLoading(true);
      const period = periodOverride ?? statsPeriod;
      console.log('[STATISTICS] Loading stats for child:', childId, 'period:', period, 'days');
      
      // Get current weight/height from growth_records
      const growthStats = await getCurrentGrowthStats(childId);
      setCurrentWeight(growthStats.weight.current);
      setCurrentHeight(growthStats.height.current);

      // Get comprehensive activity stats with dynamic period
      const comprehensiveStats = await getComprehensiveStats(user!.id, childId, period);
      console.log('[STATISTICS] Stats loaded:', {
        period: comprehensiveStats.period,
        feeding: comprehensiveStats.feeding.count,
        sleep: comprehensiveStats.sleep.count,
        diaper: comprehensiveStats.diaper.count,
        mood: comprehensiveStats.mood.count
      });
      setStats(comprehensiveStats);
      
      // Load recent activities from history (last 10 for preview)
      const activities = await getActivities(user!.id, childId, 10);
      setRecentActivities(activities);

      // Load recent growth records (NEW - for weight/height history)
      const growthRecords = await getGrowthRecords(childId, activeTab === 'sleep' ? 'weight' : activeTab);
      setRecentGrowthRecords(growthRecords.slice(0, 10)); // Last 10 records
      console.log('[STATISTICS] Loaded growth records:', growthRecords.length);

      // Load chart for active tab
      await loadChartData(childId, activeTab);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load chart data based on active tab
  const loadChartData = async (childId: string, tab: TabType) => {
    try {
      let data: ChartDataPoint[] = [];

      if (tab === 'weight') {
        data = await getGrowthChartData(childId, 'weight', 6);
      } else if (tab === 'height') {
        data = await getGrowthChartData(childId, 'height', 6);
      } else if (tab === 'sleep') {
        data = await getSleepDurationChart(user!.id, childId, 7);
      }

      console.log('[LOAD-CHART] Chart data received:', {
        tab,
        dataLength: data.length,
        dataPoints: data.map(d => ({ date: d.date, value: d.value, label: d.label }))
      });

      setChartData(data);
      const hasDataWithValue = data.length > 0 && data.some(d => d.value > 0);
      console.log('[LOAD-CHART] hasData result:', hasDataWithValue, 'condition: length > 0 && some value > 0');
      setHasData(hasDataWithValue);
    } catch (err) {
      console.error('Error loading chart:', err);
      setChartData([]);
      setHasData(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  // Refresh data when screen is focused (for growth records updates)
  useFocusEffect(
    useCallback(() => {
      if (selectedChildId) {
        loadStats(selectedChildId);
      }
    }, [selectedChildId, activeTab, statsPeriod])
  );

  // Reload chart when tab or period changes
  useEffect(() => {
    if (selectedChildId) {
      loadChartData(selectedChildId, activeTab);
    }
  }, [activeTab, selectedChildId]);

  // Reload stats when period changes
  useEffect(() => {
    if (selectedChildId) {
      loadStats(selectedChildId);
    }
  }, [statsPeriod]);

  // NEW: Handle add growth record (weight/height) directly in this screen
  const handleAddRecord = () => {
    if (!selectedChildId) return;

    if (activeTab === 'weight' || activeTab === 'height') {
      // Open input modal for adding weight/height
      setAddRecordModalVisible(true);
    } else {
      // Navigate to activities/history for adding sleep activity
      router.push(`/activities/history?childId=${selectedChildId}&type=sleep`);
    }
  };

  // NEW: Submit growth record
  const handleSubmitGrowthRecord = async (value: string) => {
    if (!selectedChildId) return;
    if (!value) {
      setAddRecordModalVisible(false);
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      Alert.alert(t('common.error'), t('errors.invalidValue'));
      return;
    }

    try {
      await addGrowthRecord(selectedChildId, activeTab === 'sleep' ? 'weight' : activeTab, numValue);
      await loadStats(selectedChildId); // Reload all data
      Alert.alert(
        t('common.success'), 
        `${t('common.data')} ${activeTab === 'weight' ? t('statistics.weight') : t('statistics.height')} ${t('success.addDataSuccess')}`
      );
      console.log('[STATISTICS] Growth record added:', { type: activeTab, value: numValue });
    } catch (error) {
      console.error('[STATISTICS] Error adding record:', error);
      Alert.alert(t('common.error'), t('errors.addDataFailed'));
    } finally {
      setAddRecordModalVisible(false);
    }
  };

  // NEW: Delete growth record
  const handleDeleteGrowthRecord = (record: GrowthRecord) => {
    Alert.alert(
      t('statistics.deleteData'),
      `${t('statistics.deleteConfirm')} ${record.record_type === 'weight' ? t('statistics.weight') : t('statistics.height')}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGrowthRecord(record.id);
              await loadStats(selectedChildId!);
              Alert.alert(t('common.success'), t('success.deleted'));
              console.log('[STATISTICS] Growth record deleted:', record.id);
            } catch (error) {
              console.error('[STATISTICS] Error deleting record:', error);
              Alert.alert(t('common.error'), t('errors.deleteData'));
            }
          },
        },
      ]
    );
  };

  // Menu handlers
  const handleSelectChild = (child: Child) => {
    setSelectedChildId(child.id);
    setSelectedChild(child);
    setChildName(child.name);
    setChildModalVisible(false);
    loadStats(child.id);
  };

  const handleChangePeriod = (days: number) => {
    console.log('[STATISTICS] Changing period from', statsPeriod, 'to', days);
    setStatsPeriod(days);
    setPeriodModalVisible(false);
    
    // Immediately reload stats with new period (pass as override to ensure correct value)
    if (selectedChildId) {
      console.log('[STATISTICS] Reloading stats for new period:', days);
      loadStats(selectedChildId, days); // Pass period directly to avoid state timing issues
    }
  };

  const handleRefresh = () => {
    setMenuVisible(false);
    if (selectedChildId) {
      loadStats(selectedChildId);
    }
  };

  const handleExportData = () => {
    setMenuVisible(false);
    Alert.alert(
      t('statistics.exportDataTitle'),
      t('statistics.exportDataMessage'),
      [{ text: t('common.ok') }]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.babyBlue} />
        <Text style={styles.loadingText}>{t('statistics.loadingStats')}</Text>
      </View>
    );
  }

  if (!selectedChildId) {
    return (
      <View style={styles.container}>
        <AppHeader title={t('statistics.watchGrowth')} showBackButton />

        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            {t('child.noChildren')}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            {t('statistics.addChildToTrack')}
          </Text>
          <CustomButton
            title={`+ ${t('child.addChild')}`}
            variant="primary"
            onPress={() => router.push('/child/add')}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  // Render chart based on tab
  const renderChart = () => {
    if (!hasData) {
      return (
        <View style={styles.emptyChart}>
          <Image
            source={require('../../assets/mascot/baby-buddy-waving.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
          <Text variant="titleMedium" style={styles.emptyChartTitle}>
            {activeTab === 'weight' && t('statistics.noWeightData')}
            {activeTab === 'height' && t('statistics.noHeightData')}
            {activeTab === 'sleep' && t('statistics.noSleepData')}
          </Text>
          <Text variant="bodyMedium" style={styles.emptyChartSubtitle}>
            {t('statistics.addFirstMeasurement')}
          </Text>
          <CustomButton
            title={`+ ${t('statistics.add')} ${activeTab === 'weight' ? t('statistics.weight') : activeTab === 'height' ? t('statistics.height') : t('statistics.sleepData')}`}
            variant="primary"
            onPress={handleAddRecord}
            style={styles.emptyChartButton}
          />
        </View>
      );
    }

    const labels = chartData.map((d) => d.label || '');
    const values = chartData.map((d) => d.value);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text variant="titleMedium" style={styles.chartTitle}>
            {activeTab === 'weight' && t('statistics.weightProgress')}
            {activeTab === 'height' && t('statistics.heightProgress')}
            {activeTab === 'sleep' && t('statistics.sleepPatterns')}
          </Text>
          <Text variant="bodySmall" style={styles.chartPeriod}>
            📅 {activeTab === 'sleep' ? t('statistics.thisWeek') : t('statistics.last6Months')}
          </Text>
        </View>

        <LineChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={CHART_WIDTH}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.white,
            backgroundGradientFrom: theme.colors.white,
            backgroundGradientTo: theme.colors.white,
            decimalPlaces: activeTab === 'sleep' ? 1 : 1,
            color: (opacity = 1) =>
              activeTab === 'weight'
                ? `rgba(135, 206, 250, ${opacity})`
                : activeTab === 'height'
                ? `rgba(249, 221, 235, ${opacity})`
                : `rgba(186, 169, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: theme.colors.babyBlue,
            },
          }}
          bezier
          style={styles.chart}
        />

        <Text variant="labelMedium" style={styles.chartLabel}>
          {activeTab === 'weight' && t('statistics.weightInKg')}
          {activeTab === 'height' && t('statistics.heightInCm')}
          {activeTab === 'sleep' && t('statistics.sleepHoursLabel')}
        </Text>
      </View>
    );
  };

  // Prepare menu items
  const menuItems = [
    ...(children.length > 1 ? [{
      title: t('child.selectChild'),
      icon: 'account-switch',
      onPress: () => setChildModalVisible(true),
    }] : []),
    {
      title: t('statistics.changePeriod'),
      icon: 'calendar-range',
      onPress: () => setPeriodModalVisible(true),
      divider: children.length > 1,
    },
    {
      title: t('common.refresh'),
      icon: 'refresh',
      onPress: handleRefresh,
    },
    {
      title: t('statistics.exportData'),
      icon: 'download',
      onPress: handleExportData,
      divider: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader
        title={t('statistics.title')}
        showBackButton
        menuItems={menuItems}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Period Indicator & Child Info */}
        <View style={styles.periodIndicator}>
          <View style={styles.periodLeft}>
            <Text variant="labelMedium" style={styles.periodText}>
              📅 {statsPeriod === 7 ? t('statistics.days7') : statsPeriod === 14 ? t('statistics.days14') : statsPeriod === 30 ? t('statistics.days30') : t('statistics.months3')}
            </Text>
            {selectedChild && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Image 
                  source={require('../../assets/mascot/Happy.png')} 
                  style={{ width: 16, height: 16, marginRight: 4 }} 
                  resizeMode="contain" 
                />
                <Text variant="bodySmall" style={styles.childInfoText}>
                  {childName} • {selectedChild.gender === 'male' ? t('child.boyLabel') : t('child.girlLabel')}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push(`/child/edit/${selectedChildId}`)}>
            <Text variant="labelSmall" style={styles.viewProfileLink}>
              {t('statistics.viewProfile')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Stats Cards */}
        <View style={styles.statsRow}>
          <CustomCard style={styles.weightCard} animated>
            <View style={styles.statCardHeader}>
              <Text variant="labelLarge" style={styles.statCardLabel}>
                {t('statistics.currentWeight')}
              </Text>
              <IconButton
                icon="trending-up"
                size={20}
                iconColor={theme.colors.babyBlue}
                style={styles.trendIcon}
              />
            </View>
            <Text variant="headlineMedium" style={styles.statValue}>
              {currentWeight ? `${currentWeight.toFixed(1)} kg` : '-'}
            </Text>
            {stats && stats.growth.count > 0 && (
              <Text variant="bodySmall" style={styles.statChange}>
                +{(stats.growth.averagePerDay * 7).toFixed(1)} kg {t('statistics.thisMonth')}
              </Text>
            )}
          </CustomCard>

          <CustomCard style={styles.heightCard} animated>
            <View style={styles.statCardHeader}>
              <Text variant="labelLarge" style={styles.statCardLabel}>
                {t('statistics.currentHeight')}
              </Text>
              <IconButton
                icon="trending-up"
                size={20}
                iconColor={theme.colors.softPink}
                style={styles.trendIcon}
              />
            </View>
            <Text variant="headlineMedium" style={styles.statValue}>
              {currentHeight ? `${currentHeight.toFixed(0)} cm` : '-'}
            </Text>
            {stats && stats.growth.count > 0 && (
              <Text variant="bodySmall" style={styles.statChange}>
                +{(stats.growth.averagePerDay * 3).toFixed(0)} cm this month
              </Text>
            )}
          </CustomCard>
        </View>

        {/* Tab Navigation */}
        <CustomCard style={styles.tabCard} animated>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'weight' && styles.activeTab]}
              onPress={() => setActiveTab('weight')}
            >
              <Text
                variant="labelLarge"
                style={[
                  styles.tabText,
                  activeTab === 'weight' && styles.activeTabText,
                ]}
              >
                {t('statistics.weightTab')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'height' && styles.activeTab]}
              onPress={() => setActiveTab('height')}
            >
              <Text
                variant="labelLarge"
                style={[
                  styles.tabText,
                  activeTab === 'height' && styles.activeTabText,
                ]}
              >
                {t('statistics.heightTab')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
              onPress={() => setActiveTab('sleep')}
            >
              <Text
                variant="labelLarge"
                style={[
                  styles.tabText,
                  activeTab === 'sleep' && styles.activeTabText,
                ]}
              >
                {t('statistics.sleepTab')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chart */}
          {renderChart()}
        </CustomCard>

        {/* Activity Summary Cards */}
        {stats && (
          <View style={styles.activitySummarySection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('statistics.activitySummary7Days', { days: statsPeriod })}
            </Text>
            
            <View style={styles.summaryGrid}>
              <CustomCard style={styles.summaryCard} animated>
                <Text variant="labelMedium" style={styles.summaryLabel}>🍼 {t('activities.feeding')}</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {stats.feeding.count}x
                </Text>
                <Text variant="bodySmall" style={styles.summaryAverage}>
                  {stats.feeding.averagePerDay.toFixed(1)}{t('statistics.perDay')}
                </Text>
              </CustomCard>

              <CustomCard style={styles.summaryCard} animated delay={50}>
                <Text variant="labelMedium" style={styles.summaryLabel}>💤 {t('activities.sleep')}</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {stats.sleep.count}x
                </Text>
                <Text variant="bodySmall" style={styles.summaryAverage}>
                  {stats.sleep.averagePerDay.toFixed(1)}{t('statistics.perDay')}
                </Text>
              </CustomCard>

              <CustomCard style={styles.summaryCard} animated delay={100}>
                <Text variant="labelMedium" style={styles.summaryLabel}>🧷 {t('activities.diaper')}</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {stats.diaper.count}x
                </Text>
                <Text variant="bodySmall" style={styles.summaryAverage}>
                  {stats.diaper.averagePerDay.toFixed(1)}{t('statistics.perDay')}
                </Text>
              </CustomCard>

              <CustomCard style={styles.summaryCard} animated delay={150}>
                <Text variant="labelMedium" style={styles.summaryLabel}>😊 {t('mood.title')}</Text>
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {stats.mood.count}x
                </Text>
                <Text variant="bodySmall" style={styles.summaryAverage}>
                  {stats.mood.averagePerDay.toFixed(1)}{t('statistics.perDay')}
                </Text>
              </CustomCard>
            </View>
          </View>
        )}

        {/* Recent Growth Records (Weight/Height only) - NEW SECTION */}
        {(activeTab === 'weight' || activeTab === 'height') && recentGrowthRecords.length > 0 && (
          <View style={styles.recentActivitiesSection}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                📏 {t('statistics.recentRecords')} {activeTab === 'weight' ? t('statistics.weight') : t('statistics.height')}
              </Text>
            </View>

            <CustomCard style={styles.recentCard}>
              {recentGrowthRecords.slice(0, 5).map((record, index) => {
                const value = record.record_type === 'weight' ? record.weight_kg : record.height_cm;
                const unit = record.record_type === 'weight' ? 'kg' : 'cm';
                const icon = record.record_type === 'weight' ? 'weight' : 'human-male-height';
                
                const date = new Date(record.measured_at);
                const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

                return (
                  <View key={record.id}>
                    <View style={styles.recordRow}>
                      <View style={styles.recordIcon}>
                        <IconButton
                          icon={icon}
                          size={20}
                          iconColor={theme.colors.babyBlue}
                          style={styles.recordIconButton}
                        />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text variant="bodyLarge" style={styles.recordValue}>
                          {value?.toFixed(record.record_type === 'height' ? 0 : 1)} {unit}
                        </Text>
                        <Text variant="bodySmall" style={styles.recordDate}>
                          {formattedDate} • {formattedTime}
                        </Text>
                        {record.note && (
                          <Text variant="bodySmall" style={styles.recordNote}>
                            {record.note}
                          </Text>
                        )}
                      </View>
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor={theme.colors.error}
                        onPress={() => handleDeleteGrowthRecord(record)}
                      />
                    </View>
                    {index < Math.min(recentGrowthRecords.length, 5) - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                );
              })}
            </CustomCard>
          </View>
        )}

        {/* Recent Activities Preview */}
        {recentActivities.length > 0 && (
          <View style={styles.recentActivitiesSection}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('statistics.recentActivitiesTitle')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/activities/history')}>
                <Text variant="labelMedium" style={styles.viewAllLink}>
                  {t('dashboard.viewAll')}
                </Text>
              </TouchableOpacity>
            </View>

            {recentActivities.slice(0, 5).map((activity, index) => (
              <CustomCard key={activity.id} style={styles.activityPreviewCard} animated delay={index * 50}>
                <View style={styles.activityPreviewContent}>
                  <View style={styles.activityPreviewLeft}>
                    <Text variant="labelLarge" style={styles.activityPreviewType}>
                      {activity.type === 'feeding' && `🍼 ${t('activities.feedingTime')}`}
                      {activity.type === 'sleep' && `💤 ${t('activities.sleepTime')}`}
                      {activity.type === 'diaper' && `🧷 ${t('activities.diaperChange')}`}
                      {activity.type === 'mood' && `😊 ${t('activities.moodNote')}`}
                      {activity.type === 'growth' && `📏 ${t('activities.growthRecord')}`}
                    </Text>
                    {activity.value && (
                      <Text variant="bodySmall" style={styles.activityPreviewValue}>
                        {getTranslatedActivityValue(activity)}
                      </Text>
                    )}
                  </View>
                  <Text variant="bodySmall" style={styles.activityPreviewTime}>
                    {new Date(activity.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </CustomCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Child Selector Modal */}
      <Modal
        visible={childModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChildModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setChildModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Image 
                  source={require('../../assets/mascot/Happy.png')} 
                  style={{ width: 32, height: 32, marginRight: 8 }} 
                  resizeMode="contain" 
                />
                <Text variant="titleLarge" style={{ ...styles.modalTitle, marginBottom: 0 }}>
                  {t('child.selectChild')}
                </Text>
              </View>
              
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
                onPress={() => setChildModalVisible(false)}
                style={styles.modalCloseButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Period Selector Modal */}
      <Modal
        visible={periodModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPeriodModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPeriodModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                {t('statistics.selectStatsPeriod')}
              </Text>
              
              {[
                { days: 7, label: t('statistics.days7') },
                { days: 14, label: t('statistics.days14') },
                { days: 30, label: t('statistics.days30') },
                { days: 90, label: t('statistics.months3') },
              ].map((period) => (
                <TouchableOpacity
                  key={period.days}
                  style={[
                    styles.modalItem,
                    statsPeriod === period.days && styles.modalItemActive,
                  ]}
                  onPress={() => handleChangePeriod(period.days)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      statsPeriod === period.days && styles.modalItemTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                  {statsPeriod === period.days && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}

              <CustomButton
                title={t('common.close')}
                variant="secondary"
                onPress={() => setPeriodModalVisible(false)}
                style={styles.modalCloseButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* FAB untuk tambah berat/tinggi badan (NEW) */}
      {(activeTab === 'weight' || activeTab === 'height') && selectedChildId && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddRecord}
          label={activeTab === 'weight' ? t('statistics.addWeight') : t('statistics.addHeight')}
          color={theme.colors.white}
        />
      )}

      {/* Input Modal untuk tambah growth record (NEW) */}
      <CustomInputModal
        visible={addRecordModalVisible}
        title={activeTab === 'weight' ? t('statistics.addWeightFull') : t('statistics.addHeightFull')}
        placeholder={`${t('statistics.enterValue')} (${activeTab === 'weight' ? 'kg' : 'cm'})`}
        onSubmit={handleSubmitGrowthRecord}
        onCancel={() => setAddRecordModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  periodIndicator: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  periodLeft: {
    flex: 1,
  },
  periodText: {
    color: theme.colors.babyBlue,
    fontWeight: '600',
    marginBottom: 4,
  },
  childInfoText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  childNameText: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  viewProfileLink: {
    color: theme.colors.babyBlue,
    fontWeight: '600',
    fontSize: 12,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  weightCard: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: '#E3F2FD',
  },
  heightCard: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: '#FCE4EC',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statCardLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  trendIcon: {
    margin: 0,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  statChange: {
    color: theme.colors.textSecondary,
  },
  tabCard: {
    padding: theme.spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 4,
    marginBottom: theme.spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: theme.colors.softPink,
  },
  tabText: {
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  chartTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  chartPeriod: {
    color: theme.colors.babyBlue,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: 16,
  },
  chartLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  mascotImage: {
    width: 180,
    height: 180,
    marginBottom: theme.spacing.lg,
  },
  emptyChartTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyChartSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyChartButton: {
    minWidth: 220,
  },
  menuContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: theme.spacing.xl,
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
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    fontSize: 20,
  },
  modalItem: {
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
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
    marginTop: theme.spacing.lg,
  },
  // Activity Summary Section
  activitySummarySection: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    color: theme.colors.babyBlue,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  summaryAverage: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  // Recent Activities Section
  recentActivitiesSection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllLink: {
    color: theme.colors.babyBlue,
    fontWeight: '600',
  },
  activityPreviewCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  activityPreviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityPreviewLeft: {
    flex: 1,
  },
  activityPreviewType: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityPreviewValue: {
    color: theme.colors.textSecondary,
  },
  activityPreviewTime: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  // Growth Records Styles (NEW)
  recentCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.babyBlue}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  recordIconButton: {
    margin: 0,
  },
  recordInfo: {
    flex: 1,
  },
  recordValue: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  recordDate: {
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  recordNote: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    backgroundColor: theme.colors.babyBlue,
  },
});

