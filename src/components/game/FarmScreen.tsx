import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { FarmPlot, SLIME_FOODS, SlimeFoodType } from '@/types/slime';
import {
  CROPS, CROP_ORDER, FARM_LEVEL_XP, FarmSlice, GOLDEN_MULT, MAX_FARM_LEVEL, PLOT_RULES, TOTAL_PLOTS, WATER_BONUS,
  cropUnlocked, extraYieldChance, goldenChance, growMsFor, growthMultiplier, harvest as farmHarvest, harvestAll as farmHarvestAll,
  isGrowing, isReady, plant as farmPlant, plantAll as farmPlantAll, plantCost, plotsAtLevel, progressOf, rushCost, water as farmWater, waterAll as farmWaterAll, xpIntoLevel, HarvestOutcome,
} from '@/utils/farmCore';
import { foodSpriteUrl } from '@/data/foodSprites';
import { formatDuration } from '@/utils/timeUtils';
import { audioEngine } from '@/utils/audioEngine';
import { CropArt, stageOf } from './farm/CropArt';
import { Lock } from 'lucide-react';

interface FarmScreenProps {
  onClose: () => void;
}

const BASE = import.meta.env.BASE_URL;
const bt = (f: string) => `${BASE}battle/${f}`;
const PARCHMENT = '#f6e8c3';
const INK = '#4a2f17';
const GOLD = '#f2b632';
const FARM = `${BASE}farm/`;

/** Painted farm icon; the global pixelated rule would wreck these, so it is overridden here. */
const Ico: React.FC<{ name: string; w: number; style?: React.CSSProperties }> = ({ name, w, style }) => (
  <img src={`${FARM}${name}.png`} alt="" draggable={false} style={{ width: w, height: w, imageRendering: 'auto', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }} />
);

// The field: 4 columns by 4 rows, in perspective (back rows smaller and higher up)
const COLS = 4;
const ROW_Y = [0.545, 0.635, 0.73, 0.825];
const ROW_SCALE = [0.8, 0.9, 1.0, 1.1];
const plotCenter = (id: number) => {
  const row = Math.floor(id / COLS);
  const col = id % COLS;
  const scale = ROW_SCALE[row];
  return { x: 0.5 + (col - 1.5) * 0.15 * scale, y: ROW_Y[row], scale, row };
};

type Fx =
  | { id: number; kind: 'pop'; x: number; y: number; text: string; color: string; size: number; label?: string }
  | { id: number; kind: 'fly'; x: number; y: number; toX: number; toY: number; img: string }
  | { id: number; kind: 'burst'; x: number; y: number; emojis: string[]; count: number }
  | { id: number; kind: 'dust'; x: number; y: number; color: string; count: number }
  | { id: number; kind: 'gold'; x: number; y: number; crop: SlimeFoodType };
type FxInput = Fx extends infer T ? (T extends { id: number } ? Omit<T, 'id'> : never) : never;

type Picker = { mode: 'plot'; plotId: number } | { mode: 'all' } | null;

const ROLE_COLOR: Record<string, string> = { Quick: '#1f9d55', Steady: '#2d7fd1', Overnight: '#7a45c9' };

/** What a Farm Level gives, so the player always knows what the next one is worth. */
function unlocksAtLevel(level: number): string[] {
  const out: string[] = [];
  if (plotsAtLevel(level) > plotsAtLevel(level - 1)) out.push(`A new plot (${plotsAtLevel(level)} total)`);
  for (const c of CROP_ORDER) if (CROPS[c].unlockLevel === level) out.push(`${CROPS[c].name} unlocked`);
  const gc = goldenChance(level), pc = goldenChance(level - 1);
  if (level > 1 && gc > pc) out.push('Better odds of golden crops');
  if (level > 1 && growthMultiplier(level) < growthMultiplier(level - 1)) out.push('Crops grow a little faster');
  return out;
}

export function FarmScreen({ onClose }: FarmScreenProps) {
  const { state, dispatch } = useGameState();
  const [now, setNow] = useState(Date.now());
  const [picker, setPicker] = useState<Picker>(null);
  const [info, setInfo] = useState<number | null>(null);
  const [fx, setFx] = useState<Fx[]>([]);
  const [banner, setBanner] = useState<{ id: number; level: number; lines: string[] } | null>(null);
  const [sw, setSw] = useState(1000);
  const stageRef = useRef<HTMLDivElement>(null);
  const bagRef = useRef<HTMLDivElement>(null);
  const fxId = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSw(el.clientWidth || 1000);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { farm, farmPlots, goo, inventory, seeds } = state;
  const sh = (sw * 9) / 16; // stage height

  const toSlice = (): FarmSlice => {
    const s = stateRef.current;
    return { goo: s.goo, seeds: s.seeds, inventory: s.inventory, farmPlots: s.farmPlots, farm: s.farm, stats: s.stats };
  };

  const addFx = useCallback((item: FxInput, life = 1200) => {
    const id = ++fxId.current;
    setFx(list => [...list, { ...item, id } as Fx]);
    setTimeout(() => setFx(list => list.filter(f => f.id !== id)), life);
  }, []);
  const px = (id: number) => {
    const c = plotCenter(id);
    return { x: c.x * sw, y: c.y * sh };
  };

  // ---- derived ----
  const readyPlots = farmPlots.filter(p => p.unlocked && isReady(p, now));
  const growingUnwatered = farmPlots.filter(p => p.unlocked && isGrowing(p, now) && !p.watered);
  const emptyPlots = farmPlots.filter(p => p.unlocked && !p.cropType);
  const xp = xpIntoLevel(farm);
  const nextUnlocks = farm.level < MAX_FARM_LEVEL ? unlocksAtLevel(farm.level + 1) : [];

  // ---- actions ----
  const showLevelUp = (level: number) => {
    const lines = unlocksAtLevel(level);
    setBanner({ id: ++fxId.current, level, lines });
    audioEngine.playSfx('achievement');
    setTimeout(() => setBanner(b => (b && b.level === level ? null : b)), 4200);
  };

  const celebrate = (o: HarvestOutcome, delay = 0) => {
    const at = px(o.plotId);
    const bag = bagRef.current?.getBoundingClientRect();
    const stage = stageRef.current?.getBoundingClientRect();
    setTimeout(() => {
      addFx({
        kind: 'pop', x: at.x, y: at.y - sw * 0.1, text: `+${o.items} ${CROPS[o.crop].emoji}`, color: o.golden ? '#ffe14d' : '#ffffff',
        size: o.golden ? 1.7 : o.extra ? 1.3 : 1.1, label: o.golden ? `GOLDEN ×${GOLDEN_MULT}!` : o.extra ? 'BONUS!' : undefined,
      }, 1300);
      if (o.golden) addFx({ kind: 'gold', x: at.x, y: at.y - sw * 0.05, crop: o.crop }, 1300);
      else addFx({ kind: 'burst', x: at.x, y: at.y - sw * 0.04, emojis: ['✨'], count: 4 }, 900);
      addFx({ kind: 'dust', x: at.x, y: at.y, color: '#8a5a34', count: 6 }, 700);
      if (bag && stage) addFx({ kind: 'fly', x: at.x, y: at.y - sw * 0.04, toX: bag.left + bag.width / 2 - stage.left, toY: bag.top + bag.height / 2 - stage.top, img: foodSpriteUrl(o.crop) }, 800);
      audioEngine.playSfx('collect');
    }, delay);
  };

  const harvestOne = (plotId: number) => {
    const rolls: [number, number] = [Math.random(), Math.random()];
    const res = farmHarvest(toSlice(), plotId, rolls, Date.now());
    if (!res) return;
    celebrate(res.outcome);
    if (res.outcome.replanted) addFx({ kind: 'dust', x: px(plotId).x, y: px(plotId).y, color: '#8a5a34', count: 6 }, 800);
    dispatch({ type: 'HARVEST_CROP', plotId, rolls });
    if (res.outcome.levelUp) setTimeout(() => showLevelUp(res.outcome.levelUp!), 500);
  };

  const harvestEverything = () => {
    const ready = stateRef.current.farmPlots.filter(p => p.unlocked && isReady(p, Date.now()));
    if (!ready.length) return;
    const rolls = ready.map(() => [Math.random(), Math.random()] as [number, number]);
    const res = farmHarvestAll(toSlice(), rolls, Date.now());
    res.outcomes.forEach((o, i) => celebrate(o, i * 110));
    dispatch({ type: 'HARVEST_ALL', rolls });
    const up = res.outcomes.find(o => o.levelUp)?.levelUp ?? null;
    const finalLevel = res.slice.farm.level;
    if (finalLevel > stateRef.current.farm.level) setTimeout(() => showLevelUp(finalLevel), 500 + res.outcomes.length * 110);
    else if (up) setTimeout(() => showLevelUp(up), 500);
  };

  const plantOne = (plotId: number, crop: SlimeFoodType) => {
    const next = farmPlant(toSlice(), plotId, crop, Date.now());
    const at = px(plotId);
    if (!next) {
      const cost = plantCost(stateRef.current, crop);
      addFx({ kind: 'pop', x: at.x, y: at.y - sw * 0.06, text: cropUnlocked(crop, stateRef.current.farm.level) ? `Need ${cost} 💧` : `Farm Lv ${CROPS[crop].unlockLevel}`, color: '#ff9a9a', size: 0.9 }, 1200);
      return;
    }
    addFx({ kind: 'dust', x: at.x, y: at.y, color: '#8a5a34', count: 8 }, 800);
    audioEngine.playSfx('tap');
    dispatch({ type: 'PLANT_CROP', plotId, cropType: crop });
    setPicker(null);
  };

  const plantEverywhere = (crop: SlimeFoodType) => {
    const res = farmPlantAll(toSlice(), crop, Date.now());
    if (!res.planted) {
      addFx({ kind: 'pop', x: sw * 0.5, y: sh * 0.5, text: 'Not enough goo', color: '#ff9a9a', size: 1.1 }, 1200);
      return;
    }
    stateRef.current.farmPlots.filter(p => p.unlocked && !p.cropType).slice(0, res.planted).forEach((p, i) => {
      setTimeout(() => addFx({ kind: 'dust', x: px(p.id).x, y: px(p.id).y, color: '#8a5a34', count: 6 }, 800), i * 70);
    });
    audioEngine.playSfx('tap');
    dispatch({ type: 'PLANT_ALL', cropType: crop });
    setPicker(null);
  };

  const waterOne = (plotId: number) => {
    if (!farmWater(toSlice(), plotId, Date.now())) return;
    const at = px(plotId);
    addFx({ kind: 'dust', x: at.x, y: at.y - sw * 0.03, color: '#7cc8ff', count: 8 }, 900);
    audioEngine.playSfx('tap');
    dispatch({ type: 'WATER_PLOT', plotId });
  };
  const waterEverything = () => {
    const r = farmWaterAll(toSlice(), Date.now());
    if (!r.watered) return;
    stateRef.current.farmPlots.filter(p => p.unlocked && isGrowing(p, Date.now()) && !p.watered).forEach((p, i) => {
      setTimeout(() => addFx({ kind: 'dust', x: px(p.id).x, y: px(p.id).y - sw * 0.03, color: '#7cc8ff', count: 6 }, 800), i * 60);
    });
    audioEngine.playSfx('tap');
    dispatch({ type: 'WATER_ALL' });
  };

  const rushOne = (plotId: number) => {
    const plot = stateRef.current.farmPlots.find(p => p.id === plotId);
    if (!plot) return;
    const cost = rushCost(plot, Date.now());
    if (cost > stateRef.current.goo) {
      addFx({ kind: 'pop', x: px(plotId).x, y: px(plotId).y - sw * 0.06, text: `Need ${cost} 💧`, color: '#ff9a9a', size: 0.9 }, 1100);
      return;
    }
    addFx({ kind: 'burst', x: px(plotId).x, y: px(plotId).y - sw * 0.03, emojis: ['⚡', '✨'], count: 6 }, 900);
    audioEngine.playSfx('purchase');
    dispatch({ type: 'RUSH_PLOT', plotId });
    setInfo(null);
  };

  const buyLand = (plot: FarmPlot) => {
    const rule = PLOT_RULES[plot.id];
    const at = px(plot.id);
    if (farm.level < rule.level) {
      addFx({ kind: 'pop', x: at.x, y: at.y - sw * 0.04, text: `Farm Lv ${rule.level}`, color: '#ffd9a0', size: 0.95 }, 1100);
      return;
    }
    if (goo < rule.cost) {
      addFx({ kind: 'pop', x: at.x, y: at.y - sw * 0.04, text: `Need ${rule.cost.toLocaleString()} 💧`, color: '#ff9a9a', size: 0.95 }, 1100);
      return;
    }
    addFx({ kind: 'burst', x: at.x, y: at.y, emojis: ['🌿', '✨'], count: 8 }, 1000);
    audioEngine.playSfx('purchase');
    dispatch({ type: 'UNLOCK_FARM_PLOT', plotId: plot.id });
  };

  const onPlotClick = (plot: FarmPlot) => {
    if (!plot.unlocked) return buyLand(plot);
    if (!plot.cropType) return setPicker({ mode: 'plot', plotId: plot.id });
    if (isReady(plot, now)) return harvestOne(plot.id);
    setInfo(prev => (prev === plot.id ? null : plot.id));
  };

  /** Which plot is under a point of the stage: the plant you can see first, then the soil mound. Front rows win. */
  const plotAt = (x: number, y: number): FarmPlot | null => {
    const front = [...farmPlots].sort((a, b) => b.id - a.id);
    for (const p of front) {
      if (!p.unlocked || !p.cropType) continue;
      const c = plotCenter(p.id);
      const w = unitW * c.scale;
      const st = stageOf(progressOf(p, now));
      const ph = w * [0.2, 0.35, 0.5, 0.55][st];
      const pw = w * [0.14, 0.18, 0.3, 0.4][st] * (p.cropType === 'elemental' ? 0.75 : 1);
      const dx = (x - c.x * sw) / pw;
      const dy = (y - (c.y * sh - ph / 2)) / (ph / 2);
      if (dx * dx + dy * dy <= 1) return p;
    }
    for (const p of front) {
      const c = plotCenter(p.id);
      const w = unitW * c.scale;
      const dx = (x - c.x * sw) / (w / 2);
      const dy = (y - c.y * sh) / (w * 0.25);
      if (dx * dx + dy * dy <= 1) return p;
    }
    return null;
  };
  const stagePoint = (e: React.MouseEvent) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (picker || (e.target as HTMLElement).closest('button')) return;
    const pt = stagePoint(e);
    const hit = plotAt(pt.x, pt.y);
    if (hit) onPlotClick(hit);
    else if (info !== null) setInfo(null);
  };
  const onStageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const overUi = !!(e.target as HTMLElement).closest('button');
    const pt = stagePoint(e);
    e.currentTarget.style.cursor = !overUi && !picker && plotAt(pt.x, pt.y) ? 'pointer' : 'default';
  };

  const infoPlot = info !== null ? farmPlots.find(p => p.id === info) : null;
  const unitW = sw * 0.105;

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden select-none animate-in fade-in duration-300" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
      <style>{CSS}</style>
      <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60" style={{ backgroundImage: `url("${BASE}farm_background.jpg")` }} />

      <div
        ref={stageRef}
        className="relative"
        style={{ width: 'min(100vw, calc(100vh * 16 / 9))', height: 'min(100vh, calc(100vw * 9 / 16))' }}
        onClick={onStageClick}
        onMouseMove={onStageMove}
      >
        <img src={`${BASE}farm_background.jpg`} alt="" draggable={false} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'auto' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(30,10,40,0.35) 100%)' }} />

        {/* ambient: pollen and a couple of butterflies */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {SPARKS.map((p, i) => (
            <span key={i} className="absolute rounded-full farm-spark" style={{ left: `${p.x}%`, top: `${p.y}%`, width: sw * 0.004, height: sw * 0.004, background: p.c, boxShadow: `0 0 ${sw * 0.008}px ${p.c}`, animationDelay: `${p.d}s`, animationDuration: `${p.t}s` }} />
          ))}
          <span className="absolute farm-butterfly" style={{ top: '40%', fontSize: sw * 0.022 }}>🦋</span>
          <span className="absolute farm-butterfly" style={{ top: '58%', fontSize: sw * 0.018, animationDelay: '-9s', animationDuration: '26s' }}>🦋</span>
        </div>

        {/* the plots */}
        {farmPlots.map(plot => {
          const c = plotCenter(plot.id);
          const w = unitW * c.scale;
          const h = w * 0.5;
          const ready = plot.unlocked && isReady(plot, now);
          const growing = plot.unlocked && isGrowing(plot, now);
          const progress = progressOf(plot, now);
          const rule = PLOT_RULES[plot.id];
          const canBuy = !plot.unlocked && farm.level >= rule.level;
          return (
            <div key={plot.id} className="absolute" style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, width: w, height: h, transform: 'translate(-50%, -50%)', zIndex: 10 + c.row * 3 }}>
              {/* painted soil mound, wet when watered, or overgrown land that is not yours yet */}
              <img
                src={`${FARM}${!plot.unlocked ? 'farm_plot_locked' : plot.watered && growing ? 'farm_soil_wet' : 'farm_soil_bed'}.png`}
                alt="" draggable={false}
                className="absolute pointer-events-none"
                style={{ left: 0, top: 0, width: '100%', height: '100%', imageRendering: 'auto', filter: !plot.unlocked && !canBuy ? 'saturate(0.55) brightness(0.9)' : undefined }}
              />

              {/* the plant */}
              {plot.unlocked && plot.cropType && (
                <div className={`absolute left-1/2 ${ready ? 'farm-ripe' : 'farm-sway'}`} style={{ width: w * 1.1, height: w * 1.1, bottom: h * 0.5, transform: 'translateX(-50%)', transformOrigin: '50% 100%' }}>
                  <CropArt crop={plot.cropType} stage={stageOf(progress)} className="w-full h-full" />
                </div>
              )}
              {ready && plot.cropType && (
                <>
                  <img src={foodSpriteUrl(plot.cropType)} alt="" draggable={false} className="absolute left-1/2 farm-float pointer-events-none" style={{ width: w * 0.3, top: -w * 1.05, transform: 'translateX(-50%)', imageRendering: 'auto', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.4))' }} />
                  <div className="absolute left-1/2 rounded-full farm-ripe-ring pointer-events-none" style={{ width: w * 1.0, height: h * 1.05, top: h * 0.02, transform: 'translateX(-50%)', border: `3px solid ${GOLD}` }} />
                </>
              )}

              {/* empty plot invitation */}
              {plot.unlocked && !plot.cropType && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="rounded-full flex items-center justify-center farm-plus" style={{ width: w * 0.3, height: w * 0.3, background: 'rgba(255,255,255,0.22)', border: '2px dashed rgba(255,255,255,0.7)', color: '#fff', fontSize: w * 0.22, fontWeight: 700 }}>+</div>
                </div>
              )}

              {/* locked land */}
              {!plot.unlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none" style={{ color: '#fff', textShadow: '0 2px 3px rgba(0,0,0,0.85)' }}>
                  <Lock style={{ width: w * 0.2, height: w * 0.2, opacity: 0.85 }} />
                  <span className="font-bold leading-none" style={{ fontSize: Math.max(9, sw * 0.0105 * c.scale), marginTop: 2 }}>
                    {canBuy ? <>{rule.cost.toLocaleString()} <Ico name="icon_drop" w={Math.max(10, sw * 0.011 * c.scale)} /></> : `Lv ${rule.level}`}
                  </span>
                </div>
              )}

              {/* keyboard / assistive target only; real clicks are resolved by plotAt so one plot's box never covers another */}
              <button
                onClick={e => { e.stopPropagation(); onPlotClick(plot); }}
                aria-label={`Plot ${plot.id + 1}${plot.cropType ? ` ${CROPS[plot.cropType].name}` : ''}${ready ? ' ready' : ''}`}
                className="absolute"
                style={{ inset: 0, pointerEvents: 'none', background: 'transparent' }}
              />
            </div>
          );
        })}

        {/* timers and progress, above the field so no plant or mound can cover them */}
        {farmPlots.map(plot => {
          if (!plot.unlocked || !isGrowing(plot, now) || !plot.readyAt) return null;
          const c = plotCenter(plot.id);
          const w = unitW * c.scale;
          const h = w * 0.5;
          const progress = progressOf(plot, now);
          return (
            <div key={`t${plot.id}`} className="absolute pointer-events-none" style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, transform: `translate(-50%, ${h * 0.16}px)`, zIndex: 11 + c.row * 3 }}>
              <div className="relative overflow-hidden whitespace-nowrap rounded-full font-bold text-white flex items-center" style={{ background: 'rgba(30,14,40,0.82)', fontSize: Math.max(8, sw * 0.0088 * c.scale), padding: `${sw * 0.0008}px ${sw * 0.0048}px ${sw * 0.002}px`, border: '1px solid rgba(255,255,255,0.3)', lineHeight: 1.15 }}>
                {plot.watered && <Ico name="icon_drop" w={Math.max(8, sw * 0.0088 * c.scale)} style={{ marginRight: 2 }} />}{formatDuration(plot.readyAt - now)}
                <div className="absolute left-0 bottom-0" style={{ height: Math.max(2, sw * 0.0022), width: `${progress * 100}%`, background: 'linear-gradient(90deg,#7dff9e,#f2d94a)' }} />
              </div>
            </div>
          );
        })}

        {/* info popover for a growing plot */}
        {infoPlot && infoPlot.cropType && isGrowing(infoPlot, now) && (() => {
          const c = plotCenter(infoPlot.id);
          const cost = rushCost(infoPlot, now);
          const crop = CROPS[infoPlot.cropType];
          return (
            <div
              className="absolute farm-rise rounded-2xl shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
              style={{ left: `${Math.min(86, Math.max(14, c.x * 100))}%`, top: `${c.y * 100 - 17}%`, transform: 'translateX(-50%)', width: sw * 0.2, background: `linear-gradient(${PARCHMENT}, #ecd9a8)`, border: `3px solid ${INK}`, color: INK, padding: sw * 0.008, zIndex: 200 }}
            >
              <div className="font-bold leading-tight" style={{ fontSize: sw * 0.0145 }}>{crop.name}</div>
              <div className="font-semibold opacity-70" style={{ fontSize: sw * 0.0105 }}>Ready in {formatDuration((infoPlot.readyAt ?? now) - now)}</div>
              <div className="flex gap-1.5" style={{ marginTop: sw * 0.006 }}>
                <button
                  onClick={() => waterOne(infoPlot.id)}
                  disabled={!!infoPlot.watered}
                  className="flex-1 rounded-full font-bold border-2 hover:scale-105 transition-transform disabled:opacity-45 disabled:hover:scale-100"
                  style={{ background: '#dff1ff', borderColor: INK, fontSize: sw * 0.011, padding: `${sw * 0.003}px 0` }}
                >
                  <Ico name="icon_water_can" w={sw * 0.016} style={{ marginRight: 3 }} />{infoPlot.watered ? 'Watered' : `Water -${Math.round(WATER_BONUS * 100)}%`}
                </button>
                <button
                  onClick={() => rushOne(infoPlot.id)}
                  className="flex-1 rounded-full font-bold border-2 hover:scale-105 transition-transform"
                  style={{ background: goo >= cost ? 'linear-gradient(#ffe98a,#f2b632)' : '#e8dfc9', borderColor: INK, fontSize: sw * 0.011, padding: `${sw * 0.003}px 0`, opacity: goo >= cost ? 1 : 0.6 }}
                >
                  <Ico name="icon_rush" w={sw * 0.016} style={{ marginRight: 3 }} />{cost.toLocaleString()} <Ico name="icon_drop" w={sw * 0.011} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 400 }}>
          {fx.map(f => <FxView key={f.id} fx={f} sw={sw} />)}
        </div>

        {/* HUD: Farm Level */}
        <div className="absolute flex items-center" style={{ left: sw * 0.014, top: sw * 0.012, gap: sw * 0.008, zIndex: 300 }}>
          <div className="relative flex items-center justify-center font-bold" style={{ width: sw * 0.066, height: sw * 0.066, color: '#fff', fontSize: sw * 0.026, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }}>
            <Ico name="icon_level_badge" w={sw * 0.066} style={{ position: 'absolute', inset: 0 }} />
            <span className="relative" style={{ WebkitTextStroke: `${sw * 0.0025}px ${INK}`, paintOrder: 'stroke fill', marginTop: sw * 0.004 }}>{farm.level}</span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full font-bold whitespace-nowrap" style={{ background: INK, color: '#ffe9a8', fontSize: sw * 0.0085, padding: `0 ${sw * 0.005}px` }}>FARM LV</span>
          </div>
          <div style={{ width: sw * 0.27 }}>
            <div className="relative" style={{ aspectRatio: '569 / 82' }}>
              <img src={bt('ui_bar_hp.png')} alt="" draggable={false} className="absolute inset-0 w-full h-full" />
              <div className="absolute overflow-hidden rounded-full" style={{ left: '3.8%', right: '3.8%', top: '27%', bottom: '27%' }}>
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${farm.level >= MAX_FARM_LEVEL ? 100 : (xp.have / xp.need) * 100}%`, background: 'linear-gradient(#ffe98a,#f2b632)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.5)' }} />
              </div>
            </div>
            <div className="font-bold text-white leading-tight" style={{ fontSize: sw * 0.0105, textShadow: '0 1px 3px rgba(0,0,0,0.9)', marginTop: sw * 0.002 }}>
              {farm.level >= MAX_FARM_LEVEL ? 'Max level' : `${xp.have} / ${xp.need} Farm XP`}
              {nextUnlocks.length > 0 && <span className="opacity-80"> · Next: {nextUnlocks[0]}</span>}
            </div>
          </div>
        </div>

        {/* HUD: goo, bag, close */}
        <div className="absolute flex items-center" style={{ right: sw * 0.014, top: sw * 0.012, gap: sw * 0.008, zIndex: 300 }}>
          <div ref={bagRef} className="flex items-center rounded-full shadow-lg" style={{ background: PARCHMENT, border: `3px solid ${INK}`, padding: `${sw * 0.003}px ${sw * 0.01}px`, gap: sw * 0.008 }}>
            <img src={`${BASE}food_bag.png`} alt="" draggable={false} style={{ width: sw * 0.026 }} />
            {CROP_ORDER.map(c => (
              <span key={c} className="flex items-center font-bold" style={{ color: INK, fontSize: sw * 0.0125, gap: 2 }}>
                <img src={foodSpriteUrl(c)} alt="" draggable={false} style={{ width: sw * 0.022 }} />
                {inventory[c] || 0}
              </span>
            ))}
          </div>
          <div className="rounded-full font-bold shadow-lg" style={{ background: PARCHMENT, border: `3px solid ${INK}`, color: INK, fontSize: sw * 0.0125, padding: `${sw * 0.004}px ${sw * 0.01}px` }}>
            <span className="inline-flex items-center" style={{ gap: sw * 0.003 }}>{Math.floor(goo).toLocaleString()} <Ico name="icon_drop" w={sw * 0.017} /></span>
          </div>
          <button onClick={onClose} aria-label="Close farm" className="hover:scale-110 transition-transform" style={{ width: sw * 0.036, height: sw * 0.036 }}>
            <img src={bt('ui_btn_close.png')} alt="" className="w-full h-full" draggable={false} />
          </button>
        </div>

        {/* action bar */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center" style={{ bottom: sw * 0.012, gap: sw * 0.008, zIndex: 300 }}>
          <ActionButton primary={readyPlots.length > 0} disabled={!readyPlots.length} onClick={harvestEverything} sw={sw} badge={readyPlots.length || undefined}>
            <Ico name="icon_basket" w={sw * 0.022} style={{ marginRight: 4 }} />Harvest All
          </ActionButton>
          <ActionButton disabled={!emptyPlots.length} onClick={() => setPicker({ mode: 'all' })} sw={sw} badge={emptyPlots.length || undefined}>
            <Ico name="icon_seed_pouch" w={sw * 0.022} style={{ marginRight: 4 }} />Plant All
          </ActionButton>
          <ActionButton disabled={!growingUnwatered.length} onClick={waterEverything} sw={sw} badge={growingUnwatered.length || undefined}>
            <Ico name="icon_water_can" w={sw * 0.022} style={{ marginRight: 4 }} />Water All
          </ActionButton>
          <button
            onClick={() => dispatch({ type: 'SET_AUTO_REPLANT', value: !farm.autoReplant })}
            title="After a harvest, plant the same crop again automatically"
            className="rounded-full font-bold border-[3px] shadow-lg hover:scale-105 transition-transform whitespace-nowrap"
            style={{ background: farm.autoReplant ? 'linear-gradient(#9dffb0,#38c95a)' : PARCHMENT, borderColor: INK, color: INK, fontSize: sw * 0.0125, padding: `${sw * 0.005}px ${sw * 0.012}px` }}
          >
            <Ico name="icon_autoreplant" w={sw * 0.02} style={{ marginRight: 4 }} />Auto-replant {farm.autoReplant ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* level-up banner */}
        {banner && (
          <div key={banner.id} className="absolute left-1/2 pointer-events-none farm-banner text-center" style={{ top: sw * 0.07, zIndex: 500 }}>
            <div className="relative mx-auto" style={{ width: sw * 0.34, aspectRatio: '358 / 116' }}>
              <img src={bt('ui_ribbon.png')} alt="" className="absolute inset-0 w-full h-full" draggable={false} style={{ filter: `drop-shadow(0 0 ${sw * 0.02}px ${GOLD})` }} />
              <div className="absolute inset-0 flex items-center justify-center font-bold" style={{ color: INK, fontSize: sw * 0.03 }}>Farm Level {banner.level}!</div>
            </div>
            {banner.lines.length > 0 && (
              <div className="mx-auto rounded-2xl font-bold" style={{ background: PARCHMENT, border: `3px solid ${INK}`, color: INK, width: sw * 0.3, marginTop: sw * 0.004, padding: `${sw * 0.005}px ${sw * 0.01}px`, fontSize: sw * 0.0125 }}>
                {banner.lines.map(l => <div key={l}>✨ {l}</div>)}
              </div>
            )}
          </div>
        )}

        {/* crop chooser */}
        {picker && (
          <CropChooser
            sw={sw}
            mode={picker.mode}
            level={farm.level}
            goo={goo}
            seeds={seeds}
            emptyCount={emptyPlots.length}
            onPick={crop => (picker.mode === 'plot' ? plantOne(picker.plotId, crop) : plantEverywhere(crop))}
            onClose={() => setPicker(null)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

const SPARKS = Array.from({ length: 16 }, (_, i) => ({
  x: 8 + ((i * 53) % 84), y: 36 + ((i * 37) % 56), d: -((i * 1.7) % 9), t: 7 + (i % 5) * 1.6, c: i % 3 === 0 ? '#fff3b0' : i % 3 === 1 ? '#ffd6f0' : '#c9f5ff',
}));

const ActionButton: React.FC<{ children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean; sw: number; badge?: number }> = ({ children, onClick, disabled, primary, sw, badge }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative rounded-full font-bold border-[3px] shadow-lg transition-transform whitespace-nowrap ${disabled ? 'opacity-55 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${primary && !disabled ? 'farm-ready-btn' : ''}`}
    style={{ background: primary && !disabled ? 'linear-gradient(#ff7eb6,#ff1493)' : PARCHMENT, borderColor: primary && !disabled ? '#fff3c0' : INK, color: primary && !disabled ? '#fff' : INK, fontSize: sw * 0.0125, padding: `${sw * 0.005}px ${sw * 0.014}px`, textShadow: primary && !disabled ? '0 1px 2px rgba(80,0,40,0.6)' : undefined }}
  >
    {children}
    {badge ? (
      <span className="absolute -top-2 -right-2 rounded-full font-bold text-white flex items-center justify-center" style={{ background: '#e8344c', border: '2px solid #fff', minWidth: sw * 0.02, height: sw * 0.02, fontSize: sw * 0.0105, padding: '0 4px' }}>{badge}</span>
    ) : null}
  </button>
);

const CropChooser: React.FC<{
  sw: number; mode: 'plot' | 'all'; level: number; goo: number; seeds: Record<SlimeFoodType, number>; emptyCount: number;
  onPick: (c: SlimeFoodType) => void; onClose: () => void;
}> = ({ sw, mode, level, goo, seeds, emptyCount, onPick, onClose }) => {
  const count = mode === 'all' ? emptyCount : 1;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/55 farm-fade" style={{ zIndex: 600 }} onClick={onClose}>
      <div className="rounded-3xl shadow-2xl farm-rise" onClick={e => e.stopPropagation()} style={{ width: sw * 0.62, background: `linear-gradient(${PARCHMENT}, #ecd9a8)`, border: `4px solid ${INK}`, color: INK, padding: sw * 0.014 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: sw * 0.01 }}>
          <div>
            <div className="font-bold" style={{ fontSize: sw * 0.024 }}>{mode === 'all' ? `Plant on ${count} empty plot${count === 1 ? '' : 's'}` : 'Choose a crop'}</div>
            <div className="font-semibold opacity-70" style={{ fontSize: sw * 0.0115 }}>Seeds are bought as you plant. Quick crops for now, long crops for later.</div>
          </div>
          <button onClick={onClose} className="rounded-full font-bold border-2 hover:scale-110 transition-transform" style={{ width: sw * 0.032, height: sw * 0.032, borderColor: INK, background: '#fff7dc', fontSize: sw * 0.018 }}>×</button>
        </div>
        <div className="grid grid-cols-3" style={{ gap: sw * 0.01 }}>
          {CROP_ORDER.map(c => {
            const def = CROPS[c];
            const unlocked = cropUnlocked(c, level);
            const have = seeds[c] || 0;
            const cost = have >= count ? 0 : (count - have) * def.seedCost;
            const afford = goo >= cost;
            const grow = growMsFor(c, level);
            const yieldTxt = `${def.baseYield}${extraYieldChance(level) > 0 ? `–${def.baseYield + 1}` : ''}`;
            return (
              <button
                key={c}
                disabled={!unlocked || !afford}
                onClick={() => onPick(c)}
                className={`relative text-center rounded-2xl border-[3px] transition-transform ${unlocked && afford ? 'hover:scale-[1.03] hover:-translate-y-1' : 'opacity-70 cursor-not-allowed'}`}
                style={{ background: '#fff7dc', borderColor: INK, padding: `${sw * 0.01}px ${sw * 0.008}px` }}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full font-bold text-white" style={{ background: ROLE_COLOR[def.role], fontSize: sw * 0.0095, padding: `0 ${sw * 0.008}px`, border: '2px solid #fff' }}>{def.role}</span>
                <Ico name={`seed_packet_${c}`} w={sw * 0.075} style={{ display: 'block', margin: '0 auto', filter: unlocked ? undefined : 'grayscale(1)' }} />
                <div className="font-bold leading-tight" style={{ fontSize: sw * 0.0155 }}>{def.name}</div>
                <div className="opacity-75 leading-tight" style={{ fontSize: sw * 0.0098, margin: `${sw * 0.003}px 0` }}>{def.blurb}</div>
                <div className="grid grid-cols-2 gap-x-2 font-semibold" style={{ fontSize: sw * 0.0105 }}>
                  <span>⏱ {formatDuration(grow)}</span>
                  <span>🧺 ×{yieldTxt}</span>
                  <span>⭐ {SLIME_FOODS[c].xpValue} XP each</span>
                  <span>🌾 +{def.farmXp} Farm XP</span>
                </div>
                <div className="font-bold" style={{ marginTop: sw * 0.005, fontSize: sw * 0.0125, color: afford ? INK : '#c0392b' }}>
                  {!unlocked ? '' : cost === 0 ? 'Seeds ready' : <>{cost.toLocaleString()} <Ico name="icon_drop" w={sw * 0.0125} /></>}
                </div>
                {!unlocked && (
                  <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/55 text-white font-bold" style={{ fontSize: sw * 0.0145 }}>
                    <Lock style={{ width: sw * 0.026, height: sw * 0.026 }} />
                    Farm Level {def.unlockLevel}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FxView: React.FC<{ fx: Fx; sw: number }> = ({ fx, sw }) => {
  if (fx.kind === 'pop') {
    return (
      <div className="absolute text-center whitespace-nowrap farm-pop" style={{ left: fx.x, top: fx.y, transform: 'translate(-50%,-50%)' }}>
        {fx.label && <div className="font-bold leading-none" style={{ fontSize: sw * 0.0125, color: '#ffe14d', textShadow: '0 2px 3px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>{fx.label}</div>}
        <div className="font-bold leading-none" style={{ fontSize: sw * 0.026 * fx.size, color: fx.color, WebkitTextStroke: `${Math.max(2, sw * 0.003)}px #2a1408`, paintOrder: 'stroke fill', textShadow: '0 3px 0 rgba(30,12,4,0.85)' }}>{fx.text}</div>
      </div>
    );
  }
  if (fx.kind === 'fly') return <FlyingFood fx={fx} sw={sw} />;
  if (fx.kind === 'gold') {
    return (
      <div className="absolute" style={{ left: fx.x, top: fx.y }}>
        <img src={`${FARM}fx_golden_burst.png`} alt="" draggable={false} className="absolute farm-gold-burst" style={{ width: sw * 0.2, imageRendering: 'auto' }} />
        <img src={`${FARM}crop_${fx.crop}_gold.png`} alt="" draggable={false} className="absolute farm-gold-plant" style={{ width: sw * 0.11, imageRendering: 'auto' }} />
      </div>
    );
  }
  if (fx.kind === 'dust') {
    return (
      <div className="absolute" style={{ left: fx.x, top: fx.y }}>
        {Array.from({ length: fx.count }).map((_, i) => {
          const a = (i / fx.count) * Math.PI * 2 + (fx.id % 7);
          const d = sw * (0.018 + ((i * 29) % 20) / 1100);
          const r = sw * (0.0035 + ((i * 13) % 5) / 1500);
          return <span key={i} className="absolute rounded-full farm-burst" style={{ width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, background: fx.color, ['--dx' as string]: `${Math.cos(a) * d * 1.4}px`, ['--dy' as string]: `${Math.sin(a) * d * 0.8 - sw * 0.012}px`, animationDelay: `${i * 0.015}s` }} />;
        })}
      </div>
    );
  }
  return (
    <div className="absolute" style={{ left: fx.x, top: fx.y }}>
      {Array.from({ length: fx.count }).map((_, i) => {
        const a = (i / fx.count) * Math.PI * 2 + (fx.id % 5);
        const d = sw * (0.03 + ((i * 37) % 30) / 900);
        return (
          <span key={i} className="absolute farm-burst" style={{ fontSize: sw * 0.02, ['--dx' as string]: `${Math.cos(a) * d}px`, ['--dy' as string]: `${Math.sin(a) * d - sw * 0.018}px`, animationDelay: `${i * 0.025}s` }}>
            {fx.emojis[i % fx.emojis.length]}
          </span>
        );
      })}
    </div>
  );
};

const FlyingFood: React.FC<{ fx: Extract<Fx, { kind: 'fly' }>; sw: number }> = ({ fx, sw }) => {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    try {
      ref.current?.animate(
        [{ transform: 'translate(-50%,-50%) scale(1.1)', opacity: 1 }, { transform: `translate(calc(-50% + ${fx.toX - fx.x}px), calc(-50% + ${fx.toY - fx.y}px)) scale(0.4)`, opacity: 0.9 }],
        { duration: 650, easing: 'cubic-bezier(.4,0,.8,.5)', fill: 'forwards' },
      );
    } catch { /* ignore */ }
  }, [fx]);
  return <img ref={ref} src={fx.img} alt="" draggable={false} className="absolute" style={{ left: fx.x, top: fx.y, width: sw * 0.04, transform: 'translate(-50%,-50%)', imageRendering: 'auto' }} />;
};

const CSS = `
  @keyframes farmSway { 0%,100% { transform: translateX(-50%) rotate(-1.5deg) } 50% { transform: translateX(-50%) rotate(1.5deg) } }
  @keyframes farmRipe { 0%,100% { transform: translateX(-50%) scale(1,1) } 50% { transform: translateX(-50%) scale(1.04,0.97) } }
  @keyframes farmFloat { 0%,100% { transform: translateX(-50%) translateY(0) } 50% { transform: translateX(-50%) translateY(-12%) } }
  @keyframes farmRipeRing { 0% { opacity: 0.9; transform: translateX(-50%) scale(0.9) } 100% { opacity: 0; transform: translateX(-50%) scale(1.25) } }
  @keyframes farmPlus { 0%,100% { transform: scale(1); opacity: 0.8 } 50% { transform: scale(1.12); opacity: 1 } }
  @keyframes farmSpark { 0% { transform: translate(0,0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translate(40px,-70px); opacity: 0 } }
  @keyframes farmButterfly { 0% { left: -4%; transform: translateY(0) } 25% { transform: translateY(-30px) } 50% { transform: translateY(10px) } 75% { transform: translateY(-24px) } 100% { left: 104%; transform: translateY(0) } }
  @keyframes farmPop { 0% { transform: translate(-50%,-30%) scale(0.5); opacity: 0 } 15% { transform: translate(-50%,-60%) scale(1.25); opacity: 1 } 70% { opacity: 1 } 100% { transform: translate(-50%,-180%) scale(1); opacity: 0 } }
  @keyframes farmBurst { 0% { transform: translate(0,0) scale(0.4); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(1.1); opacity: 0 } }
  @keyframes farmBanner { 0% { transform: translate(-50%,-30px) scale(0.7); opacity: 0 } 10% { transform: translate(-50%,0) scale(1.06); opacity: 1 } 16% { transform: translate(-50%,0) scale(1) } 90% { opacity: 1 } 100% { transform: translate(-50%,-10px); opacity: 0 } }
  @keyframes farmRise { 0% { opacity: 0; margin-top: 14px } 100% { opacity: 1; margin-top: 0 } }
  @keyframes farmFade { 0% { opacity: 0 } 100% { opacity: 1 } }
  @keyframes farmReadyBtn { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.25) } }
  .farm-sway { animation: farmSway 4.5s ease-in-out infinite }
  .farm-ripe { animation: farmRipe 1.4s ease-in-out infinite }
  .farm-float { animation: farmFloat 1.3s ease-in-out infinite }
  .farm-ripe-ring { animation: farmRipeRing 1.5s ease-out infinite }
  .farm-plus { animation: farmPlus 2s ease-in-out infinite }
  .farm-spark { animation: farmSpark 8s ease-out infinite }
  .farm-butterfly { animation: farmButterfly 22s linear infinite }
  @keyframes farmGoldBurst { 0% { transform: translate(-50%,-50%) scale(0.3) rotate(0deg); opacity: 0 } 18% { opacity: 1 } 100% { transform: translate(-50%,-50%) scale(1.25) rotate(35deg); opacity: 0 } }
  @keyframes farmGoldPlant { 0% { transform: translate(-50%,-60%) scale(0.6); opacity: 0 } 20% { transform: translate(-50%,-70%) scale(1.15); opacity: 1 } 70% { opacity: 1 } 100% { transform: translate(-50%,-110%) scale(1); opacity: 0 } }
  .farm-gold-burst { animation: farmGoldBurst 1.2s ease-out forwards }
  .farm-gold-plant { animation: farmGoldPlant 1.25s ease-out forwards }
  .farm-pop { animation: farmPop 1.2s ease-out forwards }
  .farm-burst { animation: farmBurst 0.9s ease-out forwards }
  .farm-banner { animation: farmBanner 4.2s ease-out forwards }
  .farm-rise { animation: farmRise 0.22s ease-out forwards }
  .farm-fade { animation: farmFade 0.2s ease-out forwards }
  .farm-ready-btn { animation: farmReadyBtn 1s ease-in-out infinite }
`;
