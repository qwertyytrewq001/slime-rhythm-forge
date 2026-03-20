import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { GlimCharacter } from './GlimCharacter';
import { triggerDialogue, clearDialogueTrigger, useDialogueTrigger, getDialogueTrigger } from '@/utils/dialogueTriggers';

// Define the actual trigger types that match the triggerDialogue function
type TriggerType = 
  | 'firstLaunch'
  | 'firstBazaarOpen'
  | 'firstEggBought'
  | 'firstHatch'
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
  firstHabitatBuilt: false,
  firstFeed: false,
  firstAltarVisit: false,
  firstBreedComplete: false,
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
    expression: 'shocked',
    text: "Oh. OH. Someone's actually here."
  },
  {
    id: 'firstLaunch',
    expression: 'shocked', 
    text: "After four HUNDRED years. Do you know how long that is?"
  },
  {
    id: 'firstLaunch',
    expression: 'shocked',
    text: "...It is very long. I counted the stars. Twice."
  },
  {
    id: 'firstLaunch',
    expression: 'composed',
    text: "My name is Glim. Guardian of Slime Forge."
  },
  {
    id: 'firstLaunch',
    expression: 'composed',
    text: "This world — Sanctuaries, Goo, slimes — it's dying."
  },
  {
    id: 'firstLaunch',
    expression: 'composed',
    text: "Someone has been draining it. Deliberately."
  },
  {
    id: 'firstLaunch',
    expression: 'urgent',
    text: "You're a Forger. That means you can fix this."
  },
  {
    id: 'firstLaunch',
    expression: 'urgent',
    text: "Breed slimes. Build Sanctuaries. Restore the Goo."
  },
  {
    id: 'firstLaunch',
    expression: 'urgent',
    text: "Fight back through Battle Map and take this world back."
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
    expression: 'frozen',
    text: "..."
  },
  {
    id: 'firstHatch',
    expression: 'frozen',
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
    expression: 'determined',
    text: "Each Sanctuary you build restores Goo to the world and pulls feral slimes back from the edge."
  },
  {
    id: 'firstHabitatBuilt',
    expression: 'determined',
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
    expression: 'reverent',
    text: "This is the heart of the Forge. I was born here, actually."
  },
  {
    id: 'firstAltarVisit',
    expression: 'reverent',
    text: "The Forger who bred me apparently screamed. I choose to believe it was excitement."
  },
  {
    id: 'firstAltarVisit',
    expression: 'serious',
    text: "Breeding combines two slimes into something new — their elements, their traits, their essence."
  },
  {
    id: 'firstAltarVisit',
    expression: 'serious',
    text: "Voss extracts Goo by force. We create new life. That's the difference between us."
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
    expression: 'surveying',
    text: "The Whispering Wilds. Once a safe network of paths between Sanctuaries."
  },
  {
    id: 'firstBattleMapOpen',
    expression: 'surveying',
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

  // Listen for dialogue triggers
  useDialogueTrigger(useCallback((triggerId: TriggerType, data) => {
    console.log('🎮 Dialogue Trigger Received:', triggerId);
    
    // Re-open if closed
    if (!isOpen && onOpen) {
      onOpen();
    }

    // Handle first-time events
    if (triggerId === 'firstLaunch' && !hasSeenEvent('firstLaunch')) {
      markEventSeen('firstLaunch');
      setCurrentDialogue(FIRST_LAUNCH_DIALOGUE);
      setCurrentExpression('shocked');
      setGlimPosition('center');
    }

    if (triggerId === 'firstBazaarOpen' && !hasSeenEvent('firstBazaarOpen')) {
      markEventSeen('firstBazaarOpen');
      setCurrentDialogue(FIRST_BAZAAR_DIALOGUE);
      setCurrentExpression('excited');
      setGlimPosition('bottom-left');
    }

    if (triggerId === 'firstEggBought' && !hasSeenEvent('firstEggBought')) {
      markEventSeen('firstEggBought');
      setCurrentDialogue(FIRST_EGG_DIALOGUE);
      setCurrentExpression('proud');
      setGlimPosition('bottom-left');
    }

    if (triggerId === 'firstHatch' && !hasSeenEvent('firstHatch')) {
      markEventSeen('firstHatch');
      setCurrentDialogue(FIRST_HATCH_DIALOGUE);
      setCurrentExpression('frozen');
      setGlimPosition('bottom-left');
    }

    if (triggerId === 'firstHabitatBuilt' && !hasSeenEvent('firstHabitatBuilt')) {
      markEventSeen('firstHabitatBuilt');
      setCurrentDialogue(FIRST_HABITAT_DIALOGUE);
      setCurrentExpression('warm');
      setGlimPosition('bottom-left');
    }

    if (triggerId === 'firstFeed' && !hasSeenEvent('firstFeed')) {
      markEventSeen('firstFeed');
      setCurrentDialogue(FIRST_FEED_DIALOGUE);
      setCurrentExpression('watching');
      setGlimPosition('bottom-left');
    }

    if (triggerId === 'firstAltarVisit' && !hasSeenEvent('firstAltarVisit')) {
      markEventSeen('firstAltarVisit');
      setCurrentDialogue(FIRST_ALTAR_DIALOGUE);
      setCurrentExpression('reverent');
      setGlimPosition('bottom-left');
      
      // Auto-open gallery when dialogue says "Select two slimes as parents"
      setTimeout(() => {
        const galleryButton = document.querySelector('[data-testid="gallery-button"]');
        if (galleryButton) {
          (galleryButton as HTMLElement).click();
        }
      }, 3000);
    }

    if (triggerId === 'firstBreedComplete' && !hasSeenEvent('firstBreedComplete')) {
      markEventSeen('firstBreedComplete');
      setCurrentDialogue(FIRST_BREED_DIALOGUE);
      setCurrentExpression('delighted');
      setGlimPosition('bottom-left');
    }

    if (triggerId === 'firstBattleMapOpen' && !hasSeenEvent('firstBattleMapOpen')) {
      markEventSeen('firstBattleMapOpen');
      setCurrentDialogue(FIRST_BATTLE_DIALOGUE);
      setCurrentExpression('surveying');
      setGlimPosition('bottom-left');
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
        className="fixed pointer-events-none transition-all duration-500"
        style={{
          cssText: 'position: fixed !important; bottom: 20px !important; left: 20px !important; z-index: 10000 !important; height: 250px; width: 200px;',
          ...(glimPosition === 'center' && {
            cssText: 'top: 50%; left: 50%; transform: translate(-50%, -50%); height: 400px; width: 350px;'
          })
        }}
      >
        <GlimCharacter 
          expression={currentCard?.expression ?? 'shocked'}
          size={glimPosition === 'center' ? 400 : 250}
        />
      </div>

      {/* Dialogue Box - Correctly styled and positioned */}
      <div 
        className="absolute shadow-lg pointer-events-auto"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          maxWidth: '70vw',
          background: 'rgba(20, 10, 40, 0.92)',
          borderRadius: '16px',
          border: '2px solid #ff6eb4',
          padding: '20px 24px',
          zIndex: 9999
        }}
      >
        {/* Using a separate inner div for content padding */}
        <div className="h-full flex flex-col">
          {/* Character Name */}
          <div className="mb-2">
            <h3 className="text-[#FF7EB6] font-bold text-xl">Glim</h3>
          </div>

          {/* Dialogue Text */}
          <div className="flex-1 overflow-y-auto pr-2" style={{minHeight: '60px'}}>
            <p className="text-white text-lg leading-relaxed font-medium">
              {/* Ensure displayedText is always a string */}
              {displayedText ?? ''}
              {isTyping && <span className="animate-pulse" style={{color: '#FF7EB6'}}>|</span>}
            </p>
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
                className="px-4 py-2 rounded-full bg-[#FF7EB6] hover:bg-[#FF69B4] text-black font-bold text-base transition-all hover:scale-105"
              >
                {isTyping ? 'Skip' : 
                 currentDialogueIndex < currentDialogue.length - 1 ? 'Next' : 'Got it'}
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
