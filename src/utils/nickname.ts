/** Players can name their slimes. The name is kept on this device only. */
export const NICKNAME_MAX = 14;

export const cleanNickname = (raw: string) => raw.replace(/\s+/g, ' ').trim().slice(0, NICKNAME_MAX).trim();

/** What to call a slime on screen: the player's name for it, otherwise its species. */
export const displayName = (s: { name: string; nickname?: string }) => s.nickname || s.name;
