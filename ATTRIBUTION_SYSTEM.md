# MPDC Attribution & Tracking System

## Overview
This document outlines the custom attribution tracking system implemented for the Men's Divorce Mindset System. The goal is to capture high-fidelity traffic source data (First-Touch & Last-Touch) and persist it through to conversion events (Checkout & Lead Capture), bypassing common client-side analytics limitations (like iOS14 privacy blocks).

## Architecture

### 1. Client-Side Tracking Engine (`src/lib/attribution.js`)
A lightweight, dependency-free JavaScript library that runs on every page load.

- **Storage**: Uses `localStorage` to persist data across sessions (even if the browser is closed).
- **Triggers**: automatically detects and parses URL parameters (`?utm_source=...`) and `document.referrer`.
- **Data Models**:
  - **First-Touch**: The *very first* time a user ever visited the site. This is locked and never overwritten once set. extremely valuable for knowing "How did they hear about us?"
  - **Last-Touch**: Updates on every subsequent visit if a new traffic source is detected. Valuable for "What triggered the sale today?"

### 2. Captured Data Points
We automatically capture and normalize the following parameters:

| Parameter | Description | Destination |
|Data Point| Description |
|---|---|
| `utm_source` | Traffic Source (e.g. facebook, google, newsletter) | Stripe Metadata, Firebase Lead |
| `utm_medium` | Medium (e.g. cpc, email, social) | Stripe Metadata, Firebase Lead |
| `utm_campaign` | Specific Ad Campaign Name | Stripe Metadata, Firebase Lead |
| `gclid` | Google Click ID (Critical for Offline Conversions) | Stripe Metadata |
| `fbclid` | Facebook Click ID (Critical for CAPI) | Stripe Metadata |
| `referrer` | The URL of the previous page | Stripe Metadata |
| `landing_page` | The first page they landed on in this session | Stripe Metadata |

### 3. Integration Points

#### A. Global Layout (`Layout.astro`)
The tracking script is initialized in the `<head>` of every page. It silently processes URL parameters and updates `localStorage`.

#### B. Checkout Flow (`/join`)
When a user clicks "Proceed to Checkout":
1. The system retrieves the full attribution profile from `localStorage`.
2. This data is attached to the **Firebase Lead Document** (`leads` collection) for CRM usage.
3. This data is passed to the **Stripe Checkout Session** creation API.

#### C. Stripe Integration (`functions/index.js`)
The `createCheckoutSession` backend function receives the attribution data and injects it into the Stripe `metadata` object.
- **Why?** When you view a payment in the Stripe Dashboard, you can expand "Metadata" to see exactly which ad or source drove that specific $49 payment.
- **Limit Handling**: Stripe has a 50-key / 500-char limit for metadata. The system automatically truncates long URLs to prevent errors.

#### D. Email Capture
The Email Popup component also grabs this data. When a user subscribes, their subscriber record in Firestore (`subscribers` collection) includes their original source, allowing you to segment email flows based on where they came from (e.g. "Facebook Leads" vs "Organic Blog Readers").

## How to Use This Data

1. **Stripe Dashboard**: Click on any successful payment -> scroll to "Metadata". You will see `utm_source`, `gclid`, etc.
2. **Ad Platforms**: You can now export your Stripe transaction list (including `gclid`/`fbclid`) and upload it back to Google/Facebook as "Offline Conversions" to train their pixels on *actual revenue*, not just pixel fires.

## Future Expansion
- **Server-Side Tracking (CAPI)**: Since we are capturing `fbclid`, we can now implement a server-side signal to Facebook API directly from the backend, improving ad performance by 20-30%.
- **CRM Reports**: You can build a simple dashboard to show "Revenue by UTM Source" queries in Firestore.
