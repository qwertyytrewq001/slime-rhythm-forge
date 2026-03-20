import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GlimCharacter } from './GlimCharacter';

interface LevelDialogueProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  onVossEncounter?: () => void;
}

const LEVEL_DIALOGUES = {
  1: {
    expression: 'exicted' as const,
    dialogue: [
      "Victory! First battle as a Forger in four centuries and you DELIVERED. The woods are literally trembling. Well — that might be the Electric slime. Hard to tell."
    ]
  },
  5: {
    expression: 'worried' as const,
    dialogue: [
      "...Wait.",
      "Those tracks. Human boots. Fresh ones.",
      "Someone else has been through Glimmerswell recently. And they weren't here to help."
    ]
  },
  10: {
    expression: 'worried' as const,
    dialogue: [
      "I found what's left of the old Crystal Ridge Goo pool. Drained. Completely. Not naturally — this was extracted. Deliberately and methodically.",
      "This is not corruption. This is someone's plan.",
      "Keep moving. I need to think."
    ]
  },
  14: {
    expression: 'worried' as const,
    dialogue: [
      "I know who it is.",
      "I was hoping I was wrong. I'm not.",
      "His name is Voss. And I need you to trust me when I say — do not underestimate him."
    ]
  },
  15: {
    expression: 'worried' as const,
    dialogue: [
      "Hm.",
      "A new Forger. I didn't think the Altar could still produce one.",
      "I've been collecting.",
      "A golden slime. I haven't seen one of those in… quite some time.",
      "I'm not doing anything. Just observing.",
      "You've done well so far. The breeding, the Sanctuaries — competent work. You should go home and enjoy it.",
      "The further paths are no place for a Forger."
    ]
  },
  16: {
    expression: 'worried' as const,
    dialogue: [
      "...We need to move faster."
    ]
  }
};

export function LevelDialogue({ isOpen, onClose, level, onVossEncounter }: LevelDialogueProps) {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const dialogueData = LEVEL_DIALOGUES[level as keyof typeof LEVEL_DIALOGUES];
  
  if (!dialogueData) {
    onClose();
    return null;
  }

  const fullText = dialogueData.dialogue[currentDialogueIndex] || '';

  // Typewriter effect with error handling
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
    }, 25);

    return () => clearInterval(typeInterval);
  }, [fullText, isOpen]);

  const handleNext = () => {
    if (isTyping) {
      // Skip typing effect
      setIsTyping(false);
      setDisplayedText(fullText);
      return;
    }

    if (currentDialogueIndex < dialogueData.dialogue.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      // Dialogue complete
      if (level === 15 && onVossEncounter) {
        onVossEncounter();
      }
      onClose();
      setCurrentDialogueIndex(0); // Reset for next time
    }
  };

  if (!isOpen) return null;

  // For level 15, show Voss instead of Glim
  const isVoss = level === 15;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Dragon Mania Legends Style Dialogue Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[220px] pointer-events-auto">
        
        {/* Character Portrait - Life size, positioned for engagement */}
        <div 
          className="absolute pointer-events-none z-10"
          style={{
            bottom: '160px', // Positioned above dialogue
            left: '20px',
            height: '350px', // Life size - much larger
            width: '300px', // Life size proportions
            background: 'none !important',
            backgroundColor: 'transparent !important',
            border: 'none',
            boxShadow: 'none'
          }}
        >
          {isVoss ? (
            <div className="text-8xl flex items-center justify-center h-full">🌑</div>
          ) : (
            <GlimCharacter 
              expression={dialogueData.expression}
              size={350} // Life size
            />
          )}
        </div>

        {/* Speech Bubble - Much wider for better engagement */}
        <div 
          className="absolute bottom-4 left-4 right-8 rounded-2xl shadow-lg relative"
          style={{
            width: 'calc(100vw - 48px)', // Full width minus more margin
            maxWidth: '1200px', // Much wider maximum
            height: '180px',
            background: 'rgba(255, 255, 255, 0.9)', // White transparent
            border: '2px solid #ff6eb4', // Keep pink borders
            margin: '0 auto' // Center the wider box
          }}
        >
          
          {/* Bubble Content */}
          <div className="p-4 pl-6 h-full flex flex-col">
            {/* Character Name */}
            <div className="mb-3">
              <h3 className="text-[#FF7EB6] font-bold text-lg">
                {isVoss ? 'Voss' : 'Glim'}
              </h3>
            </div>

            {/* Dialogue Text - Much larger display area */}
            <div className="flex-1 overflow-y-auto pr-2" style={{maxWidth: '100%', minHeight: '100px'}}>
              <p className="text-gray-800 text-lg leading-relaxed font-medium" style={{wordWrap: 'break-word', overflowWrap: 'break-word', textShadow: '1px 1px 2px rgba(255,255,255,0.8)', color: '#1a1a1a'}}>
                {displayedText}
                {isTyping && <span className="animate-pulse" style={{color: '#FF7EB6'}}>|</span>}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-end mt-3">
              <button
                onClick={handleNext}
                className="px-3 py-1.5 rounded-full bg-[#FF7EB6] hover:bg-[#FF69B4] text-black font-bold text-sm transition-all hover:scale-105"
              >
                {isTyping ? 'Skip' : 
                 currentDialogueIndex < dialogueData.dialogue.length - 1 ? 'Continue' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
