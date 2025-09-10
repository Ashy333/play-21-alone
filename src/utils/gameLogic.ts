import type { Card, Hand, Suit, Rank } from '@/types/game';

const suits: Suit[] = ['♠', '♥', '♦', '♣'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      const card: Card = {
        suit,
        rank,
        value: getCardValue(rank),
        isAce: rank === 'A'
      };
      deck.push(card);
    }
  }
  
  return shuffleDeck(deck);
};

const getCardValue = (rank: Rank): number => {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank);
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculateHandValue = (cards: Card[]): { value: number; hasAce: boolean } => {
  let value = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card.isAce) {
      aces++;
      value += 11;
    } else {
      value += card.value;
    }
  }
  
  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  return { value, hasAce: cards.some(card => card.isAce) };
};

export const createHand = (cards: Card[]): Hand => {
  const { value, hasAce } = calculateHandValue(cards);
  
  return {
    cards,
    value,
    hasAce,
    isBust: value > 21,
    isBlackjack: cards.length === 2 && value === 21
  };
};

export const shouldDealerHit = (dealerHand: Hand): boolean => {
  return dealerHand.value < 17;
};

export const determineWinner = (playerHand: Hand, dealerHand: Hand): 'win' | 'lose' | 'push' => {
  if (playerHand.isBust) return 'lose';
  if (dealerHand.isBust) return 'win';
  
  if (playerHand.isBlackjack && !dealerHand.isBlackjack) return 'win';
  if (!playerHand.isBlackjack && dealerHand.isBlackjack) return 'lose';
  if (playerHand.isBlackjack && dealerHand.isBlackjack) return 'push';
  
  if (playerHand.value > dealerHand.value) return 'win';
  if (playerHand.value < dealerHand.value) return 'lose';
  
  return 'push';
};