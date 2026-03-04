import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Sparkles, Trophy, ArrowUpCircle } from 'lucide-react';
import { audioEngine } from '@/utils/audioEngine';

export function EvolutionPopup() {
  const { state, dispatch } = useGameState();
  const [show, setShow] = useState(false);
  const evolution = state.lastEvolution;
  const slime = evolution ? state.slimes.find(s => s.id === evolution.slimeId) : null;

  useEffect(() => {
    if (evolution && !show) {
      setShow(true);
      audioEngine.playSfx('achievement');
    }
  }, [evolution]);

  if (!show || !slime || !evolution) return null;

  const handleClose = () => {
    setShow(false);
    dispatch({ type: 'CLEAR_EVOLUTION' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
         style={{ fontFamily: "'VT323', monospace" }}>
      
      <div className="relative max-w-sm w-full bg-white rounded-[40px] p-8 shadow-2xl border-4 border-[#FF7EB6]/20 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Background Burst Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF7EB6]/20 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#FF7EB610_0%,transparent_70%)] animate-soft-pulse" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-[#FF7EB6] animate-bounce" />
            <h2 className="text-xl font-black text-[#FF7EB6] uppercase tracking-[0.3em]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              EVOLVED!
            </h2>
            <Sparkles className="w-6 h-6 text-[#FF7EB6] animate-bounce" />
          </div>

          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-[#FF7EB6]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <div className="bg-rose-50/50 rounded-full p-6 border-2 border-[#FF7EB6]/10 shadow-inner scale-125">
              <SlimeCanvas slime={slime} size={140} animated />
            </div>
            
            {/* Stage Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FF7EB6] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border-2 border-white">
              <ArrowUpCircle className="w-3 h-3" />
              {evolution.stage}
            </div>
          </div>

          <h3 className="text-3xl font-black text-slate-800 uppercase tracking-wider mb-2">
            {slime.name}
          </h3>
          
          <p className="text-lg text-slate-500 font-bold mb-8 uppercase tracking-widest px-4">
            Your spirit has reached the <span className="text-[#FF7EB6] font-black">{evolution.stage}</span> stage!
          </p>

          <button
            onClick={handleClose}
            className="w-full py-4 bg-[#FF7EB6] hover:bg-[#FF7EB6]/90 text-white rounded-2xl text-xl font-black uppercase tracking-[0.2em] shadow-lg shadow-[#FF7EB6]/20 transition-all active:scale-95 hover:scale-105"
          >
            Continue Ritual
          </button>
        </div>
      </div>
    </div>
  );
}
