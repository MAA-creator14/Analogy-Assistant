# Analogy Assistant — Product Requirements Document

**Version:** 1.0 | **Date:** 2026-06-20 | **Status:** Draft

---

## 1. Problem Statement

Business professionals regularly need to explain complex, abstract, or technical ideas to diverse audiences — executives, clients, partners — but struggle to make those ideas land. A well-chosen analogy bridges the gap between expertise and understanding, but finding the right one in the moment is hard. The Analogy Assistant solves this by giving professionals an instant, AI-powered analogy coach available whenever they're preparing a presentation or crafting a story.

---

## 2. Product Vision

A bold, highly engaging PWA where business professionals chat naturally with an AI to find the perfect analogy for any idea — tailored to their audience and tone — and walk away ready to communicate with confidence.

---

## 3. Target Users

**Primary:** Business professionals — executives, managers, consultants, and strategists who regularly present ideas to boards, leadership, clients, or teams.

**Key context:**
- Preparing presentations, pitch decks, or narrative reports
- Needing analogies calibrated to a specific audience (e.g. non-technical executives, frontline staff, investors)
- Time-constrained — needs fast, high-quality output

---

## 4. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Users find a usable analogy quickly | Median time-to-first-copy < 90 seconds |
| Analogies feel tailored, not generic | User satisfaction rating (thumbs) > 80% positive |
| Users return | 40%+ of users return within 7 days |
| App feels polished and trustworthy | PWA install rate > 15% of active users |

---

## 5. Core Features — MVP

### 5.1 Conversational Chat Interface

The primary interaction mode. Users describe what they want to explain; the AI assistant asks clarifying follow-up questions (audience, tone, context) and surfaces 2–3 tailored analogies. The conversation feels like a smart creative partner, not a form.

**Chat flow:**
1. User opens app → greeted by a short, memorable prompt ("What idea do you need to make land?")
2. User types freely — the concept, the situation, whatever they have
3. Assistant asks 1–2 focused follow-up questions (audience, tone) inline
4. Assistant returns 2–3 distinct analogies with brief explanations of why each works
5. User can ask for more, request a twist, or pick one to save/copy

### 5.2 Tone & Audience Filters

Available as quick-tap chips inside the chat, not a separate form. Users can specify mid-conversation:

- **Audience:** Board / C-suite · Team / Colleagues · External client · General public
- **Tone:** Formal & precise · Conversational · Witty & memorable · Simple / jargon-free

### 5.3 Save & History

- Logged session: analogies are auto-saved to a local history (no account required for MVP)
- Users can star/favourite specific analogies
- History panel accessible via sidebar or swipe — shows past conversations and saved picks
- Persisted via `localStorage` / IndexedDB for offline access

### 5.4 Copy & Export

- **One-click copy** per analogy card (copies clean text to clipboard)
- **"Copy as slide note"** format — adds context label, e.g.:
  *Analogy for [Compound Interest] | Audience: Board | Tone: Formal*
- Future: export as formatted PDF card or image

### 5.5 Hybrid Analogy Engine

- **AI layer:** Claude generates fresh, context-aware analogies via streaming (responses feel instant)
- **Seed library:** A curated set of high-quality analogies across ~30 business topics (leadership, finance, strategy, technology, change management) used to bootstrap quality and reduce latency
- The AI draws from the seed library when highly relevant but always generates novel variants

---

## 6. User Stories

| ID | Story |
|----|-------|
| U1 | As a consultant prepping a client deck, I want to describe a concept and get 3 analogies so I can pick the one that fits my audience's world. |
| U2 | As a product manager, I want to specify that my audience is non-technical executives so the analogies avoid jargon. |
| U3 | As a frequent user, I want to revisit analogies from last week so I can reuse them in a new presentation. |
| U4 | As a user mid-prep, I want to copy an analogy to clipboard in one tap so I can paste it straight into my slide notes. |
| U5 | As a mobile user, I want the app to work offline so I can prep on a plane without Wi-Fi. |

---

## 7. UX & Design Direction

**Feel:** Bold, creative, and distinctive — this is not another grey SaaS tool. It should feel like a creative partner with personality.

**Visual language:**
- Rich color palette with a strong primary accent (vibrant purple or electric blue recommended)
- Expressive typography — a display font for the brand, clean sans-serif for chat
- Chat bubbles with subtle animation; analogies surface as cards with a slight "reveal" micro-animation
- Illustrated or abstract background elements to give warmth and energy
- Fully responsive: mobile-first, PWA-installable

**Key screens:**

1. **Welcome / landing** — a single bold headline + input prompt; no clutter
2. **Chat view** — full-screen chat with floating audience/tone chip selectors
3. **Analogy card** — displays text, audience tag, copy button, save button
4. **History sidebar** — slide-in panel with past sessions and starred favourites

---

## 8. Technical Architecture

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Deployed on Vercel

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 (App Router) | Server Components, streaming, great PWA support |
| Language | TypeScript | Type safety throughout |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| AI | Claude (claude-sonnet-4-6) via Vercel AI SDK | Streaming responses via `streamText` |
| Storage | localStorage / IndexedDB | No backend or auth required for MVP |
| PWA | next-pwa + Vercel | Service worker, offline support, installable |
| Seed library | JSON bundled at build time | Referenced in system prompt |
| Hosting | Vercel | Zero-config deployment, edge network |

**API route:** `/api/chat` — streams AI responses using the AI SDK `streamText` pattern

**System prompt responsibilities:**
- Instructs Claude to act as a friendly but sharp analogy coach
- Directs Claude to ask 1–2 clarifying questions before generating analogies
- Formats output as structured analogy cards (label + analogy text + why it works)
- Draws from the seed library when a curated analogy is a strong match

---

## 9. Out of Scope — v1

- User accounts / cloud sync (localStorage only for MVP)
- Team / collaboration features
- Analogy rating that feeds back into model training
- Native iOS / Android apps
- Multi-language support
- PDF / image export (copy to clipboard only)

---

## 10. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | Should the chat support voice input? | High value for mobile users preparing on the go |
| 2 | What are the ~30 seed topics for the curated library? | Needs content work before launch |
| 3 | Should analogies be rated (thumbs) in MVP? | Useful signal but adds complexity — consider post-launch |
| 4 | PWA install prompt timing? | After first analogy generated seems the most natural moment |

---

## 11. Proposed MVP Milestones

| Milestone | Scope |
|-----------|-------|
| **M1 — Core** | Chat UI + Claude integration + streaming responses |
| **M2 — Refinement** | Audience/tone chips + seed library integration |
| **M3 — Persistence** | Save/history + copy/export |
| **M4 — Polish** | Design system + micro-animations + mobile responsiveness |
| **M5 — Launch** | PWA setup + deploy to Vercel + performance pass |
