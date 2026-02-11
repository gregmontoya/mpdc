# 🚀 MPDC Marketing Links Inventory

These "Go Links" are professional redirects that automatically add tracking tags (UTMs) to your visitors. Use these instead of raw URLs to ensure your attribution data (Stripe/Slack) is accurate.

### 🎯 Marketing & Tracking Engine

## 🛑 TOMORROW'S CHECKLIST (Feb 12)
- [x] **Audit FB Pixel Event Firing**: Check Meta Events Manager. Look for "Purchase" events from today's/tomorrow's tests/sales.
- [x] **Get FB CAPI Access Token**: GENERATED & INSTALLED. 
- [x] **Identity Bridge**: Active. Tracking anonymous path from Blog -> Join.
- [x] **Video SEO / AEO**: Schema injected. Inverted Pyramid summaries active on blogs.
*   [ ] **Verify GA4 Purchase Tracking**: Ensure the $27 value is showing up in GA4 "Monetization" reports.

## 🚀 PRO RETARGETING SECRETS (Audience Strategy)
Pros don't just target "People who didn't buy." They segment by **Intent Depth**:
1.  **VSL Watchers**: Create a custom audience in Meta for "People who watched > 75% of your video." These are your highest-quality leads.
2.  **Decision-Phase Leads**: Target people who hit the `/join` page (Lead event) but didn't buy. Show them **Testimonial** ads (Social Proof).
3.  **Discovery-Phase Leads**: Target people who hit the blog but not `/join`. Show them **Education** ads (VSL snippets).
4.  **EXCLUSION (Crucial)**: Always exclude the "Purchase" audience from your prospecting ads to save money.

### 📱 Instagram
- **Bio Link:** `https://menspostdivorcecoaching.com/go/ig-bio`
  - *Destination:* `/join` (VSL Page)
  - *Tracks as:* Source: Instagram | Medium: Bio
- **Story Link:** `https://menspostdivorcecoaching.com/go/ig-story`
  - *Destination:* `/join`
  - *Tracks as:* Source: Instagram | Medium: Story

### 📺 YouTube
- **Channel Header:** `https://menspostdivorcecoaching.com/go/yt-channel`
  - *Destination:* `/` (Home)
  - *Tracks as:* Source: Youtube | Medium: Channel Header
- **Video Description:** `https://menspostdivorcecoaching.com/go/yt-desc`
  - *Destination:* `/join`
  - *Tracks as:* Source: Youtube | Medium: Video Description

### 📧 Email
- **Signature:** `https://menspostdivorcecoaching.com/go/email-sig`
  - *Destination:* `/` (Home)
  - *Tracks as:* Source: Email | Medium: Signature
- **Newsletter:** `https://menspostdivorcecoaching.com/go/newsletter`
  - *Destination:* `/join`
  - *Tracks as:* Source: Email | Medium: Newsletter

### ➕ How to Add More
Ask your dev team (or AI): "Please add a go link for [Platform/Use Case] pointing to [Page]."

### 🛠️ Config File
These links are managed in: `src/pages/go/[slug].astro`
