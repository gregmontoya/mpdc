# 🚀 Stripe Webhook Setup Guide
## Men's Divorce Mindset System - Automated User Onboarding

This guide will help you deploy your webhook server and automate the entire post-purchase flow.

---

## 📋 What This Does

When a customer pays via Stripe:
1. ✅ Stripe sends payment notification to your webhook
2. ✅ Webhook automatically creates user account
3. ✅ Generates secure temporary password
4. ✅ Sends welcome email with login credentials
5. ✅ Customer gets instant access

**Total time:** < 2 seconds after payment ⚡

---

## 🛠️ Setup Steps

### **Step 1: Sign Up for Free Services** (5 minutes)

#### A. Vercel (Free Hosting)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. No credit card required!

#### B. Resend (Free Email Service)
1. Go to [resend.com](https://resend.com)
2. Sign up (free 3,000 emails/month)
3. Get your API key from dashboard
4. **Save this key** - you'll need it later

---

### **Step 2: Deploy to Vercel** (5 minutes)

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to webhook folder
cd /Users/gregmontoya/Documents/Workspaces/MPDC-New-Website/webhook-server

# Install dependencies
npm install

# Deploy to Vercel
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: mpdc-webhook
# - Directory: ./ (current)
# - Deploy? Yes
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git Repository
3. Select `webhook-server` folder
4. Click "Deploy"

**You'll get a URL like:** `https://mpdc-webhook.vercel.app`

---

### **Step 3: Set Environment Variables** (3 minutes)

In Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these two variables:

**Variable 1:**
- **Name:** `STRIPE_WEBHOOK_SECRET`
- **Value:** (Get this from Stripe in Step 4)

**Variable 2:**
- **Name:** `RESEND_API_KEY`
- **Value:** (Your Resend API key from Step 1)

3. Click "Save"
4. Redeploy your project

---

### **Step 4: Configure Stripe Webhook** (5 minutes)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to: **Developers → Webhooks**
3. Click **"Add endpoint"**

**Endpoint URL:**
```
https://mpdc-webhook.vercel.app/webhook
```

**Events to listen for:**
- Select: `checkout.session.completed`

4. Click **"Add endpoint"**
5. Click on your new webhook
6. Copy the **"Signing secret"** (starts with `whsec_`)
7. Add this to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

### **Step 5: Test in Stripe Test Mode** (5 minutes)

1. In Stripe, make sure you're in **Test Mode** (toggle in top right)
2. Create a test Payment Link:
   - Products → Add Product
   - Name: "Men's Divorce Mindset System"
   - Price: $97
   - Create Payment Link
3. Copy the test link
4. Make a test purchase using card: `4242 4242 4242 4242`
5. Check your email - you should receive welcome email!

---

### **Step 6: Update Your Landing Page** (2 minutes)

Update the Stripe URL in your `main.js`:

```javascript
// Replace this line:
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_XXXXXXXXXX';

// With your actual Stripe Payment Link:
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/YOUR_ACTUAL_LINK';
```

**Uncomment the redirect:**
```javascript
// Remove the comment slashes:
window.location.href = `${STRIPE_CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`;
```

---

## 🎯 Going Live

### **Step 1: Switch Stripe to Live Mode**
1. Toggle "Test Mode" OFF in Stripe Dashboard
2. Create a new Payment Link (same as before, but in Live Mode)
3. Update `STRIPE_CHECKOUT_URL` in `main.js` with live link

### **Step 2: Add Live Webhook**
1. In Stripe Dashboard (Live Mode)
2. Developers → Webhooks → Add endpoint
3. Use same URL: `https://mpdc-webhook.vercel.app/webhook`
4. Get new signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel

### **Step 3: Verify Domain for Resend**
1. Go to Resend Dashboard → Domains
2. Add your domain: `menspostdivorcecoaching.com`
3. Add DNS records (they'll show you exactly what to add)
4. Update email "from" address in `index.js`:
   ```javascript
   from: 'Greg <hello@menspostdivorcecoaching.com>'
   ```

---

## 🧪 Testing Checklist

Before going live, test:

- [ ] Test purchase in Stripe Test Mode
- [ ] Verify email arrives (check spam folder)
- [ ] Verify login credentials work
- [ ] Check user is added to database
- [ ] Test with different email addresses
- [ ] Verify webhook shows "Success" in Stripe Dashboard

---

## 📊 Monitoring

### Check Webhook Logs:
1. Vercel Dashboard → Your Project → Logs
2. See real-time webhook activity

### Check Stripe Webhook Status:
1. Stripe Dashboard → Developers → Webhooks
2. Click your webhook → View events
3. See success/failure for each payment

---

## 🔧 Troubleshooting

### Email Not Sending?
- Check Resend API key is correct
- Verify domain is verified in Resend
- Check Vercel logs for errors

### Webhook Not Receiving Events?
- Verify webhook URL is correct in Stripe
- Check `STRIPE_WEBHOOK_SECRET` matches
- Ensure Vercel deployment succeeded

### User Not Created?
- Check Vercel logs for errors
- Verify `users.json` file exists
- Check file permissions

---

## 💾 User Database

Users are stored in `users.json`:

```json
{
  "users": [
    {
      "email": "customer@example.com",
      "name": "John Doe",
      "password": "hashed_password_here",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### To View Users:
```bash
cat /Users/gregmontoya/Documents/Workspaces/MPDC-New-Website/webhook-server/users.json
```

---

## 🚀 Next Steps (Optional Upgrades)

### 1. Upgrade to Real Database
- Use Supabase (free tier)
- More scalable than JSON file
- Built-in authentication

### 2. Add Password Reset
- Email link to reset password
- Secure token-based system

### 3. Add Email Sequences
- Day 1: Welcome email
- Day 3: Check-in email
- Day 7: Completion reminder

### 4. Add Analytics
- Track email open rates
- Monitor login activity
- Measure course completion

---

## 📞 Support

If you run into issues:
1. Check Vercel logs first
2. Check Stripe webhook events
3. Verify all environment variables are set
4. Test with Stripe test mode first

---

## 🎉 You're Done!

Your automated onboarding system is now live!

**What happens now:**
1. Customer pays → Instant welcome email
2. Customer logs in → Instant access
3. You do nothing → It's all automatic!

**Congratulations!** You now have the same professional system that billion-dollar companies use. 🚀
