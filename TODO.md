# MPDC Project Roadmap & TODOs

## 🎯 High Priority: Analytics & Tracking

- [x] **Activate Facebook Conversions API (CAPI)**
    - [x] Integrate server-side events for Leads, Checkout Starts, and Purchases.
    - [x] Ensure `fbc` and `fbp` parameters are correctly passed from the browser to the server.
- [ ] **Create GA4 Retargeting Audiences**
    - [ ] "Almost Bought" (Initiated Checkout but no Purchase).
    - [ ] "Video Engagers" (Video Progress > 50% but no Purchase).
- [ ] **Finalize GA4 IP Exclusions**
    - [ ] Configure internal traffic filters in GA4 Admin panel (using IP: `89.180.56.247`).
    - [ ] Move filter from 'Testing' to 'Active'.
- [ ] **Verify Attribution Flow**
    - [ ] Perform a test purchase and verify `utm_source` and `gclid` appear in Stripe Metadata.
    - [ ] Verify `fbclid` is being captured in Firebase Leads.

## 🛠 CRM & Infrastructure

- [x] **Stealth Mode Implementation**
    - [x] Global layout opt-out logic.
    - [x] CRM Dashboard toggle for browser-based exclusion.
- [x] **First-Touch / Last-Touch Attribution**
    - [x] Custom library `src/lib/attribution.js`.
    - [x] Integration with Lead capture and Checkout.

## 📈 Optimization & SEO
- [ ] **Execute Link Building Campaign**: See [LINK_BUILDING_STRATEGY.md](./LINK_BUILDING_STRATEGY.md) for full task list.
    - [ ] Sign up for Connectively.
    - [ ] Outreach to initial 10 law firms.
- [ ] **Offline Conversions Upload**: Set up a process to periodically upload Stripe successful payments back to Google/FB for better ad optimization.

## ⚡ Performance & Core Web Vitals


- [x] **Execute Technical Performance Plan**: Partytown implemented, fonts self-hosted, hero preloading active.
- [x] **Self-Host Key Fonts**: Montserrat and Bebas Neue served locally.
- [x] **Implement Partytown**: Moved tracking pixels to background workers.
