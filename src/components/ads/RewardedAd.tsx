import { useEffect, useState, useCallback } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../services/adService';

const adUnitId = getAdUnitId('REWARDED') || TestIds.REWARDED;

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

export const useRewardedAd = () => {
  const [loaded, setLoaded] = useState(false);
  const [reward, setReward] = useState<{ type: string; amount: number } | null>(null);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward of ', reward);
        setReward(reward);
      },
    );

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      setReward(null);
      rewarded.load();
    });

    // Start loading the rewarded ad straight away
    rewarded.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, []);

  const showRewarded = useCallback(() => {
    if (loaded) {
      rewarded.show();
    } else {
      console.log('Rewarded ad not loaded yet');
      rewarded.load();
    }
  }, [loaded]);

  return { showRewarded, loaded, reward };
};
