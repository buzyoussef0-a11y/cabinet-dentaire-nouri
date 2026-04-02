# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A dental clinic booking website for **Cabinet Dentaire Nouri** (Meknès, Morocco). Vanilla HTML/CSS/JS SPA deployed via GitHub Pages (or similar static host). No build step — edit files and push to deploy.

## Deployment

```bash
git add <files>
git commit -m "description"
git push   # deploys automatically
```

There is no build, lint, or test command. Changes go live on push.

## File Structure

```
/
├── index.html          ← home page (root only)
├── booking.html        ← booking form (root only)
├── 404.html
├── sw.js               ← Service Worker (only .js allowed at root)
├── manifest.json       ← PWA manifest (only .json allowed at root)
├── pages/              ← all other HTML pages
├── css/
│   ├── main.css        ← primary styles (dark-theme base)
│   ├── light-theme.css ← overrides main.css for all pages; loaded on every page
│   ├── components.css
│   ├── booking.css     ← loaded only by booking.html
│   ├── chat.css
│   └── widgets.css
├── js/
│   ├── supabase-client.js  ← Supabase init (loaded first on every page)
│   ├── auth.js             ← session, requireAuth(), logoutUser()
│   ├── main.js             ← nav, scroll, goToBooking() — every page
│   ├── i18n.js             ← translation engine — every page
│   ├── booking.js          ← booking form — booking.html only
│   ├── tracking.js         ← appointment list — appointment-tracking.html only
│   ├── chat.js             ← chat widget
│   └── toasts.js           ← toast notifications
└── assets/
```

## Architecture

### CSS Layering (critical to understand)

`main.css` uses a **dark theme** as the base. `light-theme.css` overrides it to a white/teal light theme using `!important` rules. **Every page loads both.** Load order matters:

```html
<link rel="stylesheet" href="css/main.css">        <!-- dark base -->
<link rel="stylesheet" href="css/light-theme.css"> <!-- light override -->
```

When adding new CSS to a page's `<style>` block, be aware that `light-theme.css` uses `!important` on most rules. Page-specific `<style>` blocks come **after** the `<link>` tags and can override `light-theme.css` if they also use `!important` — but that creates invisible text on white backgrounds (e.g., white text on white navbar). Prefer letting `light-theme.css` handle navbar, buttons, and lang-btn styling.

**Never add page-specific overrides for:**
- `.lang-btn` — handled globally by `light-theme.css`
- `#mainNav` background/layout — handled globally by `light-theme.css`

### i18n System

Every page loads `js/i18n.js`. It is the **only** translation engine — do not add inline translation scripts to any HTML file (booking.html previously had one that caused bugs).

- Text is translated via `data-ar` / `data-fr` attributes on elements
- The lang button label is set by `i18n.js` to `'عربي'` / `'Français'`
- `toggleLangDropdown()` and `switchLangFromDropdown()` are defined in `i18n.js`
- Arabic = RTL (`dir="rtl"`), French = LTR (`dir="ltr"`) — set on `<html>` by `i18n.js`

### Path Convention for `pages/` Files

`pages/*.html` use `../` prefixes for all assets:
```html
<link rel="stylesheet" href="../css/main.css">
<script src="../js/auth.js"></script>
<script>window._ROOT = '../';</script>  <!-- must appear before first JS script tag -->
```

Root pages (`index.html`, `booking.html`) use no prefix and do **not** set `window._ROOT`.

`window._ROOT` is used in JS files to build correct paths regardless of the calling page's depth:
```javascript
window.location.href = (window._ROOT || '') + 'pages/login.html';
window.location.href = (window._ROOT || '') + 'booking.html';
```

### Standard Script Load Order (every page)

```html
<script>window._ROOT = '../';</script>   <!-- pages/ only -->
<script src="js/supabase-client.js"></script>
<script src="js/auth.js"></script>
<script src="js/main.js"></script>
<script src="js/i18n.js"></script>
<!-- page-specific scripts (booking.js, tracking.js, etc.) -->
<script src="js/chat.js"></script>
<script src="js/toasts.js"></script>
```

### Navbar Consistency

All pages share the same `<nav id="mainNav">` structure (directly in `<body>`, not wrapped in `<header>`). Nav links are the same across all pages:

```
الرئيسية | خدماتنا | معرض الصور | من نحن | الأسئلة الشائعة | تتبع موعدك
```

`light-theme.css` handles `#mainNav` styling with `direction: rtl !important` — logo always right, nav-actions always left.

### External Integrations

| Service | Variable | Used in |
|---------|----------|---------|
| Supabase auth + DB | hardcoded in `supabase-client.js` | all pages |
| Booking/tracking webhook | `WEBHOOK_URL` in `booking.js` / hardcoded in `tracking.js` | `booking.html`, `appointment-tracking.html` |
| Chat webhook | `CHAT_WEBHOOK` in `chat.js` | all pages |

**Webhook URLs** — two separate endpoints:
- `https://n8n.srv1521649.hstgr.cloud/webhook/dental-assistant` — chat only (`chat.js`)
- `https://n8n-vortex.vivanco.work/webhook/39c27c32-3be0-4f7a-ad54-2247d341035b` — bookings + tracking

The booking webhook call is **non-blocking** (wrapped in try/catch) — booking succeeds even if webhook fails.

### Supabase Tables

- `profiles` — user data (`full_name`, `phone`) keyed on `auth.uid()`
- `bookings` — guest bookings (matched by `email` or `user_id`)
- `appointments` — authenticated user appointments (RLS: `auth.uid() = user_id`)

Cancellation requires an UPDATE policy on `appointments`. If cancellation returns 403, run in Supabase SQL Editor:
```sql
CREATE POLICY "users_can_cancel_own_appointments" ON appointments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Booking Flow

1. `goToBooking()` in `main.js` — checks auth, shows choice modal if not logged in
2. `booking.html` — 3-step form (personal info → service + date/time → confirm)
3. On submit: saves to Supabase `bookings` table, then fires webhook (non-blocking)
4. Redirects to `pages/confirmation.html` with reference number

## ⛔ Never Delete

- `booking.html`, `js/booking.js` — full booking logic
- `js/supabase-client.js`, `js/auth.js` — authentication
- `css/main.css`, `css/light-theme.css` — base and light-theme styles
- `js/i18n.js` — the only translation engine

## 🧹 Cleanup Rules

- No `fix-*.js`, `apply-*.js`, `inject-*.js`, `tmp_*.*`, `replace-end.js` at root
- Only `sw.js` allowed as `.js` at root; only `manifest.json` as `.json` at root
- All new HTML pages go in `pages/` — never create HTML at root (except `index.html`, `booking.html`, `404.html`)
- Never embed an inline translation engine (`applyLang` / `toggleLanguage`) inside any HTML file — use `i18n.js` instead
