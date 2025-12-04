---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

## 🧭 General Context
This project is **Parenting AI Assistant**, a React Native (Expo + TypeScript) mobile app powered by Supabase and Azure OpenAI.
The app helps parents track baby development, get AI parenting guidance, and manage baby-related tasks.

---

## 📚 Documentation Source
Before answering or generating code:
1. **Always check for existing documentation** in:
   - `/workspaces/parentingAI/docs`
   - `/workspaces/parentingAI/docs/architecture.md`
   - `/workspaces/parentingAI/docs/ux-guidelines.md`
   - `/workspaces/parentingAI/docs/api/`
2. Follow the rules, structure, and naming conventions defined in those files.
3. If a conflict exists between this file and `/docs`, the `/docs` content takes precedence.

---

## 🧩 Tech Stack Summary
- **Frontend:** React Native (Expo, TypeScript, Expo Router)
- **UI Framework:** React Native Paper
- **Backend:** Supabase (Auth, Database, Storage)
- **AI Processing:** Azure OpenAI (for parenting insights, emotion analysis, and recommendations)

---

## 🎨 Design & UX
- Brand colors: pastel baby blue (#CDE9F9) and soft pink (#F9DDEB).
- Tone: calm, friendly, empathetic, similar to Duolingo’s supportive personality.
- Mascot: **AI Baby Buddy** — a gentle baby avatar that interacts with parents in a warm tone.
- Font: *Poppins* or *Nunito* (rounded, approachable typeface).
- Use clear and friendly microcopy (avoid jargon).

---

## 🧠 AI Guidelines
When generating parenting advice:
- Keep tone empathetic and educational.
- Avoid medical advice — redirect to professional help if necessary.
- Personalize responses based on the child’s age group.
- Maintain warmth, safety, and accuracy.

---

## ⚙️ Code Style
- Use **TypeScript** with strict typing.
- Functional components only (React Hooks).
- Async functions should always include `try/catch` and error handling.
- Database field names → `snake_case`
- JS variables → `camelCase`
- Components → `PascalCase`
- Follow DRY (Don’t Repeat Yourself) and SOLID principles.

---

## 📁 Folder Convention
src/
app/ # Expo Router entry points
features/
auth/ # register, login, password reset
dashboard/ # home for parents
ai-assistant/ # parenting chat and insights
tracker/ # feeding, growth, sleep logs
settings/ # user preferences and AI persona
components/ # reusable UI
hooks/ # custom logic
services/ # supabase + azure clients
utils/ # constants, formatters, helpers
docs/ # internal documentation (checked before codegen)

---

## 🔐 Security
- Do not hardcode API keys.
- All credentials are stored in `.env` and accessed via Expo Config.
- Sanitize all user inputs before sending to AI or Supabase.
- Respect user privacy; never log sensitive parenting data.

---

## 🧑‍💻 Developer Notes
- Use **GitHub Copilot**, **GPT-5-Codex**, or **Claude Sonnet 4.5** as AI agents.
- Always verify any AI-generated code against existing `/docs` conventions.
- If new components or APIs are generated, update `/docs` accordingly.

---

## 🪄 Output Requirements
When generating UI, code, or documentation:
1. Match the brand colors and friendly tone.
2. Ensure TypeScript passes without errors.
3. Keep layout minimal and responsive.
4. Output production-quality code, not pseudo-code.
5. Reference `/docs` whenever possible.

---