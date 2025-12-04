import { useState } from 'react';
import { BottomNavigation } from './components/BottomNavigation';
import { FloatingActionButton } from './components/FloatingActionButton';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { StatsScreen } from './components/StatsScreen';
import { JournalScreen } from './components/JournalScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeScreen, setActiveScreen] = useState<string | null>(null);

  const handleNavigate = (screen: string) => {
    if (screen === 'home' || screen === 'journal' || screen === 'chat' || screen === 'stats' || screen === 'profile') {
      setActiveTab(screen);
      setActiveScreen(null);
    } else {
      setActiveScreen(screen);
    }
  };

  const handleBack = () => {
    setActiveScreen(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveScreen(null);
  };

  const handleFABClick = () => {
    setActiveTab('chat');
    setActiveScreen(null);
  };

  const renderScreen = () => {
    // If there's an active screen overlay, show it
    if (activeScreen === 'chat') {
      return <ChatScreen onBack={handleBack} />;
    }
    if (activeScreen === 'stats') {
      return <StatsScreen onBack={handleBack} />;
    }
    if (activeScreen === 'journal') {
      return <JournalScreen onBack={handleBack} />;
    }

    // Otherwise show tab content
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'journal':
        return <JournalScreen onBack={handleBack} />;
      case 'chat':
        return <ChatScreen onBack={handleBack} />;
      case 'stats':
        return <StatsScreen onBack={handleBack} />;
      case 'profile':
        return <ProfileScreen onBack={handleBack} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative">
      {/* Android Status Bar Simulation */}
      <div className="fixed top-0 left-0 right-0 h-6 bg-white z-50 flex items-center justify-between px-4 text-xs text-foreground border-b border-border">
        <span>9:41</span>
        <div className="flex items-center gap-2">
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Main App Container - Mobile Size */}
      <div className="pt-6 min-h-screen bg-background">
        <div className="max-w-md mx-auto relative bg-white min-h-screen shadow-xl">
          {renderScreen()}

          {/* Bottom Navigation */}
          {!activeScreen && <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />}

          {/* Floating Action Button - Only show on home */}
          {activeTab === 'home' && !activeScreen && (
            <FloatingActionButton icon="message" onClick={handleFABClick} label="Ask AI" />
          )}

          {/* FAB for adding entries on other tabs */}
          {(activeTab === 'stats' || activeTab === 'journal') && !activeScreen && (
            <FloatingActionButton icon="plus" onClick={() => {}} />
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
