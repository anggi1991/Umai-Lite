import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Test Ad Unit IDs
const AD_UNIT_IDS = {
  BANNER: Platform.select({
    ios: 'ca-app-pub-5557591662770322/6724722843',
    android: 'ca-app-pub-5557591662770322/6724722843',
  }),
  INTERSTITIAL: Platform.select({
    ios: 'ca-app-pub-5557591662770322/5411641175',
    android: 'ca-app-pub-5557591662770322/5411641175',
  }),
  REWARDED: Platform.select({
    ios: 'ca-app-pub-5557591662770322/8384562520',
    android: 'ca-app-pub-5557591662770322/8384562520',
  }),
};

export const initializeAds = async () => {
  try {
    await mobileAds().initialize();

    // Set configuration for child-directed content if applicable
    await mobileAds().setRequestConfiguration({
      // Update this based on your app's target audience
      tagForChildDirectedTreatment: true,
      maxAdContentRating: MaxAdContentRating.G,
    });

    console.log('AdMob initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AdMob:', error);
  }
};

export const getAdUnitId = (type: 'BANNER' | 'INTERSTITIAL' | 'REWARDED') => {
  return AD_UNIT_IDS[type] || '';
};
