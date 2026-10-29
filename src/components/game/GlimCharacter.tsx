import React, { useState, useEffect } from 'react';
import { TriggerType } from '@/types/dialogueTypes';

interface GlimCharacterProps {
  expression: string;
  size?: number;
}

export function GlimCharacter({ expression, size = 200 }: GlimCharacterProps) {
  const [floatOffset, setFloatOffset] = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const [idleRotation, setIdleRotation] = useState(0);

  // Mixed animations: floating + breathing + idle movements
  useEffect(() => {
    const floatAnimation = setInterval(() => {
      setFloatOffset(Math.sin(Date.now() * 0.001) * 3);
    }, 50);

    const breathAnimation = setInterval(() => {
      setBreathScale(1 + Math.sin(Date.now() * 0.0008) * 0.02);
    }, 50);

    const idleAnimation = setInterval(() => {
      setIdleRotation(Math.sin(Date.now() * 0.0003) * 2);
    }, 50);

    return () => {
      clearInterval(floatAnimation);
      clearInterval(breathAnimation);
      clearInterval(idleAnimation);
    };
  }, []);

  const getImagePath = (expression: string) => {
    // the redone Glim: every old expression name maps to one of the new painted faces (public/altar/glim_<mood>.png)
    const expressionMap: Record<string, string> = {
      explainingsomething: 'altar/glim_explain.png',
      nudging: 'altar/glim_explain.png',
      watching: 'altar/glim_explain.png',
      gesturing: 'altar/glim_explain.png',
      exicted: 'altar/glim_excited.png',
      excited: 'altar/glim_excited.png',
      delighted: 'altar/glim_excited.png',
      kind: 'altar/glim_kind.png',
      composed: 'altar/glim_kind.png',
      warm: 'altar/glim_kind.png',
      reverent: 'altar/glim_kind.png',
      relieved: 'altar/glim_kind.png',
      smug: 'altar/glim_smug.png',
      dramatic: 'altar/glim_smug.png',
      determined: 'altar/glim_smug.png',
      surveying: 'altar/glim_smug.png',
      smirk: 'altar/glim_smug.png',
      worried: 'altar/glim_worried.png',
      shocked: 'altar/glim_worried.png',
      urgent: 'altar/glim_worried.png',
      frozen: 'altar/glim_worried.png',
      serious: 'altar/glim_worried.png',
      important: 'altar/glim_worried.png',
      grim: 'altar/glim_worried.png',
      dreadful: 'altar/glim_worried.png',
      sad_glim: 'altar/glim_sad.png',
      tearfull_emotional: 'altar/glim_sad.png',
      emotional: 'altar/glim_sad.png',
    };
    return `${import.meta.env.BASE_URL}${expressionMap[expression] || 'altar/glim_kind.png'}`;
  };

  return (
    <div 
      className="relative pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translateY(${floatOffset}px) scale(${breathScale}) rotate(${idleRotation}deg)`,
        transition: 'transform 0.3s ease-out',
        background: 'none !important',
        backgroundColor: 'transparent !important',
        border: 'none',
        boxShadow: 'none'
      }}
    >
      <img
        src={getImagePath(expression)}
        alt={`Glim - ${expression}`}
        className="w-full h-full object-contain"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
          transform: 'scale(0.72)', transformOrigin: '50% 100%',
          background: 'transparent',
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
}
