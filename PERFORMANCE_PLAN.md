# ⚡ MPDC Core Web Vitals & Performance Plan

This plan outlines technical optimizations to achieve "Green" scores across all Core Web Vitals and ensure the fastest possible user experience.

## 1. 🖼️ LCP (Largest Contentful Paint)
**Goal: < 2.5s**
- [ ] **Hero Image Preloading**: Add `<link rel="preload" as="image" href="...">` in the `Layout.astro` for the hero image on the homepage and featured blog posts.
- [ ] **Image Modernization**: Ensure all images uploaded via the CMS are converted to `.webp` or `.avif` formats.
- [ ] **Priority Fetching**: Add `fetchpriority="high"` to the largest image on every page.

## 2. 🧱 CLS (Cumulative Layout Shift)
**Goal: < 0.1**
- [ ] **Promo Banner Placeholder**: Fix the height of the `#launch-banner` in CSS to prevent the header from "jumping" when the countdown script initializes.
- [ ] **AspectRatio Box**: Wrap blog card images in a div with a fixed aspect-ratio (e.g., `aspect-ratio: 16 / 9`) to reserve space before the image loads.
- [ ] **Font Swap Optimization**: Use `font-display: swap;` with a "fallback font size adjust" to prevent layout shift when custom fonts finish loading.

## 3. 🖱️ INP (Interaction to Next Paint)
**Goal: < 200ms**
- [ ] **Partytown Integration**: Install and configure `@astrojs/partytown` to move Facebook Pixel, Microsoft Clarity, and GA4 scripts into a background Web Worker.
- [ ] **Script Deferral**: Audit all `<script>` tags in `Header.astro` and `Footer.astro` to ensure they use `defer` or `type="module"` to avoid blocking the main thread.
- [ ] **Event listener optimization**: Passive event listeners for scroll-heavy sections.

## 4. 🚀 Infrastructure & Delivery
- [ ] **Self-Host Google Fonts**: Download `.woff2` files for Montserrat and Inter and serve them directly from `/public/fonts` to eliminate external DNS lookups.
- [ ] **CSS Inlining**: Configure Astro to inline critical CSS (styles for the first 1000px of the page) directly into the `<head>` for near-instant first paint.
- [ ] **Brotli Compression**: Verify that Firebase Hosting is serving assets with Brotli compression (superior to Gzip).

## 📊 Monitoring
- [ ] **Sentry Performance Monitoring**: (Optional) Integrate Sentry to track real-world user vitals rather than just lab tests.
- [ ] **Lighthouse CI**: Set up a GitHub Action to run a Lighthouse audit on every Pull Request.
