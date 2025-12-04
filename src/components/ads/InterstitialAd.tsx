import { useEffect, useState, useCallback } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../services/adService';
import { useSubscription } from '@/hooks/useSubscription';

const adUnitId = getAdUnitId('INTERSTITIAL') || TestIds.INTERSTITIAL;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

export const useInterstitialAd = () => {
  const { isPremium } = useSubscription();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isPremium) return;

    const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      interstitial.load();
    });

    // Start loading the interstitial straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribe();
      unsubscribeClosed();
    };
  }, [isPremium]);

  const showInterstitial = useCallback(() => {
    if (isPremium) return;

    if (loaded) {
      interstitial.show();
    } else {
      console.log('Interstitial ad not loaded yet');
      // Try to load again if not loaded
      interstitial.load();
    }
  }, [loaded, isPremium]);

  return { showInterstitial, loaded };
};
