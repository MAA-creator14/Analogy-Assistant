# Handoff: Analogy App — "Bold" Direction (Find + Library)

## Overview
A mobile-first PWA that generates **context-aware analogies** for pitches, talks, and decks, and stores them in a **personal library** with a built-in **"did it land?" reflection loop**. The differentiator over a stateless chat tool is that the app captures the *frame* (audience + goal + emotional register), and learns from which analogies the user actually used and whether they landed.

This handoff covers two screens of the core loop:
1. **Find** — a two-step context-framing flow.
2. **Library** — saved analogies, filterable, each with a tappable land/confusing/cut control.

A third tab, **Insights**, is intentionally present-but-dormant in the nav (no screen yet).

---

## About the Design Files
The file in this bundle — `Analogy App — Bold.dc.html` — is a **design reference created in HTML**. It is an interactive prototype demonstrating the intended look, layout, and behavior. **It is not production code to copy directly.**

Your task is to **recreate this design in the target codebase's environment** using its established patterns and libraries. If no codebase exists yet, this is a greenfield PWA — the recommended stack is **React + Vite + TypeScript** (PWA via `vite-plugin-pwa`), with plain CSS or CSS Modules. The HTML prototype uses inline styles for prototyping speed; in the real app, extract the design tokens below into your styling system.

The prototype is built on an internal "Design Component" runtime (`<x-dc>`, `support.js`). **Ignore that runtime** — it is a prototyping harness, not part of the deliverable. Read the markup and the `Component` logic class for structure, styling, and behavior only.

---

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, shadows, and interactions are final. Recreate the UI faithfully. Exact values are in the **Design Tokens** section.

---

## Global Layout & Chrome

The app renders inside a **390–392px-wide mobile viewport**. In the prototype it's drawn as an 812px-tall phone card; in the real PWA it's full-screen (`100dvh`). Structure top→bottom:

1. **Status bar** (44px tall) — OS chrome; in a real PWA this is the device status bar. The prototype fakes it (`9:41`, `5G`, battery). Omit in production.
2. **Journey pills row** — three small pills: `1 context`, `2 results`, `3 library`. Reflects where the user is in the conceptual journey. Active pill = solid violet; others = white with light-gray border. (Note: `2 results` is never "active" in this build — results screen is out of scope.)
3. **Scrollable content area** — `flex: 1; overflow-y: auto`. Padding `8px 22px 24px`. Scrollbar hidden.
4. **Bottom tab nav** (fixed, non-scrolling) — `find` / `library` / `insights`.

App container: `background:#fff; border:1.5px solid #111; border-radius:22px` in the prototype (phone card). In production, drop the border/radius and go full-bleed; keep the white background.

Font family throughout: **Space Grotesk** (Google Fonts, weights 400/500/600/700).

---

## Screens / Views

### 1. Find — Step 1 of 2 ("find an analogy")
**Purpose:** Capture *what* the user is explaining, *who* the audience is, and the *goal*.

**Layout:** Single column, content padding `8px 22px 24px`. Sections stacked with uppercase labels above each control.

**Components (top→bottom):**

- **Header row** — `display:flex; align-items:baseline; justify-content:space-between`.
  - Title `find an analogy` — Space Grotesk, **30px / 700**, letter-spacing `-0.9px`, color `#0e0e0e`, lowercase, `white-space:nowrap`.
  - Step label `step 1 / 2` — 11px / 700, letter-spacing `1px`, uppercase, color `#6D28D9` (violet), `flex:none`.

- **Section label** `WHAT ARE YOU EXPLAINING?` — see **Label style** token. Applies to every section label.

- **Textarea** — full width, `min-height:94px`, padding `14px`, `border:1.5px solid #111`, `border-radius:12px`, background `#FAFAFA`, font 15px, line-height 1.4, `resize:none`, no outline on focus. Placeholder: `e.g. why payroll compliance matters for small businesses` (placeholder color `#9a9a9a`).

- **Section label** `YOUR AUDIENCE`

- **Audience chips** (single-select) — flex-wrap row, `gap:9px`. Options: `founders`, `investors`, `engineers`, `executives`, `general public`. Default selected: `founders`. See **Chip (black)** token.

- **Section label** `GOAL OF THE ANALOGY`

- **Goal chips** (single-select, **violet** when selected) — options: `simplify something complex`, `build trust`, `create urgency`, `reframe risk`. Default: `simplify something complex`. See **Chip (violet)** token. This is the only chip group that fills violet — it semantically marks "intent."

- **Primary CTA** `frame the moment ↗` — see **CTA** token. Advances to Step 2.

---

### 2. Find — Step 2 of 2 ("frame the moment")
**Purpose:** Carry the context forward and add emotional register before searching.

**Components:**

- **Header row** — title `frame the moment` (same style as step-1 title), step label `step 2 / 2`.

- **Recap chip** — a violet-tinted summary bar showing the carried context.
  - Text: `for {audience}  ·  to {goal}` (e.g. `for founders  ·  to simplify something complex`).
  - Style: background `#F3EEFC`, `border:1.5px solid #E0D4F7`, `border-radius:10px`, padding `11px 14px`, margin-top `8px`, color `#5B21B6`, weight 600, 13.5px.

- **Section label** `EMOTIONAL REGISTER`

- **Tone chips** (single-select, black) — options: `reassure`, `excite`, `provoke`, `clarify`. Default: `reassure`.

  > Note: An earlier "how high are the stakes?" section was **removed** — do not include it.

- **Pre-search state** (`searched === false`):
  - Primary CTA `find analogies ↗` → sets `searched = true`.
  - Text link below `← back to context` → returns to Step 1 (and resets `searched`).

- **Post-search state** (`searched === true`):
  - **Success block** — background `#6D28D9` (violet), `border:1.5px solid #111`, `border-radius:12px`, `box-shadow:5px 5px 0 #111`, padding `20px`, margin-top `28px`.
    - Title `✓ 12 analogies matched` — white, 17px / 700.
    - Sub `tuned for {audience}, {tone}. the loop is propose → use → reflect.` — color `#D9CCF6`, 13px, line-height 1.45, margin-top 7px.
    - Button `save to library ↗` — white background, `border-radius:8px`, padding `9px 14px`, violet text `#6D28D9`, 13.5px / 700. Navigates to Library tab.
  - Text link `← reframe` → returns to Step 1.

  > The "12 analogies matched" count is a static placeholder for this build — there is no results list yet. When you build the real results screen, this is where it slots in.

---

### 3. Library ("library")
**Purpose:** Browse saved analogies, filter by context, and record whether each one landed.

**Components (top→bottom):**

- **Header row** — title `library`; right-side summary `{n} saved · {m} landed` in violet step-label style (e.g. `6 saved · 3 landed`). `m` is the live count of analogies with `status === 'landed'` and updates as the user uses the reflection control.

- **Import affordance** (onboarding / cold-start) — two states:
  - *Closed:* dashed bordered card — `border:1.5px dashed #111`, `border-radius:12px`, padding `14px 15px`, background `#FAFAFA`, margin `18px 0 6px`. Content: a `↓` glyph + `import analogies from a recent pitch`, weight 600, 13.5px. Tappable.
  - *Open* (after tap): solid card — `border:1.5px solid #111`, `box-shadow:4px 4px 0 #6D28D9`. Contains an uppercase micro-label `PASTE A PITCH · WE EXTRACT THE METAPHORS`, a textarea (`min-height:72px`, placeholder `Paste a transcript or pitch deck text…`), and a button row: `extract analogies` (black fill) + `cancel` (white). Both currently just toggle the card closed — wire `extract` to your import pipeline.

- **Filter chips** (single-select, black) — `all`, `pitch`, `talk`, `investor deck`. Default `all`. Filters the card list by each analogy's `tag`. Flex-wrap, `gap:9px`, margin `14px 0 4px`.

- **Analogy cards** — one per saved analogy. Card: `background:#fff; border:1.5px solid #111; border-radius:12px; padding:15px; margin-bottom:14px; box-shadow:4px 4px 0 #111`.
  - **Analogy text** — 15.5px / 500, line-height 1.4, color `#0e0e0e`, margin-bottom 13px.
  - **Meta row** — flex, `gap:9px`, wrap, 12px, color `#6b6b6b`, margin-bottom 14px:
    - **Tag pill** — `padding:3px 9px; border:1.5px solid #111; border-radius:999px`, 10px / 700, letter-spacing `.5px`, uppercase, color `#111`, white bg. Shows the analogy's context tag.
    - Audience text (e.g. `founders`).
    - A `|` divider in `#C9C9C9`.
    - `used {n}×` text.
  - **Reflection control** — the signature interaction:
    - Micro-label `DID IT LAND?` — 10px / 700, letter-spacing `1.2px`, uppercase, color `#9a9a9a`, margin-bottom 8px.
    - Three equal-width segmented buttons (`display:flex; gap:7px`, each `flex:1`): `Landed`, `Confusing`, `Cut`. The button matching the card's current `status` is filled with its semantic color (white text); the others are white with a light-gray border and muted text. Tapping a button sets that card's `status`. See **Reflection button** token.

---

## Interactions & Behavior

- **Tab navigation** (bottom nav): `find` and `library` switch the content area; `insights` is rendered disabled (faint, no handler). Switching tabs does not reset Find's internal step/search state in the prototype — preserve in-progress framing when the user pops to Library and back.
- **Chip selection**: single-select per group. Tapping a chip sets that group's value. No multi-select anywhere.
- **Step flow**: `frame the moment` → step 2; `find analogies` → success state; `← back`/`← reframe` → step 1 and clears `searched`.
- **Reflection loop**: tapping Landed/Confusing/Cut mutates the specific card's `status` and immediately updates the header's "X landed" tally.
- **Import**: tapping the dashed card opens the paste form; `extract analogies` and `cancel` both close it (placeholder — connect `extract` to real extraction).
- **Transitions**: chips and reflection buttons animate color/background with `transition: all .12s–.14s ease`. The CTA has a tactile press: on hover, `transform: translate(2px,2px)` and shadow shrinks from `5px 5px` to `3px 3px` (apply the same on `:active` for touch).
- **No native results screen** exists yet — the "12 analogies matched" success block is the current end of the Find flow.

---

## State Management

Single screen-level state object (prototype shape):

| Key | Type | Default | Notes |
|---|---|---|---|
| `tab` | `'find' \| 'library'` | `'find'` | active bottom tab |
| `step` | `1 \| 2` | `1` | Find sub-step |
| `topic` | `string` | `''` | textarea contents |
| `audience` | `string` | `'founders'` | single-select |
| `goal` | `string` | `'simplify something complex'` | single-select (violet) |
| `tone` | `string` | `'reassure'` | single-select |
| `searched` | `boolean` | `false` | step-2 success toggle |
| `libFilter` | `'all'\|'pitch'\|'talk'\|'investor deck'` | `'all'` | library filter |
| `importOpen` | `boolean` | `false` | import card expanded |
| `lib` | `Analogy[]` | seeded (6 items) | the saved library |

`Analogy` = `{ id: number; text: string; tag: 'pitch'|'talk'|'investor deck'; audience: string; status: 'landed'|'confusing'|'cut'; uses: number }`.

**Derived:** filtered list = `lib.filter(a => libFilter === 'all' || a.tag === libFilter)`; landed count = `lib.filter(a => a.status === 'landed').length`.

**Data fetching (real app):** the framing inputs (topic/audience/goal/tone) should POST to an LLM endpoint that returns ranked analogies *with fit reasoning*. Saving appends to `lib`. Persist `lib` locally (IndexedDB/localStorage) so the library survives reloads — that persistence is the core retention mechanic. The reflection signal (status history) is the data layer for future Insights.

**Seed data** (use verbatim for parity):
1. `Churn is a leaky bucket — pouring in more leads will never outrun the holes.` · pitch · founders · landed · 6×
2. `Payroll compliance is a building's fire code: invisible until the day it saves you.` · pitch · executives · landed · 4×
3. `Our API is the plumbing — nobody admires it until it leaks.` · talk · engineers · landed · 3×
4. `Onboarding is a first date, not a wedding. Don't ask for everything up front.` · investor deck · investors · confusing · 2×
5. `Switching vendors is repotting a plant — stressful for a week, then it grows.` · pitch · executives · confusing · 1×
6. `Our caching layer is milk on the counter vs. milk in the fridge.` · talk · engineers · cut · 1×

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Ink | `#0e0e0e` / `#111111` | text, borders |
| Violet (accent) | `#6D28D9` | active states, goal chips, CTA shadow, success block |
| Violet text-dark | `#5B21B6` | recap bar text |
| Violet tint bg | `#F3EEFC` | recap bar background |
| Violet tint border | `#E0D4F7` | recap bar border |
| Violet on-dark sub | `#D9CCF6` | success block sub-text |
| Phone drop-shadow | `#E5DCFA` | prototype only |
| Sub text | `#6b6b6b` | meta, nav inactive |
| Faint | `#9a9a9a` | labels, placeholder, unselected reflection text |
| Faint-er | `#C2C2C2` | disabled "insights" nav |
| Hairline | `#E2E2E2` | unselected reflection border |
| Divider | `#C9C9C9` | meta `|` |
| Field bg | `#FAFAFA` | textarea, import card closed |
| Surface | `#FFFFFF` | cards, nav |
| **Status (landed)** | `#1F8A4C` | reflection "Landed" fill |
| **Status (confusing)** | `#C77D11` | reflection "Confusing" fill |
| **Status (cut)** | `#111111` | reflection "Cut" fill |

### Typography (Space Grotesk throughout)
| Role | Size / Weight | Tracking | Transform |
|---|---|---|---|
| Screen title | 30 / 700 | -0.9px | lowercase |
| Step label | 11 / 700 | 1px | uppercase, violet |
| Section label | 11 / 700 | 1.4px | uppercase, `#9a9a9a` |
| Reflection micro-label | 10 / 700 | 1.2px | uppercase, `#9a9a9a` |
| Body / textarea | 15 / 400–500 | — | — |
| Analogy text | 15.5 / 500 | — | — |
| Chip | 14 / 600 | — | — |
| Meta | 12 / 400 | — | — |
| Tag pill | 10 / 700 | 0.5px | uppercase |
| CTA | 16 / 700 | — | lowercase |
| Nav | 11 / 600 | — | — |

### Spacing / Radius / Shadow
- Content padding: `8px 22px 24px`. Section label margin: `24px 0 11px`. Chip gap: `9px`. Card margin-bottom: `14px`.
- Radii: chips/pills `999px`; cards/textarea/CTA `12px`; recap/import-textarea/reflection buttons `8–10px`; phone `22px`.
- Borders: structural `1.5px solid #111`; hairline `1.5px solid #E2E2E2`.
- Hard shadows (no blur): card `4px 4px 0 #111`; CTA `5px 5px 0 #6D28D9` (→ `3px 3px 0` pressed); success block `5px 5px 0 #111`; import-open `4px 4px 0 #6D28D9`.

### Component tokens
- **Chip (black):** white bg, `1.5px solid #111`, `border-radius:999px`, padding `10px 16px`, 14/600. **Selected:** bg `#111`, text `#fff`.
- **Chip (violet):** same, but **selected** bg `#6D28D9`, border `#6D28D9`, text `#fff`. (Goal group only.)
- **Label style:** block, margin `24px 0 11px`, 11/700, letter-spacing 1.4px, uppercase, `#9a9a9a`.
- **CTA:** full width, padding 16, `border-radius:12px`, bg `#111`, text `#fff`, 16/700, `box-shadow:5px 5px 0 #6D28D9`, no border; hover/active `translate(2px,2px)` + `3px 3px 0`.
- **Reflection button:** `flex:1`, padding `8px 0`, `border-radius:8px`. Unselected: white bg, `1.5px solid #E2E2E2`, text `#9a9a9a`. Selected: bg = status color, white text, border = status color. 12/600, capitalize.
- **Text link:** transparent, `#6b6b6b`, 14/600, centered, full-width.

---

## Assets
- **Font:** Space Grotesk via Google Fonts (`https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700`). Self-host for the PWA.
- **Icons:** three inline stroke SVGs, `stroke="currentColor"`, `stroke-width:1.9`, 22×22 — magnifier (find), bookmark (library), bar chart (insights). Re-draw with your icon set (Lucide: `search`, `bookmark`, `bar-chart-3`). Inline glyphs `↗ ↓ ← ✓ ·` are Unicode.
- No raster images.

---

## Files
- `Analogy App — Bold.dc.html` — the high-fidelity interactive reference (this bundle). Read the `Component` class for exact state logic and the markup for structure/styling. Disregard the `<x-dc>` / `support.js` runtime.
- `screenshots/` — rendered states for visual reference:
  - `01-find-step1.png` — Find, step 1 (topic + audience + goal)
  - `02-find-step2.png` — Find, step 2 (recap + emotional register)
  - `03-find-success.png` — Find, post-search success block
  - `04-library.png` — Library with filters + reflection loop
  - `05-library-import.png` — Library with import-from-pitch form expanded

## Out of scope (future)
- **Results screen** between framing and saving (ranked analogies + fit reasoning).
- **Insights tab** — usage patterns from the reflection signal (e.g. "you reach for engineering analogies 70% of the time; they land better with technical audiences").
- Real LLM generation + import-from-pitch extraction.
