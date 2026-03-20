import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { GlimCharacter } from './GlimCharacter';
import { triggerDialogue, clearDialogueTrigger, useDialogueTrigger, getDialogueTrigger } from '@/utils/dialogueTriggers';

interface LoreChapter {
  id: string;
  title: string;
  dialogue: string[];
  expression: 'explainingsomething' | 'exicted' | 'kind' | 'smug' | 'tearfull_emotional' | 'worried';
  background?: string;
}

const LORE_CHAPTERS: LoreChapter[] = [
  {
    id: 'introduction',
    title: 'The Guardian Awakens',
    dialogue: [
      "Oh. OH. Someone's here.",
      "After four HUNDRED years. Do you know how long that is? I'll tell you — it is VERY long. I had nothing to do but count the stars. There are a lot of stars.",
      "...Sorry. I'm being dramatic. It's a coping mechanism.",
      "My name is Glim. I am — or was — guardian of Slime Forge. And you, whether you meant to or not, have just walked into the most important moment in four centuries.",
      "Welcome. No pressure.",
      "This world was not always so quiet.",
      "Once, Slime Forge was the heart of everything. Forgers — people like you — would come here to breed, raise, and bond with slimes of every element. Electric, Shadow, Light, Metal… hundreds of species.",
      "The Goo kept everything balanced. Slimes thrived. Sanctuaries flourished. And the great Mystic Altar — where I have lived for longer than I'd like to admit — was always busy with new life being forged.",
      "Then Forgotten Castle went dark.",
      "No one knows exactly what happened. One night, lights. The next — silence. And slowly, like a sickness, Goo began to drain. Slimes turned feral without it.",
      "...I waited. Because that is what guardians do.",
      "And now you're here. So let's not waste it. There's a lot of work to do."
    ],
    expression: 'kind'
  },
  {
    id: 'breeding',
    title: 'The Art of Creation',
    dialogue: [
      "The Altar.",
      "This is where I was born, you know. A long time ago, a Forger bred two ancient slimes here and I was the result.",
      "Breeding two slimes here creates something new. A combination of their elements, their traits, their essence.",
      "The point is — Altar is sacred. Every slime bred here is a new life that couldn't have existed without a Forger's intention. Without your choice.",
      "Voss extracts Goo from slimes. Takes it by force. He thinks that's power.",
      "But this — creating life, bonding with it, letting it become something — this is what Goo is actually for.",
      "He'll never understand that. And that's exactly why we'll beat him.",
      "Now. Select your parents. Let's make something new."
    ],
    expression: 'exicted'
  },
  {
    id: 'habitats',
    title: 'Sanctuaries of Life',
    dialogue: [
      "Your slime needs a home. Not just a place to sit — a Sanctuary. Somewhere designed for its element, its energy, its nature.",
      "Electric slimes need charge in air. Metal slimes need pressure and weight. Shadow slimes need… well. Darkness, obviously.",
      "Each Sanctuary you build is one more piece of this world coming back to life.",
      "There used to be dozens of these. Spread across the whole world. All of them full. We'll get there again. I genuinely believe that.",
      "...Okay. Sentimental moment over. Moving on."
    ],
    expression: 'kind'
  },
  {
    id: 'battle',
    title: 'The Path to Restoration',
    dialogue: [
      "And now. The part I've been preparing you for.",
      "The Battle Map. The world beyond the Forge. Once a network of safe paths between Sanctuaries — now overrun.",
      "They're not evil. They're lost. Defeating them in battle doesn't destroy them — it shocks them back to awareness.",
      "Long enough for restored Goo from your Sanctuaries to reach them. Long enough for things to start healing.",
      "That's what this is, by the way. Not conquest. Not collection. Restoration.",
      "Also those slimes at Level 5 are genuinely quite rude and I will not pretend otherwise. Defeat them thoroughly."
    ],
    expression: 'smug'
  }
];

interface LoreTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  startChapter?: string;
}

export function LoreTutorial({ isOpen, onClose, onOpen, startChapter = 'introduction' }: LoreTutorialProps) {
  const { state, dispatch } = useGameState();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const hasTriggeredOnMount = useRef(false);

  const currentChapter = LORE_CHAPTERS[currentChapterIndex];
  const fullText = currentChapter?.dialogue[currentDialogueIndex] || '';

  // Listen for dialogue triggers
  useDialogueTrigger(useCallback((triggerId, data) => {
    // Re-open if closed
    if (!isOpen && onOpen) {
      onOpen();
    }

    if (triggerId === 'breeding-intro') {
      setCurrentChapterIndex(1); // Breeding chapter
      setCurrentDialogueIndex(0);
    }

    if (triggerId === 'breeding-complete') {
      setCurrentChapterIndex(1); 
      setCurrentDialogueIndex(3); // "The point is — Altar is sacred."
    }

    if (triggerId === 'shop-purchase') {
      setCurrentChapterIndex(1);
      setCurrentDialogueIndex(4); // Voss part
    }

    if (triggerId === 'habitat-purchase') {
      setCurrentChapterIndex(2); // Habitats chapter
      setCurrentDialogueIndex(0);
    }

    if (triggerId === 'hatch-egg') {
      setCurrentChapterIndex(2);
      setCurrentDialogueIndex(3);
    }

    if (triggerId === 'battle-start') {
      setCurrentChapterIndex(3); // Battle chapter
      setCurrentDialogueIndex(0);
    }
    
    hasTriggeredOnMount.current = true;
  }, [isOpen, onOpen]));

  // Auto-hide tutorial after completion
  useEffect(() => {
    if (currentChapter && currentDialogueIndex >= currentChapter.dialogue.length - 1) {
      const timer = setTimeout(() => {
        // We don't dispatch COMPLETE_TUTORIAL here anymore, let the user close it
        // clearDialogueTrigger();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentDialogueIndex, currentChapter]);

  // Initial chapter setup - only if NO trigger happened on mount
  useEffect(() => {
    if (isOpen && !hasTriggeredOnMount.current) {
      const pendingTrigger = getDialogueTrigger();
      if (!pendingTrigger) {
        const startIndex = LORE_CHAPTERS.findIndex(ch => ch.id === startChapter);
        if (startIndex !== -1) {
          setCurrentChapterIndex(startIndex);
          setCurrentDialogueIndex(0);
          setDisplayedText('');
        }
      }
    }
  }, [isOpen, startChapter]);

  // Reset trigger flag when tutorial closes
  useEffect(() => {
    if (!isOpen) {
      hasTriggeredOnMount.current = false;
    }
  }, [isOpen]);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen || isTyping || !fullText) return;

    setIsTyping(true);
    setDisplayedText('');
    
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [fullText, isOpen]);

  const handleNext = () => {
    if (isTyping) {
      setIsTyping(false);
      setDisplayedText(fullText);
      return;
    }

    if (currentDialogueIndex < currentChapter.dialogue.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      // END OF CHAPTER - CLOSE AND MARK COMPLETE
      dispatch({ type: 'COMPLETE_TUTORIAL_CHAPTER', chapterId: currentChapter.id });
      clearDialogueTrigger();
      onClose();
      
      // If it was the very last chapter, complete the whole tutorial
      if (currentChapterIndex === LORE_CHAPTERS.length - 1) {
        dispatch({ type: 'COMPLETE_TUTORIAL' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentDialogueIndex > 0) {
      setCurrentDialogueIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    dispatch({ type: 'COMPLETE_TUTORIAL' });
    onClose();
  };

  if (!isOpen || !currentChapter) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-[220px] pointer-events-auto">
        {/* Character Portrait */}
        <div 
          className="absolute pointer-events-none z-10"
          style={{
            bottom: '160px',
            left: '20px',
            height: '350px',
            width: '300px',
          }}
        >
          <GlimCharacter 
            expression={currentChapter.expression}
            size={350}
          />
        </div>

        {/* Speech Bubble */}
        <div 
          className="absolute bottom-4 left-4 right-8 rounded-2xl shadow-lg relative"
          style={{
            width: 'calc(100vw - 48px)',
            maxWidth: '1200px',
            height: '180px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #ff6eb4',
            margin: '0 auto'
          }}
        >
          <div className="p-4 pl-6 h-full flex flex-col">
            <div className="mb-3">
              <h3 className="text-[#FF7EB6] font-bold text-lg">Glim</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <p className="text-gray-800 text-lg leading-relaxed font-medium" style={{ color: '#1a1a1a' }}>
                {displayedText}
                {isTyping && <span className="animate-pulse" style={{color: '#FF7EB6'}}>|</span>}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentDialogueIndex === 0}
                  className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3 h-3 text-white" />
                </button>
                
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 rounded-full bg-[#FF7EB6] hover:bg-[#FF69B4] text-black font-bold text-sm transition-all hover:scale-105"
                >
                  {isTyping ? 'Skip' : 
                   currentDialogueIndex < currentChapter.dialogue.length - 1 ? 'Next' : 'Finish Section'}
                </button>
              </div>

              <button
                onClick={handleSkip}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all text-xs"
              >
                <SkipForward className="w-2.5 h-2.5" />
                Skip Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
