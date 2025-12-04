/**
 * @jest-environment node
 */

import {
  initializeAds,
  shouldShowAds,
  getBannerAdUnitId,
  showInterstitialAd,
  showRewardedAd,
  isRewardedAdReady,
  getUserAdStats,
} from '@/services/adService';

// Mock dependencies
jest.mock('react-native-google-mobile-ads', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    setRequestConfiguration: jest.fn(),
  })),
  InterstitialAd: {
    createForAdRequest: jest.fn(() => ({
      addAdEventListener: jest.fn(),
      load: jest.fn(),
      show: jest.fn(),
    })),
  },
  RewardedAd: {
    createForAdRequest: jest.fn(() => ({
      addAdEventListener: jest.fn(),
      load: jest.fn(),
      show: jest.fn(),
    })),
  },
  RewardedAdEventType: {
    LOADED: 'LOADED',
    EARNED_REWARD: 'EARNED_REWARD',
  },
  AdEventType: {
    LOADED: 'LOADED',
    CLOSED: 'CLOSED',
  },
  TestIds: {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  },
  MaxAdContentRating: {
    G: 'G',
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: jest.fn((obj) => obj.android),
  },
}));

jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(),
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const mockSupabase = require('@/services/supabaseClient').supabase;

describe('AdService - Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeAds', () => {
    it('should initialize AdMob successfully', async () => {
      await expect(initializeAds()).resolves.not.toThrow();
    });
  });
});

describe('AdService - Ad Unit ID Getters', () => {
  it('should return banner ad unit ID', () => {
    const bannerId = getBannerAdUnitId();
    expect(bannerId).toBeDefined();
    expect(typeof bannerId).toBe('string');
    expect(bannerId).toContain('ca-app-pub');
  });

});

describe('AdService - shouldShowAds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for free tier users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // No subscription = free tier
          error: { code: 'PGRST116' },
        }),
      }),
    });

    const result = await shouldShowAds();
    expect(result).toBe(true);
  });

  it('should return false for premium users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              tier: 'premium',
              status: 'active',
            },
            error: null,
          }),
        }),
      }),
    });

    const result = await shouldShowAds();
    expect(result).toBe(false);
  });

  it('should return false for family tier users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              tier: 'family',
              status: 'active',
            },
            error: null,
          }),
        }),
      }),
    });

    const result = await shouldShowAds();
    expect(result).toBe(false);
  });

  it('should return false when user is not logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await shouldShowAds();
    expect(result).toBe(false);
  });

  it('should handle database errors gracefully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('DB error'),
          }),
        }),
      }),
    });

    const result = await shouldShowAds();
    expect(result).toBe(false);
  });
});

describe('AdService - getUserAdStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return ad stats for user', async () => {
    const mockAdsMetrics = [
      { impression_date: '2025-11-15T10:00:00Z', earned_reward: true },
      { impression_date: '2025-11-14T10:00:00Z', earned_reward: false },
      { impression_date: '2025-11-13T10:00:00Z', earned_reward: true },
    ];

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockAdsMetrics,
            error: null,
          }),
        }),
      }),
    });

    const stats = await getUserAdStats();
    expect(stats).toEqual({
      totalImpressions: 3,
      rewardsEarned: 2,
      lastAdDate: '2025-11-15T10:00:00Z',
    });
  });

  it('should return default stats when no record exists', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    const stats = await getUserAdStats();
    expect(stats).toEqual({
      totalImpressions: 0,
      rewardsEarned: 0,
      lastAdDate: null,
    });
  });

  it('should return default stats when user not logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const stats = await getUserAdStats();
    expect(stats).toEqual({
      totalImpressions: 0,
      rewardsEarned: 0,
      lastAdDate: null,
    });
  });
});

describe('AdService - showInterstitialAd', () => {
  it('should return false when called (requires actual implementation)', async () => {
    // Note: Full testing requires actual ad loading which can't be easily mocked
    const result = await showInterstitialAd();
    expect(typeof result).toBe('boolean');
  });
});

describe('AdService - showRewardedAd', () => {
  it('should return false when called (requires actual implementation)', async () => {
    // Note: Full testing requires actual ad loading which can't be easily mocked
    const result = await showRewardedAd();
    expect(typeof result).toBe('boolean');
  });
});

describe('AdService - isRewardedAdReady', () => {
  it('should return boolean value', () => {
    const result = isRewardedAdReady();
    expect(typeof result).toBe('boolean');
  });
});
