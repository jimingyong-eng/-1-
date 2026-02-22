/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CardData, Suit, GameStatus, GameStats } from './types';
import { createDeck, isValidMove, getAiMove, SUITS } from './utils/gameLogic';
import { Card } from './components/Card';
import { Trophy, RotateCcw, Play, Info, X, Heart, Diamond, Club, Spade, AlertCircle } from 'lucide-react';

// --- Types & Reducer ---

type GameState = {
  status: GameStatus;
  deck: CardData[];
  playerHand: CardData[];
  aiHand: CardData[];
  discardPile: CardData[];
  turn: 'player' | 'ai';
  currentSuit: Suit | null;
  message: string;
  isAiThinking: boolean;
  showSuitPicker: boolean;
};

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PLAYER_PLAY'; card: CardData }
  | { type: 'AI_PLAY'; card: CardData }
  | { type: 'DRAW'; who: 'player' | 'ai' }
  | { type: 'SET_SUIT'; suit: Suit }
  | { type: 'SET_MENU' }
  | { type: 'SET_AI_THINKING'; value: boolean }
  | { type: 'SKIP_TURN'; who: 'player' | 'ai' };

const initialState: GameState = {
  status: 'menu',
  deck: [],
  playerHand: [],
  aiHand: [],
  discardPile: [],
  turn: 'player',
  currentSuit: null,
  message: '',
  isAiThinking: false,
  showSuitPicker: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const newDeck = createDeck();
      const pHand = newDeck.splice(0, 8);
      const aHand = newDeck.splice(0, 8);
      let firstDiscard = newDeck.pop()!;
      while (firstDiscard.rank === 'A') {
        newDeck.unshift(firstDiscard);
        firstDiscard = newDeck.pop()!;
      }
      return {
        ...initialState,
        status: 'playing',
        deck: newDeck,
        playerHand: pHand,
        aiHand: aHand,
        discardPile: [firstDiscard],
        message: '你的回合！',
      };
    }

    case 'PLAYER_PLAY': {
      const { card } = action;
      const newHand = state.playerHand.filter(c => c.id !== card.id);
      const isGameOver = newHand.length === 0;
      
      return {
        ...state,
        playerHand: newHand,
        discardPile: [...state.discardPile, card],
        status: isGameOver ? 'gameOver' : state.status,
        showSuitPicker: !isGameOver && card.rank === 'A',
        currentSuit: card.rank === 'A' ? state.currentSuit : null,
        turn: isGameOver || card.rank === 'A' ? 'player' : 'ai',
        message: isGameOver ? '你赢了！' : (card.rank === 'A' ? '请选择花色' : 'AI 正在思考...'),
      };
    }

    case 'AI_PLAY': {
      const { card } = action;
      const newHand = state.aiHand.filter(c => c.id !== card.id);
      const isGameOver = newHand.length === 0;
      
      return {
        ...state,
        aiHand: newHand,
        discardPile: [...state.discardPile, card],
        status: isGameOver ? 'gameOver' : state.status,
        currentSuit: card.rank === 'A' ? state.currentSuit : null, // Will be set by SET_SUIT for AI
        turn: 'player',
        message: isGameOver ? 'AI 赢了' : '你的回合！',
      };
    }

    case 'DRAW': {
      if (state.deck.length === 0) return state;
      const newDeck = [...state.deck];
      const drawnCard = newDeck.pop()!;
      
      if (action.who === 'player') {
        return {
          ...state,
          deck: newDeck,
          playerHand: [...state.playerHand, drawnCard],
          turn: 'ai',
          message: '你摸了一张牌。AI 思考中...',
        };
      } else {
        return {
          ...state,
          deck: newDeck,
          aiHand: [...state.aiHand, drawnCard],
          turn: 'player',
          message: 'AI 摸了一张牌。你的回合！',
        };
      }
    }

    case 'SET_SUIT': {
      return {
        ...state,
        currentSuit: action.suit,
        showSuitPicker: false,
        turn: 'ai',
        message: `已指定花色. AI 思考中...`,
      };
    }

    case 'SET_MENU':
      return { ...initialState, status: 'menu' };

    case 'SET_AI_THINKING':
      return { ...state, isAiThinking: action.value };

    case 'SKIP_TURN':
      return {
        ...state,
        turn: action.who === 'player' ? 'ai' : 'player',
        message: '摸牌堆已空，跳过回合！',
      };

    default:
      return state;
  }
}

// --- Components ---

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Game Crash Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <h1 className="text-3xl font-black text-white mb-2 italic">糟糕，游戏出错了</h1>
          <p className="text-zinc-400 mb-8">别担心，我们可以重新开始。</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-full">刷新页面</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SuitIcon = ({ suit, size = 24 }: { suit: Suit | null; size?: number }) => {
  if (!suit) return null;
  switch (suit) {
    case 'hearts': return <Heart size={size} className="text-red-500 fill-red-500" />;
    case 'diamonds': return <Diamond size={size} className="text-red-500 fill-red-500" />;
    case 'clubs': return <Club size={size} className="text-black fill-black" />;
    case 'spades': return <Spade size={size} className="text-black fill-black" />;
    default: return null;
  }
};

export default function App() {
  return (
    <ErrorBoundary>
      <GameContent />
    </ErrorBoundary>
  );
}

function GameContent() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem('crazy_ones_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.playerWins === 'number') return parsed;
      }
    } catch (e) {}
    return { playerWins: 0, aiWins: 0 };
  });

  useEffect(() => {
    localStorage.setItem('crazy_ones_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (state.status === 'gameOver') {
      if (state.playerHand.length === 0) {
        setStats(prev => ({ ...prev, playerWins: prev.playerWins + 1 }));
        try { confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
      } else if (state.aiHand.length === 0) {
        setStats(prev => ({ ...prev, aiWins: prev.aiWins + 1 }));
      }
    }
  }, [state.status]);

  // AI Logic
  useEffect(() => {
    let isMounted = true;
    if (state.status === 'playing' && state.turn === 'ai' && !state.isAiThinking) {
      dispatch({ type: 'SET_AI_THINKING', value: true });
      const timer = setTimeout(() => {
        if (!isMounted || state.status !== 'playing' || state.turn !== 'ai') return;
        
        const topCard = state.discardPile[state.discardPile.length - 1];
        const move = getAiMove(state.aiHand, topCard, state.currentSuit);

        if (move) {
          dispatch({ type: 'AI_PLAY', card: move });
          if (move.rank === 'A') {
            const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
            dispatch({ type: 'SET_SUIT', suit: randomSuit });
          }
        } else {
          if (state.deck.length > 0) {
            dispatch({ type: 'DRAW', who: 'ai' });
          } else {
            dispatch({ type: 'SKIP_TURN', who: 'ai' });
          }
        }
        dispatch({ type: 'SET_AI_THINKING', value: false });
      }, 1500);
      return () => { isMounted = false; clearTimeout(timer); };
    }
  }, [state.turn, state.status, state.aiHand.length, state.discardPile.length, state.currentSuit]);

  const handlePlayerPlay = (card: CardData) => {
    if (state.status !== 'playing' || state.turn !== 'player' || state.isAiThinking) return;
    const topCard = state.discardPile[state.discardPile.length - 1];
    if (isValidMove(card, topCard, state.currentSuit)) {
      dispatch({ type: 'PLAYER_PLAY', card });
    }
  };

  if (state.status === 'menu') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-60 scale-105" style={{ backgroundImage: `url('https://picsum.photos/seed/superfamily-sister/1920/1080')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center p-8">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 italic">CRAZY <span className="text-yellow-500">ONES</span></h1>
          <p className="text-xl text-gray-300 mb-12 uppercase tracking-widest">小季家疯狂 1 点</p>
          <button onClick={() => dispatch({ type: 'START_GAME' })} className="px-12 py-4 bg-yellow-500 text-black font-bold text-2xl rounded-full hover:scale-105 transition-transform shadow-xl">开始游戏</button>
          <div className="mt-12 flex gap-8 justify-center text-white/70">
            <div className="text-center"><div className="text-xs opacity-50 uppercase">玩家</div><div className="text-3xl font-bold text-yellow-500">{stats.playerWins}</div></div>
            <div className="text-center"><div className="text-xs opacity-50 uppercase">AI</div><div className="text-3xl font-bold text-red-500">{stats.aiWins}</div></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-emerald-900 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
      
      {/* Header */}
      <div className="relative z-10 p-4 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-black italic text-xl">CRAZY ONES</h2>
          <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-white/70 uppercase tracking-widest">{state.message}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch({ type: 'START_GAME' })} className="p-2 hover:bg-white/10 rounded-full text-white/70"><RotateCcw size={18} /></button>
          <button onClick={() => dispatch({ type: 'SET_MENU' })} className="p-2 hover:bg-white/10 rounded-full text-white/70"><X size={18} /></button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-grow flex flex-col justify-between p-4 relative">
        {/* AI Hand */}
        <div className="flex justify-center h-32">
          <div className="flex -space-x-12">
            {state.aiHand.map((card) => <Card key={card.id} isFlipped={false} className="scale-75 origin-top" />)}
          </div>
        </div>

        {/* Center */}
        <div className="flex justify-center items-center gap-12 my-4">
          <div className="relative">
            <Card onClick={() => state.turn === 'player' && dispatch({ type: 'DRAW', who: 'player' })} disabled={state.turn !== 'player' || state.isAiThinking} />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold uppercase">摸牌 ({state.deck.length})</div>
          </div>

          <div className="relative w-24 h-36">
            <AnimatePresence mode="wait">
              {state.discardPile.length > 0 && (
                <motion.div key={state.discardPile[state.discardPile.length - 1].id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                  <Card card={state.discardPile[state.discardPile.length - 1]} isFlipped={true} disabled />
                </motion.div>
              )}
            </AnimatePresence>
            {state.currentSuit && (
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-yellow-500 z-30">
                <SuitIcon suit={state.currentSuit} size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Player Hand */}
        <div className="flex justify-center h-44">
          <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar items-center">
            {state.playerHand.map((card) => (
              <Card key={card.id} card={card} isFlipped={true} onClick={() => handlePlayerPlay(card)} disabled={state.turn !== 'player' || state.isAiThinking} />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {state.showSuitPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4">
              <h3 className="text-xl font-black mb-6 uppercase">选择花色</h3>
              <div className="grid grid-cols-2 gap-4">
                {SUITS.map(s => (
                  <button key={s} onClick={() => dispatch({ type: 'SET_SUIT', suit: s })} className="flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:bg-yellow-50 transition-colors">
                    <SuitIcon suit={s} size={32} />
                    <span className="mt-2 text-[10px] font-bold uppercase">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.status === 'gameOver' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900 p-12 rounded-[40px] shadow-2xl text-center max-w-md w-full mx-4 border border-white/10">
              <Trophy size={64} className="text-yellow-500 mx-auto mb-6" />
              <h2 className="text-4xl font-black text-white mb-8 italic uppercase">{state.playerHand.length === 0 ? "你赢了！" : "AI 赢了"}</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5"><div className="text-[10px] text-white/30 uppercase mb-1">玩家</div><div className="text-2xl font-bold text-white">{stats.playerWins}</div></div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5"><div className="text-[10px] text-white/30 uppercase mb-1">AI</div><div className="text-2xl font-bold text-white">{stats.aiWins}</div></div>
              </div>
              <button onClick={() => dispatch({ type: 'START_GAME' })} className="w-full py-4 bg-yellow-500 text-black font-black text-xl rounded-2xl hover:scale-105 transition-transform">再来一局</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
