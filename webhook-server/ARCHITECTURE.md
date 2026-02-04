# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTOMATED ONBOARDING FLOW                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Customer   │
│  Visits Page │
└──────┬───────┘
       │
       │ 1. Enters name + email
       ▼
┌──────────────┐
│ Landing Page │
│  (Your Site) │
└──────┬───────┘
       │
       │ 2. Clicks "Proceed to Checkout"
       ▼
┌──────────────┐
│    Stripe    │
│   Checkout   │
└──────┬───────┘
       │
       │ 3. Pays $97
       ▼
┌──────────────┐
│    Stripe    │
│   Webhook    │◄────────────────┐
└──────┬───────┘                 │
       │                         │
       │ 4. Sends notification   │
       ▼                         │
┌──────────────┐                 │
│ Your Webhook │                 │
│    Server    │                 │
│  (Vercel)    │                 │
└──────┬───────┘                 │
       │                         │
       │ 5. Verifies signature   │
       │ 6. Generates password   │
       │                         │
       ├─────────────────────────┤
       │                         │
       ▼                         ▼
┌──────────────┐         ┌──────────────┐
│   Database   │         │    Resend    │
│ (users.json) │         │    Email     │
└──────────────┘         └──────┬───────┘
                                │
                                │ 7. Sends welcome email
                                ▼
                         ┌──────────────┐
                         │   Customer   │
                         │    Email     │
                         └──────┬───────┘
                                │
                                │ 8. Clicks login link
                                ▼
                         ┌──────────────┐
                         │ Login Page   │
                         │ (Your Site)  │
                         └──────┬───────┘
                                │
                                │ 9. Enters credentials
                                ▼
                         ┌──────────────┐
                         │ Course Page  │
                         │ (Full Access)│
                         └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         TIME BREAKDOWN                           │
├─────────────────────────────────────────────────────────────────┤
│  Step 1-3: Customer checkout           → ~2 minutes             │
│  Step 4-7: Automated processing        → ~2 seconds             │
│  Step 8-9: Customer login              → ~30 seconds            │
│                                                                  │
│  TOTAL: Customer has access in < 3 minutes from payment         │
│  YOUR EFFORT: 0 minutes (fully automated!)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stripe → Webhook Server:                                       │
│    {                                                             │
│      "type": "checkout.session.completed",                      │
│      "data": {                                                   │
│        "customer_email": "john@example.com",                    │
│        "customer_name": "John Doe"                              │
│      }                                                           │
│    }                                                             │
│                                                                  │
│  Webhook Server → Database:                                     │
│    {                                                             │
│      "email": "john@example.com",                               │
│      "name": "John Doe",                                        │
│      "password": "hashed_TempPass2024!",                        │
│      "createdAt": "2024-01-15T10:30:00Z"                        │
│    }                                                             │
│                                                                  │
│  Webhook Server → Email Service:                                │
│    {                                                             │
│      "to": "john@example.com",                                  │
│      "subject": "Welcome! Your Login Credentials",              │
│      "html": "<beautiful_email_template>",                      │
│      "from": "hello@menspostdivorcecoaching.com"                │
│    }                                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY FEATURES                           │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Stripe signature verification (prevents fake webhooks)      │
│  ✅ Password hashing (SHA-256)                                  │
│  ✅ HTTPS only (encrypted communication)                        │
│  ✅ Environment variables (secrets not in code)                 │
│  ✅ Vercel security headers (XSS protection)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. **Stripe Webhook**
- Sends instant notification when payment succeeds
- Includes customer email and name
- Cryptographically signed for security

### 2. **Webhook Server (Vercel)**
- Receives and verifies webhook
- Creates user account
- Generates secure password
- Triggers email

### 3. **Email Service (Resend)**
- Sends professional welcome email
- Includes login credentials
- Delivered in < 2 seconds

### 4. **Database (users.json)**
- Stores user accounts
- Simple JSON file (upgradeable to Supabase later)
- Automatic creation

## Monitoring Points

1. **Stripe Dashboard** → See all webhook events
2. **Vercel Logs** → See webhook processing
3. **Resend Dashboard** → See email delivery
4. **users.json** → See all created accounts
