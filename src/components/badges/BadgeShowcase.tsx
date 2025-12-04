import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Card,
  Divider,
  ActivityIndicator,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import {
  getUserBadgeProgress,
  getTotalBadgePoints,
  getBadgeCompletionPercentage,
  BadgeProgress,
  Badge,
} from '../../services/badgeService';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * BadgeShowcase - Display user achievements and badge progress
 */
export const BadgeShowcaseScreen: React.FC = () => {
  const { t } = useTranslation();
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [nextBadge, setNextBadge] = useState<BadgeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Badge['category'] | 'all'>('all');

  useEffect(() => {
    loadBadgeData();
  }, []);

  const loadBadgeData = async () => {
    try {
      console.log('[BadgeShowcase] Loading badge data...');
      setLoading(true);
      
      // Load progress first (independent queries)
      const [progress, points, percentage] = await Promise.all([
        getUserBadgeProgress(),
        getTotalBadgePoints(),
        getBadgeCompletionPercentage(),
      ]);
      
      console.log('[BadgeShowcase] Basic data loaded:', {
        badgeCount: progress.length,
        totalPoints: points,
        completionPercentage: percentage,
      });
      
      // Get next badge from progress (avoid infinite loop)
      const locked = progress.filter(p => !p.unlocked);
      locked.sort((a, b) => b.progress - a.progress);
      const next = locked[0] || null;
      
      console.log('[BadgeShowcase] Next badge to unlock:', next?.badge.name || 'None');
      
      setBadges(progress);
      setTotalPoints(points);
      setCompletionPercentage(percentage);
      setNextBadge(next);
    } catch (error) {
      console.error('[BadgeShowcase] Error loading badge data:', error);
      console.error('[BadgeShowcase] Error details:', JSON.stringify(error, null, 2));
      // Set empty state on error
      setBadges([]);
      setTotalPoints(0);
      setCompletionPercentage(0);
      setNextBadge(null);
    } finally {
      console.log('[BadgeShowcase] Loading complete');
      setLoading(false);
    }
  };

  const handleSetDisplayedBadge = async (badgeId: string) => {
    try {
      // Find the user_badge id (would need to be passed from service)
      // For now, just reload data
      await loadBadgeData();
    } catch (error) {
      console.error('Error setting displayed badge:', error);
    }
  };

  const getTierColor = (tier: Badge['tier']) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return colors.textSecondary;
    }
  };

  const getTierIcon = (tier: Badge['tier']) => {
    switch (tier) {
      case 'bronze':
        return 'medal-outline';
      case 'silver':
        return 'medal';
      case 'gold':
        return 'trophy-variant';
      case 'platinum':
        return 'crown';
      default:
        return 'shield-outline';
    }
  };

  const _getCategoryIcon = (category: Badge['category']) => {
    switch (category) {
      case 'engagement':
        return 'fire';
      case 'milestone':
        return 'flag-checkered';
      case 'social':
        return 'account-group';
      case 'learning':
        return 'school';
      default:
        return 'star';
    }
  };

  const filteredBadges =
    selectedCategory === 'all'
      ? badges
      : badges.filter((b) => b.badge.category === selectedCategory);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Stats Header */}
      <Surface style={styles.statsHeader} elevation={2}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>
              {unlockedCount}/{badges.length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {t('badges.badgesEarned')}
            </Text>
          </View>
          <Divider style={styles.verticalDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>
              {totalPoints}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {t('badges.totalPoints')}
            </Text>
          </View>
          <Divider style={styles.verticalDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>
              {completionPercentage}%
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              {t('badges.completion')}
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={completionPercentage / 100}
          color={colors.primary}
          style={styles.progressBar}
        />
      </Surface>

      {/* Next Badge to Unlock */}
      {nextBadge && !nextBadge.unlocked && (
        <Card style={styles.nextBadgeCard}>
          <Card.Content>
            <View style={styles.nextBadgeHeader}>
              <MaterialCommunityIcons
                name="target"
                size={32}
                color={colors.warning}
              />
              <Text variant="titleMedium" style={styles.nextBadgeTitle}>
                {t('badges.nextBadgeToUnlock')}
              </Text>
            </View>

            <View style={styles.nextBadgeContent}>
              <View style={styles.nextBadgeIcon}>
                <MaterialCommunityIcons
                  name={nextBadge.badge.icon_name as any}
                  size={48}
                  color={getTierColor(nextBadge.badge.tier)}
                />
              </View>
              <View style={styles.nextBadgeInfo}>
                <Text variant="titleSmall" style={styles.nextBadgeName}>
                  {nextBadge.badge.name}
                </Text>
                <Text variant="bodySmall" style={styles.nextBadgeDescription}>
                  {nextBadge.badge.description}
                </Text>
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={nextBadge.progress / 100}
                    color={colors.primary}
                    style={styles.badgeProgress}
                  />
                  <Text variant="bodySmall" style={styles.progressText}>
                    {nextBadge.progress}%
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            style={styles.categoryChip}
          >
            {t('badges.all')}
          </Chip>
          <Chip
            selected={selectedCategory === 'engagement'}
            onPress={() => setSelectedCategory('engagement')}
            style={styles.categoryChip}
            icon={() => (
              <MaterialCommunityIcons name="fire" size={16} color={colors.primary} />
            )}
          >
            {t('badges.engagement')}
          </Chip>
          <Chip
            selected={selectedCategory === 'milestone'}
            onPress={() => setSelectedCategory('milestone')}
            style={styles.categoryChip}
            icon={() => (
              <MaterialCommunityIcons
                name="flag-checkered"
                size={16}
                color={colors.primary}
              />
            )}
          >
            {t('badges.milestone')}
          </Chip>
          <Chip
            selected={selectedCategory === 'social'}
            onPress={() => setSelectedCategory('social')}
            style={styles.categoryChip}
            icon={() => (
              <MaterialCommunityIcons
                name="account-group"
                size={16}
                color={colors.primary}
              />
            )}
          >
            {t('badges.social')}
          </Chip>
          <Chip
            selected={selectedCategory === 'learning'}
            onPress={() => setSelectedCategory('learning')}
            style={styles.categoryChip}
            icon={() => (
              <MaterialCommunityIcons name="school" size={16} color={colors.primary} />
            )}
          >
            {t('badges.learning')}
          </Chip>
        </ScrollView>
      </View>

      {/* Badge Grid */}
      <View style={styles.badgeGrid}>
        {filteredBadges.map((badgeProgress) => (
          <TouchableOpacity
            key={badgeProgress.badge.id}
            style={styles.badgeCard}
            onPress={() =>
              badgeProgress.unlocked && handleSetDisplayedBadge(badgeProgress.badge.id)
            }
            disabled={!badgeProgress.unlocked}
          >
            <Surface
              style={[
                styles.badgeSurface,
                !badgeProgress.unlocked && styles.badgeLocked,
              ]}
              elevation={badgeProgress.unlocked ? 2 : 0}
            >
              {/* Tier Badge */}
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: getTierColor(badgeProgress.badge.tier) },
                ]}
              >
                <MaterialCommunityIcons
                  name={getTierIcon(badgeProgress.badge.tier) as any}
                  size={12}
                  color="white"
                />
              </View>

              {/* Badge Icon */}
              <View style={styles.badgeIconContainer}>
                <MaterialCommunityIcons
                  name={badgeProgress.badge.icon_name as any}
                  size={48}
                  color={
                    badgeProgress.unlocked
                      ? getTierColor(badgeProgress.badge.tier)
                      : colors.disabled
                  }
                />
                {!badgeProgress.unlocked && (
                  <View style={styles.lockOverlay}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </View>
                )}
              </View>

              {/* Badge Info */}
              <Text
                variant="labelMedium"
                style={[
                  styles.badgeName,
                  !badgeProgress.unlocked && styles.badgeNameLocked,
                ]}
                numberOfLines={2}
              >
                {badgeProgress.badge.name}
              </Text>

              {/* Points */}
              {badgeProgress.unlocked && (
                <View style={styles.pointsBadge}>
                  <MaterialCommunityIcons name="star" size={12} color={colors.warning} />
                  <Text variant="bodySmall" style={styles.pointsText}>
                    {badgeProgress.badge.points_reward}
                  </Text>
                </View>
              )}

              {/* Progress for locked badges */}
              {!badgeProgress.unlocked && badgeProgress.progress > 0 && (
                <View style={styles.lockedProgress}>
                  <ProgressBar
                    progress={badgeProgress.progress / 100}
                    color={colors.primary}
                    style={styles.lockedProgressBar}
                  />
                  <Text variant="bodySmall" style={styles.lockedProgressText}>
                    {badgeProgress.progress}%
                  </Text>
                </View>
              )}
            </Surface>
          </TouchableOpacity>
        ))}
      </View>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            {t('badges.noBadgesYet')}
          </Text>
          <Text variant="bodySmall" style={styles.emptySubtitle}>
            {t('badges.keepUsing')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsHeader: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  nextBadgeCard: {
    margin: 16,
    backgroundColor: colors.surface,
  },
  nextBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  nextBadgeTitle: {
    fontWeight: 'bold',
  },
  nextBadgeContent: {
    flexDirection: 'row',
    gap: 16,
  },
  nextBadgeIcon: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 32,
  },
  nextBadgeInfo: {
    flex: 1,
  },
  nextBadgeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nextBadgeDescription: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeProgress: {
    flex: 1,
    height: 6,
  },
  progressText: {
    color: colors.textSecondary,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    marginRight: 8,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  badgeCard: {
    width: '33.33%',
    padding: 8,
  },
  badgeSurface: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 140,
  },
  badgeLocked: {
    backgroundColor: colors.surface,
  },
  tierBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconContainer: {
    marginBottom: 8,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  badgeName: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: colors.textSecondary,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pointsText: {
    fontWeight: 'bold',
    color: colors.warning,
  },
  lockedProgress: {
    width: '100%',
    marginTop: 8,
  },
  lockedProgressBar: {
    height: 4,
  },
  lockedProgressText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
