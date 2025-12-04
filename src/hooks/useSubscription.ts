import { useEffect, useState } from 'react';
import { getSubscriptionStatus } from '../services/revenueCatService';

export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const status = await getSubscriptionStatus();
      setIsPremium(status.tier !== 'free');
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  return { isPremium, loading, checkSubscription };
};
