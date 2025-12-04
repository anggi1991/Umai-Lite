# 📧 Email & SMTP Setup - Parenting AI

Complete guide for configuring production-grade email delivery using Resend or Amazon SES.

**Status:** Production-ready  
**Last Updated:** November 2025  
**Source:** Consolidated from RESEND_SMTP_SETUP.md, SETUP_NATURA_ID_EMAIL.md, DNS_RECORDS_QUICK_COPY.md

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Option 1: Resend (Recommended)](#option-1-resend-recommended)
3. [Option 2: Amazon SES](#option-2-amazon-ses)
4. [Supabase SMTP Configuration](#supabase-smtp-configuration)
5. [DNS Records Quick Reference](#dns-records-quick-reference)
6. [Testing & Verification](#testing--verification)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Why Use Dedicated SMTP Service?

Replace Supabase built-in SMTP with dedicated service for better deliverability:

| Feature | Supabase Default | Resend/SES |
|---------|------------------|------------|
| Inbox Rate | ~60-70% | 99%+ |
| Analytics | None | Open/click tracking |
| Spam Prevention | Basic | DKIM/SPF/DMARC |
| Free Tier | Limited | 3,000/month (Resend)<br>62,000/month (SES) |
| Templates | Basic | Advanced (React Email) |

### Which Service to Choose?

| Service | Best For | Free Tier | Pros | Cons |
|---------|----------|-----------|------|------|
| **Resend** | Startups, MVP | 3,000 emails/month | Easy setup, great DX, React Email support | Limited free tier |
| **Amazon SES** | Enterprise, Scale | 62,000 emails/month (first year) | Massive scale, AWS integration | Complex setup, learning curve |

**Recommendation:** Start with **Resend** for MVP, migrate to SES if you need scale.

---

## 🚀 Option 1: Resend (Recommended)

### Prerequisites

- [ ] Custom domain access (e.g., `umai.naturaerp.id`)
- [ ] DNS management access (Cloudflare, Namecheap, etc.)
- [ ] Supabase project admin access
- [ ] Resend account (free)

### Step 1: Create Resend Account

1. Visit [resend.com](https://resend.com)
2. Click **"Start Building"**
3. Sign up with GitHub (recommended) or email
4. Verify email address

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- React Email support
- Unlimited team members

### Step 2: Add Domain to Resend

#### Using Subdomain: `umai.naturaerp.id`

1. Navigate to [Resend Dashboard → Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter: `umai.naturaerp.id`
4. Click **"Add"**

**Domain Options:**
- ✅ **Subdomain** (e.g., `umai.naturaerp.id`) - Recommended for MVP
- ⚠️ **Root domain** (e.g., `naturaerp.id`) - Affects parent domain emails

### Step 3: Configure DNS Records (Resend)

Resend will provide **3 required DNS records**:

#### Record 1: SPF (Sender Policy Framework)

```
Type: TXT
Name: umai.naturaerp.id (or @)
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

**Purpose:** Prevents email spoofing, authorizes Resend to send on your behalf.

#### Record 2: DKIM (DomainKeys Identified Mail)

```
Type: TXT
Name: resend._domainkey.umai.naturaerp.id
Value: p=MIIB... (copy from Resend dashboard)
TTL: 3600
```

**Purpose:** Cryptographic signature proving email authenticity.

⚠️ **Important:** Copy the EXACT DKIM value from Resend dashboard (starts with `p=MIIB...`, usually 300+ characters).

#### Record 3: DMARC (Domain-based Message Authentication)

```
Type: TXT
Name: _dmarc.umai.naturaerp.id
Value: v=DMARC1; p=none; rua=mailto:dmarc@umai.naturaerp.id
TTL: 3600
```

**Purpose:** Email authentication policy and reporting.

**DMARC Policies:**
- `p=none` - Monitor only (recommended for testing)
- `p=quarantine` - Move suspicious emails to spam
- `p=reject` - Block suspicious emails (production)

### Step 4: Add DNS Records to Your DNS Provider

#### For Cloudflare:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select domain: `naturaerp.id`
3. Navigate to **DNS** → **Records**
4. Click **"Add record"** for each record above
5. Save changes

#### For Namecheap:

1. Go to [Namecheap Dashboard](https://ap.www.namecheap.com/)
2. Select domain: `naturaerp.id`
3. Navigate to **Advanced DNS**
4. Click **"Add New Record"**
5. Add all 3 records
6. Save changes

#### For GoDaddy:

1. Go to [GoDaddy DNS Management](https://dcc.godaddy.com/)
2. Select domain: `naturaerp.id`
3. Click **"Add"** for each DNS record
4. Save changes

### Step 5: Verify Domain in Resend

1. Return to **Resend Dashboard** → **Domains**
2. Click **"Verify"** next to `umai.naturaerp.id`
3. Wait for DNS propagation (5-30 minutes)
4. Status should change to **"Verified"** ✅

**DNS Propagation Check:**
```bash
# Check SPF record
dig TXT umai.naturaerp.id

# Check DKIM record
dig TXT resend._domainkey.umai.naturaerp.id

# Check DMARC record
dig TXT _dmarc.umai.naturaerp.id
```

### Step 6: Create API Key

1. **Resend Dashboard** → **API Keys**
2. Click **"Create API Key"**
3. Name: `Parenting AI - Production`
4. Permissions: **"Sending access"**
5. Click **"Create"**
6. **Copy the API key** (starts with `re_...`)

⚠️ **Important:** Save this key securely. You won't be able to see it again.

### Step 7: Configure Supabase (Resend)

See [Supabase SMTP Configuration](#supabase-smtp-configuration) section below.

---

## 🔧 Option 2: Amazon SES

### Prerequisites

- [ ] AWS account
- [ ] Domain access (`naturaerp.id`)
- [ ] DNS management access
- [ ] Supabase project admin access

### Step 1: Create AWS Account & Enable SES

1. Sign up at [aws.amazon.com](https://aws.amazon.com/)
2. Navigate to **Amazon SES** console
3. Select region: **Tokyo (ap-northeast-1)** (closest to Indonesia)
4. Click **"Verify a New Domain"**

### Step 2: Verify Domain in SES

1. Enter domain: `send.umai.naturaerp.id` (subdomain recommended)
2. Check **"Generate DKIM Settings"**
3. Click **"Verify This Domain"**
4. AWS will provide **4 DNS records**

### Step 3: Configure DNS Records (Amazon SES)

#### Record 1: DKIM (Domain Verification)

```
Type: TXT
Name: resend._domainkey.umai
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCyMCXLUnvz7G64X0lNTWO0fbA9oiElKpM+J5x3sLLTIlQ/PgN35gR3tLH7ykT7iCzsqZLAeazu1swdsHQwFxz2cEHk2SWAuAOgppM9425fPLJMgij2fsONaS48FNnN7wHh17GUg0XTiheqF4IlxDkCnaxfsXvRDHAX4rm4D4ssCQIDAQAB
TTL: 3600
```

#### Record 2: SPF (Sender Policy Framework)

```
Type: TXT
Name: send.umai
Value: v=spf1 include:amazonses.com ~all
TTL: 3600
```

#### Record 3: MX (Mail Exchange)

```
Type: MX
Name: send.umai
Value: feedback-smtp.ap-northeast-1.amazonses.com
Priority: 10
TTL: 3600
```

#### Record 4: DMARC (Optional, Recommended)

```
Type: TXT
Name: _dmarc.umai
Value: v=DMARC1; p=none;
TTL: 3600
```

### Step 4: Request Production Access (SES)

By default, SES starts in **Sandbox Mode** (limited to 200 emails/day, verified recipients only).

To enable production sending:

1. **SES Console** → **Account Dashboard**
2. Click **"Request Production Access"**
3. Fill out use case form:
   - **Use case:** Transactional emails (user verification, password reset)
   - **Website URL:** https://parentingai.app
   - **Expected volume:** 1,000 emails/month
   - **Bounce/complaint handling:** Automated removal from list
4. Submit request
5. Wait for approval (typically 24-48 hours)

### Step 5: Create SMTP Credentials

1. **SES Console** → **SMTP Settings**
2. Click **"Create My SMTP Credentials"**
3. IAM User Name: `ses-smtp-user-parentingai`
4. Click **"Create"**
5. **Download credentials** (username + password)

### Step 6: Configure Supabase (SES)

See [Supabase SMTP Configuration](#supabase-smtp-configuration) section below.

---

## 🔌 Supabase SMTP Configuration

### Using Resend

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: **Parenting AI**
3. Navigate to **Settings** → **Auth** → **SMTP Settings**
4. Configure:

```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: re_... (your Resend API key)

From Email: noreply@umai.naturaerp.id
From Name: Umai - Parenting AI

Enable STARTTLS: ✅ ON
```

5. Click **"Save"**

### Using Amazon SES

1. Same navigation as above
2. Configure:

```
Enable Custom SMTP: ✅ ON

SMTP Host: email-smtp.ap-northeast-1.amazonaws.com
SMTP Port: 587
SMTP User: [SES SMTP username from Step 5]
SMTP Password: [SES SMTP password from Step 5]

From Email: noreply@send.umai.naturaerp.id
From Name: Umai - Parenting AI

Enable STARTTLS: ✅ ON
```

3. Click **"Save"**

---

## 📋 DNS Records Quick Reference

### Resend: `umai.naturaerp.id`

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `umai.naturaerp.id` | `v=spf1 include:_spf.resend.com ~all` | SPF |
| TXT | `resend._domainkey.umai.naturaerp.id` | `p=MIIB...` (from Resend) | DKIM |
| TXT | `_dmarc.umai.naturaerp.id` | `v=DMARC1; p=none; rua=mailto:dmarc@umai.naturaerp.id` | DMARC |

### Amazon SES: `send.umai.naturaerp.id`

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `send.umai` | `v=spf1 include:amazonses.com ~all` | SPF |
| TXT | `resend._domainkey.umai` | `p=MIGf...` (from SES) | DKIM |
| MX | `send.umai` | `feedback-smtp.ap-northeast-1.amazonses.com` (Priority: 10) | MX |
| TXT | `_dmarc.umai` | `v=DMARC1; p=none;` | DMARC |

---

## ✅ Testing & Verification

### Test Email Send (Supabase Auth)

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Invite User"**
3. Enter test email address
4. Click **"Send Invitation"**
5. Check inbox for email

**Expected Result:**
- Email received within 1-2 minutes
- From: `noreply@umai.naturaerp.id` (or `send.umai.naturaerp.id`)
- Not in spam folder

### Verify DNS Propagation

```bash
# Check SPF (Resend)
dig TXT umai.naturaerp.id +short
# Expected: "v=spf1 include:_spf.resend.com ~all"

# Check DKIM (Resend)
dig TXT resend._domainkey.umai.naturaerp.id +short
# Expected: Long string starting with "p=MIIB..."

# Check DMARC (Resend)
dig TXT _dmarc.umai.naturaerp.id +short
# Expected: "v=DMARC1; p=none; rua=mailto:..."

# For SES, replace subdomain accordingly
```

### Test with Mail Tester

1. Go to [mail-tester.com](https://www.mail-tester.com/)
2. Copy the test email address shown
3. Send email from Supabase to that address
4. Return to mail-tester.com and click **"Then check your score"**
5. **Target:** 9/10 or 10/10 score

**Common Issues:**
- Score < 7: Missing DKIM/SPF records
- Score < 9: Missing DMARC or reverse DNS

---

## 🐛 Troubleshooting

### Issue 1: Domain Not Verified (Resend)

**Symptom:** Status stuck on "Pending" after 30+ minutes

**Solutions:**
1. Check DNS records are correct (no typos)
2. Wait longer (DNS propagation can take up to 48 hours)
3. Use `dig` command to verify records propagated
4. Clear DNS cache: `sudo dscacheutil -flushcache` (Mac) or `ipconfig /flushdns` (Windows)

### Issue 2: Emails Going to Spam

**Causes:**
- Missing or incorrect DKIM/SPF records
- No DMARC policy
- "From" domain doesn't match sending domain
- Poor sender reputation (new domain)

**Solutions:**
1. Verify all DNS records are correct
2. Update DMARC policy to `p=quarantine` (after testing)
3. Ensure "From Email" matches verified domain
4. Request recipients to whitelist your domain
5. Warm up domain (start with low volume, increase gradually)

### Issue 3: SMTP Connection Failed

**Symptom:** Supabase shows "Failed to connect to SMTP server"

**Solutions:**
1. Verify SMTP credentials are correct
2. Check SMTP host and port:
   - Resend: `smtp.resend.com:587`
   - SES: `email-smtp.ap-northeast-1.amazonaws.com:587`
3. Ensure STARTTLS is enabled
4. Try port 465 (SSL) instead of 587 (TLS)
5. Check firewall rules (if self-hosting Supabase)

### Issue 4: SES Still in Sandbox Mode

**Symptom:** Can only send to verified email addresses

**Solutions:**
1. Submit "Request Production Access" form (see Step 4 above)
2. Provide detailed use case (transactional emails, not marketing)
3. Include website URL and estimated volume
4. Explain bounce/complaint handling process
5. Wait for AWS approval (24-48 hours)

### Issue 5: DNS Records Not Propagating

**Symptom:** `dig` command returns no results after 1+ hour

**Solutions:**
1. Verify records added to correct DNS zone (parent domain)
2. Check for typos in record names and values
3. Use online DNS checker: [dnschecker.org](https://dnschecker.org/)
4. Wait longer (can take up to 48 hours in rare cases)
5. Contact DNS provider support if still failing

---

## 📊 Monitoring & Analytics

### Resend Dashboard

Track email performance:
- **Emails sent** (daily/weekly/monthly)
- **Delivery rate** (bounces, rejections)
- **Open rate** (if tracking enabled)
- **Click rate** (if links tracked)
- **Spam complaints**

### Amazon SES Console

Monitor sending activity:
- **Sending Statistics** (delivery, bounces, complaints)
- **Reputation Dashboard** (sender score)
- **Suppression List** (bounced/complained emails)
- **CloudWatch Metrics** (detailed logs)

### Supabase Email Logs

1. **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Filter by: `email_send`
3. Check for errors or failed deliveries

---

## 🔐 Security Best Practices

### Protect SMTP Credentials

```bash
# Store in environment variables (never commit to Git)
RESEND_API_KEY=re_...
SES_SMTP_USERNAME=AKIA...
SES_SMTP_PASSWORD=...

# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### Rotate API Keys Regularly

- **Resend:** Create new API key every 6-12 months
- **SES:** Rotate IAM credentials annually
- **Supabase:** Update SMTP settings with new credentials

### Monitor for Abuse

- Set up bounce/complaint notifications
- Monitor sending rate for unusual spikes
- Remove bounced emails from mailing list
- Implement rate limiting (100 emails/hour max for MVP)

---

## 📚 Resources

### Official Documentation

- [Resend Documentation](https://resend.com/docs)
- [Amazon SES Documentation](https://docs.aws.amazon.com/ses/)
- [Supabase Auth Email](https://supabase.com/docs/guides/auth/auth-email)
- [SPF, DKIM, DMARC Explained](https://www.cloudflare.com/learning/email-security/)

### Tools

- [Mail Tester](https://www.mail-tester.com/) - Test email deliverability
- [MXToolbox](https://mxtoolbox.com/) - DNS and email diagnostics
- [DNS Checker](https://dnschecker.org/) - Verify DNS propagation
- [React Email](https://react.email/) - Build email templates with React

---

## ✅ Setup Checklist

### Resend Setup
- [ ] Resend account created (free tier)
- [ ] Domain added: `umai.naturaerp.id`
- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] DNS propagation verified (dig commands)
- [ ] Domain verified in Resend dashboard ✅
- [ ] API key created and saved securely
- [ ] Supabase SMTP configured with Resend
- [ ] Test email sent and received (not in spam)
- [ ] Mail Tester score: 9/10 or 10/10

### Amazon SES Setup (Alternative)
- [ ] AWS account created
- [ ] SES enabled in Tokyo region (ap-northeast-1)
- [ ] Domain verified: `send.umai.naturaerp.id`
- [ ] DNS records added (DKIM, SPF, MX, DMARC)
- [ ] Production access requested and approved
- [ ] SMTP credentials created
- [ ] Supabase SMTP configured with SES
- [ ] Test email sent and received
- [ ] Bounce/complaint handling configured

---

**Created:** November 2025  
**Status:** ✅ Production-ready  
**Merged From:**
- `RESEND_SMTP_SETUP.md` (411 lines)
- `SETUP_NATURA_ID_EMAIL.md` (355 lines)
- `DNS_RECORDS_QUICK_COPY.md` (301 lines)
