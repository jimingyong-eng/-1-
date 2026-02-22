
import React from 'react';
import { motion } from 'motion/react';
import { CardData, Suit } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card?: CardData;
  isFlipped?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const SuitIcon = ({ suit, size = 20 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case 'hearts': return <Heart size={size} className="text-red-500 fill-red-500" />;
    case 'diamonds': return <Diamond size={size} className="text-red-500 fill-red-500" />;
    case 'clubs': return <Club size={size} className="text-black fill-black" />;
    case 'spades': return <Spade size={size} className="text-black fill-black" />;
  }
};

export const Card: React.FC<CardProps> = ({ card, isFlipped = false, onClick, className = "", disabled = false }) => {
  const content = isFlipped && card ? (
    <div className="w-full h-full bg-white rounded-lg border-2 border-gray-200 flex flex-col p-2 relative shadow-md">
      <div className="flex flex-col items-start leading-none">
        <span className={`text-xl font-bold ${['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-black'}`}>
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} size={14} />
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <SuitIcon suit={card.suit} size={60} />
      </div>
      
      <div className="flex-grow flex items-center justify-center">
         <SuitIcon suit={card.suit} size={32} />
      </div>
      
      <div className="flex flex-col items-end leading-none rotate-180">
        <span className={`text-xl font-bold ${['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-black'}`}>
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} size={14} />
      </div>
    </div>
  ) : (
    <div className="w-full h-full bg-red-700 rounded-lg border-2 border-yellow-500 flex items-center justify-center p-2 shadow-md relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent"></div>
      <div className="text-yellow-400 font-serif text-center leading-tight z-10">
        <div className="text-xs font-bold tracking-widest mb-1">恭喜</div>
        <div className="text-xl font-black">发财</div>
        <div className="text-xs font-bold tracking-widest mt-1">GONG XI</div>
      </div>
      {/* Decorative corners */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-yellow-500/50"></div>
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-yellow-500/50"></div>
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-yellow-500/50"></div>
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-yellow-500/50"></div>
    </div>
  );

  return (
    <motion.div
      whileHover={!disabled && onClick ? { y: -10, scale: 1.05 } : {}}
      whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`relative w-24 h-36 cursor-pointer select-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {content}
    </motion.div>
  );
};
