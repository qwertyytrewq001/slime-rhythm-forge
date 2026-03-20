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

  const getImagePath = () => {
    const expressionMap = {
      explainingsomething: 'explainingsomething_glim.png',
      exicted: 'glim_exicted.png',
      kind: 'glim_kind.png',
      smug: 'smug_glim.png',
      tearfull_emotional: 'tearfull_emotional.png',
      worried: 'worried_glim.png',
      // Use existing images for all expressions
      shocked: 'worried_glim.png',
      composed: 'glim_kind.png',
      urgent: 'worried_glim.png',
      dramatic: 'smug_glim.png',
      excited: 'glim_exicted.png',
      nudging: 'explainingsomething_glim.png',
      frozen: 'worried_glim.png',
      emotional: 'tearfull_emotional.png',
      warm: 'glim_kind.png',
      determined: 'smug_glim.png',
      watching: 'explainingsomething_glim.png',
      reverent: 'glim_kind.png',
      serious: 'worried_glim.png',
      gesturing: 'explainingsomething_glim.png',
      delighted: 'glim_exicted.png',
      surveying: 'smug_glim.png',
      important: 'worried_glim.png',
      smirk: 'smug_glim.png',
      relieved: 'glim_kind.png',
      grim: 'worried_glim.png',
      dreadful: 'worried_glim.png'
    };
    return `${import.meta.env.BASE_URL}${expressionMap[expression] || 'glim_kind.png'}`;
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
        src={getImagePath()}
        alt={`Glim - ${expression}`}
        className="w-full h-full object-contain"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
          background: 'transparent',
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
}
