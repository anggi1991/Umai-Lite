# Parenting AI Assistant — BRD, PRD & Use Flow (React Native + Supabase)

Dokumen ini berisi Business Requirements Document (BRD), Product Requirements Document (PRD), dan Use Flow terperinci untuk aplikasi mobile "Parenting AI Assistant". Ditulis agar tim pengembang (React Native + TypeScript + Expo + Supabase + Azure OpenAI) dapat memahami dan mengimplementasikan MVP dan roadmap awal.

---

## Daftar Isi

1. Ringkasan Eksekutif
2. Tujuan & KPI
3. Ruang Lingkup MVP
4. Persona
5. PRD (User Stories & Acceptance Criteria)
6. Use Flow
7. Arsitektur Teknis & Data Model
8. API & Edge Functions
9. Non-functional Requirements
10. Security & Privacy
11. Testing & Release Plan
12. Developer Checklist
13. Contoh Prompt Azure OpenAI

---

## 1. Ringkasan Eksekutif

Parenting AI Assistant adalah aplikasi mobile untuk membantu orang tua bayi dan balita mengelola jadwal, memantau tumbuh-kembang, mendapatkan tips personal berbasis AI, dan berkomunikasi lewat chatbot empatik. Target awal: orang tua usia 25–40 tahun di area perkotaan. Fokus MVP: pencatatan aktivitas, reminder imunisasi, AI tips harian, dan chatbot Q&A.

## 2. Tujuan Produk & KPI

Tujuan utama:
- Memudahkan pengelolaan kesehatan dan perkembangan anak
- Memberikan insight personal berdasar data aktivitas
- Pengalaman yang empatik, aman, dan mudah

KPI utama:
- DAU / MAU
- Rata-rata waktu penggunaan per hari
- Conversion rate ke premium
- Retention 30 hari
- Jumlah interaksi chatbot per pengguna

## 3. Ruang Lingkup MVP

Fitur inti MVP:

1. Onboarding & Auth (Email/Google/Apple via Supabase)
2. Dashboard ringkasan aktivitas
3. Pencatatan aktivitas: feeding, sleep, diaper, mood, growth
4. Smart Reminder (imunisasi, makan, checkup)
5. AI Parenting Tips (Azure OpenAI)
6. Chatbot Q&A (Azure OpenAI)
7. Multi-child support (maks 3 anak)
8. Media gallery (foto pertumbuhan)
9. Analytics dasar (Supabase logs)

Fitur pasca-MVP (prioritas rendah): integrasi wearable, model ML pertumbuhan, AR edukatif, telekonsultasi.

## 4. Personas (Contoh)

- Ibu Rika (29): butuh reminder imunisasi dan tips MPASI
- Bapak Andi (33): ingin laporan tidur & catatan untuk pengasuh
- Nina (Pengasuh): butuh UI cepat untuk input aktivitas

---

## 5. Product Requirements Document (PRD)

### 5.1 User Stories (ringkas)

- Onboarding & Auth: daftar/login via Email/Google/Apple
- Dashboard: lihat ringkasan aktivitas harian dan reminder
- Pencatatan: pengasuh dapat menambah catatan aktivitas cepat
- Reminders: terima notifikasi imunisasi & jadwal
- AI Tips & Chat: bertanya tentang parenting & dapatkan jawaban relevan
- Multi-child: tambah lebih dari satu anak

### 5.2 Fitur & Acceptance Criteria (MVP)

A. Authentication
- Login/signup via Supabase Auth (Email/Google/Apple)
- Token disimpan aman dengan Expo SecureStore

B. Dashboard
- Menampilkan kartu aktivitas hari ini, reminder mendesak, dan AI Tip singkat
- Terdapat tombol Quick Add (feeding, sleep, diaper)

C. Activity Tracking
- Input: feeding, sleep, diaper, mood, growth (weight/height)
- Data disimpan di tabel Supabase `activities`
- API: user hanya dapat mengakses aktivitas milik sendiri (RLS)

D. Smart Reminder
- Reminder default berdasarkan usia anak (imunisasi dasar)
- Push notification via Expo Notifications
- User dapat snooze / edit / disable reminder

E. AI Parenting Tips
- Generated via Azure OpenAI (mis. GPT-4o-mini)
- Kontekstual berdasarkan usia anak + data aktivitas terbaru
- Disimpan di tabel `daily_tips` untuk riwayat
- Batas rate & caching untuk mengurangi biaya

F. Chatbot Parenting Q&A
- Chat realtime memanggil Azure OpenAI Chat API melalui Edge Function
- Safety layer: blok pertanyaan yang meminta diagnosis medis kritis; arahkan ke tenaga kesehatan
- Riwayat chat disimpan di `chat_sessions` dan `messages`

G. Multi-child Profile
- Form: name, dob, gender, initial weight/height, photo
- Default maksimum 3 anak / akun (MVP)

---

## 6. Use Flow

1. Launch & Onboarding
- Splash → Welcome → Signup (Email/Google/Apple)
- Isi profil anak pertama → Redirect ke Dashboard

2. Dashboard
- Kartu ringkasan: aktivitas hari ini, upcoming reminders, AI Tip
- Quick Add: buka modal, pilih tipe, submit → tersimpan ke Supabase

3. Reminder Flow
- Supabase Edge Function membuat jadwal reminder berdasarkan usia & jadwal imunisasi
- Edge Function memanggil Expo Push API untuk mengirim notifikasi

4. AI Tips & Chat
- Endpoint `POST /api/generate-tip` memanggil Azure OpenAI dengan konteks anak
- Endpoint `POST /api/chat` memproksikan permintaan chat
- Responses disimpan untuk analytics dan riwayat

---

## 7. Arsitektur Teknis (High-Level)

React Native (Expo, TypeScript)
├─ UI: React Native Paper
├─ Auth, DB, Storage: Supabase
├─ Edge Functions: Supabase Functions (Node/TS)
├─ Push: Expo Notifications
└─ LLM: Azure OpenAI (Chat & Prompt)

Contoh diagram (ASCII):

```
Mobile App (Expo)
	↕ Auth
	↕ Rest/Realtime
Supabase (Auth, Postgres, Storage, Edge Functions)
	↕ Calls
Edge Functions -> Azure OpenAI
	↕ Responses
Expo Push Service -> Mobile
```

### Data Model Ringkas (tabel Supabase)
- users
- children
- activities
- reminders
- chat_sessions
- messages
- daily_tips

Kolom kunci: setiap tabel memiliki `user_id` + `child_id` (ketika relevan) dan timestamp; gunakan RLS untuk isolasi data.

## 8. API & Edge Functions (Contoh cepat)

- POST /api/generate-tip
	- Input: user_id, child_id, context (optional)
	- Action: Edge Function menyusun prompt, panggil Azure OpenAI, simpan di `daily_tips`

- POST /api/chat
	- Input: session_id, message, user_context
	- Action: forward ke Azure OpenAI, apply safety filter, simpan messages

- POST /api/schedule-reminder
	- Input: user_id, child_id, reminder_type, datetime
	- Action: simpan di `reminders`, jadwalkan push via CRON/Edge Function

---

## 9. Non-functional Requirements

- Performance: chatbot respons <2s (target on cold-start caching)
- Scalability: gunakan Supabase RLS dan pagination di queries
- Localization: Bahasa Indonesia default; support i18n
- Accessibility: font scalable, kontras WCAG minimal

## 10. Security & Privacy

- Gunakan Supabase Row-Level Security (set policy so user can only access own rows)
- All network traffic over HTTPS/TLS
- Store secrets in Supabase Secrets / environment vars (Edge Functions) and Azure Key Vault if tersedia
- Do not store sensitive medical diagnosis; apply disclaimers and safety prompts

## 11. Testing & QA

- Unit tests: Edge Functions, auth flows
- Integration tests: auth → DB → push notification flow
- E2E: Detox untuk mobile flows (onboarding, quick add, chat)
- Load test: API endpoints that call OpenAI

## 12. Release Plan

1. Sprint 1: Init project, Supabase setup, Auth, basic UI
2. Sprint 2: Activity tracker & Dashboard
3. Sprint 3: Reminders & Push Notifications
4. Sprint 4: AI Tips & Chatbot integration
5. Sprint 5: QA, beta testing, App Store / Play Store submission

## 13. Developer Checklist

- [ ] Setup Supabase project & RLS policies
- [ ] Configure Supabase Auth providers (Email/Google/Apple)
- [ ] Connect Azure OpenAI keys to Edge Functions
- [ ] Integrate Expo Notifications + configure push credentials
- [ ] Implement core UI with React Native Paper
- [ ] Setup CI/CD (EAS Build) and secrets management

---

## 14. Contoh Prompt Azure OpenAI (Template)

System: You are an empathetic Indonesian parenting assistant. Be concise, non-judgmental, and avoid giving medical diagnoses.

User: Bayi saya umur 8 bulan sering bangun malam dan rewel. Apa yang bisa saya lakukan?

Task: Berikan 3 tips praktis, alasan singkat tiap tip, sarankan kapan perlu konsultasi ke tenaga kesehatan, dan akhiri dengan saran mencari informasi lebih lanjut melalui link resmi (jika diperlukan).

---

Dokumen ini bersifat living document — perbarui saat ada keputusan arsitektural atau perubahan scope.

---

## 15. Skema Database Lengkap (Supabase / PostgreSQL)

Catatan: gunakan UUID untuk primary key dan `jsonb` untuk metadata fleksibel. RLS (Row Level Security) wajib diaktifkan dan kebijakan disesuaikan agar pengguna hanya mengakses data mereka sendiri.

Contoh definisi tabel (Postgres SQL):

```sql
-- extension untuk uuid (jalankan sekali)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profil pengguna (linked ke Supabase Auth)
CREATE TABLE profiles (
	id uuid PRIMARY KEY, -- gunakan auth.users.id dari Supabase
	full_name text,
	email text,
	avatar_url text,
	locale text DEFAULT 'id',
	created_at timestamptz DEFAULT now()
);

-- Anak / child
CREATE TABLE children (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	name text NOT NULL,
	dob date NOT NULL,
	gender text,
	photo_url text,
	initial_weight_kg numeric,
	initial_height_cm numeric,
	created_at timestamptz DEFAULT now(),
	updated_at timestamptz DEFAULT now()
);

-- Aktivitas harian (feeding, sleep, diaper, mood, growth)
CREATE TABLE activities (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	child_id uuid REFERENCES children(id) ON DELETE CASCADE,
	type text NOT NULL,
	start_time timestamptz,
	end_time timestamptz,
	duration_seconds int,
	value text, -- optional (mis. amount for feeding)
	metadata jsonb,
	created_at timestamptz DEFAULT now()
);

-- Reminder / jadwal (imunisasi, feeding, checkup)
CREATE TABLE reminders (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	child_id uuid REFERENCES children(id) ON DELETE CASCADE,
	type text NOT NULL,
	next_at timestamptz NOT NULL,
	recurrence jsonb, -- ex: {"rrule": "FREQ=DAILY;INTERVAL=1"}
	timezone text,
	enabled boolean DEFAULT true,
	metadata jsonb,
	created_at timestamptz DEFAULT now()
);

-- Daily AI tips
CREATE TABLE daily_tips (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	child_id uuid REFERENCES children(id),
	tip_text text NOT NULL,
	model text,
	prompt jsonb,
	cost_info jsonb,
	generated_at timestamptz DEFAULT now()
);

-- Chat sessions dan messages
CREATE TABLE chat_sessions (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	child_id uuid REFERENCES children(id),
	title text,
	created_at timestamptz DEFAULT now(),
	updated_at timestamptz DEFAULT now()
);

CREATE TABLE messages (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
	sender text NOT NULL, -- 'user' | 'assistant' | 'system'
	role text,
	content text NOT NULL,
	tokens int,
	model text,
	metadata jsonb,
	created_at timestamptz DEFAULT now()
);

-- Media (foto pertumbuhan)
CREATE TABLE media (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	child_id uuid REFERENCES children(id),
	url text NOT NULL,
	type text,
	caption text,
	uploaded_at timestamptz DEFAULT now()
);

-- Subscriptions / billing
CREATE TABLE subscriptions (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	tier text,
	status text,
	started_at timestamptz,
	expires_at timestamptz,
	metadata jsonb,
	created_at timestamptz DEFAULT now()
);

-- Notification logs
CREATE TABLE notification_logs (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid REFERENCES profiles(id),
	child_id uuid REFERENCES children(id),
	reminder_id uuid REFERENCES reminders(id),
	provider text,
	provider_response jsonb,
	status text,
	sent_at timestamptz DEFAULT now()
);

-- Audit / analytics
CREATE TABLE audit_logs (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid,
	action text,
	table_name text,
	record_id uuid,
	details jsonb,
	created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX ON activities(user_id);
CREATE INDEX ON activities(child_id);
CREATE INDEX ON reminders(user_id);
CREATE INDEX ON chat_sessions(user_id);
CREATE INDEX ON messages(session_id);
```

RLS contoh (aktifkan RLS lalu tambahkan policy):

```sql
-- contoh mengaktifkan RLS pada activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_manage_own_activities"
	ON activities USING (user_id = auth.uid());

-- policy serupa dibuat untuk children, reminders, daily_tips, chat_sessions, media
```

---

## 16. Struktur Folder Optimal (React Native + TypeScript + Expo + Supabase)

Struktur di bawah dirancang agar scalable, modular, dan mudah diuji.

```
/ (project root)
├─ app.json / app.config.ts
├─ eas.json
├─ package.json
├─ tsconfig.json
├─ .eslintrc.js
├─ .prettierrc
├─ /src
│  ├─ /assets                # gambar, ikon, font
│  ├─ /components            # UI components (atomic)
│  │   ├─ /common
│  │   └─ /visual
│  ├─ /screens               # screen-level components
│   │   ├─ Onboarding
│   │   ├─ Auth
│   │   ├─ Dashboard
│   │   ├─ ChildProfile
│   │   └─ Chat
│  ├─ /navigation           # React Navigation stacks & routes
│  ├─ /services             # API clients & integrasi (supabase, azure, expo)
│  │   ├─ supabaseClient.ts
│  │   ├─ openaiClient.ts
│  │   └─ notifications.ts
│  ├─ /hooks                # custom hooks (useAuth, useRealtime)
│  ├─ /contexts             # React Contexts (AuthContext, ThemeContext)
│  ├─ /stores               # optional: Zustand / Redux store
│  ├─ /utils                # helper functions, formatters
│  ├─ /types                # TypeScript type definitions / interfaces
│  ├─ /constants            # app-wide constants
│  ├─ /i18n                 # localization
│  ├─ /styles               # theme, common styles
│  └─ /screens              # (see above)
│
├─ /supabase                # infra & migrations (sql)
│  ├─ migrations
│  └─ functions              # Edge Functions (ts) untuk /api/*
│      ├─ generate-tip.ts
│      ├─ chat.ts
│      └─ schedule-reminder.ts

├─ /cloud                   # optional: cloud infra (Terraform / scripts)
├─ /tests
│  ├─ /unit
│  └─ /e2e (Detox)
├─ /docs
└─ /scripts
```

Rekomendasi file penting:
- `src/services/supabaseClient.ts` — inisialisasi Supabase client + helper auth
- `src/services/openaiClient.ts` — panggilan ke Azure OpenAI dengan retry dan rate limit
- `src/services/notifications.ts` — wrapper Expo Push + server side scheduling
- `supabase/functions/generate-tip.ts` — Edge Function untuk membuat tip harian
- `supabase/functions/chat.ts` — Edge Function yang meneruskan pesan ke OpenAI dan menerapkan safety filter

---