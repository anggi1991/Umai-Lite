import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { BabyBuddy } from '../BabyBuddy';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'support', label: 'Support' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <BabyBuddy size="sm" animate={false} />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-lg text-foreground">Parenting AI</span>
              </div>
              <span className="text-xs text-muted-foreground -mt-1">with Baby Buddy 🤗</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'features' || item.id === 'pricing') {
                    onNavigate('home');
                    setTimeout(() => {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`text-sm transition-colors hover:text-[#AEE1F9] ${
                  currentPage === item.id ? 'text-[#AEE1F9]' : 'text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="px-6 py-2 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] rounded-full text-sm text-[#2C3E50] hover:shadow-lg transition-shadow">
              Download App
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'features' || item.id === 'pricing') {
                      onNavigate('home');
                      setIsMobileMenuOpen(false);
                      setTimeout(() => {
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-muted text-[#AEE1F9]'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button className="mt-2 px-6 py-3 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] rounded-full text-sm text-[#2C3E50] hover:shadow-lg transition-shadow">
                Download App
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
