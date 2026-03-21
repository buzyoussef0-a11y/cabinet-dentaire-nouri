# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A dental clinic booking website for **Cabinet Dentaire Nouri** (Meknès, Morocco). Built as a vanilla HTML/CSS/JavaScript SPA with a separate Next.js scaffold (in `dentist/`) for future modernization.

## File Structure

```
dentist/
├── index.html          ← home page (stays at root)
├── booking.html        ← booking form (stays at root)
├── 404.html
├── sw.js               ← Service Worker (only .js allowed at root)
├── manifest.json       ← PWA manifest (only .json allowed at root)
├── CLAUDE.md
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── profile.html
│   ├── appointment-tracking.html
│   ├── confirmation.html
│   ├── services.html
│   ├── faq.html
│   └── gallery.html
├── css/
│   ├── main.css        ← primary stylesheet
│   ├── components.css
│   ├── booking.css
│   ├── chat.css
│   └── widgets.css
├── js/
│   ├── supabase-client.js
│   ├── auth.js
│   ├── main.js
│   ├── booking.js
│   ├── tracking.js
│   ├── chat.js
│   ├── toasts.js
│   ├── login.js
│   ├── register.js
│   ├── forgot-password.js
│   ├── reset-password.js
│   ├── faq.js
│   ├── modal.js
│   └── confetti.js
├── assets/
│   ├── images/
│   └── (videos)
└── dentist/            ← Next.js scaffold (future modernization)
```

## Architecture

### Two Coexisting Layers

1. **Static SPA (primary, production)** — root-level HTML files with vanilla JS
2. **Next.js app (scaffold, in-progress)** — `dentist/` subdirectory (React 19, Next.js 16, Tailwind CSS v4, TypeScript 5)

### Page Organization

- **Root pages** (`index.html`, `booking.html`) — must stay at root for simplicity
- **`pages/` subfolder** — all other HTML pages

### Path Convention for `pages/` Files

Every file in `pages/` must use `../` prefixes:
- CSS: `href="../css/main.css"`
- JS: `src="../js/auth.js"`
- Manifest: `href="../manifest.json"`
- Back to root: `href="../index.html"`, `href="../booking.html"`
- Between pages: `href="./login.html"` (same folder, no prefix needed)
- Each pages/*.html must have `<script>window._ROOT = '../';</script>` before the first JS script tag

### `window._ROOT` Pattern

JS files (`auth.js`, `main.js`, `booking.js`) are loaded by pages at different folder levels. They use `window._ROOT` to build correct relative paths:

```javascript
// Root pages (index.html, booking.html) — _ROOT not set, defaults to ''
// pages/*.html — _ROOT = '../' (set via inline script tag)

window.location.href = (window._ROOT||'') + 'pages/login.html';
window.location.href = (window._ROOT||'') + 'booking.html';
```

### Key JavaScript Modules (`js/`)

| File | Responsibility |
|------|---------------|
| `supabase-client.js` | Supabase client initialization |
| `auth.js` | Session management, `requireAuth()`, `logoutUser()` |
| `booking.js` | Multi-step booking form (only loaded by `booking.html`) |
| `tracking.js` | Appointment tracking (only loaded by `pages/appointment-tracking.html`) |
| `main.js` | Navigation, UI, scroll, `goToBooking()` — loaded on every page |
| `chat.js` | Chat widget |
| `toasts.js` | Toast notification system |

### External Integrations

- **Supabase** (`https://tdawqbjtmsoqikqokskv.supabase.co`) — authentication and user data
- **N8N webhook** (`https://jijiyassine.app.n8n.cloud/webhook/...`) — processes booking submissions and sends notifications

### i18n / Localization

- Primary language: Arabic (RTL layout)
- Secondary language: French
- Language strings are embedded directly in HTML via `data-ar` / `data-fr` attributes

### PWA

- `sw.js` — Service Worker
- `manifest.json` — Web App Manifest

## Next.js Commands (inside `dentist/`)

```bash
cd dentist
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Booking Flow

1. User visits `index.html`, clicks "Book" → `goToBooking()` in `main.js`
2. If logged in → `booking.html`; if not → choice modal (login or guest)
3. `booking.html` — 3-step form: personal info → service + date/time → submit
4. On submit, data POSTed to N8N webhook
5. Redirect to `pages/confirmation.html` with reference number

## ⛔ Never Delete

- `booking.html` — full booking logic
- `js/supabase-client.js` — Supabase connection
- `js/auth.js` — authentication
- `js/booking.js` — booking form
- `css/main.css` — main styles

## 🧹 Cleanup Rules

- Never leave `fix-*.js`, `apply-*.js`, `inject-*.js`, `tmp_*.*` files in root
- Only `sw.js` is allowed as a `.js` file at root level
- Only `manifest.json` is allowed as a `.json` file at root level
- All new HTML pages go in `pages/` — never create new HTML at root (except `index.html`, `booking.html`, `404.html`)
