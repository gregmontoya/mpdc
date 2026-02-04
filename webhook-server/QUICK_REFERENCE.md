# 🚀 QUICK REFERENCE CARD

## Deploy in 5 Steps (20 minutes total)

### 1️⃣ Sign Up (5 min)
```
✅ Vercel.com → Sign up with GitHub
✅ Resend.com → Get API key
```

### 2️⃣ Deploy (5 min)
```bash
npm install -g vercel
cd webhook-server
vercel
```
**You get:** `https://mpdc-webhook.vercel.app`

### 3️⃣ Set Variables (3 min)
```
Vercel → Settings → Environment Variables:
- STRIPE_WEBHOOK_SECRET (from Stripe)
- RESEND_API_KEY (from Resend)
```

### 4️⃣ Configure Stripe (5 min)
```
Stripe → Webhooks → Add endpoint:
URL: https://mpdc-webhook.vercel.app/webhook
Event: checkout.session.completed
```

### 5️⃣ Test (2 min)
```
✅ Make test purchase
✅ Check email arrives
✅ Verify login works
```

---

## Important URLs

| Service | URL |
|---------|-----|
| **Vercel** | https://vercel.com/dashboard |
| **Resend** | https://resend.com/dashboard |
| **Stripe** | https://dashboard.stripe.com/webhooks |

---

## Test Card

```
Card: 4242 4242 4242 4242
Exp: Any future date
CVC: Any 3 digits
```

---

## Troubleshooting

**Email not sending?**
→ Check Resend API key in Vercel

**Webhook not working?**
→ Check Stripe webhook secret matches

**User not created?**
→ Check Vercel logs for errors

---

## Monitoring

**Vercel Logs:**
```
Vercel → Your Project → Logs
```

**Stripe Events:**
```
Stripe → Webhooks → Your Webhook → Events
```

**Email Delivery:**
```
Resend → Logs
```

---

## Support Files

📖 **START_HERE.md** - Overview & next steps  
📖 **DEPLOYMENT_GUIDE.md** - Complete setup guide  
📖 **ARCHITECTURE.md** - System diagram  
📖 **README.md** - Quick reference  

---

## Cost

**Free for first 3,000 customers/month**

After that:
- Vercel: Still free
- Resend: $20/month for 50k emails
- Stripe: Still free

---

## What It Does

```
Customer Pays → Webhook → Create Account → Send Email
                 ↓
              < 2 seconds
                 ↓
         Customer has access!
```

**Your effort:** 0 minutes (automatic!)

---

## Going Live Checklist

- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Stripe webhook configured
- [ ] Tested in test mode
- [ ] Domain verified in Resend
- [ ] Updated landing page Stripe URL
- [ ] Switched Stripe to live mode
- [ ] Added live webhook
- [ ] Final test purchase

---

## Emergency Contacts

**Vercel Support:** https://vercel.com/support  
**Stripe Support:** https://support.stripe.com  
**Resend Support:** hello@resend.com  

---

**You're ready to launch! 🚀**
