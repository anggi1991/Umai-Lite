import {
  ArrowLeft,
  MoreVertical,
  Search,
  Bell,
} from "lucide-react";

interface AppBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: ("search" | "bell" | "menu")[];
}

export function AppBar({
  title,
  subtitle,
  showBack,
  onBack,
  actions = [],
}: AppBarProps) {
  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4 flex-1">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-foreground" />
              </button>
            )}
            <div className="flex-1">
              {subtitle && (
                <div className="text-xs text-muted-foreground">
                  {subtitle}
                </div>
              )}
              {title && (
                <div className="text-foreground">{title}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <button
                key={action}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                {action === "search" && (
                  <Search className="w-5 h-5 text-foreground" />
                )}
                {action === "bell" && (
                  <Bell className="w-5 h-5 text-foreground" />
                )}
                {action === "menu" && (
                  <MoreVertical className="w-5 h-5 text-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}