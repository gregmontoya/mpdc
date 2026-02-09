# Stripe Checkout Integration Guide
## Men's Divorce Mindset System - Payment Setup

This guide will walk you through setting up Stripe Checkout for your landing page.

---

## 🎯 What We Built

You now have a **hybrid checkout flow**:
1. ✅ Customer enters name & email on your landing page
2. ✅ Customer clicks "Proceed to Secure Checkout"
3. ✅ Customer is redirected to **Stripe's hosted checkout page**
4. ✅ After payment, customer returns to your **success page**

---

## 📋 Setup Steps

### Step 1: Create a Stripe Account (if you don't have one)

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" and create an account
3. Complete the onboarding process

---

### Step 2: Create a Payment Link in Stripe

#### Option A: Using Payment Links (Easiest - Recommended)

1. **Log into your Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)

2. **Navigate to Payment Links**:
   - Click "More+" in the left sidebar
   - Select "Payment Links"
   - Click "New" or "+ Create payment link"

3. **Configure Your Product**:
   - **Name**: Men's Divorce Mindset System
   - **Price**: $97.00 USD
   - **Type**: One-time payment
   - **Description**: Comprehensive 6-module system to rebuild your life after divorce

4. **Customize the Checkout**:
   - **Collect customer information**: Enable "Email" (required)
   - **After payment**: Set redirect to `https://yourdomain.com/success.html`
   - **Allow promotion codes**: Optional (enable if you want to offer discounts)

5. **Create the Link**:
   - Click "Create link"
   - Copy the generated URL (it will look like: `https://buy.stripe.com/XXXXXXXXXX`)

6. **Update Your Code**:
   - Open `main.js`
   - Find line ~110: `const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_XXXXXXXXXX';`
   - Replace with your actual Payment Link URL
   - Uncomment line ~117: `// window.location.href = ...`

---

#### Option B: Using Checkout Sessions (More Control)

If you want more customization, you'll need to set up Checkout Sessions with a backend:

1. **Create a Product in Stripe**:
   - Go to Products → Add product
   - Name: Men's Divorce Mindset System
   - Price: $97.00 (one-time)

2. **Set up a backend endpoint** (Node.js example):

```javascript
// server.js (Node.js + Express example)
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');
const express = require('express');
const app = express();

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: 'price_XXXXXXXXXX', // Your Price ID from Stripe
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'https://yourdomain.com/success.html?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://yourdomain.com/index.html',
    customer_email: req.body.email,
  });

  res.json({ url: session.url });
});

app.listen(3000);
```

3. **Update your frontend** to call this endpoint instead of redirecting directly.

---

### Step 3: Test Your Integration

#### Test Mode (Use Test Cards)

Stripe starts in **Test Mode** by default. Use these test cards:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

**Expiry**: Any future date (e.g., 12/34)  
**CVC**: Any 3 digits (e.g., 123)  
**ZIP**: Any 5 digits (e.g., 12345)

#### Testing Steps:

1. Open `index.html` in your browser
2. Scroll to a checkout form
3. Enter test name and email
4. Click "Proceed to Secure Checkout"
5. You should be redirected to Stripe
6. Use test card `4242 4242 4242 4242`
7. Complete the payment
8. You should land on `success.html`

---

### Step 4: Go Live

Once testing is complete:

1. **Complete Stripe Account Setup**:
   - Verify your business information
   - Add bank account for payouts
   - Complete tax forms

2. **Switch to Live Mode**:
   - Toggle from "Test mode" to "Live mode" in Stripe Dashboard
   - Create a **new Payment Link** in Live mode
   - Update `STRIPE_CHECKOUT_URL` in `main.js` with the live link

3. **Update Success Page URL**:
   - In your Stripe Payment Link settings
   - Set the success URL to your actual domain: `https://yourdomain.com/success.html`

---

## 🔧 Configuration Checklist

- [ ] Stripe account created
- [ ] Payment Link created for $97
- [ ] `STRIPE_CHECKOUT_URL` updated in `main.js` (line ~110)
- [ ] Redirect line uncommented in `main.js` (line ~117)
- [ ] Success URL configured in Stripe (points to `success.html`)
- [ ] Tested with test card in Test Mode
- [ ] Switched to Live Mode
- [ ] Live Payment Link created and updated in code

---

## 📧 Email Setup (Optional but Recommended)

Stripe can send receipts automatically, but you may want to send a custom welcome email:

### Option 1: Stripe Email Receipts
- Go to Settings → Emails in Stripe Dashboard
- Customize the receipt email template
- Add your logo and branding

### Option 2: Webhook + Custom Email
Set up a webhook to trigger when payment succeeds:

1. Go to Developers → Webhooks in Stripe
2. Add endpoint: `https://yourdomain.com/webhook`
3. Listen for `checkout.session.completed` event
4. Send custom email with course access details

---

## 🎨 Customization Options

### Prefill Customer Email
The code already prefills the email in Stripe Checkout:
```javascript
window.location.href = `${STRIPE_CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`;
```

### Add Discount Codes
1. In Stripe Dashboard → Products → Coupons
2. Create a coupon (e.g., "LAUNCH50" for 50% off)
3. Enable "Allow promotion codes" in your Payment Link

### Add Upsells
After the main purchase, you can redirect to another product:
- Create a second Payment Link for an upsell product
- Modify `success.html` to show the upsell offer

---

## 🛠️ Troubleshooting

### Issue: Redirect not working
- **Solution**: Make sure you uncommented line 117 in `main.js`

### Issue: "Invalid URL" error
- **Solution**: Verify your Payment Link URL is correct (should start with `https://buy.stripe.com/`)

### Issue: Customer not receiving emails
- **Solution**: Check Stripe Dashboard → Settings → Emails to ensure receipts are enabled

### Issue: Payment succeeds but success page doesn't load
- **Solution**: Check the success URL in your Stripe Payment Link settings

---

## 📊 Tracking & Analytics

### View Payments
- Stripe Dashboard → Payments
- See all successful transactions, refunds, and disputes

### Export Data
- Stripe Dashboard → Payments → Export
- Download CSV of all transactions

### Integrate with Google Analytics
Add this to your `success.html`:
```javascript
// Track conversion in Google Analytics
gtag('event', 'purchase', {
  transaction_id: orderNumber,
  value: 97.00,
  currency: 'USD',
  items: [{
    item_name: 'Men\'s Divorce Mindset System'
  }]
});
```

---

## 🔐 Security Notes

- ✅ Stripe handles all payment processing (PCI compliant)
- ✅ Customer card details never touch your server
- ✅ All transactions are encrypted
- ✅ Stripe provides fraud detection automatically

---

## 💡 Next Steps

1. **Set up your Stripe account** (if not done)
2. **Create your Payment Link**
3. **Update the code** with your Payment Link URL
4. **Test thoroughly** with test cards
5. **Go live** when ready!

---

## 📞 Support

- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **Stripe Docs**: [https://stripe.com/docs/payments/checkout](https://stripe.com/docs/payments/checkout)
- **Payment Links Guide**: [https://stripe.com/docs/payment-links](https://stripe.com/docs/payment-links)

---

**Good luck with your launch! 🚀**
