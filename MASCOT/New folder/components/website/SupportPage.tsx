import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Mail, Lock, HelpCircle, Bug, Lightbulb, ChevronRight, Book, FileText, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface SupportPageProps {
  onNavigate: (page: string) => void;
}

export function SupportPage({ onNavigate }: SupportPageProps) {
  const contactOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      email: 'support@parentingai.app',
      response: 'Response time: 24-48 hours',
      color: 'from-[#AEE1F9] to-[#87CEEB]',
    },
    {
      icon: Lock,
      title: 'Privacy & Legal',
      description: 'Privacy or legal inquiries',
      email: 'privacy@parentingai.app',
      response: 'Response time: 5-7 business days',
      color: 'from-[#FADADD] to-[#FFB6C1]',
    },
  ];

  const faqs = [
    {
      question: '🔐 How do I create an account?',
      answer: 'You can create an account by downloading the Parenting AI app and tapping "Sign Up". Choose to register with your email or use Google Sign-In for faster setup. You\'ll need to provide basic information and create a password (if using email registration).',
    },
    {
      question: '🔑 I forgot my password. What should I do?',
      answer: 'On the login screen, tap "Forgot Password". Enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password. If you don\'t receive the email, check your spam folder or contact support.',
    },
    {
      question: '👶 How do I add my child\'s profile?',
      answer: 'Go to Settings → Child Profiles → Add Child. Enter your child\'s name, date of birth, gender, and optionally add a photo. You can add multiple children depending on your subscription plan (1 child for Free, up to 3 for Premium, up to 5 for Family).',
    },
    {
      question: '📊 How do I track activities?',
      answer: 'From the home screen, use the quick action buttons or tap the "+" button to log activities like feeding, sleep, diaper changes, and moods. You can also add notes and photos to each entry. All data is automatically saved and synced.',
    },
    {
      question: '🤖 How does the AI Assistant work?',
      answer: 'Baby Buddy is powered by Azure OpenAI (GPT-4). Simply ask any parenting question in the chat, and you\'ll receive personalized advice based on your child\'s age and your previous interactions. Free users get 10 messages per day, while Premium users have unlimited access.',
    },
    {
      question: '📈 How accurate are the growth charts?',
      answer: 'Our growth charts are based on WHO (World Health Organization) standards and are updated regularly. However, they are for informational purposes only. Always consult your pediatrician for medical interpretations of your child\'s growth.',
    },
    {
      question: '💎 What\'s included in Premium?',
      answer: 'Premium includes: unlimited AI tips and chat, up to 3 child profiles, no advertisements, advanced analytics and insights, priority email support, and early access to new features. It costs IDR 49,000 per month.',
    },
    {
      question: '💳 How do I upgrade to Premium?',
      answer: 'Go to Settings → Subscription → Upgrade to Premium. Choose your plan and complete the payment through your App Store or Google Play account. Your subscription will be activated immediately.',
    },
    {
      question: '🔄 How do I cancel my subscription?',
      answer: 'Subscriptions are managed through your App Store or Google Play account. For iOS: Settings → [Your Name] → Subscriptions → Parenting AI → Cancel. For Android: Play Store → Menu → Subscriptions → Parenting AI → Cancel. You\'ll retain access until the end of your billing period.',
    },
    {
      question: '🔒 Is my child\'s data safe?',
      answer: 'Yes! We use bank-level encryption (AES-256 for data at rest, TLS/SSL for data in transit). All data is stored securely on Supabase (AWS infrastructure). We never sell your data and are GDPR compliant. See our Privacy Policy for more details.',
    },
    {
      question: '🗑️ How do I delete my account?',
      answer: 'Go to Settings → Account → Delete Account. You\'ll be asked to confirm your decision. Once deleted, all your data will be permanently removed within 30 days. This action cannot be undone, so make sure to export any data you want to keep first.',
    },
    {
      question: '🌍 How do I change the language?',
      answer: 'Go to Settings → Language & Region. Select your preferred language from English, Indonesian, Japanese, or Chinese. The app interface will update immediately. Note: AI responses will also be in your selected language.',
    },
    {
      question: '⚠️ The app keeps crashing. What should I do?',
      answer: 'First, try updating to the latest version from the App Store or Google Play. If that doesn\'t work, try clearing the app cache (Settings → App → Clear Cache) or reinstalling the app. If the problem persists, contact support@parentingai.app with your device model and OS version.',
    },
    {
      question: '📱 What devices are supported?',
      answer: 'Parenting AI requires: iOS 14.0 or later (iPhone, iPad, iPod touch) or Android 8.0 or later. The app is optimized for phones but also works on tablets. We recommend keeping your device OS updated for the best experience.',
    },
    {
      question: '📷 My photos won\'t upload. Help!',
      answer: 'Check that Parenting AI has permission to access your photos (Settings → Privacy → Photos). Ensure you have a stable internet connection. Photos should be under 10MB in size. If the issue persists, try restarting the app or contact support.',
    },
  ];

  const quickLinks = [
    {
      icon: Shield,
      title: 'Privacy Policy',
      description: 'How we protect your data',
      action: () => onNavigate('privacy'),
    },
    {
      icon: FileText,
      title: 'Terms of Service',
      description: 'Terms and conditions',
      action: () => onNavigate('terms'),
    },
  ];

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] text-[#2C3E50] border-none">
            Support Center
          </Badge>
          <h1 className="mb-4 text-foreground">We're here to help you</h1>
          <p className="text-lg text-muted-foreground">
            with any questions or issues
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-foreground mb-2">{option.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                <a
                  href={`mailto:${option.email}`}
                  className="text-[#AEE1F9] hover:underline mb-2 block"
                >
                  {option.email}
                </a>
                <p className="text-xs text-muted-foreground">{option.response}</p>
              </Card>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="mb-6 text-foreground text-center">Frequently Asked Questions</h2>
          
          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>

        {/* Feature Requests */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-[#AEE1F9]/10 to-[#FADADD]/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFE5B4] to-[#FFD699] flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground mb-2">Feature Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We love hearing from our users! Have an idea to make Parenting AI better?
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Email us at <a href="mailto:feedback@parentingai.app" className="text-[#AEE1F9] hover:underline">feedback@parentingai.app</a> with:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Feature description</li>
                <li>Why it would be helpful</li>
                <li>(Optional) Screenshots or mockups</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Report a Bug */}
        <Card className="p-6 mb-12 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center flex-shrink-0">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground mb-2">Report a Bug</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Found a bug? Please help us fix it by reporting to <a href="mailto:bugs@parentingai.app" className="text-[#AEE1F9] hover:underline">bugs@parentingai.app</a>
              </p>
              <p className="text-sm text-muted-foreground mb-2">Include:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Device model (e.g., iPhone 15, Samsung Galaxy S23)</li>
                <li>OS version (e.g., iOS 17.1, Android 13)</li>
                <li>App version (Settings → About)</li>
                <li>Steps to reproduce the bug</li>
                <li>Screenshots or screen recording (if possible)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Useful Links */}
        <div className="mb-12">
          <h3 className="mb-4 text-foreground text-center">Useful Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.title}
                  onClick={link.action}
                  className="w-full"
                >
                  <Card className="p-4 hover:shadow-md transition-shadow text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#AEE1F9] to-[#FADADD] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#2C3E50]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-foreground mb-1">{link.title}</h4>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {/* Still Need Help */}
        <Card className="p-8 text-center bg-gradient-to-r from-[#AEE1F9]/20 to-[#FADADD]/20">
          <HelpCircle className="w-12 h-12 text-[#AEE1F9] mx-auto mb-4" />
          <h3 className="text-foreground mb-2">Still Need Help?</h3>
          <p className="text-muted-foreground mb-6">
            Our support team is here for you. We typically respond within 24-48 hours.
          </p>
          <a
            href="mailto:support@parentingai.app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] rounded-full text-[#2C3E50] hover:shadow-lg transition-shadow"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </Card>
      </div>
    </div>
  );
}
