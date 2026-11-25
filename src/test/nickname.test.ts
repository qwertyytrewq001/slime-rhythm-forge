import { describe, it, expect } from 'vitest';
import { cleanNickname, displayName } from '@/utils/nickname';
import { toBattleSlime } from '@/utils/battleEngine';
import { createElementSlime } from '@/utils/slimeGenerator';

describe('slime names', () => {
  it('tidies what the player typed', () => {
    expect(cleanNickname('   Sir   Wobbles  ')).toBe('Sir Wobbles');
    expect(cleanNickname('A name that goes on forever')).toHaveLength(14);
    expect(cleanNickname('    ')).toBe('');
  });

  it('shows the nickname without changing the species or its battle stats', () => {
    const plain = createElementSlime('fire');
    const named = { ...plain, nickname: 'Pip' };
    expect(displayName(plain)).toBe(plain.name);
    expect(displayName(named)).toBe('Pip');
    expect(named.name).toBe(plain.name);
    expect(toBattleSlime(named).battleStats).toEqual(toBattleSlime(plain).battleStats);
  });
});
