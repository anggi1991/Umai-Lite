import { AppBar } from './AppBar';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ChevronRight, Crown, Settings, Shield, Bell, HelpCircle, LogOut, Baby } from 'lucide-react';

interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: Baby, label: 'Baby Profiles', value: '1 child', href: '#' },
        { icon: Settings, label: 'Account Settings', href: '#' },
        { icon: Bell, label: 'Notifications', value: 'On', href: '#' },
      ],
    },
    {
      title: 'Subscription',
      items: [
        { icon: Crown, label: 'Upgrade to Premium', badge: 'Popular', href: '#' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', href: '#' },
        { icon: Shield, label: 'Privacy Policy', href: '#' },
      ],
    },
    {
      title: 'Other',
      items: [
        { icon: LogOut, label: 'Sign Out', danger: true, href: '#' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <AppBar title="Profile" showBack onBack={onBack} actions={['menu']} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-br from-[#AEE1F9] to-[#FADADD] text-[#2C3E50]">
                SK
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-foreground mb-1">Sarah Kim</h2>
              <p className="text-sm text-muted-foreground">sarah.kim@email.com</p>
              <Badge variant="secondary" className="mt-2">
                Free Plan
              </Badge>
            </div>
            <button className="text-[#AEE1F9] text-sm">Edit</button>
          </div>
        </Card>

        {/* Baby Info */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FADADD] to-[#FFB6C1] flex items-center justify-center text-2xl">
              👶
            </div>
            <div className="flex-1">
              <h3 className="text-foreground mb-1">Emma Kim</h3>
              <p className="text-sm text-muted-foreground">6 months old • Born Jan 10, 2025</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        {/* Premium Upgrade Card */}
        <Card className="p-6 bg-gradient-to-br from-[#AEE1F9] to-[#FADADD] border-none">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#2C3E50]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#2C3E50] mb-1">Upgrade to Premium</h3>
              <p className="text-sm text-[#2C3E50]/80">
                Get unlimited AI chats, advanced tracking, and personalized insights
              </p>
            </div>
          </div>
          <button className="w-full py-3 bg-white rounded-full text-[#2C3E50] hover:shadow-md transition-shadow">
            See Premium Features
          </button>
        </Card>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 text-sm text-muted-foreground px-1">{section.title}</h3>
            <Card className="divide-y divide-border">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full p-4 flex items-center gap-4 hover:bg-muted transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.danger
                          ? 'bg-red-100'
                          : item.badge
                          ? 'bg-gradient-to-br from-[#AEE1F9] to-[#FADADD]'
                          : 'bg-muted'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          item.danger ? 'text-red-500' : 'text-foreground'
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div
                        className={`${
                          item.danger ? 'text-red-500' : 'text-foreground'
                        }`}
                      >
                        {item.label}
                      </div>
                      {item.value && (
                        <div className="text-sm text-muted-foreground">{item.value}</div>
                      )}
                    </div>
                    {item.badge && (
                      <Badge className="bg-[#FADADD] text-[#2C3E50] border-none">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Parenting AI Assistant v1.0.0</p>
          <p className="mt-1">Made with ❤️ for parents everywhere</p>
        </div>
      </div>
    </div>
  );
}
