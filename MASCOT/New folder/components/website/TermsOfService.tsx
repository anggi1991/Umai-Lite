import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileText, UserCheck, XCircle, CreditCard, Shield, AlertTriangle, Scale, Phone } from 'lucide-react';

export function TermsOfService() {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: FileText,
      content: (
        <p className="text-muted-foreground">
          Welcome to Parenting AI! These Terms of Service ("Terms") govern your access to and use of the Parenting AI mobile application ("App," "Service," or "we"). By creating an account or using our App, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our App.
        </p>
      ),
    },
    {
      id: 'eligibility',
      title: '2. Eligibility',
      icon: UserCheck,
      content: (
        <div className="space-y-2 text-muted-foreground">
          <p>You must meet the following requirements to use Parenting AI:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Age Requirement:</strong> You must be at least 18 years old to create an account</li>
            <li><strong>Legal Capacity:</strong> You have the legal capacity to enter into a binding agreement</li>
            <li><strong>Parental Authority:</strong> You are a parent, guardian, or authorized caregiver</li>
            <li><strong>Account Accuracy:</strong> You agree to provide accurate and complete information</li>
            <li><strong>Compliance:</strong> You will comply with all applicable laws and regulations</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'permitted',
      title: '4. Permitted Use',
      icon: UserCheck,
      content: (
        <div className="space-y-3">
          <p className="text-muted-foreground">You may use Parenting AI to:</p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Track your child\'s daily activities',
              'Monitor growth and development',
              'Store photos and videos',
              'Receive AI-powered advice',
              'Ask questions to our AI',
              'Export and share data with providers',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'prohibited',
      title: '5. Prohibited Conduct',
      icon: XCircle,
      content: (
        <div className="space-y-3">
          <p className="text-muted-foreground">You agree NOT to:</p>
          <div className="grid gap-2">
            {[
              'Use the App for any illegal purpose',
              'Upload harmful, threatening, or abusive content',
              'Impersonate another person or entity',
              'Interfere with or disrupt the App\'s functionality',
              'Attempt unauthorized access to our systems',
              'Reverse engineer or decompile the App',
              'Use automated tools without permission',
              'Share or sell other users\' data',
              'Upload exploitative content of minors',
              'Use the App to provide medical advice',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="text-red-500">❌</span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'subscription',
      title: '6. Subscription and Payments',
      icon: CreditCard,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-foreground mb-3">6.1 Subscription Tiers</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 bg-muted/50">
                <p className="text-sm mb-2">🆓 <strong>Free Tier</strong></p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• 3 AI tips per day</li>
                  <li>• 10 chat messages/day</li>
                  <li>• 1 child profile</li>
                  <li>• Basic tracking</li>
                </ul>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-[#AEE1F9]/20 to-[#FADADD]/20">
                <p className="text-sm mb-2">💎 <strong>Premium</strong></p>
                <p className="text-xs text-muted-foreground mb-2">IDR 49,000/month</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Unlimited AI & chat</li>
                  <li>• Up to 3 children</li>
                  <li>• No ads</li>
                  <li>• Advanced analytics</li>
                </ul>
              </Card>

              <Card className="p-4 bg-muted/50">
                <p className="text-sm mb-2">👨‍👩‍👧‍👦 <strong>Family</strong></p>
                <p className="text-xs text-muted-foreground mb-2">IDR 79,000/month</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Everything in Premium</li>
                  <li>• Up to 5 children</li>
                  <li>• Family sharing</li>
                  <li>• PDF/Excel export</li>
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="text-foreground mb-2">6.2 Payment Terms</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Subscriptions are billed monthly in advance</li>
              <li>Payment processed through App Store or Google Play</li>
              <li>Prices subject to change with 30 days notice</li>
              <li>All fees are non-refundable except as required by law</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'disclaimer',
      title: '7. AI Assistant and Content',
      icon: AlertTriangle,
      content: (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="space-y-4">
            <div>
              <h4 className="text-foreground mb-2">⚠️ Important Disclaimers</h4>
            </div>

            <div>
              <p className="text-sm mb-2"><strong>7.1 Not Medical Advice</strong></p>
              <p className="text-sm text-muted-foreground">
                The AI assistant provides general parenting information and educational content only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified pediatrician or healthcare provider for medical concerns.
              </p>
            </div>

            <div>
              <p className="text-sm mb-2"><strong>7.2 No Warranty of Accuracy</strong></p>
              <p className="text-sm text-muted-foreground">
                While we strive for accuracy, we do not guarantee that AI-generated advice is complete, accurate, or suitable for your specific situation. AI responses may contain errors or outdated information.
              </p>
            </div>

            <div>
              <p className="text-sm mb-2"><strong>7.3 Your Responsibility</strong></p>
              <p className="text-sm text-muted-foreground">
                You are solely responsible for decisions you make based on information from our AI assistant. We are not liable for any consequences resulting from reliance on AI-generated content.
              </p>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'liability',
      title: '10. Limitation of Liability',
      icon: Shield,
      content: (
        <Card className="p-6 bg-muted/50">
          <p className="text-sm text-muted-foreground mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• PARENTING AI IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND</li>
            <li>• WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES</li>
            <li>• WE ARE NOT LIABLE FOR LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION</li>
            <li>• OUR TOTAL LIABILITY SHALL NOT EXCEED IDR 100,000</li>
            <li>• WE ARE NOT LIABLE FOR DECISIONS BASED ON AI-GENERATED ADVICE</li>
            <li>• WE ARE NOT LIABLE FOR THIRD-PARTY SERVICE FAILURES</li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'dispute',
      title: '15. Dispute Resolution',
      icon: Scale,
      content: (
        <div className="space-y-4 text-muted-foreground">
          <div>
            <h4 className="text-foreground mb-2">15.1 Governing Law</h4>
            <p className="text-sm">
              These Terms are governed by the laws of the Republic of Indonesia, without regard to conflict of law principles.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2">15.2 Arbitration</h4>
            <p className="text-sm">
              Any disputes arising from these Terms or your use of the App shall be resolved through binding arbitration in Jakarta, Indonesia, in accordance with Indonesian arbitration law.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2">15.3 Exceptions</h4>
            <p className="text-sm">
              Either party may seek injunctive relief in court for intellectual property violations or breach of confidentiality obligations.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '18. Contact Information',
      icon: Phone,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            For questions about these Terms, please contact us:
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-sm text-foreground mb-1">📧 Legal</p>
              <a href="mailto:legal@parentingai.app" className="text-sm text-[#AEE1F9] hover:underline">
                legal@parentingai.app
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
          <h1 className="mb-4 text-foreground">Terms of Service</h1>
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
                <div className="pl-14">
                  {section.content}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center p-6 bg-gradient-to-r from-[#AEE1F9]/20 to-[#FADADD]/20 rounded-xl">
          <p className="text-foreground mb-2">
            🍼 Thank you for choosing Parenting AI! 🍼
          </p>
          <p className="text-sm text-muted-foreground">
            We're here to support you on your parenting journey.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: November 14, 2025 | Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
