# 📧 Email Templates - Parenting AI

Template email profesional untuk Supabase Authentication dengan tema Baby Blue & Soft Pink, 100% Bahasa Indonesia.

## 📋 Daftar Template

File ini berisi 6 template email yang siap digunakan:

1. **Confirm Signup** - Email verifikasi saat user mendaftar
2. **Invite User** - Undangan untuk bergabung dengan aplikasi
3. **Magic Link** - Login tanpa password (passwordless)
4. **Change Email** - Konfirmasi perubahan alamat email
5. **Reset Password** - Link untuk reset password
6. **Reauthentication** - Kode OTP untuk verifikasi ulang

## 🎨 Design Theme

- **Primary Color:** Baby Blue (#AEE1F9)
- **Secondary Color:** Soft Pink (#FADADD)
- **Text Color:** Dark Blue Grey (#2C3E50)
- **Style:** Modern gradient dengan emoji maskot
- **Animation:** Subtle hover dan bounce effects
- **Responsive:** Mobile-first design

## 🚀 Cara Install ke Supabase

### Step 1: Login ke Supabase
```
https://app.supabase.com
```

### Step 2: Pilih Project
Pilih project **Parenting AI** Anda

### Step 3: Navigasi ke Email Templates
```
Dashboard → Authentication → Email Templates
```

### Step 4: Copy & Paste
Untuk setiap template:
1. Buka file `SUPABASE_EMAIL_TEMPLATES.md`
2. Copy **Subject** dan **Body** untuk template yang diinginkan
3. Paste ke Supabase Dashboard
4. Klik **Save**

### Step 5: Test
Test setiap template dengan:
- Signup akun baru
- Request password reset
- Request magic link login
- Change email address

## 📁 File Structure

```
supabase/email-templates/
├── README.md                          # File ini - overview dan panduan
├── SUPABASE_EMAIL_TEMPLATES.md        # Template lengkap dengan HTML (6 templates)
├── VISUAL_GUIDE.md                    # Preview visual ASCII art setiap template
├── UPLOAD_MASCOT_GUIDE.md             # Cara upload maskot Baby Buddy ke Supabase
└── BASE64_ALTERNATIVE.md              # Alternative: embed image as base64

MASCOT/
└── Baby Buddy - Ekspresi Senang.png   # Maskot yang digunakan untuk email
```

## ✨ Features

✅ **100% Bahasa Indonesia** - Komunikasi yang jelas dengan user lokal  
✅ **Branded Colors** - Konsisten dengan aplikasi (Baby Blue & Soft Pink)  
✅ **Responsive Design** - Perfect di semua device  
✅ **Security Focused** - Warning jelas tentang keamanan  
✅ **Professional** - Modern gradient design  
✅ **User-Friendly** - CTA button yang jelas dan besar  
✅ **Animated** - Subtle animation untuk engagement  

## 🎯 Template Preview

### 1. Confirm Signup
- Subject: `Selamat Datang di Parenting AI - Verifikasi Email Anda 👶`
- Purpose: Verifikasi email saat user baru mendaftar
- Mascot: **Baby Buddy AI with Halo** (image 120x120px)
- CTA: Button "Verifikasi Email Saya"

### 2. Invite User
- Subject: `🎁 Anda Diundang Bergabung dengan Parenting AI!`
- Purpose: Mengundang user baru ke platform
- CTA: Button "Terima Undangan & Daftar"

### 3. Magic Link
- Subject: `🔐 Link Login Instan Anda - Parenting AI`
- Purpose: Login tanpa password (passwordless authentication)
- CTA: Button "Login Sekarang"

### 4. Change Email
- Subject: `🔄 Konfirmasi Perubahan Email - Parenting AI`
- Purpose: Konfirmasi saat user ingin ganti email
- CTA: Button "Konfirmasi Perubahan Email"

### 5. Reset Password
- Subject: `🔑 Reset Password Akun Parenting AI Anda`
- Purpose: User lupa password dan minta reset
- CTA: Button "Reset Password Sekarang"

### 6. Reauthentication
- Subject: `🔐 Kode Verifikasi Anda - Parenting AI`
- Purpose: Verifikasi ulang untuk aksi sensitif
- Display: 6 digit code dengan style khusus

## 🔧 Customization

### Ganti Warna
Cari dan replace warna berikut di template:
- `#AEE1F9` - Baby Blue (Primary)
- `#FADADD` - Soft Pink (Secondary)
- `#2C3E50` - Dark Text

### Ganti Logo
Replace emoji maskot dengan logo image:
```html
<img src="URL_LOGO_ANDA" alt="Parenting AI" style="width: 64px; height: 64px;">
```

### Update Contact
Update email support di footer:
```html
<a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
```

## 📧 Variables Supabase

Template menggunakan variabel berikut (auto-replace oleh Supabase):

| Variable | Description | Template Usage |
|----------|-------------|----------------|
| `{{ .ConfirmationURL }}` | URL verifikasi/konfirmasi | Semua template (kecuali Reauth) |
| `{{ .Token }}` | Kode OTP 6 digit | Reauthentication only |
| `{{ .Email }}` | Email address user | Semua template |
| `{{ .NewEmail }}` | Email baru | Change Email only |
| `{{ .SiteURL }}` | URL aplikasi | Invite User |

## ✅ Checklist

### Setup:
- [ ] Upload maskot `baby-buddy-mascot.png` ke Supabase Storage (bucket: `assets`)
- [ ] Set bucket sebagai public
- [ ] Test URL maskot di browser
- [ ] Install semua 6 email templates ke Supabase

### Testing:
- [ ] Daftar akun baru → Cek email "Confirm Signup" (verifikasi maskot muncul!)
- [ ] Login dengan magic link → Cek email "Magic Link"
- [ ] Klik "Lupa Password" → Cek email "Reset Password"
- [ ] Ubah email di settings → Cek email "Change Email"
- [ ] Test fitur yang butuh re-auth → Cek email "Reauthentication"
- [ ] Undang user baru → Cek email "Invite User"

Verifikasi di berbagai email client:
- [ ] Gmail Mobile
- [ ] Gmail Desktop
- [ ] Outlook
- [ ] Yahoo Mail
- [ ] Apple Mail (iOS)

## 🛡️ Security Features

Template include:
- ✅ Warning untuk tidak share link/kode
- ✅ Expiry time information (1 jam untuk magic link, 24 jam untuk signup)
- ✅ Instructions untuk report suspicious activity
- ✅ Clear "if you didn't request this" messages
- ✅ Official email disclaimer

## 📞 Support

Jika ada masalah dengan template:
1. Check Supabase logs di Dashboard → Logs
2. Verifikasi variabel template terisi dengan benar
3. Test SMTP settings di Supabase
4. Contact: support_parentingai@gmail.com

## 📝 Version History

- **v1.0** (November 2024)
  - Initial release
  - 6 email templates
  - Baby Blue & Soft Pink theme
  - 100% Bahasa Indonesia
  - Responsive design
  - Security warnings

## 🎨 Brand Guidelines

**Colors:**
- Primary: Baby Blue (#AEE1F9)
- Secondary: Soft Pink (#FADADD)
- Text: Dark Blue Grey (#2C3E50)
- Success: Mint Green (#A8E6CF)
- Warning: Peach (#FFD3B6)
- Error: Light Red (#FFAAA5)

**Mascots:**
- 👶 **Baby Buddy AI** - Primary mascot (cute baby with AI halo) - Used in Confirm Signup
- 🎁 - Gifts/rewards (Invite User)
- 🔐 - Security (Magic Link, Reauthentication)
- 🔑 - Password (Reset Password)
- 📧 - Email (Change Email)
- 🚀 - Action/Launch

**Mascot Image:**
- File: `baby-buddy-mascot.png`
- Size: 120x120px (display), 512x512px (original recommended)
- Location: Supabase Storage `assets` bucket
- URL: `https://gbcxzkgzhylpbmzbymwj.supabase.co/storage/v1/object/public/assets/baby-buddy-mascot.png`

**Typography:**
- Font: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Heading: 28px, Bold (700)
- Subheading: 24px, Bold (700)
- Body: 16px, Regular (400)
- Small: 13px, Regular (400)

---

**Created for Parenting AI** 👶✨  
Made with ❤️ for Indonesian Parents
