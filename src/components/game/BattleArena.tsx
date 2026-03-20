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
  onBattleComplete?: (result: { winner: 'player' | 'opponent'; level: number }) => void;
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

export const BattleArena: React.FC<BattleArenaProps> = ({ level, playerTeam, opponentTeam, onClose, onBattleComplete }) => {
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

    // Call the battle complete callback
    if (onBattleComplete) {
      onBattleComplete({ winner: resultWinner, level });
    }
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
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.2]"
        style={{
          backgroundImage: `url("${import.meta.env.BASE_URL}${encodeURIComponent('Battle Arena.png')}")`,
        }}
      />
      
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
            </div>
          </div>
        </div>
      )}

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
