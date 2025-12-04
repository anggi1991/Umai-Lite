/**
 * RevenueCat Service
 *
 * Handles subscription management via RevenueCat SDK
 * - Product offerings (Monthly, Yearly, Lifetime)
 * - Entitlement checking (razqashop Pro)
 * - Purchase flow
 * - Customer info management
 * - Restore purchases
 *
 * @see https://www.revenuecat.com/docs/getting-started
 */

import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';
import Constants from 'expo-constants';

// RevenueCat Configuration - Read from Expo Config
const REVENUECAT_API_KEY =
  Constants.expoConfig?.extra?.REVENUECAT_API_KEY || 'test_GrJfMWRWqLTeIJSBnfYxbtSXEOw';
const ENTITLEMENT_ID = 'razqashop Pro'; // Pro entitlement identifier

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Product identifiers for different subscription tiers
 */
export enum ProductIdentifier {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
}

/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'premium' | 'family' | 'lifetime';

/**
 * Product information
 */
export interface ProductInfo {
  identifier: ProductIdentifier;
  title: string;
  description: string;
  price: string;
  priceString: string;
  currencyCode: string;
  introPrice?: string;
  package?: PurchasesPackage;
}

/**
 * Customer subscription status
 */
export interface SubscriptionStatus {
  isActive: boolean;
  tier: SubscriptionTier;
  expiresAt?: Date;
  willRenew: boolean;
  productIdentifier?: string;
  originalPurchaseDate?: Date;
  isInTrial: boolean;
  trialEndDate?: Date;
}

/**
 * Check if RevenueCat is initialized
 */
const ensureInitialized = async (): Promise<boolean> => {
  // If already initialized, return true
  if (isInitialized) {
    return true;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    try {
      await initializationPromise;
      return isInitialized;
    } catch (_) {
      console.warn('[RevenueCat] Initialization failed, will retry');
      return false;
    }
  }

  // Not initialized and no initialization in progress
  console.warn('[RevenueCat] SDK not initialized. Call initializeRevenueCat() first.');
  return false;
};

/**
 * Initialize RevenueCat SDK
 * Must be called when app starts (in App.tsx or _layout.tsx)
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
  // If already initialized, skip
  if (isInitialized) {
    console.log('[RevenueCat] Already initialized');
    return;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    console.log('[RevenueCat] Initialization in progress, waiting...');
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      console.log('[RevenueCat] Starting SDK initialization...');

      // Check if platform is supported (iOS or Android only)
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        console.warn('[RevenueCat] Skipping initialization - Platform not supported:', Platform.OS);
        console.warn('[RevenueCat] RevenueCat only works on iOS and Android devices');
        isInitialized = false;
        initializationPromise = null;
        return; // Exit gracefully without throwing error
      }

      // Configure SDK with API key
      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      } else if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      }

      // Set log level for debugging (remove in production)
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Identify user if logged in
      if (userId) {
        await Purchases.logIn(userId);
        console.log('[RevenueCat] User identified:', userId);
      }

      isInitialized = true;
      console.log('[RevenueCat] SDK initialized successfully');
    } catch (error) {
      console.error('[RevenueCat] Initialization error:', error);
      isInitialized = false;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Identify user after authentication
 */
export const identifyUser = async (userId: string): Promise<CustomerInfo> => {
  try {
    const { customerInfo: _customerInfo } = await Purchases.logIn(userId);
    console.log('[RevenueCat] User logged in:', userId);

    // Sync with Supabase
    await syncCustomerInfoToSupabase(_customerInfo, userId);

    return _customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Login error:', error);
    throw error;
  }
};

/**
 * Log out current user (anonymous mode)
 */
export const logoutUser = async (): Promise<CustomerInfo> => {
  try {
    // Check if current user is anonymous before logging out
    const currentInfo = await Purchases.getCustomerInfo();
    const isAnonymous = currentInfo.originalAppUserId.startsWith('$RCAnonymousID');

    if (isAnonymous) {
      console.log('[RevenueCat] User is already anonymous, skipping logout');
      return currentInfo;
    }

    const customerInfo = await Purchases.logOut();
    console.log('[RevenueCat] User logged out');
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Logout error:', error);
    throw error;
  }
};

/**
 * Get available product offerings
 * Returns null if SDK not initialized
 */
export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  try {
    const initialized = await ensureInitialized();
    if (!initialized) {
      console.warn('[RevenueCat] SDK not initialized, cannot fetch offerings');
      return null;
    }

    const offerings = await Purchases.getOfferings();

    if (offerings.current === null) {
      console.warn('[RevenueCat] No offerings available');
      return null;
    }

    console.log('[RevenueCat] Offerings fetched:', {
      current: offerings.current.identifier,
      packages: offerings.current.availablePackages.length,
    });

    return offerings;
  } catch (error) {
    console.error('[RevenueCat] Error fetching offerings:', error);
    return null;
  }
};

/**
 * Get products with formatted information
 */
export const getProducts = async (): Promise<ProductInfo[]> => {
  try {
    const offerings = await getOfferings();
    if (!offerings || !offerings.current) {
      return [];
    }

    const products: ProductInfo[] = offerings.current.availablePackages.map((pkg) => {
      const product = pkg.product;

      return {
        identifier: pkg.identifier as ProductIdentifier,
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        priceString: product.priceString,
        currencyCode: product.currencyCode,
        introPrice: product.introPrice?.priceString,
        package: pkg,
      };
    });

    console.log('[RevenueCat] Products formatted:', products.length);
    return products;
  } catch (error) {
    console.error('[RevenueCat] Error getting products:', error);
    return [];
  }
};

/**
 * Purchase a product package
 */
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage,
): Promise<{ customerInfo: CustomerInfo; success: boolean }> => {
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);

    console.log('[RevenueCat] Purchase successful:', {
      productIdentifier,
      hasProEntitlement: customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined,
    });

    // Sync to Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await syncCustomerInfoToSupabase(customerInfo, user.id);
    }

    return { customerInfo, success: true };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('[RevenueCat] Purchase cancelled by user');
      return { customerInfo: await Purchases.getCustomerInfo(), success: false };
    }

    console.error('[RevenueCat] Purchase error:', error);
    throw error;
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log('[RevenueCat] Purchases restored');

    // Sync to Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await syncCustomerInfoToSupabase(customerInfo, user.id);
    }

    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Restore error:', error);
    throw error;
  }
};

/**
 * Get current customer info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Error fetching customer info:', error);
    throw error;
  }
};

/**
 * Check if user has Pro entitlement
 * Returns false if SDK not initialized (graceful fallback)
 */
export const hasProEntitlement = async (): Promise<boolean> => {
  try {
    // Check if SDK is initialized
    const initialized = await ensureInitialized();
    if (!initialized) {
      console.warn('[RevenueCat] SDK not initialized, returning false for Pro entitlement');
      return false; // Graceful fallback to free tier
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    const hasAccess = entitlement !== undefined;
    console.log('[RevenueCat] Pro entitlement check:', hasAccess);

    return hasAccess;
  } catch (error) {
    console.error('[RevenueCat] Entitlement check error:', error);
    return false; // Fail gracefully - assume free tier
  }
};

/**
 * Get detailed subscription status
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const customerInfo = await getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    if (!entitlement) {
      return {
        isActive: false,
        tier: 'free',
        willRenew: false,
        isInTrial: false,
      };
    }

    // Determine tier from product identifier
    const productId = entitlement.productIdentifier.toLowerCase();
    let tier: SubscriptionTier = 'premium';

    if (productId.includes('family')) {
      tier = 'family';
    } else if (productId.includes('lifetime')) {
      tier = 'lifetime';
    } else if (productId.includes('yearly') || productId.includes('monthly')) {
      tier = 'premium';
    }

    return {
      isActive: true,
      tier,
      expiresAt: entitlement.expirationDate ? new Date(entitlement.expirationDate) : undefined,
      willRenew: entitlement.willRenew,
      productIdentifier: entitlement.productIdentifier,
      originalPurchaseDate: entitlement.originalPurchaseDate
        ? new Date(entitlement.originalPurchaseDate)
        : undefined,
      isInTrial: entitlement.periodType === 'trial',
      trialEndDate:
        entitlement.periodType === 'trial' && entitlement.expirationDate
          ? new Date(entitlement.expirationDate)
          : undefined,
    };
  } catch (error) {
    console.error('[RevenueCat] Error getting subscription status:', error);
    return {
      isActive: false,
      tier: 'free',
      willRenew: false,
      isInTrial: false,
    };
  }
};

/**
 * Sync RevenueCat customer info to Supabase
 * Updates iap_receipts table with latest subscription data
 */
const syncCustomerInfoToSupabase = async (
  customerInfo: CustomerInfo,
  userId: string,
): Promise<void> => {
  try {
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    if (!entitlement) {
      console.log('[RevenueCat] No active entitlement to sync');
      return;
    }

    // Insert or update iap_receipts table
    const { error } = await supabase.from('iap_receipts').upsert(
      {
        user_id: userId,
        product_id: entitlement.productIdentifier,
        transaction_id: entitlement.originalPurchaseDate?.toString() || 'unknown',
        purchase_date: entitlement.originalPurchaseDate || new Date().toISOString(),
        expires_at: entitlement.expirationDate,
        is_active: true,
        platform: Platform.OS,
        receipt_data: JSON.stringify({
          willRenew: entitlement.willRenew,
          periodType: entitlement.periodType,
          store: entitlement.store,
        }),
      },
      {
        onConflict: 'transaction_id',
      },
    );

    if (error) {
      console.error('[RevenueCat] Supabase sync error:', error);
    } else {
      console.log('[RevenueCat] Customer info synced to Supabase');
    }
  } catch (error) {
    console.error('[RevenueCat] Sync error:', error);
  }
};

/**
 * Listen to customer info updates (real-time)
 */
export const addCustomerInfoUpdateListener = (
  callback: (customerInfo: CustomerInfo) => void,
): (() => void) => {
  const _listener = Purchases.addCustomerInfoUpdateListener(callback);
  return () => {
    // Remove listener cleanup
    console.log('[RevenueCat] Customer info listener removed');
  };
};

/**
 * Get promotional offer (if eligible)
 */
export const checkPromotionalOffer = async (): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();

    // Check if user is eligible for introductory pricing
    const hasActiveSubscription = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    const hasPreviousSubscription =
      Object.keys(customerInfo.allPurchasedProductIdentifiers).length > 0;

    // Eligible if no active subscription and no previous purchases
    return !hasActiveSubscription && !hasPreviousSubscription;
  } catch (error) {
    console.error('[RevenueCat] Promotional offer check error:', error);
    return false;
  }
};

/**
 * Attribution tracking (for marketing)
 */
export const setAttributes = async (attributes: Record<string, string | null>): Promise<void> => {
  try {
    await Purchases.setAttributes(attributes);
    console.log('[RevenueCat] Attributes set:', Object.keys(attributes));
  } catch (error) {
    console.error('[RevenueCat] Set attributes error:', error);
  }
};

/**
 * Check if user should see paywall
 * Based on usage limits and subscription status
 */
export const shouldShowPaywall = async (featureName?: string): Promise<boolean> => {
  try {
    const hasAccess = await hasProEntitlement();

    if (hasAccess) {
      return false; // Has Pro, no need for paywall
    }

    // Additional logic for feature-specific paywalls
    if (featureName) {
      // Could check usage limits here
      console.log('[RevenueCat] Checking paywall for feature:', featureName);
    }

    return true; // Show paywall for free users
  } catch (error) {
    console.error('[RevenueCat] Paywall check error:', error);
    return false; // Fail open
  }
};

export default {
  initializeRevenueCat,
  identifyUser,
  logoutUser,
  getOfferings,
  getProducts,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  hasProEntitlement,
  getSubscriptionStatus,
  addCustomerInfoUpdateListener,
  checkPromotionalOffer,
  setAttributes,
  shouldShowPaywall,
};
