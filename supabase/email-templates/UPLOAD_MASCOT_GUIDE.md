# 📸 Upload Maskot Baby Buddy ke Supabase Storage

## Langkah Upload Maskot untuk Email Template

### 1️⃣ Siapkan Image Maskot

File image yang Anda berikan:
- **Nama file:** `baby-buddy-mascot.png`
- **Deskripsi:** Baby AI dengan halo di atas kepala, background baby blue
- **Ukuran:** Optimal 512x512px atau 1024x1024px
- **Format:** PNG dengan transparency (recommended)

### 2️⃣ Upload ke Supabase Storage

#### Cara Upload via Supabase Dashboard:

1. **Login ke Supabase Dashboard**
   ```
   https://app.supabase.com
   ```

2. **Pilih Project Parenting AI**
   - Project ID: `gbcxzkgzhylpbmzbymwj`

3. **Buka Storage**
   - Klik menu **Storage** di sidebar kiri
   - Atau akses: https://app.supabase.com/project/gbcxzkgzhylpbmzbymwj/storage/buckets

4. **Create Bucket (jika belum ada)**
   - Klik **New Bucket**
   - Bucket name: `assets`
   - Public bucket: **✅ YES** (centang "Public bucket")
   - Klik **Save**

5. **Upload Image**
   - Klik bucket `assets`
   - Klik **Upload file**
   - Pilih file maskot Anda
   - Rename menjadi: `baby-buddy-mascot.png`
   - Klik **Upload**

6. **Get Public URL**
   - Klik file yang sudah diupload
   - Copy URL public:
   ```
   https://gbcxzkgzhylpbmzbymwj.supabase.co/storage/v1/object/public/assets/baby-buddy-mascot.png
   ```

### 3️⃣ Verifikasi URL

Test URL di browser untuk memastikan image bisa diakses publik:
```
https://gbcxzkgzhylpbmzbymwj.supabase.co/storage/v1/object/public/assets/baby-buddy-mascot.png
```

Jika berhasil, image akan langsung muncul di browser.

---

## 🎨 Alternative: Host di CDN Eksternal

Jika tidak ingin menggunakan Supabase Storage, Anda bisa upload ke:

### Option 1: GitHub (Recommended untuk static assets)
1. Upload ke folder `/MASCOT/` di repo ini
2. Commit dan push
3. Akses via GitHub raw URL:
   ```
   https://raw.githubusercontent.com/razqashop91/parentingAI/main/MASCOT/baby-buddy-mascot.png
   ```

### Option 2: Cloudinary (Free CDN)
1. Daftar di https://cloudinary.com (free tier)
2. Upload image
3. Copy image URL yang digenerate

### Option 3: ImgBB (Simple & Free)
1. Buka https://imgbb.com
2. Upload image (no account needed)
3. Copy direct link

---

## 🔧 Update Email Template dengan URL Final

Setelah upload, update URL di template email:

**File:** `SUPABASE_EMAIL_TEMPLATES.md`

**Cari baris:**
```html
<img src="https://gbcxzkgzhylpbmzbymwj.supabase.co/storage/v1/object/public/assets/baby-buddy-mascot.png" alt="Baby Buddy AI" class="mascot">
```

**Ganti dengan URL final Anda** jika berbeda.

---

## ✅ Checklist

- [ ] Upload image maskot ke Supabase Storage (bucket: `assets`)
- [ ] Set bucket sebagai public
- [ ] Test URL di browser
- [ ] Update URL di email template jika diperlukan
- [ ] Test kirim email untuk verifikasi tampilan
- [ ] Cek di mobile dan desktop email client

---

## 🎯 Recommended Image Specs

**Untuk Email:**
- **Ukuran display:** 120x120px (defined in CSS)
- **Ukuran file original:** 512x512px atau 1024x1024px
- **Format:** PNG with transparency
- **File size:** < 100KB (optimized)
- **Background:** Transparent atau baby blue (#AEE1F9)

**Optimization Tools:**
- TinyPNG: https://tinypng.com (compress PNG)
- Squoosh: https://squoosh.app (Google's image optimizer)

---

## 📧 Email Template yang Menggunakan Maskot

Template yang sudah diupdate dengan maskot image:
- ✅ **Confirm Signup** (Verifikasi Email)

Template lain masih menggunakan emoji, bisa diupdate juga jika diperlukan.

---

## 🚨 Troubleshooting

**Q: Image tidak muncul di email?**
- Pastikan URL bisa diakses publik (buka di browser incognito)
- Pastikan bucket Supabase adalah "public bucket"
- Check email client security settings (beberapa block external images)

**Q: Image terlalu besar/kecil?**
- Adjust `width` dan `height` di CSS:
  ```css
  .header .mascot {
    width: 120px;
    height: 120px;
  }
  ```

**Q: Animation tidak jalan?**
- Some email clients tidak support CSS animation
- Image tetap akan muncul, hanya tidak animated
- Gmail, Outlook modern support animations

---

**Created for Parenting AI** 👶✨  
**Mascot:** Baby Buddy with AI Halo
