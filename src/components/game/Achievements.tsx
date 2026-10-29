import { useGameState } from '@/hooks/useGameState';
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_DEFS } from '@/data/achievements';
import { audioEngine } from '@/utils/audioEngine';

const U = `${import.meta.env.BASE_URL}ui/`;
const FRED = "'Fredoka', 'Trebuchet MS', sans-serif";
const INK = '#4a2f17';

/** Bronze, silver or gold medal by how big the reward is. */
const medalFor = (reward: number) => (reward >= 500 ? 'gold' : reward >= 200 ? 'silver' : 'bronze');

export function Achievements({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGameState();

  const claimable = state.achievements.filter(a => a.unlocked && !a.claimed);
  const unlockedCount = state.achievements.filter(a => a.unlocked).length;
  const claimableGoo = claimable.reduce((sum, a) => sum + a.rewardAmount, 0);

  const claim = (id: string) => {
    dispatch({ type: 'CLAIM_ACHIEVEMENT', id });
    audioEngine.playSfx('achievement');
  };
  const claimAll = () => {
    claimable.forEach(a => dispatch({ type: 'CLAIM_ACHIEVEMENT', id: a.id }));
    audioEngine.playSfx('achievement');
  };

  return (
    <div className="fixed inset-0 z-[260] bg-[#1a0f24] flex items-center justify-center" onClick={onClose} style={{ fontFamily: FRED }}>
      <img src={`${U}ach_bg.jpg`} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ imageRendering: 'auto' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(30,16,10,0.05), rgba(30,16,10,0.5))' }} />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()} style={{ background: 'rgba(246,232,195,0.88)', border: '4px solid #4a2f17', boxShadow: '0 20px 60px rgba(0,0,0,0.55)' }}>
        <div className="flex items-center justify-between gap-4 p-4" style={{ background: 'linear-gradient(#5a3a7a,#3f2757)', borderBottom: '4px solid #f2d68a', color: '#fff3d0' }}>
          <div className="flex items-center gap-3">
            <img src={`${U}tool_achievements.png`} alt="" draggable={false} className="w-16 h-16" style={{ imageRendering: 'auto' }} />
            <div>
              <div className="text-3xl font-bold leading-none" style={{ letterSpacing: '0.05em', WebkitTextStroke: '4px #2a1238', paintOrder: 'stroke fill' }}>Achievements</div>
              <p className="text-sm font-semibold opacity-90 mt-1">
                {unlockedCount} / {state.achievements.length} unlocked{claimable.length > 0 && ` · ${claimable.length} ready to claim`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {claimable.length > 0 && (
              <button onClick={claimAll} className="relative hover:scale-105 active:scale-95 transition-transform" style={{ width: 190 }}>
                <img src={`${U}ach_claim.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto' }} />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-white whitespace-nowrap" style={{ fontSize: 15, WebkitTextStroke: '3px #1f4a1a', paintOrder: 'stroke fill' }}>Claim all · {claimableGoo}</span>
              </button>
            )}
            <button onClick={onClose} aria-label="Close" className="hover:scale-110 active:scale-95 transition-transform">
              <img src={`${U}baz_close.png`} alt="" draggable={false} className="w-12 h-12" style={{ imageRendering: 'auto' }} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-5">
          {ACHIEVEMENT_CATEGORIES.map(category => {
            const defs = ACHIEVEMENT_DEFS.filter(d => d.category === category);
            const done = defs.filter(d => state.achievements.find(a => a.id === d.id)?.unlocked).length;
            return (
              <section key={category}>
                <div className="flex items-center justify-between mb-1 px-2" style={{ color: INK }}>
                  <div className="text-base font-bold uppercase tracking-widest">{category}</div>
                  <span className="text-sm font-bold opacity-70">{done}/{defs.length}</span>
                </div>
                <div className="grid gap-2">
                  {defs.map(def => {
                    const ach = state.achievements.find(a => a.id === def.id);
                    if (!ach) return null;
                    const current = Math.min(def.progress(state), def.target);
                    const pct = Math.round((current / def.target) * 100);
                    const card = ach.claimed ? 'ach_row' : ach.unlocked ? 'ach_row_ready' : 'ach_row_locked';
                    return (
                      <div key={def.id} className="relative" style={{ minHeight: 82, borderStyle: 'solid', borderWidth: '15px 64px', borderImageSource: `url(${U}${card}.png)`, borderImageSlice: '45 192 fill', borderImageRepeat: 'stretch', boxSizing: 'border-box' }}>
                        <div className="relative flex items-center gap-3" style={{ color: INK, margin: '-15px -64px', padding: '10px 70px 10px 78px', minHeight: 82 }}>
                          <div className="absolute" style={{ left: 11, top: '50%', width: 47, height: 47, transform: 'translateY(-50%)' }}>
                            {ach.unlocked ? (
                              <img src={`${U}ach_medal_${medalFor(def.rewardAmount)}.png`} alt="" draggable={false} className="w-full h-full" style={{ imageRendering: 'auto' }} />
                            ) : (
                              <img src={`${U}ach_lock.png`} alt="" draggable={false} className="w-full h-full" style={{ imageRendering: 'auto', opacity: 0.85 }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold leading-tight">{def.name}</p>
                            <p className="text-xs font-semibold opacity-75 leading-snug">{def.description}</p>
                            {!ach.unlocked && (
                              <div className="mt-1 flex items-center gap-2">
                                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(60,35,15,0.35)' }}>
                                  <div className="h-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#ffe98a,#f2b632)' }} />
                                </div>
                                <span className="text-[11px] font-bold tabular-nums opacity-70">{Math.min(current, def.target)}/{def.target}</span>
                              </div>
                            )}
                          </div>
                          <div className="shrink-0">
                            {ach.claimed ? (
                              <span className="text-sm font-bold" style={{ color: '#2f7a2a' }}>✓ Claimed</span>
                            ) : ach.unlocked ? (
                              <button onClick={() => claim(def.id)} className="relative hover:scale-105 active:scale-95 transition-transform" style={{ width: 130 }}>
                                <img src={`${U}ach_claim.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto' }} />
                                <span className="absolute inset-0 flex items-center justify-center font-bold text-white whitespace-nowrap" style={{ fontSize: 13, WebkitTextStroke: '3px #1f4a1a', paintOrder: 'stroke fill' }}>Claim {def.rewardAmount}</span>
                              </button>
                            ) : (
                              <span className="text-sm font-bold opacity-70">{def.rewardAmount} 💧</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
