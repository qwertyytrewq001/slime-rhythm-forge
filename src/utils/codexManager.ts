import { CodexSlime, ALL_CODEX_SLIMES, SLIME_CODEX_MAP } from '@/data/slimeCodex';

export interface CodexState {
  discoveredSlimeIds: Set<string>;
  totalDiscovered: number;
  totalSlimes: number;
}

/**
 * Codex Manager - Tracks 'Discovered' vs 'Undiscovered' (silhouettes) IDs
 */
export class CodexManager {
  private state: CodexState;
  
  constructor(initialDiscovered: string[] = []) {
    this.state = {
      discoveredSlimeIds: new Set(initialDiscovered),
      totalDiscovered: initialDiscovered.length,
      totalSlimes: ALL_CODEX_SLIMES.length
    };
  }
  
  /**
   * Mark a slime as discovered
   */
  discoverSlime(slimeId: string): void {
    if (!this.state.discoveredSlimeIds.has(slimeId)) {
      this.state.discoveredSlimeIds.add(slimeId);
      this.state.totalDiscovered++;
      console.log(`📚 New Discovery: ${SLIME_CODEX_MAP.get(slimeId)?.name}`);
    }
  }
  
  /**
   * Check if a slime is discovered
   */
  isDiscovered(slimeId: string): boolean {
    return this.state.discoveredSlimeIds.has(slimeId);
  }
  
  /**
   * Get all slimes, marking undiscovered ones
   */
  getAllSlimes(): CodexSlime[] {
    return ALL_CODEX_SLIMES.map(slime => ({
      ...slime,
      isDiscovered: this.isDiscovered(slime.id)
    }));
  }
  
  /**
   * Get only discovered slimes
   */
  getDiscoveredSlimes(): CodexSlime[] {
    return ALL_CODEX_SLIMES.filter(slime => this.isDiscovered(slime.id));
  }
  
  /**
   * Get only undiscovered slimes (for codex display as silhouettes)
   */
  getUndiscoveredSlimes(): CodexSlime[] {
    return ALL_CODEX_SLIMES.filter(slime => !this.isDiscovered(slime.id));
  }
  
  /**
   * Get discovery progress
   */
  getDiscoveryProgress(): { discovered: number; total: number; percentage: number } {
    return {
      discovered: this.state.totalDiscovered,
      total: this.state.totalSlimes,
      percentage: Math.round((this.state.totalDiscovered / this.state.totalSlimes) * 100)
    };
  }
  
  /**
   * Save/load state persistence
   */
  saveState(): void {
    try {
      const stateData = {
        discoveredSlimeIds: Array.from(this.state.discoveredSlimeIds),
        totalDiscovered: this.state.totalDiscovered
      };
      localStorage.setItem('slimeCodexState', JSON.stringify(stateData));
      console.log('💾 Codex state saved');
    } catch (error) {
      console.error('❌ Failed to save codex state:', error);
    }
  }
  
  loadState(): void {
    try {
      const savedData = localStorage.getItem('slimeCodexState');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.state = {
          discoveredSlimeIds: new Set(parsedData.discoveredSlimeIds || []),
          totalDiscovered: parsedData.totalDiscovered || 0,
          totalSlimes: ALL_CODEX_SLIMES.length
        };
        console.log('📂 Codex state loaded');
      }
    } catch (error) {
      console.error('❌ Failed to load codex state:', error);
    }
  }
  
  /**
   * Initialize on first load
   */
  initialize(): void {
    this.loadState();
    console.log(`📚 Codex initialized: ${this.state.totalDiscovered}/${this.state.totalSlimes} slimes discovered`);
  }
}
