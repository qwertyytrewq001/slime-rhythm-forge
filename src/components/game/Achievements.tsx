import { useGameState } from '@/hooks/useGameState';
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_DEFS } from '@/data/achievements';
import { audioEngine } from '@/utils/audioEngine';
import { Trophy, X, Check } from 'lucide-react';

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
    <div
      className="fixed inset-0 z-[260] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl border-4 border-[#FF7EB6] shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] p-5 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>Achievements</h2>
              <p className="text-sm opacity-90">
                {unlockedCount} / {state.achievements.length} unlocked
                {claimable.length > 0 && ` · ${claimable.length} ready to claim`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {claimable.length > 0 && (
              <button
                onClick={claimAll}
                className="px-4 py-2 rounded-full bg-white text-[#FF1493] font-black text-sm hover:scale-105 transition-transform shadow-lg"
              >
                Claim all · {claimableGoo} 💧
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-5 space-y-6">
          {ACHIEVEMENT_CATEGORIES.map(category => {
            const defs = ACHIEVEMENT_DEFS.filter(d => d.category === category);
            const done = defs.filter(d => state.achievements.find(a => a.id === d.id)?.unlocked).length;
            return (
              <section key={category}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-sm font-black text-[#FF1493] uppercase tracking-widest">{category}</h3>
                  <span className="text-xs font-bold text-gray-400">{done}/{defs.length}</span>
                </div>
                <div className="grid gap-2">
                  {defs.map(def => {
                    const ach = state.achievements.find(a => a.id === def.id);
                    if (!ach) return null;
                    const current = Math.min(def.progress(state), def.target);
                    const pct = Math.round((current / def.target) * 100);
                    return (
                      <div
                        key={def.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                          ach.claimed
                            ? 'border-green-300 bg-green-50/70'
                            : ach.unlocked
                              ? 'border-[#FF7EB6] bg-pink-50 shadow-md'
                              : 'border-gray-200 bg-white/70'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl border-2 ${
                            ach.unlocked ? 'border-[#FF7EB6]/60 bg-white' : 'border-gray-200 bg-gray-100 grayscale opacity-60'
                          }`}
                        >
                          {def.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-800 leading-tight">{def.name}</p>
                          <p className="text-xs text-gray-500 leading-snug">{def.description}</p>
                          {!ach.unlocked && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                                {Math.min(current, def.target)}/{def.target}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {ach.claimed ? (
                            <span className="flex items-center gap-1 text-xs font-black text-green-600">
                              <Check className="w-4 h-4" /> Claimed
                            </span>
                          ) : ach.unlocked ? (
                            <button
                              onClick={() => claim(def.id)}
                              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] text-white text-xs font-black hover:scale-105 transition-transform shadow-lg"
                            >
                              Claim {def.rewardAmount} 💧
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-gray-400">{def.rewardAmount} 💧</span>
                          )}
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
