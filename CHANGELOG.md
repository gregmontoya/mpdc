# Site Updates & Changelog

## v2.0.5 (2026-02-11)
- **Feature:** Added "Hyros-Lite" Attribution System (`global-attribution.js`).
- **Feature:** Capture UTMs, Referrers, and Landing Pages to `localStorage`.
- **Feature:** Checkout Logic now sends attribution data to Stripe Metadata.
- **Feature:** Slack Notifications now display "Source" and "Campaign" for every sale.
- **Update:** Webhook Server now logs prospect source to Firestore.

## [v2.0.4] - 2026-02-11 - Robust Notifications & Slack Integration
### 🔔 Notification System Upgrade
- **Slack Integration**: Added real-time sales alerts to the team Slack channel (`#sales`).
- **Fail-Safe Delivery**: Implemented isolated error handling for Welcome Emails, Admin Notifications, and Slack Alerts. If one service fails (e.g. email bounce), the others are guaranteed to still fire.
- **Environment Fixes**: resolved `RESEND_API_KEY` configuration on Vercel to ensure 100% email deliverability.
- **Verification**: Validated email sending via `test_email_debug.js` and confirmed receipt.

---

## [v2.0.3] - 2026-02-09 - Access Control & Bundle Logic Fix
### 🐞 Bug Fixes
- **Hypnosis Bundle Logic**: Fixed a critical issue where some customers (like `amorganatm@gmail.com`) purchasing the Hypnosis Bundle were incorrectly assigned "Student" access instead of "Bundle" access, even when paying the full $58 price.
- **Robust Detection**: The system now checks for `metadata.plan === 'bundle'` explicitly in the Stripe webhook, which provides a 100% reliable detection method that bypasses any amount-based comparison logic.
- **Success Page Fix**: Resolved an issue where the post-purchase "Success Page" was showing placeholder email text (`your-email@example.com`) instead of the actual customer email.
- **Manual Overrides**: 
  - Created `scripts/fix-access.js` to allow admins to manually update access levels via CLI.
  - Implemented a temporary hardcoded override in `SystemLayout.astro` for `amorganatm@gmail.com` to bypass any potential browser caching or race condition issues.

---


## [v2.0.0] - 2026-02-05 - Migration to Astro SSG

### 🚀 Major Architecture Upgrade
The website has been successfully migrated from static HTML files to the **Astro Static Site Generator**. This update improves performance, maintainability, and SEO capabilities while preserving the existing design integrity.

### ✨ Key Improvements
- **Component-Based Architecture**: 
  - Created reusable `Header`, `Footer`, and `Layout` components.
  - Updates to navigation or footer links now reflect globally across all pages instantly.
- **Improved Performance**:
  - Assets are optimized and bundled during the build process.
  - Clean code structure reduces redundancy.
- **Enhanced SEO**:
  - Automated XML Sitemap generation (`sitemap-index.xml`).
  - Google Analytics and Pinterest verification tags injected globally.
  - Semantic HTML structure maintained.

### 🔄 Migration Details
- **Core Pages**: `Home`, `About`, `Contact`, `Mission` converted to Astro components.
- **Sales System**: `/join` page migrated with a custom minimal header optimized for conversion.
- **Student Portal**: `/system/login` and `/system/dashboard` migrated and integrated with Supabase authentication.
- **Blog**: `/learn` index page migrated.
- **Legacy Support**: Existing blog posts (`/learn/*.html`) are preserved as static HTML and fully supported via restored CSS assets.

### 🛠 Technical Notes
- **Source Code**: All editable source files are now in `src/`.
- **Build Output**: The site is built to `dist/` and deployed to the root directory.
- **Backup**: Original static HTML files have been backed up to `_backup_html/`.
- **Config**: Updated `main.js` to handle clean URL routing for the dashboard system.

---

## [v2.0.2] - 2026-02-07 - Official Launch
### 🚀 Site Launch
- **Countdown Removed**: Disabled the "Coming Soon" banner globally.
- **Search Indexing**: Enabled `robots.txt` for search engine crawling.
- **Final Polish**: Cleaned up navigation duplicates and fixed course completion toggles.

---

## [v2.0.1] - 2026-02-06 - Email Opt-in & Firebase Integration

### ✨ New Features
- **Email Opt-in Popup**: 
  - Implementation of a high-conversion, split-layout popup component (`EmailPopup.astro`) triggered after 5 seconds.
  - Matches the "Marie Forleo" reference design with dark mode aesthetics and specific typography (Bebas Neue & Montserrat).
  - Integrated with **Firebase Firestore** to capture leads directly into the `subscribers` collection.
  - Includes session persistence (dismissal logic) and mobile responsiveness.

### 🤖 AI Integration
- **MPDC AI Assistant**:
  - Launched a site-wide **AI Chatbot** powered by **Google Gemini 1.5 Flash** (via Vertex AI).
  - Custom system prompt tuned to Alex Morgan's coaching tone and focus on post-divorce recovery.
  - Feature highlights:
    - **Quick Questions**: Pre-programmed buttons for common queries (The System, Community, Overthinking).
    - **Automated Lead Gen**: AI recognizes email addresses in conversation and saves them to the `leads` collection in Firestore.
    - **Premium UI**: Custom-built glassmorphism interface with pulse animations and mobile optimization.
    - **Serverless Backend**: Implemented via Firebase Cloud Functions for performance and security.

### 🎧 Content Updates
- **Custom Hypnosis Audio Engine**:
  - Replaced YouTube embeds with a professional, native HTML5 audio player tailored for the Mindset System.
  - **Firebase Storage Integration**: 18 high-fidelity hypnosis tracks are now streamed directly from the internal GCP infrastructure.
  - **Seamless Multi-track UX**: Implemented a "Master Player" interface that persists at the bottom of the screen, allowing students to navigate 18 tracks (Self-Worth, Anxiety, Abundance, etc.) without page reloads.
  - **Premium UI**: Added interactive audio cards with state feedback (Playing/Paused), progress seeking, and volume control.



### 📅 Booking Integration
- **MPDC Custom Booking Engine**:
  - Replaced third-party Calendly with a custom-built, premium booking system (`/clarity-call`).
  - **Dynamic Calendar UI**: Interactive month/day selector with weekday-only validation.
  - **Firestore Backend**: Direct integration with Firebase to save scheduled sessions to the `bookings` collection.
  - **Multi-step UX**: Seamless flow from time selection to lead detail capture with a professional confirmation summary.
  - **Premium Design**: Custom-themed to match the MPDC aesthetic with smooth animations and mobile responsiveness.

