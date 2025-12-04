import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, FAB, Avatar, IconButton } from 'react-native-paper';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getChildren, deleteChild, formatAge } from '../../services/childService';
import { getCurrentGrowthStats } from '../../services/growthService';
import { Child } from '../../types/database';
import { CustomButton, CustomCard, SkeletonLoader, AppHeader } from '../../components/ui';
import { BabyBuddyEmptyState } from '../../components/mascot';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';

export default function ChildListScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const selectMode = params?.selectMode === 'true'; // Check if in select mode
  const returnTo = params?.returnTo as string; // Where to return after selection
  
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, _setSelectedChild] = useState<string | null>(null);
  const [growthStats, setGrowthStats] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  // Refresh list setiap kali screen fokus kembali (misal setelah tambah anak)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadChildren();
      }
    }, [user])
  );

  // Force refresh on mount for release builds (Android Play Store testing)
  useEffect(() => {
    if (!__DEV__ && user) {
      console.log('[ChildList] Force refresh on mount (release build)');
      loadChildren();
    }
  }, []);

  const loadChildren = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getChildren(user.id);
      setChildren(data);
      
      // Load growth stats for each child
      const stats: { [key: string]: any } = {};
      for (const child of data) {
        try {
          const childStats = await getCurrentGrowthStats(child.id);
          stats[child.id] = childStats;
        } catch (_err) {
          console.log(`No growth stats for child ${child.id}`);
          stats[child.id] = null;
        }
      }
      setGrowthStats(stats);
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert(t('common.error'), t('errors.loadChildFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChild = (childId: string, childName: string) => {
    Alert.alert(
      t('child.deleteProfile'),
      t('child.deleteConfirmMessage', { name: childName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[Delete Child] Attempting to delete child:', childId);
              await deleteChild(childId);
              console.log('[Delete Child] ✅ Child deleted successfully');
              await loadChildren();
              Alert.alert(t('common.success'), t('success.deleteChildSuccess'));
            } catch (error: any) {
              console.error('[Delete Child] ❌ Error:', error);
              const errorMsg = error.message || t('errors.deleteChildFailed');
              Alert.alert(
                t('common.error'),
                `${t('errors.deleteChildFailed')}\n\nDetail: ${errorMsg}`
              );
            }
          },
        },
      ]
    );
  };

  const handleSelectChild = (childId: string) => {
    if (selectMode) {
      console.log('Child selected for media upload:', childId);
      // Navigate to media with selected childId and trigger upload
      if (returnTo === 'media') {
        router.replace(`/(tabs)/media?childId=${childId}&autoUpload=true`);
      } else {
        router.back();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title={selectMode ? `📸 ${t('child.selectChildForUpload')}` : t('child.profile')}
        showBackButton
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {loading ? (
          <>
            {[0, 1, 2].map((index) => (
              <CustomCard key={index} style={styles.childCard}>
                <View style={styles.childCardContent}>
                  <SkeletonLoader width={64} height={64} borderRadius={32} style={{ marginRight: 16 }} />
                  <View style={styles.childInfo}>
                    <SkeletonLoader width={120} height={24} borderRadius={8} />
                    <SkeletonLoader width={100} height={16} borderRadius={6} style={{ marginTop: 8 }} />
                    <SkeletonLoader width={90} height={14} borderRadius={6} style={{ marginTop: 6 }} />
                  </View>
                  <View style={styles.cardActions}>
                    <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginLeft: 4 }} />
                    <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </CustomCard>
            ))}
          </>
        ) : children.length === 0 ? (
          <>
            <BabyBuddyEmptyState
              message={t('child.emptyTitle')}
              submessage={t('child.emptyMessage')}
              expression="happy"
            />
            <CustomCard style={styles.addCard} animated>
              <CustomButton
                title={t('child.addChild')}
                variant="primary"
                onPress={() => router.push('/child/add')}
              />
            </CustomCard>
          </>
        ) : (
          <>
            {children.map((child, index) => {
              const CardContent = (
                <CustomCard
                  key={child.id}
                  style={
                    selectedChild === child.id 
                      ? { ...styles.childCard, ...styles.selectedCard }
                      : styles.childCard
                  }
                  animated
                  delay={index * 100}
                >
                  <View style={styles.childCardContent}>
                    {child.photo_url ? (
                      <Avatar.Image
                        size={64}
                        source={{ uri: child.photo_url }}
                        style={styles.avatar}
                      />
                    ) : (
                      <Avatar.Text
                        size={64}
                        label={child.name.substring(0, 2).toUpperCase()}
                        style={[styles.avatar, { backgroundColor: theme.colors.babyBlue }]}
                      />
                    )}
                    <View style={styles.childInfo}>
                      <Text variant="titleLarge" style={styles.childName}>
                        {child.name}
                      </Text>
                      <Text variant="bodyMedium" style={styles.childAge}>
                        🎂 {formatAge(child.dob)}
                      </Text>
                      <Text variant="bodySmall" style={styles.childGender}>
                        {child.gender === 'male' ? t('child.boyEmoji') : t('child.girlEmoji')}
                      </Text>
                      
                      {/* Growth Stats Preview */}
                      {growthStats[child.id] && (
                        <View style={styles.growthPreview}>
                          {growthStats[child.id].weight.current != null && (
                            <Text variant="bodySmall" style={styles.growthStat}>
                              ⚖️ {growthStats[child.id].weight.current.toFixed(1)} kg
                            </Text>
                          )}
                          {growthStats[child.id].height.current != null && (
                            <Text variant="bodySmall" style={styles.growthStat}>
                              📏 {growthStats[child.id].height.current.toFixed(0)} cm
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                    {!selectMode && (
                      <View style={styles.cardActions}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => router.push(`/child/edit/${child.id}`)}
                          iconColor={theme.colors.babyBlue}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleDeleteChild(child.id, child.name)}
                          iconColor={theme.colors.error}
                        />
                      </View>
                    )}
                    {selectMode && (
                      <IconButton
                        icon="chevron-right"
                        size={24}
                        iconColor={theme.colors.babyBlue}
                      />
                    )}
                  </View>
                  
                  {/* Statistics & Growth Button - Routes to unified /statistics */}
                  {!selectMode && (
                    <TouchableOpacity
                      style={styles.growthButton}
                      onPress={() => router.push(`/statistics?childId=${child.id}`)}
                      activeOpacity={0.7}
                    >
                      <Text variant="labelLarge" style={styles.growthButtonText}>
                        {t('child.viewStatisticsGrowth')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </CustomCard>
              );

              return selectMode ? (
                <TouchableOpacity 
                  key={child.id} 
                  onPress={() => handleSelectChild(child.id)}
                  activeOpacity={0.7}
                >
                  {CardContent}
                </TouchableOpacity>
              ) : CardContent;
            })}

            {children.length < 3 && (
              <CustomCard style={styles.addCard} animated delay={children.length * 100}>
                <CustomButton
                  title={t('child.addAnotherChild')}
                  variant="secondary"
                  onPress={() => router.push('/child/add')}
                />
              </CustomCard>
            )}
          </>
        )}
      </ScrollView>

      {children.length > 0 && children.length < 3 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/child/add')}
          label={t('child.addChild')}
          color={theme.colors.white}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 100,
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
  emptyCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: theme.spacing.sm,
  },
  childCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: theme.colors.babyBlue,
  },
  childCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: theme.spacing.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  childAge: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  childGender: {
    color: theme.colors.textSecondary,
  },
  growthPreview: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  growthStat: {
    color: theme.colors.babyBlue,
    fontWeight: '600',
  },
  growthButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: `${theme.colors.babyBlue}15`,
    borderRadius: theme.borders.radius.medium,
    borderWidth: 1,
    borderColor: theme.colors.babyBlue,
    alignItems: 'center',
  },
  growthButtonText: {
    color: theme.colors.babyBlue,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
  },
  addCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    backgroundColor: theme.colors.babyBlue,
  },
});
