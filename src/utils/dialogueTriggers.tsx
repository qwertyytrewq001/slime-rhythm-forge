import React, { useCallback, useEffect } from 'react';

// Global dialogue trigger system
export type DialogueTrigger = 
  | 'firstLaunch'
  | 'firstBazaarOpen'
  | 'firstEggBought'
  | 'firstHatch'
  | 'secondHatch'
  | 'firstHabitatBuilt'
  | 'firstFeed'
  | 'firstAltarVisit'
  | 'firstBreedComplete'
  | 'firstBattleMapOpen'
  | 'levelUp'
  | 'vossEncounter'
  | 'finalBattle'
  // Additional triggers from game
  | 'breeding-intro'
  | 'battle-start'
  | 'shop-purchase'
  | 'habitat-purchase'
  | 'hatch-egg'
  | 'breeding-complete';

let globalTrigger: DialogueTrigger | null = null;
let globalTriggerData: any = null;

export const triggerDialogue = (trigger: DialogueTrigger, data?: any) => {
  globalTrigger = trigger;
  globalTriggerData = data;
  
  // Create a custom event that other components can listen for
  window.dispatchEvent(new CustomEvent('dialogueTrigger', { 
    detail: { trigger, data } 
  }));
};

export const getDialogueTrigger = (): DialogueTrigger | null => {
  return globalTrigger;
};

export const getDialogueTriggerData = (): any => {
  return globalTriggerData;
};

export const clearDialogueTrigger = () => {
  globalTrigger = null;
  globalTriggerData = null;
};

// Hook for components to listen for dialogue triggers
export const useDialogueTrigger = (callback: (trigger: DialogueTrigger, data?: any) => void) => {
  const savedCallback = React.useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Check for pending trigger on mount
    if (globalTrigger) {
      savedCallback.current(globalTrigger, globalTriggerData);
    }

    const handleTrigger = (event: any) => {
      if (event.detail?.trigger) {
        savedCallback.current(event.detail.trigger, event.detail.data);
      }
    };

    window.addEventListener('dialogueTrigger', handleTrigger);
    return () => {
      window.removeEventListener('dialogueTrigger', handleTrigger);
    };
  }, []);
};
