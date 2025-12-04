import { motion } from 'motion/react';

interface BabyBuddyProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function BabyBuddy({ size = 'md', animate = true }: BabyBuddyProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const animationVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative flex items-center justify-center`}
      animate={animate ? 'float' : undefined}
      variants={animationVariants}
    >
      {/* Glowing halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#AEE1F9] to-[#FADADD] opacity-30 blur-lg"></div>
      
      {/* Baby face */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#FFE4E1] to-[#FADADD] flex items-center justify-center shadow-md">
        {/* Eyes */}
        <div className="flex gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#2C3E50]"></div>
          <div className="w-2 h-2 rounded-full bg-[#2C3E50]"></div>
        </div>
        
        {/* Smile */}
        <div className="absolute bottom-3">
          <div className="w-4 h-2 border-b-2 border-[#2C3E50] rounded-full"></div>
        </div>
      </div>
      
      {/* AI sparkle */}
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#AEE1F9] shadow-lg">
        <div className="absolute inset-0 rounded-full bg-[#AEE1F9] animate-ping opacity-75"></div>
      </div>
    </motion.div>
  );
}
