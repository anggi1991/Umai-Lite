import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  SegmentedButtons,
  Card,
  FAB,
  Divider,
  IconButton,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getChildren } from '../../services/childService';
import {
  getCurrentGrowthStats,
  getGrowthChartData,
  getGrowthRecords,
  addGrowthRecord,
  deleteGrowthRecord,
  ChartDataPoint,
  GrowthRecord,
} from '../../services/growthService';
import { Child } from '../../types/database';
import { CustomCard, SkeletonLoader, AppHeader, CustomInputModal } from '../../components/ui';
import { BabyBuddyEmptyState } from '../../components/mascot';
import theme from '../../theme';

const screenWidth = Dimensions.get('window').width;

type TabValue = 'weight' | 'height' | 'sleep';

interface GrowthStats {
  weight: {
    current: number | null;
    change: number;
    measuredAt: string | null;
  };
  height: {
    current: number | null;
    change: number;
    measuredAt: string | null;
  };
}

export default function GrowthTrackerScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const preselectedChildId = params?.childId as string; // Get child ID from route params
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabValue>('weight');
  
  const [growthStats, setGrowthStats] = useState<GrowthStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentRecords, setRecentRecords] = useState<GrowthRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load children on mount
  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (selectedChild) {
        loadGrowthData();
      }
    }, [selectedChild, selectedTab])
  );

  const loadChildren = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getChildren(user.id);
      setChildren(data);
      
      // Select child from params or first child by default
      if (preselectedChildId) {
        const child = data.find(c => c.id === preselectedChildId);
        if (child) {
          setSelectedChild(child);
        } else if (data.length > 0) {
          setSelectedChild(data[0]);
        }
      } else if (data.length > 0) {
        setSelectedChild(data[0]);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert(t('common.error'), t('errors.loadChildrenFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadGrowthData = async () => {
    if (!selectedChild) return;
    
    try {
      setLoadingData(true);
      
      const [stats, chart, records] = await Promise.all([
        getCurrentGrowthStats(selectedChild.id),
        getGrowthChartData(selectedChild.id, selectedTab, 6),
        getGrowthRecords(selectedChild.id, selectedTab),
      ]);
      
      setGrowthStats(stats);
      setChartData(chart);
      setRecentRecords(records.slice(0, 10)); // Show last 10 records
    } catch (error) {
      console.error('Error loading growth data:', error);
      Alert.alert(t('common.error'), t('errors.loadGrowthDataFailed'));
    } finally {
      setLoadingData(false);
    }
  };

  const [inputModalVisible, setInputModalVisible] = useState(false);

  const handleAddRecord = () => {
    setInputModalVisible(true);
  };

  const handleSubmitRecord = async (value: string) => {
    if (!selectedChild) return;
    if (!value) {
      setInputModalVisible(false);
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      Alert.alert(t('common.error'), t('errors.invalidValue'));
      return;
    }
    try {
      await addGrowthRecord(selectedChild.id, selectedTab, numValue);
      await loadGrowthData();
      Alert.alert(t('common.success'), t('success.addDataSuccess'));
    } catch (error) {
      console.error('Error adding record:', error);
      Alert.alert(t('common.error'), t('errors.addDataFailed'));
    } finally {
      setInputModalVisible(false);
    }
  };

  const handleDeleteRecord = (record: GrowthRecord) => {
    Alert.alert(
      t('statistics.deleteData'),
      t('statistics.confirmDeleteData'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGrowthRecord(record.id);
              await loadGrowthData();
              Alert.alert(t('common.success'), t('success.deleted'));
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert(t('common.error'), t('errors.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  const getTabLabel = (tab: TabValue): string => {
    switch (tab) {
      case 'weight': return t('statistics.weight');
      case 'height': return t('statistics.height');
      case 'sleep': return t('statistics.sleepHoursLabel');
    }
  };

  const getUnit = (tab: TabValue): string => {
    switch (tab) {
      case 'weight': return 'kg';
      case 'height': return 'cm';
      case 'sleep': return t('feeding.hours');
    }
  };

  const getCurrentValue = (): number | null => {
    if (!growthStats) return null;
    if (selectedTab === 'weight') return growthStats.weight.current;
    if (selectedTab === 'height') return growthStats.height.current;
    return null;
  };

  const getMonthlyChange = (): number => {
    if (!growthStats) return 0;
    if (selectedTab === 'weight') return growthStats.weight.change;
    if (selectedTab === 'height') return growthStats.height.change;
    return 0;
  };

  const formatChartData = () => {
    if (chartData.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    // Use label if available, otherwise format from date
    const labels = chartData.map((point) => {
      if (point.label) return point.label;
      const date = new Date(point.measured_date || point.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const data = chartData.map((point) => point.value);

    console.log('[GROWTH-TRACKER] Chart formatted:', { 
      dataPoints: chartData.length, 
      labels, 
      values: data 
    });

    return {
      labels,
      datasets: [{ data }],
    };
  };

  const renderStatsCards = () => {
    if (selectedTab === 'sleep') {
      return null; // Sleep doesn't have preview cards
    }

    const currentWeight = growthStats?.weight.current;
    const weightChange = growthStats?.weight.change || 0;
    const currentHeight = growthStats?.height.current;
    const heightChange = growthStats?.height.change || 0;

    return (
      <View style={styles.statsContainer}>
        {/* Current Weight Card */}
        <CustomCard style={styles.statCard}>
          <View style={styles.statCardContent}>
            <Text variant="labelLarge" style={styles.statLabel}>
              Berat Saat Ini
            </Text>
            <Text variant="displaySmall" style={styles.statValue}>
              {currentWeight ? `${currentWeight.toFixed(1)} kg` : '-'}
            </Text>
            {weightChange !== 0 && (
              <View style={styles.changeContainer}>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.changeText,
                    weightChange > 0 ? styles.changePositive : styles.changeNegative,
                  ]}
                >
                  {weightChange > 0 ? '+' : ''}
                  {weightChange.toFixed(1)} kg bulan ini
                </Text>
              </View>
            )}
          </View>
        </CustomCard>

        {/* Current Height Card */}
        <CustomCard style={styles.statCard}>
          <View style={styles.statCardContent}>
            <Text variant="labelLarge" style={styles.statLabel}>
              Tinggi Saat Ini
            </Text>
            <Text variant="displaySmall" style={styles.statValue}>
              {currentHeight ? `${currentHeight.toFixed(0)} cm` : '-'}
            </Text>
            {heightChange !== 0 && (
              <View style={styles.changeContainer}>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.changeText,
                    heightChange > 0 ? styles.changePositive : styles.changeNegative,
                  ]}
                >
                  {heightChange > 0 ? '+' : ''}
                  {heightChange.toFixed(0)} cm bulan ini
                </Text>
              </View>
            )}
          </View>
        </CustomCard>
      </View>
    );
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <CustomCard style={styles.chartCard}>
          <BabyBuddyEmptyState
            message={t('growth.noData', { type: getTabLabel(selectedTab).toLowerCase() })}
            submessage={t('growth.addFirstMeasurement')}
            expression="happy"
          />
        </CustomCard>
      );
    }

    return (
      <CustomCard style={styles.chartCard}>
        <Text variant="titleMedium" style={styles.chartTitle}>
          Grafik {getTabLabel(selectedTab)}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={formatChartData()}
            width={Math.max(screenWidth - 64, chartData.length * 60)}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.white,
              backgroundGradientFrom: theme.colors.white,
              backgroundGradientTo: theme.colors.white,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(174, 225, 249, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.babyBlue,
              },
            }}
            bezier
            style={styles.chart}
          />
        </ScrollView>
      </CustomCard>
    );
  };

  const renderRecentEntries = () => {
    if (recentRecords.length === 0) {
      return null;
    }

    return (
      <CustomCard style={styles.recentCard}>
        <Text variant="titleMedium" style={styles.recentTitle}>
          Catatan Terbaru
        </Text>
        <Divider style={styles.divider} />
        {recentRecords.map((record, index) => {
          const value = 
            record.record_type === 'weight' ? record.weight_kg :
            record.record_type === 'height' ? record.height_cm :
            record.sleep_hours;

          const icon = 
            record.record_type === 'weight' ? 'weight' :
            record.record_type === 'height' ? 'human-male-height' :
            'sleep';

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
                    {value?.toFixed(record.record_type === 'height' ? 0 : 1)} {getUnit(record.record_type)}
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
                  onPress={() => handleDeleteRecord(record)}
                />
              </View>
              {index < recentRecords.length - 1 && <Divider style={styles.divider} />}
            </View>
          );
        })}
      </CustomCard>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Pantau Pertumbuhan" showBackButton />
        <View style={styles.loadingContainer}>
          <SkeletonLoader width={200} height={24} borderRadius={8} />
        </View>
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader title={t('growth.title')} showBackButton />
        <BabyBuddyEmptyState
          message={t('child.noChildren')}
          submessage={t('growth.addChildToTrack')}
          expression="happy"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader title="Pantau Pertumbuhan" showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Child Selector */}
        {children.length > 1 && (
          <View style={styles.childSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  onPress={() => setSelectedChild(child)}
                  style={[
                    styles.childChip,
                    selectedChild?.id === child.id && styles.childChipSelected,
                  ]}
                >
                  <Text
                    variant="labelLarge"
                    style={[
                      styles.childChipText,
                      selectedChild?.id === child.id && styles.childChipTextSelected,
                    ]}
                  >
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stats Cards (Weight & Height only) */}
        {renderStatsCards()}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={selectedTab}
            onValueChange={(value) => setSelectedTab(value as TabValue)}
            buttons={[
              {
                value: 'weight',
                label: 'Berat',
                icon: 'weight',
              },
              {
                value: 'height',
                label: 'Tinggi',
                icon: 'human-male-height',
              },
              {
                value: 'sleep',
                label: 'Tidur',
                icon: 'sleep',
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Chart */}
        {loadingData ? (
          <CustomCard style={styles.chartCard}>
            <SkeletonLoader width="100%" height={220} borderRadius={8} />
          </CustomCard>
        ) : (
          renderChart()
        )}

        {/* Recent Entries */}
        {!loadingData && renderRecentEntries()}
      </ScrollView>

      {/* FAB to add new record */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddRecord}
        label={t('growth.addRecord', { type: getTabLabel(selectedTab) })}
        color={theme.colors.white}
      />

      {/* Custom Input Modal for adding record */}
      <CustomInputModal
        visible={inputModalVisible}
        title={t('growth.addRecord', { type: getTabLabel(selectedTab) })}
        placeholder={t('growth.enterValue', { type: getTabLabel(selectedTab).toLowerCase(), unit: getUnit(selectedTab) })}
        onSubmit={handleSubmitRecord}
        onCancel={() => setInputModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 100,
  },
  childSelector: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  childChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  childChipSelected: {
    backgroundColor: theme.colors.babyBlue,
    borderColor: theme.colors.babyBlue,
  },
  childChipText: {
    color: theme.colors.textPrimary,
  },
  childChipTextSelected: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
  },
  changePositive: {
    color: theme.colors.success,
  },
  changeNegative: {
    color: theme.colors.error,
  },
  tabContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  segmentedButtons: {
    backgroundColor: theme.colors.white,
  },
  chartCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: 16,
  },
  recentCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  recentTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
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
