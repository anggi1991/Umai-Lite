# 👶 Umai Lite - Simplified Parenting Assistant

<div align="center">

![Umai Lite Logo](./assets/logo.png)

**A Lightweight, Open-Source Parenting Companion**

Perfect for parents who want activity tracking and insights without the complexity of AI features.

[![GitHub Stars](https://img.shields.io/github/stars/anggi1991/umai-lite?style=flat-square&logo=github)](https://github.com/anggi1991/umai-lite)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Made with React Native](https://img.shields.io/badge/Made%20with-React%20Native-61DAFB?logo=react&style=flat-square)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)

[✨ Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Getting Started](#-getting-started) • [🔄 Comparison](#-vs-umai-full)

</div>

---

## 📖 About

**Umai Lite** is the simplified, open-source version of Umai—a parenting companion designed for parents who want core functionality without the complexity of AI features or cloud sync.

Perfect for learning React Native, customizing parenting tools, or starting with a lightweight foundation that you can extend with your own features.

### Why Umai Lite?

- 🎯 **Simple & Lightweight** - Core features only, minimal dependencies
- 📱 **Beginner-Friendly** - Great for learning React Native fundamentals
- 🧩 **Easy to Extend** - Perfect base for adding custom features
- 🎨 **Beautiful UI** - Material Design 3 with modern components
- 📊 **Local Data** - All data stored locally on device
- 🔓 **Open Source** - MIT licensed, community-driven

---

## ✨ Features

### Core Features (Included)
- ✅ **Child Profile Management** - Create and manage children's profiles
- ✅ **Activity Tracking** - Log daily activities (feeding, sleep, play, etc.)
- ✅ **Activity History** - Browse past activities chronologically
- ✅ **Simple Analytics** - View activity trends and patterns
- ✅ **Reminders** - Set reminders for important tasks
- ✅ **Media Gallery** - Store photos of your children (local storage)
- ✅ **Dark Mode** - Eye-friendly theme support
- ✅ **Internationalization** - Multi-language support

### Premium Features (NOT Included - Full Version Only)
- ❌ AI-powered parenting tips
- ❌ AI chat assistant
- ❌ Advanced analytics
- ❌ Badges & achievements
- ❌ Monetization/In-app purchases
- ❌ Cloud backup
- ❌ Referral program

### Why These Limitations?

Umai Lite removes features that require:
- **Cloud backend** (Supabase, database sync)
- **AI integration** (Azure OpenAI APIs, expensive operations)
- **Monetization** (RevenueCat, subscription management)
- **Complex services** (email, notifications, analytics)

This makes Umai Lite **simple to setup, deploy, and customize**.

---

## 🛠️ Tech Stack

### Frontend (Minimal Stack)
```
React Native 0.76.0
├── Expo SDK 54
├── TypeScript 5.3+
├── Expo Router 6 (File-based routing)
├── React Navigation 6
├── React Native Paper 5 (Material Design 3)
└── Async Storage (Local persistence)
```

### No External Services Required
- ✅ No database needed
- ✅ No authentication services
- ✅ No AI/LLM services
- ✅ No payment processing
- ✅ No cloud sync

### Developer Tools
```
ESLint + Prettier
├── Code formatting
├── Type checking (TypeScript)
└── Development utilities
```

---

## 🏗️ Project Structure

```
umai-lite/
├── app/                          # Expo Router navigation
│   ├── (tabs)/                  # Main tab navigation
│   │   ├── dashboard.tsx        # Home/Dashboard
│   │   ├── activities/          # Activity tracking
│   │   ├── profile/             # Child profiles
│   │   ├── analytics.tsx        # Analytics
│   │   └── settings.tsx         # Settings
│   └── _layout.tsx              # Root layout
├── src/
│   ├── components/              # Reusable UI components
│   ├── services/                # Business logic (no backends!)
│   ├── utils/                   # Helper functions
│   ├── types/                   # TypeScript definitions
│   ├── i18n/                    # Internationalization
│   └── constants/               # App constants
├── docs/                        # Documentation
├── app.json                     # Expo configuration
├── tsconfig.json               # TypeScript config
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Expo CLI** - [Install here](https://docs.expo.dev/get-started/installation/)

### Installation (Super Simple!)

```bash
# 1. Clone the repository
git clone https://github.com/anggi1991/umai-lite.git
cd umai-lite

# 2. Install dependencies
npm install

# 3. NO environment setup needed! Start the app
npx expo start

# 4. Scan the QR code with your phone
# - iOS: Open Camera app and scan
# - Android: Open Expo Go app and scan
```

**That's it!** No API keys, no database setup, no credentials needed.

### Running on Emulator

```bash
# Android Emulator
npx expo start
# Press 'a' in the terminal

# iOS Simulator (macOS only)
npx expo start
# Press 'i' in the terminal
```

---

## 📚 Simplified Architecture

Unlike the full version, Umai Lite uses only local storage:

```
User
  ↓
Expo Router (Navigation)
  ↓
React Components (UI)
  ↓
Services (Business Logic)
  ↓
AsyncStorage (Local Data)
  ↓
Device Storage
```

**No cloud servers, no external APIs, no subscriptions needed!**

---

## 🔄 Vs Umai Full

| Feature | Umai Lite | Umai Full |
|---------|-----------|-----------|
| Activity Tracking | ✅ | ✅ |
| Child Profiles | ✅ | ✅ |
| Analytics | ✅ Basic | ✅ Advanced |
| Reminders | ✅ | ✅ |
| Media Gallery | ✅ Local | ✅ Cloud |
| **AI Tips** | ❌ | ✅ |
| **AI Chat** | ❌ | ✅ |
| **Cloud Sync** | ❌ | ✅ |
| **Badges** | ❌ | ✅ |
| **In-App Purchase** | ❌ | ✅ |
| **Backend Setup** | ❌ | ✅ Required |
| **API Keys** | ❌ | ✅ Required |
| **Complexity** | 🟢 Low | 🟠 Medium-High |
| **Setup Time** | 5 min | 30-60 min |

---

## 🎓 Perfect for Learning

Umai Lite is ideal for:

- **Learning React Native** - Clean, modern code structure
- **Teaching Mobile Dev** - Perfect for courses or tutorials
- **Portfolio Projects** - Simple enough to understand, complex enough to impress
- **Customization** - Easy to modify and extend
- **Offline Apps** - No internet connection needed

### Study the Code

1. **Navigation** - `app/_layout.tsx` and `app/(tabs)/` directory
2. **State Management** - Check `src/contexts/` folder
3. **Storage** - See `src/services/` for AsyncStorage patterns
4. **UI Components** - Browse `src/components/` directory
5. **Internationalization** - Explore `src/i18n/` setup

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Format code
npm run format

# Check TypeScript
npm run type-check
```

---

## 📱 Building for Production

### Android (APK)

```bash
# Install EAS CLI
npm install -g eas-cli

# Build APK
eas build --platform android --profile preview
```

### iOS

```bash
# Build IPA
eas build --platform ios --profile preview
```

---

## 🤝 Contributing

We welcome contributions! This is a great project to start contributing to open source.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Submit a Pull Request**

### Contribution Ideas

- 🎨 New activity categories
- 📊 Enhanced analytics visualizations
- 🌍 Additional language translations
- 🧪 Test coverage improvements
- 📱 New screen designs
- ♿ Accessibility improvements

---

## 🐛 Bug Reports & Feature Requests

Found an issue? [Open an issue](https://github.com/anggi1991/umai-lite/issues) on GitHub!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Child profiles
- ✅ Activity tracking
- ✅ Simple analytics
- ✅ Reminders
- ✅ Media gallery
- ✅ Dark mode
- ✅ Multi-language

### Version 1.1 (Planned)
- [ ] Export data to CSV
- [ ] Photo filtering/search
- [ ] Custom activity colors
- [ ] Activity categories customization

### Want to Go Bigger?

If you want AI features, cloud sync, and monetization, check out **Umai Full Edition** at https://github.com/anggi1991/umai-parenting

---

## 👨‍💻 Author

**Anggi Andriyana**

- 🌐 **Portfolio**: [https://anggiandriyana.com](https://anggiandriyana.com)
- 💼 **LinkedIn**: [Anggi Andriyana](https://linkedin.com/in/anggi-andriyana-073a11aa)
- 🐙 **GitHub**: [@anggi1991](https://github.com/anggi1991)
- 📧 **Email**: anggiandriyana@razqashop.com

---

## 🎉 Show Your Support

- ⭐ **Star the repo** - Show your support
- 📢 **Share it** - Tell friends and colleagues
- 🤝 **Contribute** - Help improve it
- 💬 **Feedback** - Let me know what you think

---

<div align="center">

### Made with ❤️ for parents and developers worldwide

**[⬆ Back to Top](#-umai-lite---simplified-parenting-assistant)**

</div>
