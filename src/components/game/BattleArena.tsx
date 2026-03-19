import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { BattleSlime, BattleTurn, Slime } from '@/types/slime';
import { simulateBattle, calculateRewards, deriveBattleStats, generateOpponent } from '@/utils/battleEngine';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_ICONS } from '@/data/traitData';
import { audioEngine } from '@/utils/audioEngine';
import { toast } from 'sonner';
import { Swords, Zap, Shield, Heart, Trophy, X, ChevronRight } from 'lucide-react';

interface BattleArenaProps {
  onClose: () => void;
}

type BattlePhase = 'select' | 'intro' | 'fighting' | 'result';

export function BattleArena({ onClose }: BattleArenaProps) {
  const { state, dispatch } = useGameState();
  const [phase, setPhase] = useState<BattlePhase>('select');
  const [selectedSlime, setSelectedSlime] = useState<Slime | null>(null);
  const [playerStats, setPlayerStats] = useState<BattleSlime | null>(null);
  const [enemyStats, setEnemyStats] = useState<BattleSlime | null>(null);
  const [turns, setTurns] = useState<BattleTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerMaxHp, setPlayerMaxHp] = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [lastMove, setLastMove] = useState<BattleTurn | null>(null);
  const [won, setWon] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [rewards, setRewards] = useState({ goo: 0, xp: 0 });
  const turnTimer = useRef<ReturnType<typeof setTimeout>>();

  const startBattle = useCallback((slime: Slime) => {
    setSelectedSlime(slime);
    const result = simulateBattle(slime);
    const pStats = deriveBattleStats(slime);
    const eStats = generateOpponent(slime);
    
    // Re-simulate with these exact stats
    const sim = simulateBattle(slime);
    
    setPlayerStats(pStats);
    setEnemyStats(sim.enemyStats);
    setTurns(sim.turns);
    setPlayerHp(pStats.hp);
    setEnemyHp(sim.enemyStats.maxHp);
    setPlayerMaxHp(pStats.maxHp);
    setEnemyMaxHp(sim.enemyStats.maxHp);
    setCurrentTurn(0);
    setPhase('intro');

    // After intro, start fighting
    setTimeout(() => setPhase('fighting'), 1500);
  }, []);

  // Play turns automatically
  useEffect(() => {
    if (phase !== 'fighting' || currentTurn >= turns.length) return;

    turnTimer.current = setTimeout(() => {
      const turn = turns[currentTurn];
      setLastMove(turn);

      if (turn.attacker === 'player') {
        setShakeEnemy(true);
        setEnemyHp(turn.remainingHp);
        setTimeout(() => setShakeEnemy(false), 400);
      } else {
        setShakePlayer(true);
        setPlayerHp(turn.remainingHp);
        setTimeout(() => setShakePlayer(false), 400);
      }

      audioEngine.playSfx('tap');

      // Check if battle ended
      if (currentTurn === turns.length - 1 || turn.remainingHp <= 0) {
        setTimeout(() => {
          const playerWon = turn.attacker === 'player' ? turn.remainingHp <= 0 ? false : true : turn.remainingHp <= 0 ? true : false;
          // Actually: if enemy's hp <= 0 after player attack, player won. If player's hp <= 0 after enemy attack, player lost.
          const didWin = turn.attacker === 'player' ? true : false; // Last hit determines winner
          // More accurate: check final HPs
          const finalPlayerAlive = turn.attacker === 'enemy' ? turn.remainingHp > 0 : true;
          const finalEnemyAlive = turn.attacker === 'player' ? turn.remainingHp > 0 : true;
          const victory = !finalEnemyAlive || (finalPlayerAlive && !finalEnemyAlive);
          
          setWon(!finalEnemyAlive);
          
          if (selectedSlime && enemyStats) {
            const r = calculateRewards(selectedSlime, !finalEnemyAlive, enemyStats.slime.level);
            setRewards(r);
            dispatch({ type: 'BATTLE_REWARD', slimeId: selectedSlime.id, goo: r.goo, xp: r.xp });
            
            if (!finalEnemyAlive) {
              audioEngine.playSfx('achievement');
            }
          }
          
          setPhase('result');
        }, 800);
        return;
      }

      setCurrentTurn(prev => prev + 1);
    }, 1200);

    return () => { if (turnTimer.current) clearTimeout(turnTimer.current); };
  }, [phase, currentTurn, turns, selectedSlime, enemyStats, dispatch]);

  // Slime selection screen
  if (phase === 'select') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
          <X className="w-8 h-8" />
        </button>
        
        <div className="text-center mb-6">
          <Swords className="w-12 h-12 text-[#FF7EB6] mx-auto mb-2" />
          <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Press Start 2P' }}>BATTLE ARENA</h2>
          <p className="text-white/60 text-sm mt-2">Choose your champion</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl max-h-[60vh] overflow-y-auto p-2">
          {state.slimes.map(slime => {
            const stats = deriveBattleStats(slime);
            return (
              <button
                key={slime.id}
                onClick={() => startBattle(slime)}
                className="bg-black/50 border border-[#FF7EB6]/30 rounded-xl p-3 hover:border-[#FF7EB6] hover:bg-[#FF7EB6]/10 transition-all hover:scale-105 group"
              >
                <div className="w-16 h-16 mx-auto mb-2">
                  <SlimeCanvas slime={slime} size={64} />
                </div>
                <p className="text-white text-xs font-bold truncate">{slime.name}</p>
                <p className="text-white/50 text-[10px]">Lv.{slime.level} {ELEMENT_ICONS[slime.element]}</p>
                <div className="flex gap-1 mt-1 justify-center">
                  <span className="text-[9px] text-red-400">⚔{stats.attack}</span>
                  <span className="text-[9px] text-blue-400">🛡{stats.defense}</span>
                  <span className="text-[9px] text-green-400">💚{stats.maxHp}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Battle screen (intro, fighting, result)
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in overflow-hidden">
      {/* Battle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#0d0d2b] to-[#050510]">
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,126,182,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,126,182,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
          {phase === 'intro' && '⚡ Battle Start!'}
          {phase === 'fighting' && `Turn ${currentTurn + 1}`}
          {phase === 'result' && (won ? '🏆 Victory!' : '💀 Defeat')}
        </span>
        <div className="w-6" />
      </div>

      {/* Battle field */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 px-4">
        {/* Enemy side */}
        {enemyStats && (
          <div className={`flex items-center gap-4 transition-transform ${shakeEnemy ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
            <div className="text-right">
              <p className="text-white font-bold text-sm">{enemyStats.slime.name}</p>
              <p className="text-white/50 text-xs">Lv.{enemyStats.slime.level} {ELEMENT_ICONS[enemyStats.slime.element]}</p>
              {/* HP bar */}
              <div className="w-40 h-3 bg-black/60 rounded-full overflow-hidden mt-1 border border-white/10">
                <div
                  className="h-full transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${Math.max(0, (enemyHp / enemyMaxHp) * 100)}%`,
                    background: enemyHp / enemyMaxHp > 0.5 ? '#4ade80' : enemyHp / enemyMaxHp > 0.2 ? '#fbbf24' : '#ef4444',
                  }}
                />
              </div>
              <p className="text-white/40 text-[10px] mt-0.5">{enemyHp}/{enemyMaxHp} HP</p>
            </div>
            <div className={`w-20 h-20 ${phase === 'intro' ? 'animate-scale-in' : ''}`}>
              <SlimeCanvas slime={enemyStats.slime} size={80} />
            </div>
          </div>
        )}

        {/* Move display */}
        <div className="h-16 flex items-center justify-center">
          {lastMove && phase === 'fighting' && (
            <div className="animate-scale-in text-center">
              <p className="text-lg font-black text-white">
                {lastMove.move.emoji} {lastMove.move.name}
              </p>
              <p className={`text-sm font-bold ${
                lastMove.move.effectiveness === 'super' ? 'text-yellow-400' :
                lastMove.move.effectiveness === 'weak' ? 'text-blue-300' : 'text-white/60'
              }`}>
                {lastMove.move.isCrit && '💥 CRITICAL! '}
                {lastMove.move.effectiveness === 'super' && '⚡ Super effective! '}
                {lastMove.move.effectiveness === 'weak' && '🛡 Not very effective... '}
                -{lastMove.move.damage} HP
              </p>
            </div>
          )}
          
          {phase === 'intro' && (
            <div className="animate-scale-in">
              <p className="text-xl font-black text-[#FF7EB6]" style={{ fontFamily: 'Press Start 2P', fontSize: '14px' }}>
                VS
              </p>
            </div>
          )}
        </div>

        {/* Player side */}
        {playerStats && selectedSlime && (
          <div className={`flex items-center gap-4 transition-transform ${shakePlayer ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
            <div className={`w-20 h-20 ${phase === 'intro' ? 'animate-scale-in' : ''}`}>
              <SlimeCanvas slime={selectedSlime} size={80} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{selectedSlime.name}</p>
              <p className="text-white/50 text-xs">Lv.{selectedSlime.level} {ELEMENT_ICONS[selectedSlime.element]}</p>
              <div className="w-40 h-3 bg-black/60 rounded-full overflow-hidden mt-1 border border-white/10">
                <div
                  className="h-full transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`,
                    background: playerHp / playerMaxHp > 0.5 ? '#4ade80' : playerHp / playerMaxHp > 0.2 ? '#fbbf24' : '#ef4444',
                  }}
                />
              </div>
              <p className="text-white/40 text-[10px] mt-0.5">{playerHp}/{playerMaxHp} HP</p>
            </div>
          </div>
        )}
      </div>

      {/* Result overlay */}
      {phase === 'result' && (
        <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center animate-fade-in">
          <div className="text-center animate-scale-in">
            {won ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-black text-yellow-400 mb-2" style={{ fontFamily: 'Press Start 2P', fontSize: '20px' }}>
                  VICTORY!
                </h2>
              </>
            ) : (
              <>
                <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-red-400 mb-2" style={{ fontFamily: 'Press Start 2P', fontSize: '20px' }}>
                  DEFEAT
                </h2>
              </>
            )}
            
            <div className="flex gap-6 mt-4 mb-6">
              <div className="text-center">
                <p className="text-yellow-300 text-2xl font-black">+{rewards.goo}</p>
                <p className="text-white/50 text-xs">GOO</p>
              </div>
              <div className="text-center">
                <p className="text-cyan-300 text-2xl font-black">+{rewards.xp}</p>
                <p className="text-white/50 text-xs">XP</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPhase('select');
                  setLastMove(null);
                  setCurrentTurn(0);
                }}
                className="px-6 py-3 bg-[#FF7EB6] text-black font-black rounded-xl hover:bg-[#FF7EB6]/80 transition-all hover:scale-105"
              >
                Battle Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
