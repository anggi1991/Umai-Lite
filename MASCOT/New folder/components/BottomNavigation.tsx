import { Home, BookOpen, MessageCircle, BarChart3, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center min-w-[64px] h-full gap-1 transition-colors"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-[#AEE1F9]' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  isActive ? 'text-[#AEE1F9]' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
