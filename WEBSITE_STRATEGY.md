# Website Strategy & Analytics Master Checklist

This document tracks all strategic implementations, analytics setups, and future ideas for the Men's Post-Divorce Coaching (MPDC) website.

## 📊 Analytics & Reporting

### ✅ Completed Setups
- [x] **GA4 Configuration**: Base tracking ID `G-T26PKTMJB1` installed globally.
- [x] **Funnel Tracking**:
    - **Step 1**: `page_view` on `/join` (Landing Page)
    - **Step 2**: `begin_checkout` triggered on "Get Instant Access" click (captures Name/Email + Bump Offer status).
    - **Step 3**: `purchase` triggered on `/system/success` (Conversion).
- [x] **Looker Studio Dashboard**:
    - Embedded directly into CRM at `/crm/analytics`.
    - Live funnel visualization (Views -> Clicks -> Sales).
    - Date range controls and event filtering.
- [x] **Retargeting Audiences**:
    - "Almost Bought" (Checkout Abandoners).
    - "Video Engagers" (50%+ Watch Time).
- [x] **Bing IndexNow Integration**:
    - Automated URL submission to Bing on every deployment.
    - Instant indexing for all new/updated content.
    - See `BING_INDEXNOW_GUIDE.md` for implementation details.


### 🚀 Future Ideas / To-Do
- [ ] **Retention Cohort Analysis**: Track how long students stay active in the course.
- [ ] **Source Attribution**: Break down sales by organic vs. paid traffic in Looker Studio.
- [ ] **Bump Offer Conversion Rate**: Create a specific chart for Bump Offer uptake %.

---

## 🛠️ feature Implementations (Log)

### Checkout System
- [x] **Stripe Integration**: Dynamic checkout session creation based on Bump Offer selection.
- [x] **Lead Capture**: Firebase Firestore captures leads (`leads` collection) *before* redirect to Stripe.
- [x] **Dual Cart Support**: Both "Hero" (top) and "Main" (bottom) carts are fully functional and tracked.

### CRM & Backend
- [x] **Analytics Command Center**: Centralized page for viewing business health.
- [x] **SEO Manager**: Interface to toggle `noindex` on specific pages.
- [x] **Schema Injector**: Tool to add structured data (JSON-LD) to pages for rich snippets.
- [x] **Live VSL Signal**: Real-time tracking of video engagement on the dashboard.

---

## 💡 Strategic Ideas (Backlog)

### Conversion Rate Optimization (CRO)
- [ ] **Exit Intent Popup**: Offer a down-sell or lead magnet if user moves mouse to exit `/join`.
- [ ] **Social Proof Ticker**: "Someone from [City] just joined" notification (genuine or simulated).
- [ ] **Split Testing (A/B)**: Test "Get Instant Access" vs "Start My Transformation" button copy.

### Content Strategy
- [ ] **Blog/Resource Hub**: SEO-driven articles to feed organic traffic into the funnel.
- [ ] **Email Drip Campaign**: Automated 7-day sequence for "Almost Bought" audience.
