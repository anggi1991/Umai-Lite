# Supabase Email Templates - Parenting AI

Template email profesional untuk Parenting AI - Fokus Bahasa Indonesia dengan tema Baby Blue & Soft Pink.

## 📧 Cara Menggunakan

1. Buka Supabase Dashboard → Authentication → Email Templates
2. Copy template di bawah ini ke masing-masing email type
3. Paste ke Subject dan Body yang sesuai
4. Klik Save

---

## 1. Confirm Signup (Konfirmasi Pendaftaran)

### Subject
```
Selamat Datang di Parenting AI - Verifikasi Email Anda 👶
```

### Body
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2C3E50;
      background-color: #F5F5F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(174, 225, 249, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      padding: 40px 20px;
      text-align: center;
    }
    .header .mascot {
      width: 120px;
      height: 120px;
      margin: 0 auto 15px auto;
      display: block;
      animation: wave 2s ease-in-out infinite;
    }
    @keyframes wave {
      0%, 100% { transform: rotate(0deg) translateY(0); }
      25% { transform: rotate(5deg) translateY(-5px); }
      50% { transform: rotate(0deg) translateY(-8px); }
      75% { transform: rotate(-5deg) translateY(-5px); }
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #2C3E50;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #AEE1F9;
      font-size: 24px;
      margin-top: 0;
      font-weight: 700;
    }
    .content p {
      font-size: 16px;
      margin: 15px 0;
      color: #2C3E50;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      margin: 25px 0;
      box-shadow: 0 6px 20px rgba(174, 225, 249, 0.4);
      transition: all 0.3s;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(174, 225, 249, 0.5);
    }
    .welcome-box {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      border-left: 4px solid #AEE1F9;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .welcome-box ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .welcome-box li {
      margin: 8px 0;
    }
    .footer {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #7F8C8D;
    }
    .footer a {
      color: #AEE1F9;
      text-decoration: none;
      font-weight: 600;
    }
    .alternative-link {
      background-color: #F5F5F5;
      padding: 15px;
      border-radius: 8px;
      font-size: 12px;
      color: #7F8C8D;
      word-break: break-all;
      margin-top: 20px;
      border: 1px dashed #E0E0E0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://gbcxzkgzhylpbmzbymwj.supabase.co/storage/v1/object/public/assets/baby-buddy-mascot.png" alt="Baby Buddy AI" class="mascot">
      <h1>Parenting AI</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Teman Setia dalam Perjalanan Parenting Anda</p>
    </div>
    
    <div class="content">
      <h2>🎉 Selamat Datang di Parenting AI!</h2>
      <p>Halo dan terima kasih telah bergabung dengan <strong>Parenting AI</strong>!</p>
      <p>Kami sangat senang bisa membantu Anda dalam perjalanan mengasuh si kecil. Untuk memulai petualangan bersama Baby Buddy, silakan verifikasi alamat email Anda terlebih dahulu.</p>
      
      <div class="welcome-box">
        <strong>✨ Yang akan Anda dapatkan:</strong>
        <ul>
          <li>💬 Chat dengan Baby Buddy AI untuk tips parenting</li>
          <li>📊 Tracking pertumbuhan dan perkembangan anak</li>
          <li>📸 Album foto dan milestone memories</li>
          <li>⏰ Reminder untuk aktivitas penting</li>
          <li>📈 Analisis statistik pertumbuhan</li>
        </ul>
      </div>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">✅ Verifikasi Email Saya</a>
      </center>
      
      <div class="alternative-link">
        <strong>Link alternatif:</strong><br>
        Jika tombol di atas tidak berfungsi, copy dan paste link berikut ke browser Anda:<br>
        <span style="color: #AEE1F9;">{{ .ConfirmationURL }}</span>
      </div>
      
      <p style="margin-top: 25px; font-size: 13px; color: #7F8C8D; text-align: center;">
        <em>⏰ Link ini akan kadaluarsa dalam 24 jam</em>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Parenting AI</strong></p>
      <p style="margin: 5px 0;">© 2024 Parenting AI. All rights reserved.</p>
      <p style="margin: 15px 0;">
        Butuh bantuan? Hubungi kami di<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        Jika Anda tidak mendaftar akun ini, abaikan email ini.<br>
        Email ini dikirim otomatis, mohon tidak membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Invite User (Undangan Pengguna)

### Subject
```
🎁 Anda Diundang Bergabung dengan Parenting AI!
```

### Body
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2C3E50;
      background-color: #F5F5F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(174, 225, 249, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      padding: 40px 20px;
      text-align: center;
    }
    .header .mascot {
      font-size: 64px;
      margin-bottom: 10px;
      animation: bounce 1s ease-in-out infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #2C3E50;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #AEE1F9;
      font-size: 24px;
      margin-top: 0;
      font-weight: 700;
    }
    .content p {
      font-size: 16px;
      margin: 15px 0;
      color: #2C3E50;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      margin: 25px 0;
      box-shadow: 0 6px 20px rgba(174, 225, 249, 0.4);
      transition: all 0.3s;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(174, 225, 249, 0.5);
    }
    .feature-box {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      border-left: 4px solid #FADADD;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .feature-box ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .feature-box li {
      margin: 8px 0;
    }
    .footer {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #7F8C8D;
    }
    .footer a {
      color: #AEE1F9;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="mascot">🎁</div>
      <h1>Parenting AI</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Teman Setia dalam Perjalanan Parenting Anda</p>
    </div>
    
    <div class="content">
      <h2>🎊 Anda Mendapat Undangan Spesial!</h2>
      <p>Halo!</p>
      <p>Seseorang yang peduli dengan Anda telah mengundang Anda untuk bergabung dengan <strong>Parenting AI</strong> - aplikasi teman setia untuk para orang tua!</p>
      
      <div class="feature-box">
        <strong>✨ Apa yang akan Anda dapatkan:</strong>
        <ul>
          <li><strong>💬 Baby Buddy AI Chat</strong> - Tanya jawab seputar parenting kapan saja</li>
          <li><strong>📊 Growth Tracker</strong> - Monitor pertumbuhan dan perkembangan si kecil</li>
          <li><strong>📸 Memory Album</strong> - Simpan momen berharga dalam timeline</li>
          <li><strong>⏰ Smart Reminders</strong> - Pengingat cerdas untuk aktivitas penting</li>
          <li><strong>📈 Analytics</strong> - Analisis statistik dan insight pertumbuhan anak</li>
          <li><strong>🎯 Daily Tips</strong> - Tips parenting harian yang disesuaikan</li>
        </ul>
      </div>
      
      <p>Bergabunglah sekarang dan mulai perjalanan parenting yang lebih mudah dan menyenangkan!</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">🎉 Terima Undangan & Daftar</a>
      </center>
      
      <p style="margin-top: 25px; font-size: 13px; color: #7F8C8D; text-align: center;">
        <em>⏰ Link undangan ini akan kadaluarsa dalam 7 hari</em>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Parenting AI</strong></p>
      <p style="margin: 5px 0;">© 2024 Parenting AI. All rights reserved.</p>
      <p style="margin: 15px 0;">
        Butuh bantuan? Hubungi kami di<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        Email ini dikirim otomatis, mohon tidak membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Magic Link (Login Tanpa Password)

### Subject
```
🔐 Link Login Instan Anda - Parenting AI
```

### Body
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2C3E50;
      background-color: #F5F5F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(174, 225, 249, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      padding: 40px 20px;
      text-align: center;
    }
    .header .mascot {
      font-size: 64px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #2C3E50;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #AEE1F9;
      font-size: 24px;
      margin-top: 0;
      font-weight: 700;
    }
    .content p {
      font-size: 16px;
      margin: 15px 0;
      color: #2C3E50;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      margin: 25px 0;
      box-shadow: 0 6px 20px rgba(174, 225, 249, 0.4);
      transition: all 0.3s;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(174, 225, 249, 0.5);
    }
    .warning-box {
      background-color: #FFF3CD;
      border-left: 4px solid #FFD3B6;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .warning-box ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .warning-box li {
      margin: 8px 0;
    }
    .email-info {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      border: 1px dashed #AEE1F9;
    }
    .footer {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #7F8C8D;
    }
    .footer a {
      color: #AEE1F9;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="mascot">🔐</div>
      <h1>Parenting AI</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Login Cepat & Aman</p>
    </div>
    
    <div class="content">
      <h2>🚀 Magic Link Login Anda Siap!</h2>
      <p>Hai!</p>
      <p>Kami menerima permintaan untuk login ke akun Parenting AI Anda tanpa password. Klik tombol di bawah ini untuk login secara instan:</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">🔓 Login Sekarang</a>
      </center>
      
      <div class="email-info">
        <strong>📧 Email yang akan login:</strong><br>
        <span style="color: #AEE1F9; font-weight: 600;">{{ .Email }}</span>
      </div>
      
      <div class="warning-box">
        <strong>⚠️ Penting - Demi Keamanan Anda:</strong>
        <ul>
          <li>🔒 Link ini <strong>hanya dapat digunakan SEKALI</strong></li>
          <li>⏰ Link akan <strong>kadaluarsa dalam 1 jam</strong></li>
          <li>🚫 <strong>JANGAN BAGIKAN</strong> link ini ke siapapun</li>
          <li>📱 Link ini bersifat rahasia seperti password Anda</li>
        </ul>
      </div>
      
      <p style="margin-top: 25px; font-size: 14px; color: #7F8C8D; background-color: #F5F5F5; padding: 15px; border-radius: 8px; text-align: center;">
        💡 <strong>Tips Keamanan:</strong> Pastikan Anda yang meminta link ini. Jika bukan Anda, segera hubungi kami!
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Parenting AI</strong></p>
      <p style="margin: 5px 0;">© 2024 Parenting AI. All rights reserved.</p>
      <p style="margin: 15px 0;">
        Butuh bantuan? Hubungi kami di<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        Jika Anda tidak meminta login ini, abaikan email ini.<br>
        Email ini dikirim otomatis, mohon tidak membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Change Email Address (Ubah Email)

### Subject
```
🔄 Konfirmasi Perubahan Email - Parenting AI
```

### Body
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2C3E50;
      background-color: #F5F5F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(174, 225, 249, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      padding: 40px 20px;
      text-align: center;
    }
    .header .mascot {
      font-size: 64px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #2C3E50;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #AEE1F9;
      font-size: 24px;
      margin-top: 0;
      font-weight: 700;
    }
    .content p {
      font-size: 16px;
      margin: 15px 0;
      color: #2C3E50;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      margin: 25px 0;
      box-shadow: 0 6px 20px rgba(174, 225, 249, 0.4);
      transition: all 0.3s;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(174, 225, 249, 0.5);
    }
    .email-box {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      border-left: 4px solid #AEE1F9;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .warning-box {
      background-color: #FFAAA5;
      background: linear-gradient(135deg, rgba(255, 170, 165, 0.2) 0%, rgba(255, 211, 182, 0.2) 100%);
      border-left: 4px solid #FFAAA5;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      font-size: 14px;
    }
    .footer {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #7F8C8D;
    }
    .footer a {
      color: #AEE1F9;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="mascot">📧</div>
      <h1>Parenting AI</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Konfirmasi Perubahan Email</p>
    </div>
    
    <div class="content">
      <h2>🔄 Permintaan Perubahan Email</h2>
      <p>Hai!</p>
      <p>Kami menerima permintaan untuk mengubah alamat email yang terdaftar di akun Parenting AI Anda.</p>
      
      <div class="email-box">
        <strong>📋 Detail Perubahan:</strong><br><br>
        <strong>Email Lama:</strong><br>
        <code style="background-color: rgba(174, 225, 249, 0.3); padding: 5px 10px; border-radius: 4px;">{{ .Email }}</code><br><br>
        <strong>⬇️</strong><br><br>
        <strong>Email Baru:</strong><br>
        <code style="background-color: rgba(250, 218, 221, 0.5); padding: 5px 10px; border-radius: 4px;">{{ .NewEmail }}</code>
      </div>
      
      <p>Jika Anda yang meminta perubahan ini, silakan konfirmasi dengan klik tombol di bawah:</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">✅ Konfirmasi Perubahan Email</a>
      </center>
      
      <div class="warning-box">
        <strong>⚠️ PERHATIAN - Jika Anda TIDAK meminta perubahan ini:</strong><br><br>
        <strong>🚨 Akun Anda mungkin telah diakses oleh orang lain!</strong><br><br>
        Segera lakukan:
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Abaikan email ini (JANGAN klik tombol konfirmasi)</li>
          <li>Ganti password akun Anda segera</li>
          <li>Hubungi kami di <a href="mailto:support_parentingai@gmail.com" style="color: #FFAAA5; font-weight: 700;">support_parentingai@gmail.com</a></li>
        </ul>
      </div>
      
      <p style="margin-top: 25px; font-size: 13px; color: #7F8C8D; text-align: center;">
        <em>⏰ Link konfirmasi ini akan kadaluarsa dalam 24 jam</em>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Parenting AI</strong></p>
      <p style="margin: 5px 0;">© 2024 Parenting AI. All rights reserved.</p>
      <p style="margin: 15px 0;">
        Butuh bantuan? Hubungi kami di<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        Email ini dikirim otomatis, mohon tidak membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 5. Reset Password (Reset Password)

### Subject
```
🔑 Reset Password Akun Parenting AI Anda
```

### Body
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2C3E50;
      background-color: #F5F5F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(174, 225, 249, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      padding: 40px 20px;
      text-align: center;
    }
    .header .mascot {
      font-size: 64px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #2C3E50;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #AEE1F9;
      font-size: 24px;
      margin-top: 0;
      font-weight: 700;
    }
    .content p {
      font-size: 16px;
      margin: 15px 0;
      color: #2C3E50;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      margin: 25px 0;
      box-shadow: 0 6px 20px rgba(174, 225, 249, 0.4);
      transition: all 0.3s;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(174, 225, 249, 0.5);
    }
    .security-box {
      background: linear-gradient(135deg, rgba(168, 230, 207, 0.2) 0%, rgba(174, 225, 249, 0.2) 100%);
      border-left: 4px solid #A8E6CF;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .security-box ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .security-box li {
      margin: 8px 0;
    }
    .warning-box {
      background-color: #FFF3CD;
      border-left: 4px solid #FFD3B6;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      font-size: 14px;
    }
    .email-info {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      border: 1px dashed #AEE1F9;
    }
    .footer {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #7F8C8D;
    }
    .footer a {
      color: #AEE1F9;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="mascot">�</div>
      <h1>Parenting AI</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Reset Password Akun</p>
    </div>
    
    <div class="content">
      <h2>🔐 Permintaan Reset Password</h2>
      <p>Hai!</p>
      <p>Kami menerima permintaan untuk mereset password akun Parenting AI Anda. Tidak perlu khawatir, kami akan membantu Anda membuat password baru yang aman.</p>
      
      <p>Klik tombol di bawah untuk membuat password baru:</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">🔑 Reset Password Sekarang</a>
      </center>
      
      <div class="email-info">
        <strong>� Akun untuk reset:</strong><br>
        <span style="color: #AEE1F9; font-weight: 600;">{{ .Email }}</span>
      </div>
      
      <div class="security-box">
        <strong>💡 Tips Membuat Password yang Kuat:</strong>
        <ul>
          <li>🔤 Gunakan kombinasi <strong>huruf besar</strong>, <strong>huruf kecil</strong>, <strong>angka</strong>, dan <strong>simbol</strong></li>
          <li>📏 Minimal <strong>8 karakter</strong> (lebih panjang lebih baik!)</li>
          <li>🔐 Jangan gunakan password yang <strong>sama dengan aplikasi lain</strong></li>
          <li>🚫 Hindari informasi pribadi (nama, tanggal lahir, dll)</li>
          <li>🤫 <strong>JANGAN PERNAH</strong> bagikan password ke siapapun</li>
        </ul>
      </div>
      
      <div class="warning-box">
        <strong>⚠️ Jika Anda TIDAK meminta reset password:</strong><br><br>
        Tenang, password Anda masih aman! Cukup abaikan email ini dan password Anda tidak akan berubah.<br><br>
        Namun jika Anda merasa khawatir tentang keamanan akun, segera hubungi kami di <a href="mailto:support_parentingai@gmail.com" style="color: #FFD3B6; font-weight: 700;">support_parentingai@gmail.com</a>
      </div>
      
      <p style="margin-top: 25px; font-size: 13px; color: #7F8C8D; text-align: center;">
        <em>⏰ Link reset password ini akan kadaluarsa dalam 1 jam</em>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Parenting AI</strong></p>
      <p style="margin: 5px 0;">© 2024 Parenting AI. All rights reserved.</p>
      <p style="margin: 15px 0;">
        Butuh bantuan? Hubungi kami di<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        Email ini dikirim otomatis, mohon tidak membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 6. Reauthentication (Verifikasi Ulang)

### Subject
```
🔐 Kode Verifikasi Anda - Parenting AI
```

### Body
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2C3E50;
      background-color: #F5F5F5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(174, 225, 249, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      padding: 40px 20px;
      text-align: center;
    }
    .header .mascot {
      font-size: 64px;
      margin-bottom: 10px;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #2C3E50;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #AEE1F9;
      font-size: 24px;
      margin-top: 0;
      font-weight: 700;
    }
    .content p {
      font-size: 16px;
      margin: 15px 0;
      color: #2C3E50;
    }
    .code-box {
      background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
      color: #2C3E50;
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 12px;
      padding: 30px 20px;
      margin: 30px 0;
      border-radius: 12px;
      text-align: center;
      font-family: 'Courier New', monospace;
      box-shadow: 0 6px 20px rgba(174, 225, 249, 0.4);
      border: 3px dashed #2C3E50;
    }
    .code-instruction {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #AEE1F9;
    }
    .warning-box {
      background-color: #FFF3CD;
      border-left: 4px solid #FFD3B6;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      font-size: 14px;
    }
    .warning-box ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .warning-box li {
      margin: 8px 0;
    }
    .email-info {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      border: 1px dashed #AEE1F9;
    }
    .footer {
      background: linear-gradient(135deg, rgba(174, 225, 249, 0.1) 0%, rgba(250, 218, 221, 0.1) 100%);
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #7F8C8D;
    }
    .footer a {
      color: #AEE1F9;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="mascot">🔐</div>
      <h1>Parenting AI</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Verifikasi Keamanan</p>
    </div>
    
    <div class="content">
      <h2>🔐 Kode Verifikasi Anda</h2>
      <p>Hai!</p>
      <p>Untuk melanjutkan dan memastikan keamanan akun Anda, masukkan kode verifikasi berikut di aplikasi Parenting AI:</p>
      
      <div class="code-box">
        {{ .Token }}
      </div>
      
      <div class="code-instruction">
        <strong>📱 Cara Menggunakan Kode:</strong><br>
        <p style="margin: 10px 0;">Buka aplikasi Parenting AI → Masukkan 6 digit kode di atas → Klik Verifikasi</p>
      </div>
      
      <div class="email-info">
        <strong>� Akun yang diverifikasi:</strong><br>
        <span style="color: #AEE1F9; font-weight: 600;">{{ .Email }}</span>
      </div>
      
      <div class="warning-box">
        <strong>⚠️ PENTING - Keamanan Kode Verifikasi:</strong>
        <ul>
          <li>⏰ Kode ini akan <strong>kadaluarsa dalam 10 menit</strong></li>
          <li>🔒 Kode ini bersifat <strong>rahasia dan pribadi</strong></li>
          <li>🚫 <strong>JANGAN PERNAH</strong> bagikan kode ini ke siapapun</li>
          <li>📵 Parenting AI <strong>tidak akan pernah</strong> meminta kode ini via telepon, email, atau chat</li>
          <li>🚨 Jika ada yang meminta kode ini, <strong>segera laporkan ke kami!</strong></li>
        </ul>
      </div>
      
      <p style="margin-top: 25px; font-size: 14px; color: #7F8C8D; background-color: #F5F5F5; padding: 15px; border-radius: 8px; text-align: center;">
        💡 <strong>Tip Keamanan:</strong> Pastikan hanya Anda yang melihat kode ini dan segera masukkan di aplikasi sebelum kadaluarsa.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Parenting AI</strong></p>
      <p style="margin: 5px 0;">© 2024 Parenting AI. All rights reserved.</p>
      <p style="margin: 15px 0;">
        Butuh bantuan? Hubungi kami di<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        Jika Anda tidak meminta kode ini, segera hubungi kami.<br>
        Email ini dikirim otomatis, mohon tidak membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 📝 Panduan Implementasi

### 🚀 Cara Setup di Supabase Dashboard:

1. **Login ke Supabase Dashboard** (https://app.supabase.com)
2. **Pilih Project Parenting AI** Anda
3. **Navigasi ke:** Authentication → Email Templates (di sidebar kiri)
4. **Untuk setiap template email:**
   - Klik tab email yang sesuai (Confirm signup, Invite user, dll)
   - Copy **Subject** dari template di atas
   - Paste ke kolom **Subject** di Supabase
   - Copy **Body (HTML)** dari template di atas
   - Paste ke kolom **Message (Body)** di Supabase
   - Klik tombol **Save** di pojok kanan atas
5. **Ulangi untuk semua 6 template email**

### 📧 Variabel Supabase yang Bisa Digunakan:

Variabel ini akan otomatis diganti oleh Supabase:

- `{{ .ConfirmationURL }}` - URL konfirmasi/verifikasi otomatis
- `{{ .Token }}` - Token verifikasi (untuk kode OTP)
- `{{ .TokenHash }}` - Hash dari token
- `{{ .SiteURL }}` - URL website/aplikasi Anda
- `{{ .Email }}` - Email address user yang login
- `{{ .NewEmail }}` - Email baru (khusus untuk change email)
- `{{ .Data }}` - Data tambahan (custom metadata)
- `{{ .RedirectTo }}` - URL redirect setelah konfirmasi

### ✨ Fitur Template Email Ini:

✅ **100% Bahasa Indonesia** - Fokus komunikasi dengan user Indonesia
✅ **Tema Baby Blue & Soft Pink** - Konsisten dengan aplikasi (#AEE1F9 & #FADADD)
✅ **Maskot Emoji** - Menggunakan emoji yang relatable dan friendly
✅ **Responsive Design** - Tampil sempurna di mobile, tablet, dan desktop
✅ **Security Focused** - Peringatan keamanan yang jelas dan tegas
✅ **Professional Look** - Design modern dengan gradient dan shadow
✅ **User-Friendly** - CTA button besar dan jelas, mudah diklik
✅ **Animation** - Subtle animation pada maskot untuk engagement

### 🎨 Customization (Opsional):

Jika ingin menyesuaikan lebih lanjut:

**Warna:**
- Primary: `#AEE1F9` (Baby Blue)
- Secondary: `#FADADD` (Soft Pink)
- Text: `#2C3E50` (Dark Blue Grey)
- Success: `#A8E6CF` (Mint Green)
- Warning: `#FFD3B6` (Peach)
- Error: `#FFAAA5` (Light Red)

**Logo/Maskot:**
Jika ingin mengganti emoji dengan logo:
```html
<img src="URL_LOGO_ANDA" alt="Parenting AI" style="width: 64px; height: 64px;">
```

**Footer Contact:**
Update email support sesuai kebutuhan di bagian footer.

### 🧪 Testing Email Templates:

Setelah setup di Supabase, test dengan:

1. **Confirm Signup:**
   - Daftar akun baru dari aplikasi
   - Cek inbox email untuk verifikasi
   
2. **Magic Link:**
   - Pilih login dengan magic link
   - Cek apakah email masuk dan link berfungsi
   
3. **Reset Password:**
   - Klik "Lupa Password" di app
   - Cek email dan test link reset
   
4. **Change Email:**
   - Ubah email di settings
   - Verifikasi email baru masuk
   
5. **Reauthentication:**
   - Test fitur yang memerlukan re-auth
   - Verifikasi kode OTP masuk

### 📱 Email Preview:

Pastikan email terlihat bagus di:
- ✅ Gmail (Mobile & Desktop)
- ✅ Outlook (Mobile & Desktop)
- ✅ Yahoo Mail
- ✅ Apple Mail (iPhone/iPad)
- ✅ Samsung Email

### 🔒 Security Tips untuk User:

Template ini sudah include warning box untuk:
- Jangan share link/kode ke siapapun
- Link akan expire (1 jam untuk magic link, 24 jam untuk verifikasi)
- Cara mengidentifikasi email phishing
- Contact support jika mencurigakan

### 📞 Support Contact:

Email: support_parentingai@gmail.com
(Pastikan email ini aktif dan dimonitor!)

---

## 🎯 Checklist Setup:

- [ ] Login ke Supabase Dashboard
- [ ] Buka Authentication → Email Templates
- [ ] Setup template: **Confirm Signup**
- [ ] Setup template: **Invite User**
- [ ] Setup template: **Magic Link**
- [ ] Setup template: **Change Email**
- [ ] Setup template: **Reset Password**
- [ ] Setup template: **Reauthentication**
- [ ] Test semua email template
- [ ] Verifikasi tampilan di mobile dan desktop
- [ ] Update support email jika berbeda

---

**Template Email Created for Parenting AI** 👶✨  
**Version:** 1.0  
**Date:** November 2024  
**Theme:** Baby Blue & Soft Pink  
**Language:** Bahasa Indonesia
