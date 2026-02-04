# 🚀 GO LIVE CHECKLIST

Congratulation on building your automated sales machine! To switch from **Test Mode** to **Real Money**, follow these exact steps.

## 1. Stripe: Switch to Live Mode
1. Log into [dashboard.stripe.com](https://dashboard.stripe.com).
2. Toggle the **"Test Mode"** switch (top right) to **OFF**.
   - *It might ask for your business details/bank info if you haven't activated your account yet.*

## 2. Generate LIVE Payment Link
1. Go to **Product Catalog** -> Select your Course Product.
2. Click **"Create Payment Link"**.
3. Configure it (Price: $97).
4. **Copy the URL** (It will look similar to the test one, but it's for real money).
5. **Save this URL.** You will need to give it to me to update your website.

## 3. Configure LIVE Webhooks
1. Go to **Developers** -> **Webhooks**.
2. Click **"+ Add Endpoint"**.
3. **Endpoint URL:** `https://webhook-server-xi-nine.vercel.app/webhook`
4. **Select Events:** `checkout.session.completed`
5. Click **"Add endpoint"**.
6. **Reveal Signing Secret** (starts with `whsec_...`).
7. **Copy this Secret.**

## 4. Update Vercel (The Server)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select `webhook-server` -> **Settings** -> **Environment Variables**.
3. Find `STRIPE_WEBHOOK_SECRET`.
4. Click the **three dots** -> **Edit**.
5. **Paste the NEW Live Signing Secret**.
6. Click **Save**.
7. **IMPORTANT:** Go to **Deployments** tab -> Click latest deployment (three dots) -> **Redeploy**.

## 5. Update Website (The Frontend)
*This is the only code change needed.*
1. Send me the **LIVE Payment Link** you generated in Step 2.
2. I will update `main.js` to use this real link instead of the test link.

---

### ✅ Post-Launch Test
1. Open your live website.
2. Click the button.
3. Verify it goes to the Stripe Checkout page (Live mode won't have the orange banner).
4. **Ideally:** Run a real transaction with your own credit card to verify the full flow (you can refund yourself later).
