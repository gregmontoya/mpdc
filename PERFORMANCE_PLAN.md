# ⚡ MPDC Core Web Vitals & Performance Plan

This plan outlines technical optimizations to achieve "Green" scores across all Core Web Vitals and ensure the fastest possible user experience.

## 1. 🖼️ LCP (Largest Contentful Paint)
**Goal: < 2.5s**
- [x] **Hero Image Preloading**: Done in `Layout.astro`.
- [x] **Image Modernization**: Optimized using Astro Image component.
- [x] **Priority Fetching**: Added `fetchpriority="high"` to hero images.

## 2. 🧱 CLS (Cumulative Layout Shift)
**Goal: < 0.1**
- [x] **Promo Banner Placeholder**: min-height set to 54px in `Layout.astro`.
- [x] **AspectRatio Box**: Implemented for blog cards.
- [x] **Font Swap Optimization**: `font-display: swap` active.

## 3. 🖱️ INP (Interaction to Next Paint)
**Goal: < 200ms**
- [x] **Partytown Integration**: Initialized in `astro.config.mjs` and used in `SEO.astro`.
- [x] **Script Deferral**: All scripts deferred or moved to Partytown.
- [x] **Event listener optimization**: Interaction-based loading active.

## 4. 🚀 Infrastructure & Delivery
- [x] **Self-Host Google Fonts**: Montserrat and Bebas Neue served locally.
- [x] **CSS Inlining**: `inlineStylesheets: 'always'` configured.
- [ ] **Brotli Compression**: Verify that Firebase Hosting is serving assets with Brotli compression (superior to Gzip).

## 📊 Monitoring
- [ ] **Sentry Performance Monitoring**: (Optional) Integrate Sentry to track real-world user vitals rather than just lab tests.
- [ ] **Lighthouse CI**: Set up a GitHub Action to run a Lighthouse audit on every Pull Request.
