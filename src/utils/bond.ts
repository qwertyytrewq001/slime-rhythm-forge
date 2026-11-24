/** Friendship between you and each slime. It grows from petting, feeding, playing and coming when called. */
export const BOND_LEVELS = [
  { name: 'New', at: 0 },
  { name: 'Friend', at: 40 },
  { name: 'Buddy', at: 120 },
  { name: 'Best Friend', at: 300 },
] as const;

export const bondLevel = (bond = 0): number => {
  let lv = 0;
  BOND_LEVELS.forEach((l, i) => { if (bond >= l.at) lv = i; });
  return lv;
};
export const bondName = (bond = 0): string => BOND_LEVELS[bondLevel(bond)].name;
/** 0..1 progress to the next level (1 at the top). */
export const bondProgress = (bond = 0): number => {
  const lv = bondLevel(bond);
  const next = BOND_LEVELS[lv + 1];
  if (!next) return 1;
  return (bond - BOND_LEVELS[lv].at) / (next.at - BOND_LEVELS[lv].at);
};

/** Every slime has a nature, fixed by its id. It changes how it reacts when you pet it. */
export type SlimeNature = 'shy' | 'playful' | 'greedy' | 'lazy';
const NATURES: SlimeNature[] = ['shy', 'playful', 'greedy', 'lazy'];
export const slimeNature = (id: string): SlimeNature => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return NATURES[h % NATURES.length];
};
export const NATURE_BLURB: Record<SlimeNature, string> = {
  shy: 'Shy: hides at first, warms up once you are friends',
  playful: 'Playful: bounces when you pet it',
  greedy: 'Greedy: always thinking about snacks',
  lazy: 'Lazy: would rather be napping',
};
