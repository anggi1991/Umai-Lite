/**
 * Dashboard Helper Functions
 * Extracted from Dashboard screen for better code organization
 */

import { i18n } from '../i18n';

/**
 * Get time-based greeting key for i18n
 */
export function getGreetingKey():
  | 'greeting.morning'
  | 'greeting.afternoon'
  | 'greeting.evening'
  | 'greeting.night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'greeting.morning';
  if (hour < 18) return 'greeting.afternoon';
  return 'greeting.night';
}

/**
 * Get fallback tips when AI generation fails
 */
export function getFallbackTip(): string {
  const fallbackTipKeys = [
    'tips.fallback1',
    'tips.fallback2',
    'tips.fallback3',
    'tips.fallback4',
    'tips.fallback5',
  ];

  const randomKey = fallbackTipKeys[Math.floor(Math.random() * fallbackTipKeys.length)];
  return i18n.t(randomKey);
}

/**
 * Get activity type icon (mascot PNG)
 */
export function getActivityIcon(type: string) {
  const iconMap: Record<string, any> = {
    feeding: require('../assets/mascot/feeding.png'),
    sleep: require('../assets/mascot/Sleep.png'),
    diaper: require('../assets/mascot/diaper.png'),
    mood: require('../assets/mascot/Mood.png'),
    growth: require('../assets/mascot/growth.png'),
  };
  return iconMap[type] || iconMap.mood;
}

/**
 * Get activity type emoji (deprecated - use getActivityIcon instead)
 */
export function getActivityEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    feeding: '🍼',
    sleep: '😴',
    diaper: '🧷',
    mood: '😊',
    growth: '📏',
  };
  return emojiMap[type] || '📝';
}

/**
 * Get activity type label (i18n)
 */
export function getActivityLabel(type: string): string {
  const labelKeyMap: Record<string, string> = {
    feeding: 'activities.feeding',
    sleep: 'activities.sleep',
    diaper: 'activities.diaper',
    mood: 'activities.mood',
    growth: 'activities.growth',
  };
  return i18n.t(labelKeyMap[type] || type);
}
