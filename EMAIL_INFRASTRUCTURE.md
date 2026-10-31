# 📧 MPDC Email Infrastructure Documentation

## 🏗️ The Architecture
The Men's Post Divorce Coaching (MPDC) system uses a "Dual-Lane" email setup to ensure high deliverability and zero conflicts.

### Lane 1: The Personal/Core Inbox (Hostinger)
- **Used for**: Direct emails you send and receive from your personal inbox.
- **Handled by**: Hostinger Mail Servers.
- **DNS Records**: MX records (`mx1.hostinger.com`, `mx2.hostinger.com`).

### Lane 2: The Demand Gen Engine (Resend)
- **Used for**: 5-Day Logic-First Sequence, Lead Alerts, Daily Pulse, and Checkout Credential emails.
- **Handled by**: Resend (Amazon SES backend).
- **DNS Records**: TXT (`resend._domainkey`), MX (`send`), and SPF.

---

## 🛡️ DNS Rules (Do Not Delete)
To prevent the "403 Forbidden" error that stops your automations, the following must remain in Hostinger:

1. **The Combined SPF (Root @)**
   - **Value**: `v=spf1 include:_spf.mail.hostinger.com include:amazonses.com ~all`
   - **Why**: This whitelists both your personal mail AND your automated server. If you only have one, the other will go to spam.

2. **The DKIM Signature (`resend._domainkey`)**
   - **Value**: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQK...`
   - **Why**: Proves to Gmail/Outlook that the automations are legitimate.

3. **The Return-Path (`send`)**
   - **MX Value**: `feedback-smtp.us-east-1.amazonses.com`
   - **TXT Value**: `v=spf1 include:amazonses.com ~all`
   - **Why**: Prevents your automation bounces from hurting your personal email's reputation.

---

## 🚨 Troubleshooting: "Emails Stopped"
If emails stop:
1. **Check Resend Domains**: [https://resend.com/domains](https://resend.com/domains)
2. **Verify Status**: If it says "Pending," click the "Verify" button to force a re-scan.
3. **Check .env.local**: Ensure `RESEND_API_KEY` is current.

*Last Updated: Feb 19, 2026 by Antigravity*
