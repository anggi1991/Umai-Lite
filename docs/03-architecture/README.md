# 🏗️ 03 - Architecture

**Status:** 📐 System Design Documentation

Technical architecture and system design documentation for the Parenting AI Assistant.

---

## 📁 Contents

- `system-overview.md` - High-level system architecture
- `data-flow.md` - Data flow and integration patterns
- `database-schema.md` - Supabase database schema
- `integration-points.md` - External service integrations

---

## 🎯 Tech Stack

### Frontend
- React Native (Expo + TypeScript)
- Expo Router for navigation
- React Native Paper for UI components

### Backend
- Supabase (Auth, Database, Storage, Edge Functions)
- Azure OpenAI for AI processing
- RevenueCat for subscriptions
- AdMob for advertising

---

## 📖 Key Concepts

- **Multi-tenancy:** Each family has isolated data
- **Auto-assignment:** Automatic child_id assignment for activities
- **Real-time sync:** Supabase real-time subscriptions
- **AI Processing:** Azure OpenAI Assistants API

---

**Last Updated:** November 16, 2025
