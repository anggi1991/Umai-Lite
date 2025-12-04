import { Card } from './ui/card';
import { BabyBuddy } from './BabyBuddy';
import { AppBar } from './AppBar';
import { TrendingUp, MessageCircle, Lightbulb, Baby, Activity, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const quickActions = [
    { icon: TrendingUp, label: 'Growth', color: 'from-[#AEE1F9] to-[#87CEEB]', onClick: () => onNavigate('stats') },
    { icon: MessageCircle, label: 'Chat AI', color: 'from-[#FADADD] to-[#FFB6C1]', onClick: () => onNavigate('chat') },
    { icon: Baby, label: 'Journal', color: 'from-[#E0BBE4] to-[#D8A7D8]', onClick: () => onNavigate('journal') },
    { icon: Lightbulb, label: 'Tips', color: 'from-[#FFE5B4] to-[#FFD699]', onClick: () => {} },
  ];

  const dailyTips = [
    {
      title: 'Sleep Schedule',
      description: 'Consistent bedtime routines help babies sleep better',
      image: 'https://images.unsplash.com/photo-1649636862012-7e1bce091934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwaGFwcHklMjBmYW1pbHl8ZW58MXx8fHwxNzYyNzQ1NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      title: 'Tummy Time',
      description: '3-5 minutes several times a day helps motor development',
      image: 'https://images.unsplash.com/photo-1758513422399-68a0aff34c8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwZ3Jvd3RoJTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzYyNzQ1NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      title: 'Bonding Time',
      description: 'Skin-to-skin contact strengthens parent-baby connection',
      image: 'https://images.unsplash.com/photo-1758691462119-792279713969?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJlbnRpbmclMjB0aXBzJTIwbW90aGVyJTIwY2hpbGR8ZW58MXx8fHwxNzYyNzQ1NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  const todayStats = [
    { icon: Activity, label: 'Feedings', value: '6', color: 'text-[#AEE1F9]' },
    { icon: Clock, label: 'Sleep', value: '14h', color: 'text-[#FADADD]' },
    { icon: Baby, label: 'Diapers', value: '8', color: 'text-[#E0BBE4]' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <AppBar title="Good morning, Sarah 👋" actions={['bell', 'menu']} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card with Baby Buddy */}
        <Card className="p-6 bg-gradient-to-br from-[#AEE1F9] to-[#FADADD] border-none shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-[#2C3E50] mb-1">Your AI Parenting Assistant</h2>
              <p className="text-sm text-[#2C3E50]/80">
                I'm here to help you every step of the way
              </p>
            </div>
            <BabyBuddy size="lg" />
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-4 text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-foreground">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Summary */}
        <Card className="p-5">
          <h3 className="mb-4 text-foreground">Today's Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            {todayStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-center">
                    <div className="text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Daily Tips Carousel */}
        <div>
          <h3 className="mb-4 text-foreground">Daily Tips</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {dailyTips.map((tip, index) => (
              <Card key={index} className="flex-shrink-0 w-72 overflow-hidden">
                <div className="relative h-40">
                  <ImageWithFallback
                    src={tip.image}
                    alt={tip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="mb-1 text-foreground">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
