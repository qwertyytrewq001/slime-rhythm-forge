import React, { useCallback, useEffect } from 'react';

// Global dialogue trigger system
export type DialogueTrigger = 
  | 'breeding-intro'
  | 'breeding-complete' 
  | 'shop-purchase'
  | 'habitat-purchase'
  | 'hatch-egg'
  | 'battle-start';

let globalTrigger: DialogueTrigger | null = null;
let globalTriggerData: any = null;

export const triggerDialogue = (triggerId: DialogueTrigger, data?: any) => {
  globalTrigger = triggerId;
  globalTriggerData = data;
  
  // Create a custom event that other components can listen for
  window.dispatchEvent(new CustomEvent('dialogueTrigger', { 
    detail: { triggerId, data } 
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
export const useDialogueTrigger = (callback: (triggerId: DialogueTrigger, data?: any) => void) => {
  const handleTrigger = useCallback((event: any) => {
    if (event.detail?.triggerId) {
      callback(event.detail.triggerId, event.detail.data);
    }
  }, [callback]);

  useEffect(() => {
    window.addEventListener('dialogueTrigger', handleTrigger);
    return () => {
      window.removeEventListener('dialogueTrigger', handleTrigger);
    };
  }, [handleTrigger]);
};
