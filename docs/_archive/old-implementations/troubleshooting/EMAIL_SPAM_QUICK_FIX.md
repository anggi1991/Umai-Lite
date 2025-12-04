# 🚨 Email Masuk Spam - Quick Fix Guide

**Problem**: Test email dari `onboarding@resend.dev` masuk spam folder  
**Cause**: Using shared test domain instead of verified custom domain  
**Solution**: Setup custom domain (15-30 menit)

---

## ✅ Immediate Action Plan

### Option 1: Setup Custom Domain (RECOMMENDED)

**Time**: 30-60 menit  
**Result**: 99% inbox rate, professional sender name

#### Step-by-Step:

**1. Pilih Domain** (5 menit)
- [ ] Sudah punya domain? Use it (e.g., `parentingai.com`)
- [ ] Belum punya? Beli domain baru:
  - **Recommended**: `umai.app` (jika available)
  - **Alternative**: `getumai.com`, `umaiapp.com`, `myumai.app`
  - **Budget options**: Namecheap ($8/year), Porkbun ($7/year), Cloudflare ($9/year)

**2. Add Domain to Resend** (5 menit)
1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter domain: `yourdomain.com`
4. Choose: **Root domain** (recommended) or **Subdomain** (`mail.yourdomain.com`)

**3. Copy DNS Records** (2 menit)
Resend akan kasih 3 DNS records:

```
📋 COPY THESE:

1. SPF Record (TXT)
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all

2. DKIM Record (TXT)
   Name: resend._domainkey
   Value: [LONG STRING FROM RESEND]

3. DMARC Record (TXT)
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

**4. Add DNS Records to Your Domain Provider** (10 menit)

**If using Cloudflare**:
1. Login to Cloudflare dashboard
2. Select your domain
3. Click **DNS** → **Records** → **Add record**
4. Add 3 TXT records (paste values from Resend)
5. Save changes

**If using Namecheap**:
1. Login to Namecheap
2. Domain List → Manage → Advanced DNS
3. Click **"Add New Record"** (3 times)
4. Type: TXT Record
5. Paste values from Resend
6. Save

**If using GoDaddy**:
1. Login to GoDaddy
2. My Products → Domains → DNS
3. Add → TXT
4. Paste values from Resend
5. Save

**5. Verify Domain in Resend** (1-5 menit)
1. Return to Resend dashboard
2. Click **"Verify Domain"**
3. Wait for green checkmark ✅
4. May take 1-60 minutes (DNS propagation)

**Check DNS Propagation**:
```bash
# Check SPF
dig TXT yourdomain.com

# Check DKIM
dig TXT resend._domainkey.yourdomain.com

# Check DMARC
dig TXT _dmarc.yourdomain.com
```

Or use: https://mxtoolbox.com/SuperTool.aspx

**6. Update Supabase SMTP Settings** (5 menit)
1. Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/settings/auth
2. Scroll to **"SMTP Settings"**
3. Click **"Enable Custom SMTP"**
4. Fill in:
   ```
   Host: smtp.resend.com
   Port Number: 587
   Username: resend
   Password: re_BaUTw2dB_6uMeRbpDxAHGCo2gDc2WqWHS
   Sender email: noreply@yourdomain.com
   Sender name: Umai
   ```
5. Click **"Save"**

**7. Test with Real Signup** (2 menit)
```bash
# Test real signup flow
1. Open app in simulator
2. Sign up with NEW email (not used before)
3. Check email inbox (should arrive in 5-30 seconds)
4. Verify email should be in INBOX (not spam)
```

**Expected Result**:
- ✅ Email from "Umai <noreply@yourdomain.com>"
- ✅ Lands in inbox (not spam)
- ✅ DKIM/SPF/DMARC all PASS
- ✅ Spam score: 8/10+ on mail-tester.com

---

### Option 2: Continue with Test Domain (NOT RECOMMENDED)

**Time**: 0 menit (no changes)  
**Result**: Emails will continue going to spam

⚠️ **Consequences**:
- Users won't receive verification emails (stuck in spam)
- No signups will complete
- App unusable in production
- Poor user experience

❌ **DO NOT USE FOR PRODUCTION**

---

## 🔍 Verify Email Deliverability

After custom domain setup, test with **mail-tester.com**:

**Test Steps**:
1. Go to: https://www.mail-tester.com
2. Copy the test email address (e.g., `test-abc123@mail-tester.com`)
3. Update test script:
   ```javascript
   // In scripts/test-resend-email.js, change:
   to: 'test-abc123@mail-tester.com',  // Use mail-tester address
   from: 'noreply@yourdomain.com',     // Use YOUR domain
   ```
4. Run: `node scripts/test-resend-email.js`
5. Click **"Then check your score"** on mail-tester.com
6. **Target**: 8/10 or higher (10/10 is perfect)

**Score Breakdown**:
- 10/10: Perfect - All authentication passed
- 8-9/10: Good - Minor issues (ok for production)
- 6-7/10: Fair - Will reach inbox but some risk
- <6/10: Poor - High chance of spam

**Common Issues**:
- SPF not aligned: Check DNS records
- DKIM failed: Verify DKIM record copied correctly
- DMARC missing: Add DMARC record
- Content spam triggers: Reduce exclamation marks, avoid spam words

---

## 📊 Current Status

- [x] **Resend API Key**: Working (`re_BaUTw2dB_...`)
- [x] **Test Email**: Sent successfully (Email ID: `828b0e09-...`)
- [x] **Delivery**: Delivered (but to spam folder)
- [ ] **Custom Domain**: NOT configured yet
- [ ] **DNS Records**: NOT added yet
- [ ] **Supabase SMTP**: Still using Supabase default
- [ ] **Production Ready**: ❌ NO

**Blocking Issues**:
1. ⚠️ Using test domain → Emails go to spam
2. ⚠️ No custom domain → Can't send production emails
3. ⚠️ Supabase SMTP not updated → Still using poor deliverability

**To Unblock**:
→ **Must complete Option 1** (setup custom domain)

---

## 🎯 Next Steps Priority

### Priority 1: CRITICAL (Must do before testing app)
- [ ] Buy or choose domain (if don't have one)
- [ ] Add domain to Resend
- [ ] Configure DNS records (SPF, DKIM, DMARC)
- [ ] Verify domain in Resend
- [ ] Update Supabase SMTP settings

### Priority 2: IMPORTANT (Before production launch)
- [ ] Test with mail-tester.com (target: 8/10+)
- [ ] Test real signup flow (verify email lands in inbox)
- [ ] Monitor Resend dashboard for delivery metrics
- [ ] Setup domain warmup (gradually increase sending volume)

### Priority 3: RECOMMENDED (Post-launch optimization)
- [ ] Setup Resend webhooks for delivery tracking
- [ ] Create React Email templates for better branding
- [ ] Monitor bounce rates and adjust DMARC policy
- [ ] Setup dedicated IP (if sending >100k emails/month)

---

## 🆘 Need Help?

**Resend Support**:
- Documentation: https://resend.com/docs
- Discord: https://discord.gg/resend
- Email: support@resend.com

**DNS Issues**:
- DNS Checker: https://mxtoolbox.com
- SPF Checker: https://mxtoolbox.com/spf.aspx
- DKIM Checker: https://mxtoolbox.com/dkim.aspx

**Email Testing**:
- Mail Tester: https://www.mail-tester.com
- GlockApps: https://glockapps.com
- Mail Reach: https://www.mailreach.co

---

**⏰ Time Estimate**: 30-60 minutes total for Option 1  
**💰 Cost**: $0 (if using Resend free tier) + domain cost ($8-15/year)  
**🎯 Result**: 99% inbox delivery rate, professional email sender

---

**Status**: ⚠️ ACTION REQUIRED - Cannot proceed to production without custom domain setup
