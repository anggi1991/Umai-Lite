# Supabase Email Templates - Umai (Rebranded)

✅ **UPDATED FOR REBRANDING**: Baby Buddy → Umai (You + Me + AI)  
✅ **LANGUAGE**: All templates converted to English for international audience  
✅ **COMPLETE**: 6 production-ready email templates included

Professional email templates for **Umai** - Featuring Baby Blue & Soft Pink theme.

---

## 📧 Cara Menggunakan

1. Buka **Supabase Dashboard** → https://supabase.com/dashboard
2. Pilih project **"Parenting AI"**
3. **Authentication → Email Templates**
4. Copy template di bawah ini ke masing-masing email type
5. Paste ke **Subject** dan **Body** yang sesuai
6. Klik **Save**

---

## 🎯 CRITICAL: URL Configuration

**BEFORE deploying these templates**, update ALL URLs:

- ❌ OLD: `localhost:8081` 
- ✅ NEW: `parentingai.netlify.app`

Search and replace in Supabase dashboard before saving!

---

## 1. Confirm Signup (Email Verification)

### Subject
```
Welcome to Umai - Verify Your Email 👶
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
      border-radius: 50%;
      border: 4px solid #FFFFFF;
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
      <img src="https://parentingai.netlify.app/mascot/buddy-concise.png" alt="Umai Mascot" class="mascot">
      <h1>Umai</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">You + Me + AI - Your Parenting Companion</p>
    </div>
    
    <div class="content">
      <h2>🎉 Welcome to Umai!</h2>
      <p>Hello and thank you for joining <strong>Umai</strong>!</p>
      <p>We're excited to help you on your parenting journey. To get started, please verify your email address.</p>
      
      <div class="welcome-box">
        <strong>✨ What you'll get:</strong>
        <ul>
          <li>💬 Chat with Umai AI for parenting tips</li>
          <li>📊 Track your child's growth and development</li>
          <li>📸 Photo albums and milestone memories</li>
          <li>⏰ Smart reminders for important activities</li>
          <li>📈 Growth statistics and analytics</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">✅ Verify My Email</a>
      </p>
      
      <p style="font-size: 14px; color: #7F8C8D; margin-top: 30px;">
        <strong>Important:</strong> This verification link will expire in 24 hours. If you didn't sign up for Umai, please ignore this email.
      </p>
      
      <div class="alternative-link">
        <p style="margin: 0 0 10px 0; font-size: 13px;"><strong>Or copy this link to your browser:</strong></p>
        {{ .ConfirmationURL }}
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Umai</strong> - You + Me + AI = Better Parenting Together</p>
      <p style="margin: 5px 0;">
        <a href="https://parentingai.netlify.app">Website</a> | 
        <a href="https://parentingai.netlify.app/privacy-policy">Privacy Policy</a> | 
        <a href="https://parentingai.netlify.app/terms">Terms & Conditions</a>
      </p>
      <p style="margin: 15px 0 5px 0; font-size: 12px; color: #95A5A6;">
        © 2025 Umai. Made with ❤️ for parents everywhere
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Reset Password

### Subject
```
🔑 Reset Your Umai Password
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
      <div class="mascot">🔑</div>
      <h1>Umai</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Account Password Reset</p>
    </div>
    
    <div class="content">
      <h2>🔐 Password Reset Request</h2>
      <p>Hello!</p>
      <p>We received a request to reset the password for your Umai account. Don't worry, we'll help you create a new secure password.</p>
      
      <p>To proceed with resetting your password, use this secure link:</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">🔑 Reset Password Now</a>
      </center>
      
      <div class="email-info">
        <strong>📧 Account to reset:</strong><br>
        <span style="color: #AEE1F9; font-weight: 600;">{{ .Email }}</span>
      </div>
      
      <div class="security-box">
        <strong>💡 Tips for Creating a Strong Password:</strong>
        <ul>
          <li>🔤 Use a combination of <strong>uppercase</strong>, <strong>lowercase</strong>, <strong>numbers</strong>, and <strong>symbols</strong></li>
          <li>📏 At least <strong>8 characters</strong> (longer is better!)</li>
          <li>🔐 Don't reuse passwords from <strong>other apps or websites</strong></li>
          <li>🚫 Avoid personal information (name, birthday, etc.)</li>
          <li>🤫 <strong>NEVER</strong> share your password with anyone</li>
        </ul>
      </div>
      
      <div class="warning-box">
        <strong>⚠️ If you DIDN'T request a password reset:</strong><br><br>
        No worries, your password is still safe! Just ignore this email and your password won't be changed.<br><br>
        However, if you're concerned about your account security, please contact us immediately at <a href="mailto:support_parentingai@gmail.com" style="color: #FFD3B6; font-weight: 700;">support_parentingai@gmail.com</a>
      </div>
      
      <p style="margin-top: 25px; font-size: 13px; color: #7F8C8D; text-align: center;">
        <em>⏰ This password reset link will expire in 1 hour</em>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Umai</strong> - You + Me + AI</p>
      <p style="margin: 5px 0;">© 2025 Umai. Made with ❤️</p>
      <p style="margin: 15px 0;">
        Need help? Contact us at<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        This email was sent automatically, please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Magic Link (Passwordless Login)

### Subject
```
🔐 Your Instant Login Link - Umai
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
      <h1>Umai</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Fast & Secure Login</p>
    </div>
    
    <div class="content">
      <h2>🚀 Your Magic Link is Ready!</h2>
      <p>Hello!</p>
      <p>We received a request to log in to your Umai account without a password. Click the button below to log in instantly:</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">🔓 Log In Now</a>
      </center>
      
      <div class="email-info">
        <strong>📧 Email to log in:</strong><br>
        <span style="color: #AEE1F9; font-weight: 600;">{{ .Email }}</span>
      </div>
      
      <div class="warning-box">
        <strong>⚠️ Important - For Your Security:</strong>
        <ul>
          <li>🔒 This link can <strong>only be used ONCE</strong></li>
          <li>⏰ Link will <strong>expire in 1 hour</strong></li>
          <li>🚫 <strong>DO NOT SHARE</strong> this link with anyone</li>
          <li>📱 This link is as confidential as your password</li>
        </ul>
      </div>
      
      <p style="margin-top: 25px; font-size: 14px; color: #7F8C8D; background-color: #F5F5F5; padding: 15px; border-radius: 8px; text-align: center;">
        💡 <strong>Security Tip:</strong> Make sure you requested this link. If not, please contact us immediately!
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Umai</strong> - You + Me + AI</p>
      <p style="margin: 5px 0;">© 2025 Umai. Made with ❤️</p>
      <p style="margin: 15px 0;">
        Need help? Contact us at<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        If you didn't request this login, please ignore this email.<br>
        This email was sent automatically, please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Email OTP / Verification Code

### Subject
```
🔐 Your Verification Code - Umai
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
      <h1>Umai</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Security Verification</p>
    </div>
    
    <div class="content">
      <h2>🔐 Your Verification Code</h2>
      <p>Hello!</p>
      <p>To continue and ensure the security of your account, enter the following verification code in the Umai app:</p>
      
      <div class="code-box">
        {{ .Token }}
      </div>
      
      <div class="code-instruction">
        <strong>📱 How to Use This Code:</strong><br>
        <p style="margin: 10px 0;">Open Umai app → Enter the 6-digit code above → Click Verify</p>
      </div>
      
      <div class="email-info">
        <strong>📧 Account being verified:</strong><br>
        <span style="color: #AEE1F9; font-weight: 600;">{{ .Email }}</span>
      </div>
      
      <div class="warning-box">
        <strong>⚠️ IMPORTANT - Verification Code Security:</strong>
        <ul>
          <li>⏰ This code will <strong>expire in 10 minutes</strong></li>
          <li>🔒 This code is <strong>confidential and private</strong></li>
          <li>🚫 <strong>NEVER</strong> share this code with anyone</li>
          <li>📵 Umai will <strong>never ask</strong> for this code via phone, email, or chat</li>
          <li>🚨 If someone asks for this code, <strong>report to us immediately!</strong></li>
        </ul>
      </div>
      
      <p style="margin-top: 25px; font-size: 14px; color: #7F8C8D; background-color: #F5F5F5; padding: 15px; border-radius: 8px; text-align: center;">
        💡 <strong>Security Tip:</strong> Make sure only you see this code and enter it in the app immediately before it expires.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Umai</strong> - You + Me + AI</p>
      <p style="margin: 5px 0;">© 2025 Umai. Made with ❤️</p>
      <p style="margin: 15px 0;">
        Need help? Contact us at<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        If you didn't request this code, please contact us immediately.<br>
        This email was sent automatically, please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 5. Email Change Confirmation

### Subject
```
📧 Confirm Your Email Change - Umai
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
      <h1>Umai</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Email Change Confirmation</p>
    </div>
    
    <div class="content">
      <h2>🔄 Email Change Request</h2>
      <p>Hello!</p>
      <p>We received a request to change the email address registered to your Umai account.</p>
      
      <div class="email-box">
        <strong>📋 Change Details:</strong><br><br>
        <strong>Old Email:</strong><br>
        <code style="background-color: rgba(174, 225, 249, 0.3); padding: 5px 10px; border-radius: 4px;">{{ .Email }}</code><br><br>
        <strong>⬇️</strong><br><br>
        <strong>New Email:</strong><br>
        <code style="background-color: rgba(250, 218, 221, 0.5); padding: 5px 10px; border-radius: 4px;">{{ .NewEmail }}</code>
      </div>
      
      <p>If you requested this change, please confirm by using the secure link below:</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">✅ Confirm Email Change</a>
      </center>
      
      <div class="warning-box">
        <strong>⚠️ ATTENTION - If you DID NOT request this change:</strong><br><br>
        <strong>🚨 Your account may have been accessed by someone else!</strong><br><br>
        Take action immediately:
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Ignore this email (DO NOT confirm the change)</li>
          <li>Change your account password immediately</li>
          <li>Contact us at <a href="mailto:support_parentingai@gmail.com" style="color: #FFAAA5; font-weight: 700;">support_parentingai@gmail.com</a></li>
        </ul>
      </div>
      
      <p style="margin-top: 25px; font-size: 13px; color: #7F8C8D; text-align: center;">
        <em>⏰ This confirmation link will expire in 24 hours</em>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Umai</strong> - You + Me + AI</p>
      <p style="margin: 5px 0;">© 2025 Umai. Made with ❤️</p>
      <p style="margin: 15px 0;">
        Need help? Contact us at<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        This email was sent automatically, please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 6. Invite User

### Subject
```
🎁 You're Invited to Join Umai!
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
      <h1>Umai</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #7F8C8D;">Your Trusted Parenting Companion</p>
    </div>
    
    <div class="content">
      <h2>🎊 You've Received a Special Invitation!</h2>
      <p>Hello!</p>
      <p>Someone who cares about you has invited you to join <strong>Umai</strong> - the trusted companion for parents!</p>
      
      <div class="feature-box">
        <strong>✨ What you'll get:</strong>
        <ul>
          <li><strong>💬 Umai AI Chat</strong> - Ask parenting questions anytime</li>
          <li><strong>📊 Growth Tracker</strong> - Monitor your child's growth and development</li>
          <li><strong>📸 Memory Album</strong> - Save precious moments in a timeline</li>
          <li><strong>⏰ Smart Reminders</strong> - Intelligent reminders for important activities</li>
          <li><strong>📈 Analytics</strong> - Statistical analysis and growth insights</li>
          <li><strong>🎯 Daily Tips</strong> - Personalized daily parenting tips</li>
        </ul>
      </div>
      
      <p>Join now and start an easier and more enjoyable parenting journey!</p>
      
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">🎉 Accept Invitation & Sign Up</a>
      </center>
      
      <p style="margin-top: 25px; font-size: 13px; color: #7F8C8D; text-align: center;">
        <em>⏰ This invitation link will expire in 7 days</em>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Umai</strong> - You + Me + AI = Better Parenting Together</p>
      <p style="margin: 5px 0;">© 2025 Umai. Made with ❤️</p>
      <p style="margin: 15px 0;">
        Need help? Contact us at<br>
        <a href="mailto:support_parentingai@gmail.com">support_parentingai@gmail.com</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #BDC3C7;">
        This email was sent automatically, please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 📋 Checklist Setup di Supabase:

1. [ ] Login ke https://supabase.com/dashboard
2. [ ] Pilih project "Parenting AI"
3. [ ] Buka **Authentication → Email Templates**
4. [ ] Update **Confirm signup** template:
   - Subject: `Welcome to Umai - Verify Your Email 👶`
   - Body: Copy dari template #1 di atas
   - ✅ Verify mascot URL: `https://parentingai.netlify.app/mascot/buddy-concise.png`
   - ✅ Verify footer URLs use `parentingai.netlify.app`
5. [ ] Update **Reset password** template:
   - Subject: `🔑 Reset Your Umai Password`
   - Body: Copy dari template #2 di atas
6. [ ] Update **Magic Link** template (if enabled):
   - Subject: `🔐 Your Instant Login Link - Umai`
   - Body: Copy dari template #3 di atas
7. [ ] Update **Email OTP** template (if enabled):
   - Subject: `🔐 Your Verification Code - Umai`
   - Body: Copy dari template #4 di atas
8. [ ] Update **Email Change** template (if enabled):
   - Subject: `📧 Confirm Your Email Change - Umai`
   - Body: Copy dari template #5 di atas
9. [ ] Update **Invite User** template (if enabled):
   - Subject: `🎁 You're Invited to Join Umai!`
   - Body: Copy dari template #6 di atas
10. [ ] Test email delivery:
    - Trigger signup dari mobile app
    - Verify email tampil dengan branding "Umai"
    - Verify links mengarah ke `parentingai.netlify.app`

---

## ✅ Key Changes from Baby Buddy → Umai:

| Element | Before (Baby Buddy) | After (Umai) |
|---------|---------------------|--------------|
| App Name | Baby Buddy | Umai |
| Tagline | Your AI Parenting Assistant | You + Me + AI - Your Parenting Companion |
| Feature | Baby Buddy AI | Umai AI |
| Footer | Parenting AI | Umai - You + Me + AI |
| Copyright | © 2024 Parenting AI | © 2025 Umai |
| Website Links | localhost:8081 | parentingai.netlify.app |

---

## 🔧 Manual Steps Required:

**IN SUPABASE DASHBOARD:**

1. **Mascot Image URL** - Currently using:
   ```
   https://parentingai.netlify.app/mascot/buddy-concise.png
   ```
   - ✅ This file exists in website (deployed)
   - ⚠️ If you want to use Supabase Storage instead:
     1. Upload `buddy-concise.png` to Supabase Storage bucket `assets`
     2. Get public URL
     3. Replace in email templates

2. **Test Email Sending:**
   - Create test account in mobile app
   - Verify email arrives with "Umai" branding
   - Click verification link
   - Ensure redirect works to `parentingai.netlify.app`

3. **Support Email:**
   - Currently: `support_parentingai@gmail.com`
   - ✅ Keep as is (Gmail account exists)
   - Or update to custom domain email if available

---

## 🚀 Next Steps After Supabase Update:

1. ✅ Website rebranded (DONE)
2. ⏳ Supabase email templates (IN PROGRESS - manual setup required)
3. [ ] Mobile app rebrand:
   - Update `app.json` app name
   - Update hardcoded strings in Settings screen
   - Update splash screens/icons if needed
4. [ ] Documentation files rebrand:
   - README.md
   - DEPLOYMENT_GUIDE.md
   - Other MD files with "Baby Buddy" references
5. [ ] Test E2E flow:
   - Signup → Email → Verification → Dashboard
   - Password reset flow
   - All emails show "Umai" branding

---

**Template Created:** November 14, 2025  
**Rebranding:** Baby Buddy → Umai (You + Me + AI)  
**Reason:** Copyright issue with "Baby Buddy" name  
**New Identity:** Short, brandable, legal ✅
