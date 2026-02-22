
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface CardData {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
}

export type GameStatus = 'menu' | 'playing' | 'gameOver';

export interface GameStats {
  playerWins: number;
  aiWins: number;
}
