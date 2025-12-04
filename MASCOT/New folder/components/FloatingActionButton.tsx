import { Plus, MessageCircle } from 'lucide-react';

interface FABProps {
  icon?: 'plus' | 'message';
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ icon = 'plus', onClick, label }: FABProps) {
  const Icon = icon === 'plus' ? Plus : MessageCircle;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      style={{ boxShadow: '0 4px 12px rgba(174, 225, 249, 0.4)' }}
    >
      {label ? (
        <>
          <span className="pl-6 pr-2 py-4 text-[#2C3E50]">{label}</span>
          <div className="pr-6">
            <Icon className="w-6 h-6 text-[#2C3E50]" />
          </div>
        </>
      ) : (
        <div className="p-4">
          <Icon className="w-6 h-6 text-[#2C3E50]" />
        </div>
      )}
    </button>
  );
}
