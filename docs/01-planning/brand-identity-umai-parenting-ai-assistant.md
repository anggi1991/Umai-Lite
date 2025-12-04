# Umai Parenting AI Assistant — Brand Identity

## Brand Snapshot
- **Mission:** Empower modern parents with empathetic, AI-guided support that blends actionable insights, gentle encouragement, and delightful storytelling.
- **Tagline:** *You + Me + AI — growing together.*
- **Personality:** Warm, nurturing, playful, trustworthy, with calm confidence and gentle humor.
- **Visual Language:** Pastel baby blue (#CDE9F9) and soft pink (#F9DDEB) as core palette, rounded shapes, generous whitespace, and the friendly AI Baby Buddy mascot.
- **Voice & Tone:** Supportive, empathetic, non-judgmental, focuses on celebrating small wins, and redirects medical concerns to licensed professionals.

## BRD (Business Requirements Document)
| Dimension | Details |
| --- | --- |
| **Business Goal** | Provide a premium-yet-accessible parenting companion that increases user retention, drives subscription revenue, and positions Umai as the go-to AI parenting partner in Southeast Asia. |
| **Primary Audience** | Millennial & Gen-Z parents (0–5 year olds), tech-comfortable caregivers, and multilingual families seeking trusted guidance. |
| **Value Proposition** | Real-time AI parenting support, personalized growth insights, and a unified space for tracking baby milestones, all wrapped in a kind, culturally-aware experience. |
| **Brand Pillars** | Empathy, Guidance, Celebration, Safety, Inclusivity. |
| **Success Metrics** | >45% 30-day retention, Net Promoter Score ≥ 40, 10% free → paid conversion, <1% churn on Family tier, and consistent 4.7+ app store rating. |
| **Differentiators** | Multilingual AI coach, holistic tracker (sleep/feeding/mood/growth), rewards & referrals, and localized tips powered by Azure OpenAI & Supabase data. |

## PRD (Product Requirements Document)
| Section | Highlights |
| --- | --- |
| **Problem Statement** | Parents struggle to consolidate baby data, gain trustworthy insights, and receive timely encouragement without overwhelming interfaces. |
| **Objectives** | Deliver an intuitive, bilingual (ID/EN/JP/ZH) app that automates logging, surfaces AI-driven suggestions, and motivates families through rewards. |
| **User Personas** | *Ayu* (first-time mom, Jakarta), *Kenji* (remote-working dad, Tokyo), *Mei* (overseas aunt caregiver, Singapore). |
| **User Journeys** | Onboarding → child profile setup → daily logging → AI chat tips → reminders & rewards → subscription upgrade. |
| **Functional Requirements** | Secure Supabase-auth login, Google/Apple sign-in, activity & growth tracking, AI chat (Azure OpenAI), reminders, media gallery, achievements, and RevenueCat-based subscriptions. |
| **Non-functional Requirements** | P99 latency < 1.5s for primary flows, offline-friendly drafts, complete localization, SOC2-aligned data handling, and accessible UI (WCAG AA). |
| **Risks & Mitigations** | AI hallucinations → human-in-the-loop content guardrails; data privacy → encrypted storage + RLS; retention → gamified milestones & streaks. |

## Key Features
- 👶 Multi-child support (3 on free tier, 5 on Family tier)
- 📝 Activity logging (feeding, sleep, diaper, mood, growth)
- 💬 AI Baby Buddy chat with customizable persona
- 💡 Daily AI-generated parenting tips and checklists
- 🔔 Smart reminders with recurrence and snooze controls
- 📸 Memory lane gallery for milestone photos and notes
- 📈 WHO-based growth charts (weight, height, head circumference)
- 💎 Freemium usage caps with RevenueCat-managed upgrades
- 🎁 Referral program and promo codes for bonus months
- 🏆 Achievement badges that celebrate healthy habits

## Built With
| Layer | Stack |
| --- | --- |
| **Frontend** | React Native (Expo 51), TypeScript, React Native Paper, Expo Router |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions), Row-Level Security |
| **AI Services** | Azure OpenAI (GPT-4 family deployments for chat, insights, emotion analysis) |
| **Monetization** | RevenueCat subscriptions, AdMob banner/interstitial ads |
| **Analytics & Notifications** | Expo Push Notifications, custom analytics service, Supabase audit logs |
| **Tooling** | Jest + React Native Testing Library, ESLint/Prettier, EAS Build, GitHub Actions |

## Development Process
1. **Documentation-First Planning**  
   - Draft BRD/PRD, UX flows, and localization requirements before engineering.  
   - Align on success metrics and release scope using `/docs/01-planning` templates.
2. **Incremental Delivery**  
   - Implement feature slices end-to-end (database → services → UI).  
   - Maintain TypeScript strictness, reusable hooks, and service layer patterns.  
   - Leverage feature flags and Supabase Edge Functions for safe rollouts.
3. **Quality & Testing**  
   - Combine automated unit tests with manual device QA (Android/iOS).  
   - Validate RLS policies, AI prompts, and multilingual copy per release.  
   - Run regression via `/docs/06-testing/test-strategy.md` checklist.
4. **Feedback Loop & Growth**  
   - Track cohort retention, feature adoption, and subscription funnels.  
   - Iterate using user interviews, in-app surveys, and AI chat analytics.  
   - Celebrate shipped milestones with updated docs, changelog entries, and badge unlocks.
