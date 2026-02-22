
import { CardData, Suit, Rank } from '../types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): CardData[] => {
  const deck: CardData[] = [];
  let idCounter = 0;
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      let value = 0;
      if (rank === 'A') value = 1;
      else if (['J', 'Q', 'K'].includes(rank)) value = 10;
      else value = parseInt(rank);

      deck.push({
        id: `${rank}-${suit}-${idCounter++}-${Date.now()}`,
        suit,
        rank,
        value,
      });
    });
  });
  return shuffle(deck);
};

export const shuffle = (deck: CardData[]): CardData[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const isValidMove = (card: CardData, topCard: CardData | undefined, currentSuit: Suit | null): boolean => {
  if (!card) return false;
  // "1" (Ace) is always valid
  if (card.rank === 'A') return true;
  
  if (!topCard) return true; // If no top card, any card is valid (shouldn't happen in this game)
  
  const targetSuit = currentSuit || topCard.suit;
  
  return card.suit === targetSuit || card.rank === topCard.rank;
};

export const getAiMove = (hand: CardData[], topCard: CardData | undefined, currentSuit: Suit | null): CardData | null => {
  if (!hand || hand.length === 0 || !topCard) return null;
  
  // Priority 1: Matching rank or suit (non-wild)
  const normalMoves = hand.filter(c => c.rank !== 'A' && isValidMove(c, topCard, currentSuit));
  if (normalMoves.length > 0) {
    // Pick a random normal move
    return normalMoves[Math.floor(Math.random() * normalMoves.length)];
  }
  
  // Priority 2: Wild card
  const wildMove = hand.find(c => c.rank === 'A');
  if (wildMove) return wildMove;
  
  return null;
};
