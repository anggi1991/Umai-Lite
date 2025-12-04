# 🚀 Quick Start Guide

Get up and running with the Parenting AI Assistant in 15 minutes.

---

## ⚡ Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- Azure OpenAI account
- RevenueCat account (for monetization)

---

## 📦 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/razqashop91/parentingAI.git
cd parentingAI

# Install dependencies
npm install
```

---

## 🔐 2. Environment Setup

Create `.env` file in the root:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Azure OpenAI
EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT=your_endpoint
EXPO_PUBLIC_AZURE_OPENAI_API_KEY=your_api_key
EXPO_PUBLIC_AZURE_OPENAI_ASSISTANT_ID=your_assistant_id

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your_ios_key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your_android_key

# AdMob (optional)
EXPO_PUBLIC_ADMOB_APP_ID_IOS=ca-app-pub-xxx
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=ca-app-pub-xxx
```

---

## ⚙️ 3. Supabase Setup

### A. Create Tables

Run SQL from `/docs/03-architecture/database-schema.md`

### B. Configure Auth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google OAuth
3. Add redirect URLs:
   - `https://[your-project].supabase.co/auth/v1/callback`
   - `exp://[your-ip]:8081` (for local development)

### C. Setup Storage

1. Create bucket: `child-photos`
2. Set policies for authenticated access

---

## 🚀 4. Run Development Server

```bash
# Start Expo dev server
npx expo start

# Options:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app
```

---

## 🧪 5. Verify Setup

```bash
# Run tests
npm test

# Expected: 127/127 tests passing ✅
```

---

## 🎨 6. First Launch

1. **Register account** with Google or Email
2. **Add a child** (name, date of birth, photo)
3. **Log first activity** (feeding, sleep, diaper)
4. **Try AI chat** - Ask parenting questions
5. **Check growth tracker** - Add weight/height measurements

---

## 📚 Next Steps

### Learn More
- [Architecture Overview](/docs/03-architecture/system-overview.md)
- [Feature Documentation](/docs/04-features/)
- [API Reference](/docs/07-reference/)

### Setup Services
- [Google OAuth Setup](/docs/02-setup/google-oauth.md)
- [Edge Functions Deployment](/docs/02-setup/edge-functions.md)
- [Push Notifications](/docs/02-setup/push-notifications.md)

### Development
- [Testing Guide](/docs/06-testing/manual-testing.md)
- [Troubleshooting](/docs/08-maintenance/troubleshooting.md)
- [Contributing Guidelines](/CONTRIBUTING.md)

---

## 🐛 Common Issues

### Google OAuth not working
```bash
# Check redirect URIs in Supabase dashboard
# Make sure they match your Expo app scheme
```

### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Expo won't start
```bash
# Clear Expo cache
npx expo start -c
```

---

## 💡 Pro Tips

1. **Use TypeScript strictly** - Enable strict mode in `tsconfig.json`
2. **Test frequently** - Run `npm test` after each feature
3. **Check linting** - Run `npm run lint` before committing
4. **Read docs** - Check `/docs/` for detailed guides
5. **Ask for help** - Create GitHub issue if stuck

---

## 📞 Need Help?

- **Documentation:** `/docs/`
- **GitHub Issues:** [Create Issue](https://github.com/razqashop91/parentingAI/issues)
- **Email:** support@parentingai.app

---

**Happy coding! 🎉**
