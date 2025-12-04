import { BabyBuddy } from '../BabyBuddy';
import { Mail, MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#F5F5F5] border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <BabyBuddy size="sm" animate={false} />
              <div>
                <div className="text-foreground">Parenting AI</div>
                <div className="text-xs text-muted-foreground">with Baby Buddy</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your smart parenting companion
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm text-foreground mb-4">Legal</h4>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('privacy')}
                className="block text-sm text-muted-foreground hover:text-[#AEE1F9] transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => onNavigate('terms')}
                className="block text-sm text-muted-foreground hover:text-[#AEE1F9] transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm text-foreground mb-4">Support</h4>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('support')}
                className="block text-sm text-muted-foreground hover:text-[#AEE1F9] transition-colors"
              >
                Help Center
              </button>
              <a
                href="mailto:support@parentingai.app"
                className="block text-sm text-muted-foreground hover:text-[#AEE1F9] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm text-foreground mb-4">Connect</h4>
            <div className="space-y-2">
              <a
                href="mailto:hello@parentingai.app"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#AEE1F9] transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
              <a
                href="mailto:feedback@parentingai.app"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#AEE1F9] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Feedback
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Parenting AI. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Made with 💙 for parents everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
