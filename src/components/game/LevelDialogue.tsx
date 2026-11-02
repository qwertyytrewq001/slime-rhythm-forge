import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PaintedDialogue } from './PaintedDialogue';

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
      "You've done well so far. The breeding, the Habitats — competent work. You should go home and enjoy it.",
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
      <PaintedDialogue
        speaker={isVoss ? 'Voss' : 'Glim'}
        expression={dialogueData.expression}
        portrait={isVoss ? <div className="text-8xl flex items-center justify-center h-full">🌑</div> : undefined}
        text={displayedText}
        isTyping={isTyping}
        onNext={handleNext}
        index={currentDialogueIndex}
        total={dialogueData.dialogue.length}
      />
    </div>
  );
}
