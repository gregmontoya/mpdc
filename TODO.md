# MPDC Project Roadmap & TODOs

## 🎯 High Priority: Analytics & Tracking

- [ ] **Activate Facebook Conversions API (CAPI)**
    - [ ] Provide `FB_PIXEL_ID`.
    - [ ] Provide `FB_ACCESS_TOKEN` (Generated in Events Manager).
    - [ ] Re-deploy `stripeWebhook` function with these secrets.
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

## 📈 Optimization (Future)

- [ ] **Offline Conversions Upload**: Set up a process to periodically upload Stripe successful payments back to Google/FB for better ad optimization.
## ⚡ Performance & Core Web Vitals

- [ ] **Execute Technical Performance Plan**: See [PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) for full task list.
- [ ] **Self-Host Key Fonts**: Move Montserrat/Inter to local assets.
- [ ] **Implement Partytown**: Offload tracking scripts to background workers.
