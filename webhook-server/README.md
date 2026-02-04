# MPDC Webhook Server

Professional Stripe webhook handler for automated user onboarding.

## Quick Start

```bash
npm install
npm start
```

## What It Does

✅ Receives Stripe payment notifications  
✅ Creates user accounts automatically  
✅ Generates secure passwords  
✅ Sends welcome emails with login credentials  
✅ 100% automated - zero manual work  

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete setup instructions.

## Tech Stack

- **Express.js** - Web server
- **Stripe Webhooks** - Payment notifications
- **Resend** - Email delivery
- **Vercel** - Free hosting

## Files

- `index.js` - Main webhook handler
- `package.json` - Dependencies
- `vercel.json` - Deployment config
- `users.json` - User database (auto-created)
- `DEPLOYMENT_GUIDE.md` - Setup instructions

## Environment Variables

Required:
- `STRIPE_WEBHOOK_SECRET` - From Stripe Dashboard
- `RESEND_API_KEY` - From Resend Dashboard

## Support

Check the deployment guide for troubleshooting steps.
