import React, { useState, useEffect } from 'react';

interface GlimCharacterProps {
  expression: 'explainingsomething' | 'exicted' | 'kind' | 'smug' | 'tearfull_emotional' | 'worried';
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
      worried: 'worried_glim.png'
    };
    return `${import.meta.env.BASE_URL}${expressionMap[expression]}`;
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
