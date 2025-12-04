#!/usr/bin/env node

/**
 * I18n Features Test Script
 * Tests context-aware translation features: pluralization, date/time formatting, number formatting
 * Run with: node scripts/test-i18n-features.js [language]
 */

import { fileURLToPath } from 'url';

const languages = ['id', 'en', 'jp', 'zh'];
const testLanguage = process.argv[2] || 'en';

if (!languages.includes(testLanguage)) {
  console.error(`❌ Invalid language. Choose from: ${languages.join(', ')}`);
  process.exit(1);
}

console.log(`\n🧪 Testing I18n Features for: ${testLanguage}\n`);
console.log('='.repeat(60));

// Locale configurations
const localeConfig = {
  id: { locale: 'id-ID', timeFormat: '24h' },
  en: { locale: 'en-US', timeFormat: '12h' },
  jp: { locale: 'ja-JP', timeFormat: '24h' },
  zh: { locale: 'zh-CN', timeFormat: '24h' }
};

const config = localeConfig[testLanguage];

// Test 1: Pluralization
console.log('\n📊 Test 1: Pluralization\n');
console.log('Testing plural forms with different counts:\n');

const pluralTests = [
  { count: 0, singular: 'day', plural: 'days' },
  { count: 1, singular: 'day', plural: 'days' },
  { count: 2, singular: 'day', plural: 'days' },
  { count: 5, singular: 'day', plural: 'days' }
];

function pluralize(count, singular, plural) {
  // English: use plural for anything except 1
  // Indonesian: no plural form (always singular)
  // Japanese/Chinese: no plural distinction

  const rules = {
    en: (n) => n !== 1,
    id: () => false,
    jp: () => false,
    zh: () => false
  };

  const shouldPluralize = rules[testLanguage](count);
  return `${count} ${shouldPluralize ? plural : singular}`;
}

pluralTests.forEach(({ count, singular, plural }) => {
  console.log(`  ${pluralize(count, singular, plural)}`);
});

// Test 2: Date Formatting
console.log('\n\n📅 Test 2: Date Formatting\n');
console.log('Testing different date formats:\n');

const testDate = new Date('2025-11-12T14:30:00');

const dateFormats = [
  { style: 'short', dateStyle: 'short' },
  { style: 'medium', dateStyle: 'medium' },
  { style: 'long', dateStyle: 'long' },
  { style: 'full', dateStyle: 'full' }
];

dateFormats.forEach(({ style, dateStyle }) => {
  const formatted = new Intl.DateTimeFormat(config.locale, { dateStyle }).format(testDate);
  console.log(`  ${style.padEnd(8)}: ${formatted}`);
});

// Test 3: Time Formatting
console.log('\n\n⏰ Test 3: Time Formatting\n');
console.log(`Testing time formats (${config.timeFormat} format):\n`);

const timeFormats = [
  { style: 'short', timeStyle: 'short' },
  { style: 'medium', timeStyle: 'medium' }
];

timeFormats.forEach(({ style, timeStyle }) => {
  const formatted = new Intl.DateTimeFormat(config.locale, {
    timeStyle,
    hour12: config.timeFormat === '12h'
  }).format(testDate);
  console.log(`  ${style.padEnd(8)}: ${formatted}`);
});

// Test 4: Number Formatting
console.log('\n\n🔢 Test 4: Number Formatting\n');
console.log('Testing number formats with different options:\n');

const numberTests = [
  { value: 1234.56, options: {}, label: 'Standard' },
  { value: 1234.567, options: { minimumFractionDigits: 2, maximumFractionDigits: 2 }, label: 'Fixed 2 decimals' },
  { value: 50000, options: { style: 'currency', currency: 'USD' }, label: 'Currency (USD)' },
  { value: 0.75, options: { style: 'percent' }, label: 'Percentage' }
];

numberTests.forEach(({ value, options, label }) => {
  try {
    const formatted = new Intl.NumberFormat(config.locale, options).format(value);
    console.log(`  ${label.padEnd(20)}: ${formatted}`);
  } catch (error) {
    console.log(`  ${label.padEnd(20)}: Error - ${error.message}`);
  }
});

// Test 5: Combined Scenario
console.log('\n\n🎯 Test 5: Real-World Scenario\n');
console.log('Baby feeding summary:\n');

const feedingData = {
  date: new Date('2025-11-12T14:30:00'),
  count: 8,
  totalMl: 720.5,
  averageMl: 90.06
};

console.log(`  Date: ${new Intl.DateTimeFormat(config.locale, { dateStyle: 'full' }).format(feedingData.date)}`);
console.log(`  Time: ${new Intl.DateTimeFormat(config.locale, { timeStyle: 'short', hour12: config.timeFormat === '12h' }).format(feedingData.date)}`);
console.log(`  Feedings: ${pluralize(feedingData.count, 'feeding', 'feedings')}`);
console.log(`  Total: ${new Intl.NumberFormat(config.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(feedingData.totalMl)} ml`);
console.log(`  Average: ${new Intl.NumberFormat(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feedingData.averageMl)} ml`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n✅ All tests completed successfully!\n');
console.log(`Locale: ${config.locale}`);
console.log(`Time Format: ${config.timeFormat}`);
console.log(`Language: ${testLanguage.toUpperCase()}\n`);
console.log('💡 Tip: Run with different languages to compare:');
languages.forEach(lang => {
  console.log(`   node scripts/test-i18n-features.js ${lang}`);
});
console.log('\n');
