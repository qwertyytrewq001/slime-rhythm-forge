import React, { useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Slime, BattleSlime } from '@/types/slime';
import { generateAIOpponents, deriveBattleStats, toBattleSlime } from '@/utils/battleEngine';
import { SlimeCanvas } from './SlimeCanvas';
import { Button } from '@/components/ui/button';
import { X, Sword, Heart, Trophy } from 'lucide-react';
import { ELEMENT_ICONS } from '@/data/traitData';

interface BattlePreviewProps {
  level: number;
  onStartBattle: (playerTeam: BattleSlime[], opponentTeam: BattleSlime[]) => void;
  onClose: () => void;
}

export const BattlePreview: React.FC<BattlePreviewProps> = ({ level, onStartBattle, onClose }) => {
  const { state } = useGameState();
  const [playerTeam, setPlayerTeam] = useState<(Slime | null)[]>([null, null, null]);
  const [opponentTeam, setOpponentTeam] = useState<BattleSlime[]>([]);
  const [isSelectingFor, setIsSelectingFor] = useState<number | null>(null);

  useEffect(() => {
    const avgLevel = state.slimes.reduce((sum, s) => sum + s.level, 0) / state.slimes.length || 1;
    setOpponentTeam(generateAIOpponents(level, avgLevel));
  }, [level, state.slimes]);

  const handleSelectSlime = (slime: Slime) => {
    if (isSelectingFor === null || playerTeam.some(s => s?.id === slime.id)) return;
    const newTeam = [...playerTeam];
    newTeam[isSelectingFor] = slime;
    setPlayerTeam(newTeam);
    setIsSelectingFor(null);
  };

  const isTeamReady = playerTeam.every(s => s !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in zoom-in duration-300 p-4">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#0f172a] border-4 border-slate-800 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("${import.meta.env.BASE_URL}${encodeURIComponent('Preview arena.png')}")`,
          }}
        />

        {/* Header */}
        <div className="relative z-10 p-4 px-6 flex justify-between items-center bg-black/40 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Team Preparation</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Level {level} Challenge</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-red-500/20 text-white rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden px-8 py-6">
          <div className="flex-1 grid grid-cols-2 gap-10 items-center min-h-0">
            {/* Player Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest italic">Your Squad</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Select 3 Slimes</span>
              </div>
              <div className="grid gap-3">
                {playerTeam.map((slime, idx) => (
                  <div key={idx} className="relative">
                    <button
                      onClick={() => setIsSelectingFor(idx)}
                      className={`w-full h-20 flex items-center gap-4 p-3 rounded-2xl border-2 transition-all duration-300 ${slime ? 'bg-blue-900/20 border-blue-500/30' : 'bg-black/40 border-dashed border-white/10 hover:border-blue-500/40'}`}
                    >
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${slime ? 'bg-blue-500/10' : 'bg-white/5'}`}>
                        {slime ? <SlimeCanvas slime={slime} size={50} animated /> : <Sword className="w-5 h-5 text-white/10" />}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        {slime ? (
                          <>
                            <div className="text-xs font-black text-white truncate">{slime.name}</div>
                            <div className="flex gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[9px] font-bold text-red-400/70"><Heart className="w-2.5 h-2.5" /> {deriveBattleStats(slime).maxHp}</span>
                              <span className="flex items-center gap-1 text-[9px] font-bold text-orange-400/70"><Sword className="w-2.5 h-2.5" /> {deriveBattleStats(slime).attack}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] font-bold text-blue-400/40 uppercase">Enlist Slot {idx + 1}</div>
                        )}
                      </div>
                      {slime && (
                        <div className="flex gap-1">
                          {slime.elements.slice(0, 2).map(el => (
                            <span key={el} className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px] border border-white/5">{ELEMENT_ICONS[el]}</span>
                          ))}
                        </div>
                      )}
                    </button>
                    {slime && (
                      <button onClick={(e) => { e.stopPropagation(); const t = [...playerTeam]; t[idx] = null; setPlayerTeam(t); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Opponent Side */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-red-400 uppercase tracking-widest italic px-2">Opponents</h3>
              <div className="grid gap-3">
                {opponentTeam.map((slime, idx) => (
                  <div key={idx} className="w-full h-20 flex items-center gap-4 p-3 rounded-2xl border-2 bg-red-950/10 border-red-900/20 opacity-90">
                    <div className="w-14 h-14 rounded-lg bg-red-500/5 flex items-center justify-center grayscale-[0.3]">
                      <SlimeCanvas slime={slime} size={50} animated />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-xs font-black text-white truncate">{slime.name}</div>
                      <div className="flex gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-red-400/40"><Heart className="w-2.5 h-2.5" /> {slime.battleStats.maxHp}</span>
                        <span className="flex items-center gap-1 text-[9px] font-bold text-orange-400/40"><Sword className="w-2.5 h-2.5" /> {slime.battleStats.attack}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {slime.elements.slice(0, 2).map(el => (
                        <span key={el} className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px] border border-white/5">{ELEMENT_ICONS[el]}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center pb-2">
            <Button
              disabled={!isTeamReady}
              onClick={() => onStartBattle(playerTeam.map(s => toBattleSlime(s!)), opponentTeam)}
              className={`h-14 px-12 rounded-xl text-lg font-black uppercase tracking-tight transition-all duration-300 ${isTeamReady ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl hover:scale-105 active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              {isTeamReady ? <><Sword className="w-5 h-5 mr-3" /> Engage Battle</> : 'Ready Your Squad'}
            </Button>
          </div>
        </div>

        {/* Slime Selection Drawer */}
        {isSelectingFor !== null && (
          <div className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="p-4 px-6 flex justify-between items-center border-b border-white/5">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Select Combatant <span className="text-blue-500">#{isSelectingFor + 1}</span></h3>
              <Button variant="ghost" size="icon" onClick={() => setIsSelectingFor(null)} className="hover:bg-white/10 text-white rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
                {state.slimes
                  .filter(s => !playerTeam.some(pts => pts?.id === s.id))
                  .map(slime => {
                    const stats = deriveBattleStats(slime);
                    return (
                      <button key={slime.id} onClick={() => handleSelectSlime(slime)} className="group relative bg-slate-900/50 border-2 border-slate-800 hover:border-blue-500 rounded-2xl p-4 text-left transition-all hover:scale-[1.02]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                            <SlimeCanvas slime={slime} size={40} animated />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-black text-white truncate">{slime.name}</div>
                            <div className="flex gap-1 mt-0.5">
                              {slime.elements.map(el => (
                                <span key={el} className="text-[9px]">{ELEMENT_ICONS[el]}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 pt-3 border-t border-white/5">
                          <div className="flex items-center justify-between text-[9px]"><span className="font-black text-slate-500 uppercase">HP</span><span className="font-bold text-white">{stats.maxHp}</span></div>
                          <div className="flex items-center justify-between text-[9px]"><span className="font-black text-slate-500 uppercase">ATK</span><span className="font-bold text-white">{stats.attack}</span></div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
