import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { BabyBuddy } from '../BabyBuddy';
import { CheckCircle2, TrendingUp, MessageCircle, BarChart3, Image, Globe, Shield, Apple, Smartphone } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const features = [
    {
      icon: BarChart3,
      title: 'Smart Tracking',
      description: 'Log feeding, sleep, diaper changes, and moods effortlessly. Get AI-powered insights into your baby patterns.',
      gradient: 'from-[#AEE1F9] to-[#87CEEB]',
    },
    {
      icon: MessageCircle,
      title: 'Baby Buddy AI',
      description: '24/7 parenting advice powered by GPT-4. Meet Baby Buddy, your cute AI companion with personalized recommendations.',
      gradient: 'from-[#FADADD] to-[#FFB6C1]',
      badge: 'POPULAR',
    },
    {
      icon: TrendingUp,
      title: 'Growth Monitoring',
      description: 'Track weight, height, and milestones. Compare with WHO growth charts. Never miss an important development.',
      gradient: 'from-[#E0BBE4] to-[#D8A7D8]',
    },
    {
      icon: Image,
      title: 'Media Library',
      description: 'Store precious photos and videos. AI-powered face recognition automatically organizes by child.',
      gradient: 'from-[#FFE5B4] to-[#FFD699]',
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Available in English, Indonesian, Japanese, and Chinese. Perfect for international families.',
      gradient: 'from-[#B5E7A0] to-[#86C67C]',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Bank-level encryption. Your family data is safe. GDPR compliant. We never sell your information.',
      gradient: 'from-[#A7C7E7] to-[#87AACC]',
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'IDR 0',
      period: 'forever',
      badge: null,
      features: [
        '3 AI tips per day',
        '10 chat messages/day',
        '1 child profile',
        'Basic tracking',
      ],
      gradient: 'from-white to-gray-50',
      buttonStyle: 'border-2 border-border bg-white text-foreground hover:bg-muted',
    },
    {
      name: 'Premium',
      price: 'IDR 49K',
      period: 'per month',
      badge: 'MOST POPULAR',
      features: [
        'Unlimited AI tips & chat',
        'Up to 3 child profiles',
        'No advertisements',
        'Advanced analytics',
        'Priority support',
      ],
      gradient: 'from-[#AEE1F9] to-[#FADADD]',
      buttonStyle: 'bg-[#2C3E50] text-white hover:bg-[#1a252f]',
    },
    {
      name: 'Family',
      price: 'IDR 79K',
      period: 'per month',
      badge: 'FAMILY',
      features: [
        'Everything in Premium',
        'Up to 5 child profiles',
        'Family sharing',
        'Export to PDF/Excel',
        'Premium support',
      ],
      gradient: 'from-white to-gray-50',
      buttonStyle: 'border-2 border-border bg-white text-foreground hover:bg-muted',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#AEE1F9]/20 via-[#FADADD]/20 to-white"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] text-[#2C3E50] border-none">
                ✨ Coming Soon to App Stores
              </Badge>
              
              <h1 className="mb-6 text-foreground">
                Baby Buddy - Your AI Parenting Assistant
              </h1>
              
              <p className="mb-8 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Your AI-powered parenting companion for tracking, analyzing, and supporting your baby growth journey
              </p>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button className="flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors">
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Download on</div>
                    <div className="text-sm">App Store</div>
                  </div>
                </button>
                <button className="flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors">
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm">Google Play</div>
                  </div>
                </button>
              </div>

              <p className="text-sm text-muted-foreground">
                Trusted by parents worldwide 🌍
              </p>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#AEE1F9] to-[#FADADD] rounded-3xl blur-3xl opacity-30"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
                <BabyBuddy size="lg" animate={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-foreground">
              Everything You Need for Baby Care
            </h2>
            <p className="text-lg text-muted-foreground">
              Trusted by parents worldwide 🌍
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
                >
                  {feature.badge && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-[#FFD699] to-[#FFB366] text-[#2C3E50] border-none text-xs">
                      ⭐ {feature.badge}
                    </Badge>
                  )}
                  
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade anytime 💎
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 relative overflow-hidden ${
                  plan.badge === 'MOST POPULAR' ? 'shadow-2xl border-2 border-[#AEE1F9]' : ''
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-[#FFD699] to-[#FFB366] text-[#2C3E50] border-none text-xs">
                    {plan.badge}
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl text-foreground">{plan.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.period}</p>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-3 rounded-xl transition-all ${plan.buttonStyle}`}>
                  {plan.name === 'Starter' ? 'Get Started' : 'Upgrade Now'}
                </button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#AEE1F9] to-[#FADADD]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <BabyBuddy size="lg" animate={true} />
          </div>
          
          <h2 className="mb-4 text-[#2C3E50]">
            Ready to Start Your Parenting Journey?
          </h2>
          
          <p className="text-lg text-[#2C3E50]/80 mb-8 max-w-2xl mx-auto">
            Join thousands of parents who trust Baby Buddy to support their family 💙
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#2C3E50] text-white rounded-xl hover:bg-[#1a252f] transition-colors flex items-center justify-center gap-2">
              <Smartphone className="w-5 h-5" />
              Download Now
            </button>
            <button className="px-8 py-4 bg-white text-[#2C3E50] rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
