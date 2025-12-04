#!/usr/bin/env node

/**
 * Script untuk mendapatkan Redirect URI yang benar untuk Google OAuth
 * Jalankan: node scripts/get-oauth-redirect-uri.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Getting OAuth Redirect URIs for Parenting AI...\n');

// Read app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
let appConfig;

try {
  const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
  appConfig = JSON.parse(appJsonContent);
} catch (error) {
  console.error('❌ Failed to read app.json:', error.message);
  process.exit(1);
}

const scheme = appConfig.expo.scheme || 'parentingai';
const slug = appConfig.expo.slug || 'parenting-ai';

console.log('📱 App Configuration:');
console.log(`   Scheme: ${scheme}`);
console.log(`   Slug: ${slug}\n`);

console.log('🌐 Redirect URIs to add to Google Cloud Console:\n');

console.log('1️⃣ For Development (Expo Go):');
console.log(`   ${scheme}://`);
console.log('   https://auth.expo.io/@yourusername/${slug}');
console.log('   (Replace "yourusername" with your Expo username)\n');

console.log('2️⃣ For Production (Standalone App):');
console.log(`   ${scheme}://auth-callback`);
console.log(`   ${scheme}://oauth2redirect\n`);

console.log('3️⃣ For Web (Supabase):');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const supabaseUrlMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_URL=(.+)/);
  if (supabaseUrlMatch) {
    const supabaseUrl = supabaseUrlMatch[1].trim();
    console.log(`   ${supabaseUrl}/auth/v1/callback\n`);
  }
}

console.log('4️⃣ For Testing (Current Network):');
try {
  // Try to get network IP
  const networkInterfaces = require('os').networkInterfaces();
  const addresses = [];
  
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(interfaceInfo => {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        addresses.push(interfaceInfo.address);
      }
    });
  });

  addresses.forEach(ip => {
    console.log(`   exp://${ip}:8081`);
    console.log(`   exp://${ip}:19000`);
  });
} catch (error) {
  console.log('   (Could not detect network IPs)');
}

console.log('\n📋 Instructions:');
console.log('1. Go to: https://console.cloud.google.com/');
console.log('2. Navigate to: APIs & Services > Credentials');
console.log('3. Select your OAuth 2.0 Client ID');
console.log('4. Add ALL the redirect URIs listed above');
console.log('5. Click SAVE\n');

console.log('⚠️  Important Notes:');
console.log('• Redirect URIs are case-sensitive');
console.log('• No trailing slashes for most URIs');
console.log('• For Expo Go, you MUST add your Expo username');
console.log('• Changes may take a few minutes to propagate\n');

console.log('🔑 Client IDs from .env:');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const iosMatch = envContent.match(/EXPO_PUBLIC_IOS_CLIENT_ID=(.+)/);
  const androidMatch = envContent.match(/EXPO_PUBLIC_ANDROID_CLIENT_ID=(.+)/);
  const webMatch = envContent.match(/EXPO_PUBLIC_WEB_CLIENT_ID=(.+)/);
  
  if (iosMatch) console.log(`   iOS: ${iosMatch[1].trim()}`);
  if (androidMatch) console.log(`   Android: ${androidMatch[1].trim()}`);
  if (webMatch) console.log(`   Web: ${webMatch[1].trim()}`);
  
  console.log('\n✅ Client IDs are configured');
} else {
  console.log('   ❌ .env file not found');
}

console.log('\n💡 Next Steps:');
console.log('1. Add test users to OAuth consent screen');
console.log('2. Add email: artconcept91@gmail.com as test user');
console.log('3. Configure redirect URIs in Google Console');
console.log('4. Restart Expo: npx expo start --clear');
console.log('5. Try Google Sign-In again\n');

console.log('📚 Full documentation: docs/setup/GOOGLE_OAUTH_SETUP.md\n');
