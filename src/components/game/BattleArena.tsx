<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { BattleSlime, SlimeElement } from '@/types/slime';
import { calculateDamage } from '@/utils/battleEngine';
import { SlimeCanvas } from './SlimeCanvas';
import { Button } from '@/components/ui/button';
import { Sword, Trophy, AlertCircle, TrendingUp, Coins, Zap, Shield, X } from 'lucide-react';
import { ELEMENT_ICONS, ELEMENT_COLORS } from '@/data/traitData';
import { audioEngine } from '@/utils/audioEngine';

interface BattleArenaProps {
  level: number;
  playerTeam: BattleSlime[];
  opponentTeam: BattleSlime[];
  onClose: () => void;
}

interface Move {
  name: string;
  type: SlimeElement;
  power: number;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  icon: string;
  progress: number;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ level, playerTeam, opponentTeam, onClose }) => {
  const { dispatch } = useGameState();
  const [pTeam, setPTeam] = useState<BattleSlime[]>(playerTeam.map(s => ({ ...s, battleStats: { ...s.battleStats } })));
  const [oTeam, setOTeam] = useState<BattleSlime[]>(opponentTeam.map(s => ({ ...s, battleStats: { ...s.battleStats } })));
  
  const [activeSlimeIdx, setActiveSlimeIdx] = useState<number | null>(null);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
  const [isProcessing, setIsProcessing] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>(["Battle Started!"]);
  const [showSummary, setShowSummary] = useState(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  // Animation states
  const [attackerId, setAttackerId] = useState<string | null>(null);
  const [defenderId, setDefenderId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [floatingDamage, setFloatingDamage] = useState<{ id: string, amount: number, x: number, y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const battleLogsRef = useRef<HTMLDivElement>(null);

  const getMoves = (slime: BattleSlime): Move[] => {
    return slime.elements.slice(0, 3).map(el => ({
      name: `${el.charAt(0).toUpperCase() + el.slice(1)} Burst`,
      type: el,
      power: 1.0
    }));
  };

  const dispatchRewards = (resultWinner: 'player' | 'opponent') => {
    const gooReward = resultWinner === 'player' ? 25 + Math.floor(Math.random() * 26) : 5;
    const xpReward = resultWinner === 'player' ? 30 + Math.floor(Math.random() * 21) : 10;
    
    dispatch({
      type: 'BATTLE_REWARD',
      result: {
        playerTeam: playerTeam,
        opponentTeam: opponentTeam,
        winner: resultWinner,
        gooReward,
        xpReward,
        levelReached: level
      }
    });
  };

  const executeAttack = (attacker: BattleSlime, defender: BattleSlime, move: Move, isPlayerAttacker: boolean) => {
    setIsProcessing(true);
    setAttackerId(attacker.id);
    audioEngine.playSfx('tap');

    const attackerEl = document.getElementById(`slime-${attacker.id}`);
    const defenderEl = document.getElementById(`slime-${defender.id}`);
    
    if (attackerEl && defenderEl) {
      const aRect = attackerEl.getBoundingClientRect();
      const dRect = defenderEl.getBoundingClientRect();
      const cRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

      const newProj: Projectile = {
        id: Math.random().toString(),
        x: aRect.left + aRect.width / 2 - cRect.left,
        y: aRect.top + aRect.height / 2 - cRect.top,
        targetX: dRect.left + dRect.width / 2 - cRect.left,
        targetY: dRect.top + dRect.height / 2 - cRect.top,
        icon: ELEMENT_ICONS[move.type],
        progress: 0
      };
      setProjectiles(prev => [...prev, newProj]);

      let start: number | null = null;
      const duration = 600;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setProjectiles(prev => prev.map(p => p.id === newProj.id ? { ...p, progress } : p));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setProjectiles(prev => prev.filter(p => p.id !== newProj.id));
          handleImpact(attacker, defender, move, isPlayerAttacker, dRect, cRect);
        }
      };
      requestAnimationFrame(step);
    } else {
      handleImpact(attacker, defender, move, isPlayerAttacker, { left: 0, top: 0, width: 0, height: 0 }, { left: 0, top: 0 });
    }
  };

  const handleImpact = (attacker: BattleSlime, defender: BattleSlime, move: Move, isPlayerAttacker: boolean, dRect: any, cRect: any) => {
    const { damage } = calculateDamage(attacker, defender, move.type);
    setDefenderId(defender.id);
    setFloatingDamage({ 
      id: defender.id, 
      amount: damage, 
      x: dRect.left + dRect.width / 2 - cRect.left,
      y: dRect.top - cRect.top
    });
    audioEngine.playSfx('hatch');

    setBattleLogs(prev => [...prev, `${attacker.name} used ${move.name}! ${damage} DMG.`]);

    if (isPlayerAttacker) {
      setOTeam(prev => prev.map(s => s.id === defender.id ? { ...s, battleStats: { ...s.battleStats, hp: Math.max(0, s.battleStats.hp - damage) } } : s));
    } else {
      setPTeam(prev => prev.map(s => s.id === defender.id ? { ...s, battleStats: { ...s.battleStats, hp: Math.max(0, s.battleStats.hp - damage) } } : s));
    }

    setTimeout(() => {
      setDefenderId(null);
      setAttackerId(null);
      setFloatingDamage(null);
      setIsProcessing(false);
      if (!winner) {
        setCurrentTurn(isPlayerAttacker ? 'ai' : 'player');
      }
    }, 600);
  };

  // Win Detection
  useEffect(() => {
    if (winner) return;
    
    const oDead = oTeam.every(s => s.battleStats.hp <= 0);
    const pDead = pTeam.every(s => s.battleStats.hp <= 0);

    if (oDead) {
      setWinner('player');
      setShowSummary(true);
      dispatchRewards('player');
    } else if (pDead) {
      setWinner('opponent');
      setShowSummary(true);
      dispatchRewards('opponent');
    }
  }, [oTeam, pTeam, winner]);

  // AI Turn Logic
  useEffect(() => {
    if (currentTurn === 'ai' && !winner && !isProcessing) {
      const aliveAI = oTeam.filter(s => s.battleStats.hp > 0);
      const alivePlayers = pTeam.filter(s => s.battleStats.hp > 0);
      
      if (aliveAI.length > 0 && alivePlayers.length > 0) {
        const attacker = aliveAI[Math.floor(Math.random() * aliveAI.length)];
        const defender = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const move = getMoves(attacker)[0];
        
        const aiTimer = setTimeout(() => {
          executeAttack(attacker, defender, move, false);
        }, 1000);
        return () => clearTimeout(aiTimer);
      }
    }
  }, [currentTurn, winner, isProcessing, oTeam, pTeam]);

  // Drag handlers
  const onDragStart = (e: React.MouseEvent | React.TouchEvent, move: Move) => {
    if (isProcessing || currentTurn !== 'player' || winner) return;
    setSelectedMove(move);
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragPos({ x: clientX, y: clientY });
  };

  const onDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    setDragPos({ x: clientX, y: clientY });
  };

  const onDragEnd = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedMove || activeSlimeIdx === null) return;
    
    const clientX = 'touches' in e ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY;

    const targets = document.querySelectorAll('.opponent-slime-target');
    let targetIdx: number | null = null;

    targets.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        targetIdx = idx;
      }
    });

    if (targetIdx !== null && oTeam[targetIdx].battleStats.hp > 0) {
      executeAttack(pTeam[activeSlimeIdx], oTeam[targetIdx], selectedMove, true);
      setActiveSlimeIdx(null);
    }

    setIsDragging(false);
    setSelectedMove(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragMove, { passive: false });
      window.addEventListener('touchend', onDragEnd, { passive: false });
    }
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [isDragging, selectedMove, activeSlimeIdx, oTeam]);

  useEffect(() => {
    if (battleLogsRef.current) {
      battleLogsRef.current.scrollTop = battleLogsRef.current.scrollHeight;
    }
  }, [battleLogs]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex flex-col bg-slate-950 animate-in fade-in duration-500 overflow-hidden select-none">
      <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.2]" style={{ backgroundImage: 'url("/Battle Arena.png")' }} />
      
      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className={`transition-all duration-500 ${currentTurn === 'player' ? 'scale-110' : 'opacity-50'}`}>
          <div className={`bg-blue-600/20 p-3 rounded-2xl border ${currentTurn === 'player' ? 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-blue-500/30'}`}>
            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Player Turn</span>
          </div>
        </div>
        <div className={`transition-all duration-500 ${currentTurn === 'ai' ? 'scale-110' : 'opacity-50'}`}>
          <div className={`bg-red-600/20 p-3 rounded-2xl border ${currentTurn === 'ai' ? 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-red-500/30'}`}>
            <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">Opponent Turn</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div className="w-full max-w-6xl px-12 flex justify-between items-center relative">
          
          {/* Projectiles & Floating Damage */}
          <div className="absolute inset-0 pointer-events-none z-50">
            {projectiles.map(p => {
              const dx = p.targetX - p.x;
              const dy = p.targetY - p.y;
              return (
                <div 
                  key={p.id}
                  className="absolute text-5xl"
                  style={{
                    left: p.x + dx * p.progress,
                    top: p.y + dy * p.progress,
                    transform: 'translate(-50%, -50%)',
                    filter: 'drop-shadow(0 0 15px white)'
                  }}
                >
                  {p.icon}
                </div>
              );
            })}
            {floatingDamage && (
              <div 
                className="absolute text-5xl font-black text-white drop-shadow-[0_4px_8px_black] animate-bounce"
                style={{ left: floatingDamage.x, top: floatingDamage.y - 60, transform: 'translateX(-50%)' }}
              >
                -{floatingDamage.amount}
              </div>
            )}
          </div>

          {/* Player Team */}
          <div className="flex flex-col gap-12">
            {pTeam.map((slime, i) => {
              const isActive = activeSlimeIdx === i;
              const isAttacking = attackerId === slime.id;
              const isBeingHit = defenderId === slime.id;
              
              return (
                <div key={slime.id} id={`slime-${slime.id}`} className="relative">
                  <div className={`relative transition-all duration-300 ${isAttacking ? 'translate-x-8 scale-105 z-20' : ''} ${isBeingHit ? 'animate-shake' : ''} ${slime.battleStats.hp <= 0 ? 'opacity-30 grayscale blur-[1px]' : ''}`}>
                    <button 
                      disabled={slime.battleStats.hp <= 0 || isProcessing || currentTurn !== 'player' || !!winner}
                      onClick={() => setActiveSlimeIdx(isActive ? null : i)}
                      className={`relative z-10 p-1 rounded-full transition-all ${isActive ? 'ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-110' : 'hover:scale-105'}`}
                    >
                      <SlimeCanvas slime={slime} size={130} animated={slime.battleStats.hp > 0} isHurt={isBeingHit} />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24">
                        <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                          <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(slime.battleStats.hp / slime.battleStats.maxHp) * 100}%` }} />
                        </div>
                        <div className="text-[8px] font-black text-white mt-1 text-center">{Math.ceil(slime.battleStats.hp)}/{slime.battleStats.maxHp}</div>
                      </div>
                    </button>

                    {/* Radial Attack Menu */}
                    {isActive && !isDragging && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-in zoom-in duration-200">
                        {getMoves(slime).map((move, mIdx) => {
                          const angle = (mIdx * (360 / 3)) - 90;
                          const radius = 80;
                          const x = Math.cos(angle * Math.PI / 180) * radius;
                          const y = Math.sin(angle * Math.PI / 180) * radius;
                          
                          return (
                            <div
                              key={mIdx}
                              onMouseDown={(e) => onDragStart(e, move)}
                              onTouchStart={(e) => onDragStart(e, move)}
                              className="absolute w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-2xl border-2 border-blue-500 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                              style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                            >
                              <span className="text-xl">{ELEMENT_ICONS[move.type]}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Opponent Team */}
          <div className="flex flex-col gap-12">
            {oTeam.map((slime, i) => {
              const isAttacking = attackerId === slime.id;
              const isBeingHit = defenderId === slime.id;
              
              return (
                <div key={slime.id} id={`slime-${slime.id}`} className={`opponent-slime-target relative transition-all duration-300 ${isAttacking ? '-translate-x-8 scale-105 z-20' : ''} ${isBeingHit ? 'animate-shake' : ''} ${slime.battleStats.hp <= 0 ? 'opacity-30 grayscale blur-[1px]' : ''}`}>
                  <div className="relative z-10 p-1">
                    <SlimeCanvas slime={slime} size={130} animated={slime.battleStats.hp > 0} isHurt={isBeingHit} />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24">
                      <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(slime.battleStats.hp / slime.battleStats.maxHp) * 100}%` }} />
                      </div>
                      <div className="text-[8px] font-black text-white mt-1 text-center">{Math.ceil(slime.battleStats.hp)}/{slime.battleStats.maxHp}</div>
                    </div>
                    {isDragging && slime.battleStats.hp > 0 && (
                      <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500/50 rounded-full animate-pulse blur-md" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drag Indicator */}
          {isDragging && selectedMove && (
            <div 
              className="fixed w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-500 z-[100] pointer-events-none"
              style={{ left: dragPos.x - 28, top: dragPos.y - 28 }}
            >
              <span className="text-2xl">{ELEMENT_ICONS[selectedMove.type]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Battle Feed */}
      <div className="relative z-10 p-6 flex gap-6 items-end">
        <div className="flex-1 h-20 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-3 overflow-hidden">
          <div ref={battleLogsRef} className="h-full overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {battleLogs.map((log, i) => (
              <p key={i} className="text-[10px] font-bold text-white/60 animate-in slide-in-from-left duration-300">
                <span className="text-blue-500 mr-2">»</span> {log}
              </p>
            ))}
          </div>
        </div>
        <Button onClick={onClose} variant="ghost" className="h-20 w-20 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-red-500/20 transition-all">
          <X className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Quit</span>
        </Button>
      </div>

      {/* Summary Popup */}
      {showSummary && winner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-[3rem] p-8 text-center relative">
            <div className="relative z-10">
              <div className={`w-16 h-16 rounded-xl mx-auto mb-6 flex items-center justify-center ${winner === 'player' ? 'bg-blue-600' : 'bg-red-600'}`}>
                {winner === 'player' ? <Trophy className="text-white w-8 h-8" /> : <X className="text-white w-8 h-8" />}
              </div>
              <h2 className="text-3xl font-black text-white uppercase mb-2">{winner === 'player' ? 'Victory!' : 'Defeat'}</h2>
              <div className="grid grid-cols-2 gap-4 mb-8 mt-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Goo</p>
                  <p className="text-lg font-black text-white">+{winner === 'player' ? '25' : '5'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">XP</p>
                  <p className="text-lg font-black text-white">+{winner === 'player' ? '30' : '10'}</p>
                </div>
              </div>
              <Button onClick={onClose} className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-lg font-black uppercase tracking-tight">
                Continue
              </Button>
=======
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
>>>>>>> ee7780da1f8543a719a150126d95f2bb1838f514
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-8px, 0); }
          75% { transform: translate(8px, 0); }
        }
        .animate-shake { animation: shake 0.1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
=======
    </div>
  );
}
>>>>>>> ee7780da1f8543a719a150126d95f2bb1838f514
