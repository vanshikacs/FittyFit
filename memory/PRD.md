# Fittyfit — Product Requirements Document (PRD)

_Last updated: 2026-02-23_

## Original problem statement
Design & build a premium, futuristic, hackathon-winning UI/UX for **Fittyfit** — an India-first AI health companion for elderly people, chronic patients, caregivers, and families. Visual inspiration: soft blue gradient background, glassmorphism white/blue cards, bold oversized typography, floating stat chips, lime-green CTA accents, semi-3D healthcare illustrations. Product must feel modern, caring, elder-friendly, and startup-quality. Core features: AI health coaching, food analysis, medication reminders, cultural + seasonal health suggestions, emergency SOS, caregiver/family alerts, daily voice health summary, login/signup and health profiles.

## Architecture
- **Backend**: FastAPI + Motor (MongoDB) + PyJWT + bcrypt
- **AI**: `emergentintegrations` `LlmChat` → OpenAI `gpt-4o` (text + vision) using `EMERGENT_LLM_KEY`
- **Frontend**: React 19 + React Router 7, Tailwind (+ tailwindcss-animate), sonner (toasts), lucide-react (icons). Fonts: **Cabinet Grotesk** (display) + **Satoshi** (body) via Fontshare.
- **Auth**: JWT (Bearer) with email+password; bcrypt hashing; `role` = `elder` | `caregiver`
- **Design tokens**: `/app/design_guidelines.json` (applied via `tailwind.config.js` + `index.css`)

## User personas (v1)
1. **Elder/User** (e.g., Shanti Devi, 68) — takes 4 meds, diabetic, needs gentle reminders + voice summary.
2. **Caregiver** (family member or professional) — wants alerts when meds are missed or risky food is scanned.
3. **Chronic patients** — diabetes, BP, heart, arthritis, etc.

## Core requirements (static)
- India-first: Indian food, festivals, fasts, Hindi/Hinglish voice
- Elder-friendly: large readable text, calm tone, generous spacing, big SOS button
- Premium: glassmorphism, bold oversized typography, floating chips, soft blue gradient bg

## Implemented (v1 — 2026-02-23)
- Landing page (hero + bento features + how-it-works + impact stats + testimonials + CTA + footer)
- JWT Signup + Login (role-picker) + Auth context in localStorage
- 3-step Onboarding (basic → health → preferences) with `onboarded=true` gate
- Main Dashboard: greeting, adherence, active meds, open alerts, care status, upcoming meds, quick actions (Coach/Food/Voice), cultural tip card, seasonal tip card, alerts preview, SOS CTA
- AI Coach chat with suggestions (gpt-4o, context-aware from user's health profile)
- Food Analysis: image upload (base64) + text input → gpt-4o vision → Safe/Limit/Avoid verdict + reason + alternatives + med-interaction + seasonal note; auto-creates caregiver alert if verdict=avoid
- Medication Tracker: CRUD, mark taken/missed, 7-day adherence %, auto caregiver alert on miss
- Voice Health Summary: gpt-4o-generated daily script in user's language, browser SpeechSynthesis playback, schedule + language settings UI
- Caregiver Alerts: feed with priority badges (critical/high/medium), mark read
- Emergency SOS: large pulsing button, geolocation, caregiver info card, SOS history
- Profile / Settings view
- AppShell with sidebar (desktop) + bottom nav (mobile) + always-accessible SOS
- 100% test coverage via testing_agent_v3 (16/16 backend tests, full frontend E2E)

## Backlog

### P0 (next iteration)
- Real TTS voice playback via OpenAI TTS (currently browser SpeechSynthesis only)
- Push/SMS notifications for caregivers (currently in-app alerts only)
- Real voice call scheduling (currently UI-only)

### P1
- Dedicated Cultural Mode screen with festival calendar
- Dedicated Seasonal Mode screen with weather API + city-based recommendations
- Caregiver "companion" view (parent dashboard for a caregiver monitoring multiple elders)
- Medicine photo scanning (OCR for Rx labels)
- Whisper STT for voice input in AI Coach

### P2
- Multi-elder linking + family sharing
- PDF export of weekly health summary
- Integration with wearables (Fitbit, Mi Band)
- In-app video tutorials in Hindi/regional languages

## Test credentials
See `/app/memory/test_credentials.md`.

## Known MOCKED features
- Real phone voice call — UI only; playback uses browser Web Speech API for text generated server-side.
