import { Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card?: Card;
  isHidden?: boolean;
  className?: string;
  isDealing?: boolean;
}

const PlayingCard = ({ card, isHidden = false, className, isDealing = false }: PlayingCardProps) => {
  const isRed = card?.suit === '♥' || card?.suit === '♦';
  
  if (isHidden) {
    return (
      <div className={cn(
        "w-20 h-28 md:w-24 md:h-32 rounded-lg playing-card",
        "bg-gradient-to-br from-blue-900 to-blue-700",
        "flex items-center justify-center",
        "border-2 border-blue-600",
        isDealing && "deal-animation",
        className
      )}>
        <div className="text-2xl text-blue-200">
          ♠
        </div>
      </div>
    );
  }
  
  if (!card) {
    return (
      <div className={cn(
        "w-20 h-28 md:w-24 md:h-32 rounded-lg",
        "border-2 border-dashed border-muted",
        "flex items-center justify-center",
        className
      )}>
        <div className="text-muted-foreground text-sm">Empty</div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "w-20 h-28 md:w-24 md:h-32 rounded-lg playing-card",
      "flex flex-col justify-between p-2",
      "bg-white text-card-foreground",
      "select-none",
      isDealing && "deal-animation",
      className
    )}>
      {/* Top rank and suit */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "text-sm md:text-base font-bold leading-none",
          isRed ? "text-red-600" : "text-black"
        )}>
          {card.rank}
        </div>
        <div className={cn(
          "text-lg md:text-xl leading-none",
          isRed ? "text-red-600" : "text-black"
        )}>
          {card.suit}
        </div>
      </div>
      
      {/* Center suit (larger) */}
      <div className={cn(
        "text-2xl md:text-3xl self-center",
        isRed ? "text-red-600" : "text-black"
      )}>
        {card.suit}
      </div>
      
      {/* Bottom rank and suit (rotated) */}
      <div className="flex flex-col items-center rotate-180">
        <div className={cn(
          "text-sm md:text-base font-bold leading-none",
          isRed ? "text-red-600" : "text-black"
        )}>
          {card.rank}
        </div>
        <div className={cn(
          "text-lg md:text-xl leading-none",
          isRed ? "text-red-600" : "text-black"
        )}>
          {card.suit}
        </div>
      </div>
    </div>
  );
};

export default PlayingCard;