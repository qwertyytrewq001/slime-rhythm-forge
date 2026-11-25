import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PaintedDialogue } from './PaintedDialogue';
import { VossPortrait } from './VossPortrait';

type Line = string | { who: 'Glim' | 'Voss'; mood?: string; text: string };
const lineText = (l: Line | undefined) => (l === undefined ? '' : typeof l === 'string' ? l : l.text);

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
      "Victory! First battle as a Forger in four centuries and you DELIVERED. The woods are literally trembling. Or your slime sneezed. Hard to tell."
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
      { who: 'Voss', mood: 'calm', text: "Hm." },
      { who: 'Voss', mood: 'calm', text: "A new Forger. I didn't think the Altar could still produce one." },
      { who: 'Glim', text: "Voss. Whatever you're doing, stop." },
      { who: 'Voss', mood: 'amused', text: "Glim. Still hiding behind a child. How very like you." },
      { who: 'Voss', mood: 'calm', text: "I'm not doing anything. Just collecting. A golden slime, there. I haven't seen one of those in quite some time." },
      { who: 'Glim', text: "They aren't yours to collect." },
      { who: 'Voss', mood: 'cold', text: "Everything in this valley is a resource. Some of us simply admit it." },
      { who: 'Voss', mood: 'calm', text: "You've done well, little Forger. The breeding, the Habitats. Competent work. Go home and enjoy it." },
      { who: 'Voss', mood: 'cold', text: "The further paths are no place for you." }
    ] as Line[]
  },
  16: {
    expression: 'worried' as const,
    dialogue: [
      "...We need to move faster."
    ]
  }
};

// Levels without a script render nothing. The hooks live in the inner component so their order never changes.
export function LevelDialogue(props: LevelDialogueProps) {
  const has = !!LEVEL_DIALOGUES[props.level as keyof typeof LEVEL_DIALOGUES];
  const { isOpen, onClose } = props;
  useEffect(() => { if (!has && isOpen) onClose(); }, [has, isOpen, onClose]);
  return has ? <LevelDialogueInner {...props} /> : null;
}

function LevelDialogueInner({ isOpen, onClose, level, onVossEncounter }: LevelDialogueProps) {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const dialogueData = LEVEL_DIALOGUES[level as keyof typeof LEVEL_DIALOGUES];
  

  const line = (dialogueData.dialogue as Line[])[currentDialogueIndex];
  const fullText = lineText(line);

  const typeRef = useRef<number>();

  // Typewriter effect
  useEffect(() => {
    if (!isOpen || !fullText) return;

    setIsTyping(true);
    setDisplayedText('');
    
    let charIndex = 0;
    const typeInterval = window.setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 25);

    typeRef.current = typeInterval;

    return () => clearInterval(typeInterval);
  }, [fullText, currentDialogueIndex, isOpen]);

  const handleNext = () => {
    if (isTyping) {
      // Skip typing effect
      clearInterval(typeRef.current);
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

  // each line says who is talking: Voss gets his own face and name
  const isVoss = typeof line === 'object' && line.who === 'Voss';
  const mood = typeof line === 'object' ? line.mood : undefined;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <PaintedDialogue
        speaker={isVoss ? 'Voss' : 'Glim'}
        expression={dialogueData.expression}
        portrait={isVoss ? <VossPortrait mood={mood} /> : undefined}
        text={displayedText}
        isTyping={isTyping}
        onNext={handleNext}
        index={currentDialogueIndex}
        total={dialogueData.dialogue.length}
      />
    </div>
  );
}
