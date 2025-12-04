import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Shield, Lock, Database, UserCheck, AlertTriangle, Globe, Trash2, Download } from 'lucide-react';

export function PrivacyPolicy() {
  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: Shield,
      content: (
        <>
          <p className="mb-4">
            Welcome to Parenting AI ("we," "our," or "us"). We are committed to protecting your privacy and the privacy of your children. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application ("App").
          </p>
          <p>
            By using Parenting AI, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our App.
          </p>
        </>
      ),
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      icon: Database,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="text-foreground mb-2">2.1 Personal Information</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Account Information: Email address, name, and password (encrypted)</li>
              <li>Profile Information: Optional profile photo and display name</li>
              <li>Child Information: Child's name, date of birth, gender, photo (optional)</li>
              <li>OAuth Data: If you sign in with Google, we receive your email, name, and profile picture</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-foreground mb-2">2.2 Baby Care Data</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Activity Tracking: Feeding times and types, sleep duration, diaper changes, mood logs</li>
              <li>Growth Tracking: Weight, height, head circumference measurements</li>
              <li>Media Library: Photos and videos you upload of your child</li>
              <li>AI Chat History: Questions you ask and responses from our AI assistant</li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-2">2.3 Usage Information</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Device Information: Device model, operating system, app version</li>
              <li>Analytics: App usage patterns, feature interactions, crash reports</li>
              <li>Location Data: We do NOT collect precise location data</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'usage',
      title: '3. How We Use Your Information',
      icon: UserCheck,
      content: (
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Core Functionality:</strong> Providing baby tracking, growth monitoring, and AI assistance</li>
          <li><strong>AI-Powered Insights:</strong> Analyzing patterns and generating personalized parenting advice</li>
          <li><strong>Account Management:</strong> Creating and managing your account, authentication</li>
          <li><strong>Communication:</strong> Sending important updates, notifications, and support responses</li>
          <li><strong>Improvement:</strong> Improving our services, fixing bugs, developing new features</li>
          <li><strong>Security:</strong> Detecting and preventing fraud, abuse, and security incidents</li>
          <li><strong>Legal Compliance:</strong> Complying with legal obligations and enforcing our terms</li>
        </ul>
      ),
    },
    {
      id: 'third-party',
      title: '4. Third-Party Services',
      icon: Globe,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">We use the following third-party services that may collect your data:</p>
          
          <Card className="p-4 bg-muted/50">
            <h4 className="text-foreground mb-2">🔐 Supabase (Database & Authentication)</h4>
            <p className="text-sm text-muted-foreground">
              We use Supabase to securely store your data and manage authentication. Data is encrypted at rest and in transit.
            </p>
          </Card>

          <Card className="p-4 bg-muted/50">
            <h4 className="text-foreground mb-2">🤖 Azure OpenAI (AI Assistant)</h4>
            <p className="text-sm text-muted-foreground">
              We use Azure OpenAI to power our AI parenting assistant. Your chat messages are sent to OpenAI for processing but are NOT used to train their models.
            </p>
          </Card>

          <Card className="p-4 bg-muted/50">
            <h4 className="text-foreground mb-2">🔑 Google OAuth (Sign In)</h4>
            <p className="text-sm text-muted-foreground">
              If you choose to sign in with Google, we receive basic profile information (email, name, photo) from Google.
            </p>
          </Card>
        </div>
      ),
    },
    {
      id: 'security',
      title: '5. Data Storage and Security',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <h4 className="text-foreground">🔒 Security Measures</h4>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
            <li><strong>Authentication:</strong> Passwords are hashed using bcrypt, never stored in plain text</li>
            <li><strong>Row-Level Security:</strong> Database policies ensure users can only access their own data</li>
            <li><strong>Regular Backups:</strong> Automated daily backups with 30-day retention</li>
            <li><strong>Access Controls:</strong> Strict internal access policies and audit logs</li>
          </ul>
          
          <p className="text-muted-foreground">
            <strong>Data Location:</strong> Your data is stored on secure servers provided by Supabase (AWS infrastructure) in the United States. By using our App, you consent to the transfer and storage of your data in the United States.
          </p>
        </div>
      ),
    },
    {
      id: 'rights',
      title: '7. Your Rights and Choices',
      icon: UserCheck,
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-[#AEE1F9] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-sm text-foreground mb-1">Access Your Data</h4>
                <p className="text-xs text-muted-foreground">Request a copy of all data we have about you</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-[#AEE1F9] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-sm text-foreground mb-1">Correct Your Data</h4>
                <p className="text-xs text-muted-foreground">Update inaccurate or incomplete information</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-[#AEE1F9] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-sm text-foreground mb-1">Delete Your Data</h4>
                <p className="text-xs text-muted-foreground">Request deletion of your account and data</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-[#AEE1F9] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-sm text-foreground mb-1">Export Your Data</h4>
                <p className="text-xs text-muted-foreground">Download your data in portable format</p>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'medical',
      title: '13. Medical Disclaimer',
      icon: AlertTriangle,
      content: (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-foreground mb-3">⚠️ Important Medical Notice</h4>
              <p className="text-muted-foreground mb-4">
                Parenting AI provides general parenting information and is NOT a substitute for professional medical advice, diagnosis, or treatment. The AI assistant is designed to offer educational support and should not be used for medical emergencies or serious health concerns.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Always seek the advice of your pediatrician or qualified healthcare provider</li>
                <li>Never disregard professional medical advice or delay seeking it</li>
                <li>Do not use our AI assistant for medical emergencies - call emergency services</li>
              </ul>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'contact',
      title: '12. Contact Us',
      icon: Globe,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-sm text-foreground mb-1">📧 Email</p>
              <a href="mailto:privacy@parentingai.app" className="text-sm text-[#AEE1F9] hover:underline">
                privacy@parentingai.app
              </a>
            </Card>

            <Card className="p-4 text-center">
              <p className="text-sm text-foreground mb-1">💬 Support</p>
              <a href="mailto:support@parentingai.app" className="text-sm text-[#AEE1F9] hover:underline">
                support@parentingai.app
              </a>
            </Card>

            <Card className="p-4 text-center">
              <p className="text-sm text-foreground mb-1">🌐 Website</p>
              <a href="https://parenting-ai.vercel.app" className="text-sm text-[#AEE1F9] hover:underline">
                parenting-ai.vercel.app
              </a>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] text-[#2C3E50] border-none">
            Legal Document
          </Badge>
          <h1 className="mb-4 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: November 14, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#AEE1F9] to-[#FADADD] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#2C3E50]" />
                  </div>
                  <h2 className="text-foreground">{section.title}</h2>
                </div>
                <div className="text-muted-foreground pl-14">
                  {section.content}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center p-6 bg-gradient-to-r from-[#AEE1F9]/20 to-[#FADADD]/20 rounded-xl">
          <p className="text-foreground mb-2">
            🍼 Thank you for trusting Parenting AI with your family's precious moments 🍼
          </p>
          <p className="text-sm text-muted-foreground">
            We are committed to protecting your privacy and providing the best parenting support possible.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: November 14, 2025 | Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
