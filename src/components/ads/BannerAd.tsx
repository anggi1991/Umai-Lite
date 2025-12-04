import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd as RNMBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../../services/adService';
import { useSubscription } from '@/hooks/useSubscription';

export const BannerAd: React.FC = () => {
  const { isPremium } = useSubscription();
  const adUnitId = getAdUnitId('BANNER') || TestIds.BANNER;

  // Don't show ads for premium users
  if (isPremium) {
    return null;
  }

  return (
    <View style={styles.container}>
      <RNMBannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
});
