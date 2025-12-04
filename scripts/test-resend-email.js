/**
 * Resend Email Test Script
 * 
 * Purpose: Test Resend API integration by sending a test email
 * Run: node scripts/test-resend-email.js
 * 
 * NOTE: This is a one-time test script. For production, 
 * API key should be stored in Supabase SMTP settings.
 */

// Using fetch API (built-in Node.js 18+)
const RESEND_API_KEY = 're_BaUTw2dB_6uMeRbpDxAHGCo2gDc2WqWHS';
const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendTestEmail() {
  console.log('🚀 Sending test email via Resend API...\n');

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@umai.naturaerp.id',  // Updated to use custom domain
        to: 'razqashop91@gmail.com',
        subject: 'Hello from Umai! 🤗 (Custom Domain Test)',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
                  padding: 40px 20px;
                  margin: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 16px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  overflow: hidden;
                }
                .header {
                  background: linear-gradient(135deg, #AEE1F9 0%, #FADADD 100%);
                  padding: 40px 20px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  color: #333;
                  font-size: 32px;
                  font-weight: 600;
                }
                .header p {
                  margin: 10px 0 0 0;
                  color: #555;
                  font-size: 16px;
                }
                .content {
                  padding: 40px 30px;
                }
                .content h2 {
                  color: #333;
                  font-size: 24px;
                  margin-top: 0;
                }
                .content p {
                  color: #555;
                  line-height: 1.6;
                  font-size: 16px;
                }
                .success-box {
                  background: #E8F5E9;
                  border-left: 4px solid #4CAF50;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .success-box strong {
                  color: #2E7D32;
                }
                .checklist {
                  background: #F5F5F5;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .checklist ul {
                  margin: 0;
                  padding-left: 20px;
                }
                .checklist li {
                  margin: 8px 0;
                  color: #555;
                }
                .footer {
                  background: #F9F9F9;
                  padding: 30px;
                  text-align: center;
                  border-top: 1px solid #EEE;
                }
                .footer p {
                  margin: 5px 0;
                  color: #888;
                  font-size: 14px;
                }
                .footer a {
                  color: #1976D2;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🤗 Umai</h1>
                  <p>You + Me + AI = Better Parenting</p>
                </div>
                
                <div class="content">
                  <h2>Congratulations! 🎉</h2>
                  <p>You've successfully sent your <strong>first test email</strong> using Resend API!</p>
                  
                  <div class="success-box">
                    <strong>✅ Email Delivery Test: PASSED</strong><br>
                    This confirms your Resend account is configured correctly.
                  </div>
                  
                  <h3>Next Steps:</h3>
                  <div class="checklist">
                    <ul>
                      <li>✅ Resend API key working</li>
                      <li>⏳ Add custom domain (e.g., umai.app)</li>
                      <li>⏳ Configure DNS records (SPF, DKIM, DMARC)</li>
                      <li>⏳ Update Supabase SMTP settings</li>
                      <li>⏳ Test with real signup flow</li>
                    </ul>
                  </div>
                  
                  <p><strong>Important:</strong> The current sender domain (<code>onboarding@resend.dev</code>) is for testing only. For production, you must verify your own domain.</p>
                  
                  <p>📖 <strong>Full setup guide:</strong> <code>/docs/setup/RESEND_SMTP_SETUP.md</code></p>
                </div>
                
                <div class="footer">
                  <p><strong>Umai - AI Parenting Assistant</strong></p>
                  <p>
                    <a href="https://parentingai.netlify.app">Website</a> |
                    <a href="https://parentingai.netlify.app/support">Support</a> |
                    <a href="https://parentingai.netlify.app/privacy-policy">Privacy</a>
                  </p>
                  <p style="margin-top: 15px;">© 2025 Umai. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Email sent successfully!\n');
      console.log('📧 Email ID:', data.id);
      console.log('📬 To:', 'razqashop91@gmail.com');
      console.log('📨 From:', 'onboarding@resend.dev');
      console.log('\n✨ Check your inbox at razqashop91@gmail.com\n');
      console.log('📊 View delivery status: https://resend.com/emails/' + data.id);
      console.log('\n---\n');
      console.log('🎯 NEXT STEPS:');
      console.log('1. Check spam folder if not in inbox');
      console.log('2. Add custom domain in Resend dashboard');
      console.log('3. Configure DNS records (SPF, DKIM, DMARC)');
      console.log('4. Update Supabase SMTP settings');
      console.log('5. Test with real signup flow');
      console.log('\n📖 Full guide: docs/setup/RESEND_SMTP_SETUP.md\n');
    } else {
      console.error('❌ ERROR: Failed to send email\n');
      console.error('Status:', response.status, response.statusText);
      console.error('Response:', JSON.stringify(data, null, 2));
      
      // Common error messages
      if (data.message) {
        console.error('\n💡 Error details:', data.message);
      }
      
      if (response.status === 401) {
        console.error('\n⚠️  Authentication failed. Check your API key.');
      } else if (response.status === 422) {
        console.error('\n⚠️  Validation error. Check email format and content.');
      } else if (response.status === 429) {
        console.error('\n⚠️  Rate limit exceeded. Wait a moment and try again.');
      }
    }

  } catch (error) {
    console.error('❌ EXCEPTION:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('- Check internet connection');
    console.error('- Verify API key is correct');
    console.error('- Ensure Node.js version 18+ (for fetch support)');
  }
}

// Run the test
sendTestEmail();
