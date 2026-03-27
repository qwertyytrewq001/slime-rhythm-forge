import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { GlimCharacter } from './GlimCharacter';
import { triggerDialogue, clearDialogueTrigger, useDialogueTrigger, getDialogueTrigger } from '@/utils/dialogueTriggers';

// Define the actual trigger types that match the triggerDialogue function
type TriggerType = 
  | 'firstLaunch'
  | 'breeding-intro'
  | 'battle-start'
  | 'shop-purchase'
  | 'habitat-purchase'
  | 'hatch-egg'
  | 'breeding-complete'
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
  | 'finalBattle';

interface LoreChapter {
  id: string;
  title: string;
  dialogue: string[];
  expression: string;
}

// First-time tutorial events
const FIRST_TIME_EVENTS = {
  firstLaunch: false,
  firstBazaarOpen: false,
  firstEggBought: false,
  firstHatch: false,
  secondHatch: false,
  firstHabitatBuilt: false,
  firstFeed: false,
  firstAltarVisit: false,
  firstBreedComplete: false,
  breedingIntroShown: false, // Prevent repeated breeding-intro triggers
  firstBattleMapOpen: false,
};

// Check if event has been seen
const hasSeenEvent = (eventName: keyof typeof FIRST_TIME_EVENTS): boolean => {
  return localStorage.getItem(`glim_event_${eventName}`) === 'true';
};

// Mark event as seen
const markEventSeen = (eventName: keyof typeof FIRST_TIME_EVENTS): void => {
  localStorage.setItem(`glim_event_${eventName}`, 'true');
  FIRST_TIME_EVENTS[eventName] = true;
};

// PART 1 - FIRST TIME TUTORIAL FLOW
const FIRST_LAUNCH_DIALOGUE = [
  {
    id: 'firstLaunch',
    expression: 'exicted',
    text: "Oh. OH. Someone's actually here."
  },
  {
    id: 'firstLaunch',
    expression: 'explainingsomething',
    text: "After four HUNDRED years. Do you know how long that is?"
  },
  {
    id: 'firstLaunch',
    expression: 'explainingsomething',
    text: "...It is very long. I counted the stars. Twice."
  },
  {
    id: 'firstLaunch',
    expression: 'glim_kind',
    text: "My name is Glim. Guardian of Slime Forge."
  },
  {
    id: 'firstLaunch',
    expression: 'glim_kind',
    text: "This world — Sanctuaries, Goo, slimes — it's dying."
  },
  {
    id: 'firstLaunch',
    expression: 'sad_glim',
    text: "Someone has been draining it. Deliberately."
  },
  {
    id: 'firstLaunch',
    expression: 'sad_glim',
    text: "You're a Forger. That means you can fix this."
  },
  {
    id: 'firstLaunch',
    expression: 'sad_glim',
    text: "Breed slimes. Build Sanctuaries. Restore the Goo."
  },
  {
    id: 'firstLaunch',
    expression: 'dramatic',
    text: "Start at the Bazaar. Buy an egg. Begin."
  },
  {
    id: 'firstLaunch',
    expression: 'dramatic',
    text: "I'll be watching."
  }
];

const FIRST_BAZAAR_DIALOGUE = [
  {
    id: 'firstBazaarOpen',
    expression: 'excited',
    text: "Eggs! Each one is a different slime species waiting to exist."
  },
  {
    id: 'firstBazaarOpen',
    expression: 'excited',
    text: "Electric, Metal, Shadow, Light — each type has its own strengths."
  },
  {
    id: 'firstBazaarOpen',
    expression: 'nudging',
    text: "Go on. Pick one. I personally recommend Electric — reliable, powerful, only occasionally causes explosions."
  }
];

const FIRST_EGG_DIALOGUE = [
  {
    id: 'firstEggBought',
    expression: 'proud',
    text: "Good. Now head to the hatchery and get that egg warm."
  }
];

const FIRST_HATCH_DIALOGUE = [
  {
    id: 'firstHatch',
    expression: 'exicted',
    text: "..."
  },
  {
    id: 'firstHatch',
    expression: 'exicted',
    text: "I haven't seen a hatching in four hundred years."
  },
  {
    id: 'firstHatch',
    expression: 'emotional',
    text: "When a slime hatches for a Forger, it bonds with you. That bond is everything."
  },
  {
    id: 'firstHatch',
    expression: 'emotional',
    text: "It's also exactly what our enemy doesn't understand. Remember that."
  },
  {
    id: 'firstHatch',
    expression: 'emotional',
    text: "Now — it needs a home. Build it a Sanctuary."
  }
];

const FIRST_HABITAT_DIALOGUE = [
  {
    id: 'firstHabitatBuilt',
    expression: 'warm',
    text: "There used to be dozens of these. Full of life. All of them."
  },
  {
    id: 'firstHabitatBuilt',
    expression: 'warm',
    text: "Voss drained every single one."
  },
  {
    id: 'firstHabitatBuilt',
    expression: 'warm',
    text: "Each Sanctuary you build restores Goo to the world and pulls feral slimes back from the edge."
  },
  {
    id: 'firstHabitatBuilt',
    expression: 'warm',
    text: "Place your slime inside. Then feed it. It needs to grow."
  }
];

const FIRST_FEED_DIALOGUE = [
  {
    id: 'firstFeed',
    expression: 'watching',
    text: "Feeding strengthens the bond. It doesn't just make them bigger —"
  },
  {
    id: 'firstFeed',
    expression: 'watching',
    text: "— it makes them more fully what they were always meant to become."
  },
  {
    id: 'firstFeed',
    expression: 'excited',
    text: "Strong slime. Strong Forger. Strong case for us winning this thing."
  },
  {
    id: 'firstFeed',
    expression: 'excited',
    text: "Now — it's time to breed."
  }
];

const FIRST_ALTAR_DIALOGUE = [
  {
    id: 'firstAltarVisit',
    expression: 'smug',
    text: "This is the heart of the Forge. I was born here, actually."
  },
  {
    id: 'firstAltarVisit',
    expression: 'smug',
    text: "The Forger who bred me apparently screamed. I choose to believe it was excitement."
  },
  {
    id: 'firstAltarVisit',
    expression: 'smug',
    text: "Breeding combines two slimes into something new — their elements, their traits, their essence."
  },
  {
    id: 'firstAltarVisit',
    expression: 'smug',
    text: "Voss extracts Goo by force. We create new life. That's the difference between us."
  },
  {
    id: 'firstAltarVisit',
    expression: 'smug',
    text: "Remember: you need to evolve slimes to adult to breed them."
  },
  {
    id: 'firstAltarVisit',
    expression: 'gesturing',
    text: "Select two slimes as parents. Place them on the platform."
  },
  {
    id: 'firstAltarVisit',
    expression: 'gesturing',
    text: "The Altar will do the rest."
  }
];

const FIRST_BREED_DIALOGUE = [
  {
    id: 'firstBreedComplete',
    expression: 'delighted',
    text: "New life. Created by a Forger. At the Altar."
  },
  {
    id: 'firstBreedComplete',
    expression: 'delighted',
    text: "Four hundred years and it still works."
  }
];

const FIRST_BATTLE_DIALOGUE = [
  {
    id: 'firstBattleMapOpen',
    expression: 'sad_glim',
    text: "The Whispering Wilds. Once a safe network of paths between Sanctuaries."
  },
  {
    id: 'firstBattleMapOpen',
    expression: 'sad_glim',
    text: "Now overrun. Every feral slime out there was someone's companion before Goo ran dry."
  },
  {
    id: 'firstBattleMapOpen',
    expression: 'important',
    text: "Defeating them in battle doesn't destroy them — it shocks them back to awareness."
  },
  {
    id: 'firstBattleMapOpen',
    expression: 'important',
    text: "Your restored Goo reaches them. They heal. The world heals."
  },
  {
    id: 'firstBattleMapOpen',
    expression: 'important',
    text: "This is restoration. Not conquest."
  },
  {
    id: 'firstBattleMapOpen',
    expression: 'smirk',
    text: "Also those slimes at Level 5 are genuinely quite rude and I will not pretend otherwise."
  },
  {
    id: 'firstBattleMapOpen',
    expression: 'smirk',
    text: "Go. Fight. Win."
  }
];

// PART 2 - LEVEL-BASED LORE DIALOGUE
const LEVEL_DIALOGUE = {
  1: [
    {
      expression: 'relieved',
      text: "First battle done. The woods haven't seen a Forger in centuries."
    },
    {
      expression: 'relieved',
      text: "The trees are gossiping about you. I can tell."
    }
  ],
  5: [
    {
      expression: 'serious',
      text: "...Wait. Those tracks. Human boots. Fresh."
    },
    {
      expression: 'serious',
      text: "Someone else has been through Glimmerswell recently. And they weren't here to help."
    }
  ],
  10: [
    {
      expression: 'grim',
      text: "I found what's left of the Crystal Ridge Goo pool."
    },
    {
      expression: 'grim',
      text: "Drained completely. Extracted by force. This isn't natural — this is someone's plan."
    },
    {
      expression: 'grim',
      text: "Keep moving. I need to think."
    }
  ],
  14: [
    {
      expression: 'dreadful',
      text: "I know who it is."
    },
    {
      expression: 'dreadful',
      text: "I was hoping I was wrong."
    },
    {
      expression: 'dreadful',
      text: "His name is Voss. Do not underestimate him."
    }
  ],
  15: [
    {
      expression: 'grim',
      text: "...We move faster now."
    }
  ],
  20: [
    {
      expression: 'urgent',
      text: "He's heading for the Marsh. The Shadow slimes there are ancient."
    },
    {
      expression: 'urgent',
      text: "If he extracts them, Goo imbalance could become permanent."
    },
    {
      expression: 'urgent',
      text: "We can't let him reach them first."
    }
  ],
  25: [
    {
      expression: 'holding',
      text: "A feral slime dropped this. Voss's insignia."
    },
    {
      expression: 'holding',
      text: "He's using extracted Goo to drive slimes feral on purpose — creating chaos so no one can protect the Sanctuaries while he harvests them."
    },
    {
      expression: 'holding',
      text: "This isn't greed. This is a strategy."
    }
  ],
  30: [
    {
      expression: 'quiet',
      text: "I need to tell you something."
    },
    {
      expression: 'quiet',
      text: "The Forgotten Castle didn't just fall silent. It was silenced. By a Forger who wanted power over all slime-kind."
    },
    {
      expression: 'quiet',
      text: "Voss found the old texts. He knows what's buried there."
    },
    {
      expression: 'quiet',
      text: "And so do I."
    }
  ],
  35: [
    {
      expression: 'still',
      text: "Before you go in — I want you to know something."
    },
    {
      expression: 'still',
      text: "The first Forger who went dark... I knew him."
    },
    {
      expression: 'still',
      text: "Before everything went wrong, before the castle fell — I knew him."
    },
    {
      expression: 'still',
      text: "Just keep fighting."
    }
  ],
  40: [
    {
      expression: 'serious',
      text: "This is it."
    },
    {
      expression: 'serious',
      text: "Everything you've bred, every Sanctuary restored, every bond forged — it all comes down to this."
    },
    {
      expression: 'serious',
      text: "Voss extracts. We create. Show him what that means."
    }
  ],
  45: [
    {
      expression: 'smirk',
      text: "You can't control it."
    }
  ],
  49: [
    {
      expression: 'scared',
      text: "Everything we've built — every slime, every Sanctuary, every bond — it matters now more than ever."
    },
    {
      expression: 'scared',
      text: "Don't stop."
    }
  ],
  50: [
    {
      expression: 'determined',
      text: "This is it."
    },
    {
      expression: 'determined',
      text: "Everything you've bred, every Sanctuary restored, every bond forged — it all comes down to this."
    },
    {
      expression: 'determined',
      text: "Voss extracts. We create. Show him what that means."
    }
  ]
};

interface LoreTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  startChapter?: string;
}

export function LoreTutorial({ isOpen, onClose, onOpen, startChapter = 'firstLaunch' }: LoreTutorialProps) {
  const { state, dispatch } = useGameState();
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<any[]>([]);
  const [currentExpression, setCurrentExpression] = useState('shocked');
  const [glimPosition, setGlimPosition] = useState<'center' | 'bottom-left'>('center');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  console.log('🔍 LoreTutorial state:', { isOpen, currentDialogueLength: currentDialogue.length, currentExpression, glimPosition });

  // Fallback to trigger first launch if open but empty
  useEffect(() => {
    if (isOpen && currentDialogue.length === 0) {
      console.log('🚀 LoreTutorial fallback: Setting firstLaunch dialogue');
      setCurrentDialogue(FIRST_LAUNCH_DIALOGUE);
      setCurrentDialogueIndex(0);
      setDisplayedText('');
      setCurrentExpression('exicted');
      setGlimPosition('bottom-left');
    }
  }, [isOpen, currentDialogue.length]);

  // Listen for dialogue triggers
  useDialogueTrigger(useCallback((triggerId: TriggerType, data) => {
    console.log('🎮 Dialogue Trigger Received:', triggerId);
    console.log('🔍 hasSeenEvent firstEggBought:', hasSeenEvent('firstEggBought'));
    console.log('🔍 hasSeenEvent firstHabitatBuilt:', hasSeenEvent('firstHabitatBuilt'));
    console.log('🔍 hasSeenEvent firstBazaarOpen:', hasSeenEvent('firstBazaarOpen'));
    console.log('🔍 hasSeenEvent firstHatch:', hasSeenEvent('firstHatch'));
    console.log('🔍 hasSeenEvent secondHatch:', hasSeenEvent('secondHatch'));
    console.log('🔍 hasSeenEvent breedingIntroShown:', hasSeenEvent('breedingIntroShown'));
    
    // Re-open if closed
    if (!isOpen && onOpen) {
      onOpen();
    }

    // Handle breeding-intro trigger (what actually fires when egg is bought)
    if (triggerId === 'breeding-intro' && !hasSeenEvent('firstEggBought')) {
      console.log('🚀 Executing breeding-intro trigger for firstEggBought');
      markEventSeen('firstEggBought');
      markEventSeen('breedingIntroShown'); // Prevent repeated triggers
      setCurrentDialogue(FIRST_EGG_DIALOGUE);
      setCurrentDialogueIndex(0); // Reset to start
      setDisplayedText(''); // Clear displayed text
      setCurrentExpression('proud');
      setGlimPosition('bottom-left');
    }

    // Handle second slime hatch (trigger breeding tutorial)
    if (triggerId === 'hatch-egg' && hasSeenEvent('firstHatch') && !hasSeenEvent('secondHatch')) {
      console.log('🚀 Executing second hatch trigger for breeding tutorial');
      markEventSeen('secondHatch');
      setCurrentDialogue(FIRST_ALTAR_DIALOGUE);
      setCurrentDialogueIndex(0); // Reset to start
      setDisplayedText(''); // Clear displayed text
      setCurrentExpression('reverent');
      setGlimPosition('bottom-left');
      
      // Auto-open gallery when dialogue says "Select two slimes as parents"
      setTimeout(() => {
        const galleryButton = document.querySelector('[data-testid="gallery-button"]') as HTMLButtonElement;
        if (galleryButton) {
          galleryButton.click();
        }
      }, 3000); // 3 seconds after dialogue starts
    }


    // Handle battle-start trigger
    if (triggerId === 'battle-start' && !hasSeenEvent('firstBattleMapOpen')) {
      console.log('🚀 Executing battle-start trigger for firstBattleMapOpen');
      markEventSeen('firstBattleMapOpen');
      setCurrentDialogue(FIRST_BATTLE_DIALOGUE);
      setCurrentDialogueIndex(0); // Reset to start
      setDisplayedText(''); // Clear displayed text
      setCurrentExpression('surveying');
      setGlimPosition('bottom-left');
    }

    // Handle shop-purchase trigger (first time only)
    if (triggerId === 'shop-purchase' && !hasSeenEvent('firstBazaarOpen')) {
      console.log('🚀 Executing shop-purchase trigger for firstBazaarOpen');
      markEventSeen('firstBazaarOpen');
      setCurrentDialogue(FIRST_BAZAAR_DIALOGUE);
      setCurrentDialogueIndex(0); // Reset to start
      setDisplayedText(''); // Clear displayed text
      setCurrentExpression('excited');
      setGlimPosition('bottom-left');
    }

    // Handle habitat-purchase trigger
    if (triggerId === 'habitat-purchase') {
      console.log('🏠 habitat-purchase trigger received');
      console.log('🔍 hasSeenEvent firstHabitatBuilt:', hasSeenEvent('firstHabitatBuilt'));
      if (!hasSeenEvent('firstHabitatBuilt')) {
        console.log('🚀 Executing habitat-purchase trigger for firstHabitatBuilt');
        markEventSeen('firstHabitatBuilt');
        setCurrentDialogue(FIRST_HABITAT_DIALOGUE);
        setCurrentDialogueIndex(0); // Reset to start
        setDisplayedText(''); // Clear displayed text
        setCurrentExpression('warm');
        setGlimPosition('bottom-left');
      } else {
        console.log('❌ firstHabitatBuilt already seen, skipping habitat dialogue');
      }
    }

    // Handle hatch-egg trigger
    if (triggerId === 'hatch-egg' && !hasSeenEvent('firstHatch')) {
      console.log('🚀 Executing hatch-egg trigger for firstHatch');
      markEventSeen('firstHatch');
      setCurrentDialogue(FIRST_HATCH_DIALOGUE);
      setCurrentDialogueIndex(0); // Reset to start
      setDisplayedText(''); // Clear displayed text
      setCurrentExpression('frozen');
      setGlimPosition('bottom-left');
    }

    // Handle breeding-complete trigger
    if (triggerId === 'breeding-complete' && !hasSeenEvent('firstBreedComplete')) {
      console.log('🚀 Executing breeding-complete trigger for firstBreedComplete');
      markEventSeen('firstBreedComplete');
      setCurrentDialogue(FIRST_BREED_DIALOGUE);
      setCurrentDialogueIndex(0); // Reset to start
      setDisplayedText(''); // Clear displayed text
      setCurrentExpression('delighted');
      setGlimPosition('bottom-left');
    }

    // Handle first-time events
    if (triggerId === 'firstLaunch' && !hasSeenEvent('firstLaunch')) {
      console.log('🚀 Executing firstLaunch trigger');
      markEventSeen('firstLaunch');
      setCurrentDialogue(FIRST_LAUNCH_DIALOGUE);
      setCurrentDialogueIndex(0); // Reset to start
      setDisplayedText(''); // Clear displayed text
      setCurrentExpression('shocked');
      setGlimPosition('bottom-left'); // Changed from 'center' to 'bottom-left'
    }

    if (triggerId === 'firstHatch' && !hasSeenEvent('firstHatch')) {
      markEventSeen('firstHatch');
      // Note: FIRST_HATCH_DIALOGUE is already handled by hatch-egg trigger above
    }

    if (triggerId === 'firstFeed' && !hasSeenEvent('firstFeed')) {
      markEventSeen('firstFeed');
      setCurrentDialogue(FIRST_FEED_DIALOGUE);
      setCurrentDialogueIndex(0); // Reset to start
      setDisplayedText(''); // Clear displayed text
      setCurrentExpression('watching');
      setGlimPosition('bottom-left');
    }

    if (triggerId === 'firstAltarVisit' && !hasSeenEvent('firstAltarVisit')) {
      markEventSeen('firstAltarVisit');
      // Note: FIRST_ALTAR_DIALOGUE is already handled by second hatch trigger above
    }

    if (triggerId === 'firstBreedComplete' && !hasSeenEvent('firstBreedComplete')) {
      markEventSeen('firstBreedComplete');
      // Note: FIRST_BREED_DIALOGUE is already handled by breeding-complete trigger above
    }

    if (triggerId === 'firstBattleMapOpen' && !hasSeenEvent('firstBattleMapOpen')) {
      markEventSeen('firstBattleMapOpen');
      // Note: FIRST_BATTLE_DIALOGUE is already handled by battle-start trigger above
    }

    // Handle level-based dialogue
    if (triggerId === 'levelUp') {
      const playerLevel = data?.level || 1;
      const levelDialogue = LEVEL_DIALOGUE[playerLevel as keyof typeof LEVEL_DIALOGUE];
      if (levelDialogue) {
        setCurrentDialogue(levelDialogue);
        setCurrentExpression(levelDialogue[0].expression);
        setGlimPosition('bottom-left');
      }
    }

    // Handle Voss encounters (cutscenes)
    if (triggerId === 'vossEncounter') {
      const vossLevel = data?.level || 15;
      if (vossLevel === 15) {
        // First Voss encounter - cutscene
        // This would need special cutscene handling
        console.log('🎭 Voss Encounter Level 15 - Cutscene');
      } else if (vossLevel === 30) {
        console.log('🎭 Voss Encounter Level 30 - Cutscene');
      } else if (vossLevel === 45) {
        console.log('🎭 Voss Encounter Level 45 - Cutscene');
      }
    }

    if (triggerId === 'finalBattle') {
      setCurrentDialogue([{
        expression: 'determined',
        text: "This is it."
      }, {
        expression: 'determined',
        text: "Everything you've bred, every Sanctuary restored, every bond forged — it all comes down to this."
      }, {
        expression: 'determined',
        text: "Voss extracts. We create. Show him what that means."
      }]);
      setCurrentExpression('determined');
      setGlimPosition('bottom-left');
    }
  }, [isOpen, onOpen]));

  // Typewriter effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (!isOpen || !currentDialogue.length) return;

    const currentCard = currentDialogue[currentDialogueIndex];
    if (!currentCard) return;

    const text = currentCard.text ?? '';
    
    // Don't re-trigger for the same text
    if (displayedText === text && !isTyping) return;

    setDisplayedText('');
    setIsTyping(true);
    
    let charIndex = 0;
    
    intervalRef.current = setInterval(() => {
      if (charIndex < text.length) {
        // Use slice to avoid character-by-character scrambling
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 30);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentDialogue, currentDialogueIndex, isOpen]);

  const handleNext = () => {
    if (isTyping) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsTyping(false);
      setDisplayedText(currentDialogue[currentDialogueIndex]?.text ?? '');
      return;
    }

    if (currentDialogueIndex < currentDialogue.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
      // Reset text for the new card
      setDisplayedText('');
    } else {
      // End of dialogue - dismiss
      onClose();
      // Reset for next time
      setTimeout(() => setCurrentDialogueIndex(0), 500);
    }
  };

  const handlePrevious = () => {
    if (currentDialogueIndex > 0) {
      setCurrentDialogueIndex(prev => prev - 1);
      setDisplayedText(''); // Reset text
    }
  };

  const handleSkip = () => {
    onClose();
    setTimeout(() => setCurrentDialogueIndex(0), 500);
  };

  if (!isOpen || !currentDialogue.length) return null;

  const currentCard = currentDialogue[currentDialogueIndex];
  const progress = ((currentDialogueIndex + 1) / currentDialogue.length) * 100;

  return (
    <div 
      className="fixed inset-0 z-[200] pointer-events-none"
      // The main container for dialogue should not be styled itself
      // but should act as a portal root for its children.
    >
      {/* Glim Character - positioned based on context */}
      <div 
        className="absolute pointer-events-none z-10 transition-all duration-500"
        style={{
          bottom: '16px', // Same level as dialogue box
          left: '20px', // Left side of screen, next to dialogue box
          height: '500px',
          width: '400px',
          background: 'none',
          border: 'none',
          boxShadow: 'none'
        }}
      >
        <GlimCharacter 
          expression={currentCard?.expression ?? 'shocked'}
          size={500}
        />
      </div>

      {/* Dialogue Box */}
      <div 
        className="absolute shadow-2xl relative pointer-events-auto transition-all duration-500"
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '640px',
          maxWidth: '85vw',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          border: '4px solid #FF7EB6',
          padding: '16px 24px',
          zIndex: 9999,
          boxShadow: '0 20px 50px rgba(255, 126, 182, 0.2)'
        }}
      >
        {/* Using a separate inner div for content padding */}
        <div className="h-full flex flex-col">
          {/* Character Name */}
          <div className="mb-3">
            <h3 className="text-[#FF7EB6] font-black text-xl uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>Glim</h3>
          </div>

          {/* Dialogue Text */}
          <div className="flex-1 overflow-y-auto pr-2" style={{minHeight: '50px'}}>
            <p className="text-slate-800 text-xl leading-relaxed font-bold italic" style={{ fontFamily: "'VT323', monospace" }}>
              {/* Ensure displayedText is always a string */}
              "{displayedText ?? ''}"
              {isTyping && <span className="animate-pulse ml-1" style={{color: '#FF7EB6'}}>|</span>}
            </p>
            
            {/* Add Select Parents button for breeding dialogue */}
            {currentDialogue === FIRST_ALTAR_DIALOGUE && displayedText?.includes('Select two slimes as parents') && (
              <button
                onClick={() => {
                  // Create and dispatch a custom event to open breeding gallery
                  console.log('🖼️ Select Parents button clicked - opening breeding gallery');
                  const event = new CustomEvent('openBreedingGallery', { detail: { slot: 1 } });
                  window.dispatchEvent(event);
                }}
                className="mt-3 px-4 py-2 rounded-full bg-[#FF7EB6] hover:bg-[#ff6eb4]/80 text-white font-medium transition-all text-sm"
              >
                Select Parents
              </button>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentDialogueIndex === 0}
                className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all text-xs"
              >
                <ChevronRight className="w-3 h-3" />
                {currentDialogueIndex < currentDialogue.length - 1 ? 'Next' : 'Got it'}
              </button>

              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all text-xs"
                aria-label="Skip dialogue"
              >
                <SkipForward className="w-3 h-3" />
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
