export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  isAce: boolean;
}

export interface Hand {
  cards: Card[];
  value: number;
  hasAce: boolean;
  isBust: boolean;
  isBlackjack: boolean;
}

export type GamePhase = 'betting' | 'dealing' | 'playerTurn' | 'dealerTurn' | 'gameOver';
export type GameResult = 'win' | 'lose' | 'push' | null;

export interface GameState {
  phase: GamePhase;
  result: GameResult;
  playerHand: Hand;
  dealerHand: Hand;
  deck: Card[];
  chips: number;
  bet: number;
  isDealing: boolean;
}