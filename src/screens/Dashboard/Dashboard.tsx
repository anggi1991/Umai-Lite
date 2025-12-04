import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, IconButton, Menu, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { CustomCard } from '../../components/ui/CustomCard';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { BabyBuddy } from '../../components/mascot';
import { UpgradeModal } from '../../components/ui/UpgradeModal';
import { AppHeader, QuickActions, TodaysSummary } from '../../components/ui';
import { 
  QuickAddSection, 
  AITipsSection, 
  RecentActivitiesSection, 
  UpcomingRemindersSection 
} from '../../components/dashboard';
import theme from '../../theme';
import AddActivityModal from '../../components/activities/AddActivityModal';
import { createActivity, getTodayActivities, getActivitySummary } from '../../services/activityService';
import { getChildren } from '../../services/childService';
import { generateDailyTip } from '../../services/dailyTipsService';
import { Activity, ActivityInput, ActivityType } from '../../types/database';
import { trackScreenView, trackActivityCreated, trackFeatureUsage } from '../../services/analyticsService';
import { UsageLimitService } from '../../services/usageLimitService';
import { getGreetingKey, getFallbackTip } from '../../utils/dashboardHelpers';
import { BannerAd, useRewardedAd } from '../../components/ads';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { t, language } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [preselectedType, setPreselectedType] = useState<ActivityType | undefined>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitySummary, setActivitySummary] = useState({
    feeding: 0,
    sleep: 0,
    diaper: 0,
    mood: 0,
    growth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tipLoading, setTipLoading] = useState(false);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const tipsViewRef = React.useRef<View>(null);
  
  // 🩹 FIX: Track if user has children for QuickActions
  const [hasChildren, setHasChildren] = useState(true);
  
  // Monetization states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSource, setUpgradeSource] = useState<'ai_tips' | 'chat' | 'general'>('general');
  const [usageStatus, setUsageStatus] = useState({
    ai_tips: { used: 0, limit: 3 },
    chat_messages: { used: 0, limit: 10 },
  });

  // AdMob Rewarded Ad
  const { showRewarded, loaded: adLoaded, reward } = useRewardedAd();

  // Effect to handle reward earned
  useEffect(() => {
    if (reward) {
      console.log('Reward earned, generating tip...');
      handleGenerateTip(true); // Bypass limit
    }
  }, [reward]);

  // Combined data loading for better performance
  useEffect(() => {
    if (user) {
      loadAllData();
      trackScreenView('Dashboard');
    }
  }, [user]);
  
  const loadAllData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load all data in parallel for better performance
      const [todayActivities, summary, usageData, children] = await Promise.all([
        getTodayActivities(user.id),
        getActivitySummary(user.id),
        UsageLimitService.getAllUsageStatus().catch(() => null),
        getChildren(user.id),
      ]);
      
      // Set activities and summary
      setActivities(todayActivities);
      setActivitySummary({
        feeding: summary.feeding || 0,
        sleep: summary.sleep || 0,
        diaper: summary.diaper || 0,
        mood: summary.mood || 0,
        growth: summary.growth || 0,
      });
      
      // 🩹 FIX: Check if user has children
      setHasChildren(children.length > 0);
      
      // Set usage status if available
      if (usageData) {
        setUsageStatus({
          ai_tips: {
            used: usageData.ai_tips?.current_count || 0,
            limit: usageData.ai_tips?.limit || 3,
          },
          chat_messages: {
            used: usageData.chat_messages?.current_count || 0,
            limit: usageData.chat_messages?.limit || 10,
          },
        });
      }
      
      // Set default tip (no auto-load to avoid error)
      setDailyTip(t('dashboard.defaultTip'));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('common.error'), t('dashboard.loadDataError'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleQuickAdd = (type: ActivityType) => {
    setPreselectedType(type);
    setModalVisible(true);
  };

  const handleAddActivity = async (activityData: ActivityInput) => {
    if (!user) return;
    
    try {
      const newActivity = await createActivity(user.id, activityData);
      await loadAllData(); // Refresh all data after adding activity
      
      // Track activity creation
      if (newActivity?.id) {
        await trackActivityCreated(activityData.type, newActivity.id);
      }
      
      Alert.alert(t('common.success'), t('dashboard.activityAdded'));
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert(t('common.error'), t('dashboard.activityAddError'));
      throw error;
    }
  };

  const handleGenerateTip = async (bypassLimit = false) => {
    if (!user || tipLoading) return;
    
    setTipLoading(true);
    
    try {
      const tip = await generateDailyTip({ language, bypassLimit });
      
      if (tip?.tip_text) {
        setDailyTip(tip.tip_text);
        
        // Track feature usage and reload usage status in parallel
        await Promise.all([
          tip.id ? trackFeatureUsage('generate_tip', { tip_id: tip.id }) : Promise.resolve(),
          UsageLimitService.getAllUsageStatus()
            .then(status => {
              setUsageStatus({
                ai_tips: {
                  used: status.ai_tips?.current_count || 0,
                  limit: status.ai_tips?.limit || 3,
                },
                chat_messages: {
                  used: status.chat_messages?.current_count || 0,
                  limit: status.chat_messages?.limit || 10,
                },
              });
            })
            .catch(() => {}),
        ]);
        
        Alert.alert(t('dashboard.tipUpdated'), t('dashboard.tipGenerated'));
      } else {
        throw new Error('Tips tidak valid');
      }
    } catch (e: any) {
      // Check if it's a usage limit error
      if (e.message === 'USAGE_LIMIT_REACHED' && !bypassLimit) {
        setUpgradeSource('ai_tips');
        setShowUpgradeModal(true);
        return;
      }
      
      // Use fallback tip
      setDailyTip(getFallbackTip());
      
      Alert.alert(
        t('dashboard.dailyTip'),
        t('dashboard.usingOfflineTip'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setTipLoading(false);
    }
  };

  const handleWatchAd = () => {
    if (adLoaded) {
      showRewarded();
    } else {
      Alert.alert(t('common.loading'), t('ads.adNotReady'));
    }
  };

  const scrollToTips = () => {
    tipsViewRef.current?.measureLayout(
      scrollViewRef.current as any,
      (x, y) => {
        scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
      },
      () => {}
    );
  };

  // 🔔 Fix Bug #3: Handler for notification bell - Show unread notifications
  const handleNotificationPress = () => {
    console.log('[Dashboard] Bell icon pressed - showing unread notifications');
    // Navigate to reminders screen which shows upcoming/unread reminders
    router.push('/reminders');
  };

  const greeting = t(getGreetingKey());
  
  // 🍔 FIX Bug #4: Menu items using AppHeader pattern like journal
  const menuItems = [
    {
      title: t('common.settings'),
      icon: 'cog',
      onPress: () => router.push('/settings'),
    },
    {
      title: t('profile.editProfile'),
      icon: 'account-edit',
      onPress: () => router.push('/profile/edit'),
    },
    {
      title: t('common.helpSupport'),
      icon: 'help-circle',
      onPress: () => {
        Alert.alert(
          t('common.helpSupport'),
          t('common.helpMessage'),
          [{ text: t('common.ok') }]
        );
      },
      divider: true,
    },
    {
      title: t('auth.signOut'),
      icon: 'logout',
      onPress: async () => {
        Alert.alert(
          t('auth.signOut'),
          t('auth.signOutConfirm'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('auth.signOut'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await signOut();
                  router.replace('/(auth)/signin');
                } catch (error) {
                  console.error('Sign out error:', error);
                  Alert.alert(t('common.error'), t('errors.signOutFailed'));
                }
              }
            }
          ]
        );
      },
    },
  ];
  
  // State for menu visibility
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header with bell and menu using customRight */}
      <AppHeader 
        title={greeting}
        showBackButton={false}
        variant="gradient"
        customRight={
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="bell"
              size={24}
              onPress={handleNotificationPress}
              iconColor={theme.colors.white}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => setMenuVisible(true)}
                  iconColor={theme.colors.white}
                />
              }
            >
              {menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  {item.divider && index > 0 && <Divider />}
                  <Menu.Item
                    onPress={() => {
                      setMenuVisible(false);
                      item.onPress();
                    }}
                    title={item.title}
                    leadingIcon={item.icon}
                  />
                </React.Fragment>
              ))}
            </Menu>
          </View>
        }
      />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        
        {/* Welcome Card with BabyBuddy (Figma Design) */}
        <CustomCard style={styles.welcomeCard} animated delay={0}>
          <LinearGradient
            colors={[theme.colors.babyBlue, theme.colors.softPink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeContent}>
              <View>
                <Text variant="headlineSmall" style={styles.welcomeTitle}>
                  {t('dashboard.hello')} 👋
                </Text>
                <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
                  {t('dashboard.howIsBaby')}
                </Text>
              </View>
              <BabyBuddy 
                expression="waving" 
                size={80} 
                animated={true}
                showHalo={false}
                showSparkle={true}
              />
            </View>
          </LinearGradient>
        </CustomCard>

        {/* Quick Actions Grid (Figma Design) */}
        <QuickActions onTipsPress={scrollToTips} hasChildren={hasChildren} />

        {/* Today's Summary (Figma Design) */}
        {loading ? (
          <CustomCard style={styles.card}>
            <SkeletonLoader width="60%" height={20} style={{ marginBottom: theme.spacing.md }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: theme.spacing.sm }}>
              <View style={{ alignItems: 'center', padding: theme.spacing.sm }}>
                <SkeletonLoader width={60} height={40} style={{ marginBottom: theme.spacing.xs }} />
                <SkeletonLoader width={70} height={14} />
              </View>
              <View style={{ alignItems: 'center', padding: theme.spacing.sm }}>
                <SkeletonLoader width={60} height={40} style={{ marginBottom: theme.spacing.xs }} />
                <SkeletonLoader width={70} height={14} />
              </View>
              <View style={{ alignItems: 'center', padding: theme.spacing.sm }}>
                <SkeletonLoader width={60} height={40} style={{ marginBottom: theme.spacing.xs }} />
                <SkeletonLoader width={70} height={14} />
              </View>
            </View>
          </CustomCard>
        ) : (
          <TodaysSummary 
            feedingCount={activitySummary.feeding}
            sleepHours={Math.round((activitySummary.sleep / 60) * 10) / 10}
            diaperCount={activitySummary.diaper}
          />
        )}

        {/* Quick Add Section - For logging activities */}
        <QuickAddSection onQuickAdd={handleQuickAdd} hasChildren={hasChildren} />

        {/* AI Tips Section - Combined static and AI-generated tips */}
        <View ref={tipsViewRef} collapsable={false}>
          <AITipsSection
            dailyTip={dailyTip}
            tipLoading={tipLoading}
            onGenerateTip={() => handleGenerateTip(false)}
            usageStatus={usageStatus.ai_tips}
            onUpgradePress={() => router.push('/settings/subscription')}
            onWatchAd={handleWatchAd}
          />
        </View>

        {/* Upcoming Reminders */}
        <UpcomingRemindersSection />

        {/* Recent Activities */}
        {loading ? (
          <View style={styles.card}>
            <SkeletonLoader width="60%" height={20} style={{ marginBottom: theme.spacing.md }} />
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.activityItem}>
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  <SkeletonLoader width="40%" height={16} style={{ marginBottom: theme.spacing.xs }} />
                  <SkeletonLoader width="60%" height={14} />
                </View>
                <SkeletonLoader width={60} height={14} />
              </View>
            ))}
          </View>
        ) : (
          <RecentActivitiesSection activities={activities} />
        )}
      </ScrollView>

      {/* Add Activity Modal */}
      <AddActivityModal
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setPreselectedType(undefined);
        }}
        onSubmit={handleAddActivity}
        preselectedType={preselectedType}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onDismiss={() => setShowUpgradeModal(false)}
        onUpgrade={(_) => {
          setShowUpgradeModal(false);
          router.push('/subscription');
        }}
        source={upgradeSource}
        currentUsage={
          upgradeSource === 'ai_tips'
            ? { ...usageStatus.ai_tips, feature: 'AI Tips' }
            : upgradeSource === 'chat'
            ? { ...usageStatus.chat_messages, feature: 'Chat Messages' }
            : undefined
        }
      />

      {/* Banner Ad */}
      <BannerAd />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.md, // Small padding at bottom
  },
  // Only styles used in Dashboard.tsx (sub-component styles moved to their files)
  card: {
    margin: theme.spacing.md,
    marginBottom: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  welcomeCard: {
    margin: theme.spacing.md,
    marginBottom: 0,
    overflow: 'hidden',
    padding: 0,
  },
  welcomeGradient: {
    padding: theme.spacing.lg,
    borderRadius: theme.borders.radius.large,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    color: theme.colors.white,
    opacity: 0.9,
  },
});
