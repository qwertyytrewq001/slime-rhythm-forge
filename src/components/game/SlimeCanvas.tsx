import { useRef, useEffect, useState } from 'react';
import { Slime } from '@/types/slime';
import { getSpriteIdForSlime } from '@/utils/spriteLoader';
import { getStage } from '@/utils/slimeRenderer';

interface SlimeCanvasProps {
  slime: Slime;
  size: number;
  animated?: boolean;
  renderEnhancement?: 'classic' | 'enhanced3d';
  useSprites?: boolean; // New option to use sprites
  className?: string;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  isHurt?: boolean;
  sizeMultiplier?: number; // New prop to make slimes bigger
  animationStyle?: 'gentle' | 'playful' | 'calm' | 'excited'; // Animation presets
  isSilhouette?: boolean; // New prop for shadow silhouettes
}

export function SlimeCanvas({
  slime,
  size,
  animated = false,
  renderEnhancement = 'enhanced3d',
  useSprites = true, // Enable sprites by default
  className = '',
  onClick,
  draggable,
  onDragStart,
  isHurt = false,
  sizeMultiplier = 2.5, // Default 2.5x bigger
  animationStyle = 'gentle', // Default gentle animation
  isSilhouette = false, // Default to not silhouette
}: SlimeCanvasProps) {
  const [spriteError, setSpriteError] = useState(false);
  const [floatOffset, setFloatOffset] = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const [idleRotation, setIdleRotation] = useState(0);

  // Calculate stage-based size multiplier
  const stage = getStage(slime.level || 1);
  const stageScale = stage === 'baby' ? 0.6 : stage === 'teen' ? 0.85 : 1.0;
  const finalSizeMultiplier = sizeMultiplier * stageScale;

  // Animation for sprites (standardized movement with presets)
  useEffect(() => {
    if (!animated || !useSprites || spriteError) return;

    const animationInterval = setInterval(() => {
      const time = Date.now() / 1000;
      
      // Animation presets for different moods
      let sway, squeeze, bounce;
      
      switch (animationStyle) {
        case 'gentle':
          // Gentle, calm movement
          sway = Math.sin(time * 1.5) * 2; // Slow 2px sway
          squeeze = 1 + Math.sin(time * 3) * 0.03; // 3% gentle squeeze
          bounce = Math.abs(Math.sin(time * 1.2)) * 3; // 3px gentle bounce
          break;
          
        case 'playful':
          // More energetic movement
          sway = Math.sin(time * 2.5) * 4; // Faster 4px sway
          squeeze = 1 + Math.sin(time * 4) * 0.05; // 5% more squeeze
          bounce = Math.abs(Math.sin(time * 2)) * 5; // 5px more bounce
          break;
          
        case 'calm':
          // Very subtle movement
          sway = Math.sin(time * 1.0) * 1; // Very slow 1px sway
          squeeze = 1 + Math.sin(time * 2) * 0.02; // 2% minimal squeeze
          bounce = Math.abs(Math.sin(time * 0.8)) * 2; // 2px minimal bounce
          break;
          
        case 'excited':
          // Very energetic movement
          sway = Math.sin(time * 3.0) * 6; // Fast 6px sway
          squeeze = 1 + Math.sin(time * 5) * 0.08; // 8% strong squeeze
          bounce = Math.abs(Math.sin(time * 2.5)) * 7; // 7px strong bounce
          break;
          
        default:
          // Default to gentle
          sway = Math.sin(time * 1.5) * 2;
          squeeze = 1 + Math.sin(time * 3) * 0.03;
          bounce = Math.abs(Math.sin(time * 1.2)) * 3;
      }
      
      // Apply transformations
      setFloatOffset(-bounce); // Negative because up is negative Y
      setBreathScale(squeeze);
      setIdleRotation(sway);
    }, 50); // 20 FPS for smooth animation

    return () => clearInterval(animationInterval);
  }, [animated, useSprites, spriteError, animationStyle]);

  // Get sprite path
  const getSpritePath = () => {
    if (!useSprites || spriteError) return null;
    
    try {
      const spriteId = getSpriteIdForSlime(slime);
      const base = import.meta.env.BASE_URL;
      return `${base}${spriteId}.png`;
    } catch (error) {
      console.warn('Failed to get sprite path:', error);
      setSpriteError(true);
      return null;
    }
  };

  const spritePath = getSpritePath();

  // If we have a sprite path, render it like Glim
  if (spritePath && useSprites && !spriteError) {
    const actualSize = size * finalSizeMultiplier;
    
    return (
      <div 
        className={`relative ${className} cursor-pointer`}
        style={{
          width: `${actualSize}px`,
          height: `${actualSize}px`,
          transform: `translateY(${floatOffset}px) scale(${breathScale}) rotate(${idleRotation}deg)`,
          transition: 'transform 0.2s ease-out', // Faster transition for more responsive movement
          background: 'none !important',
          backgroundColor: 'transparent !important',
          border: 'none',
          boxShadow: 'none'
        }}
        onClick={onClick}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        <img
          src={spritePath}
          alt={`${slime.name} - ${slime.element}`}
          className="w-full h-full object-contain"
          style={{
            filter: isSilhouette 
              ? 'brightness(0) contrast(1.2) saturate(0) drop-shadow(0 0 10px rgba(0, 0, 0, 0.5))'
              : isHurt 
                ? 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))' 
                : 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
            background: 'transparent',
            backgroundColor: 'transparent',
            opacity: isSilhouette ? 0.8 : 1
          }}
          onError={() => {
            console.warn(`Failed to load sprite: ${spritePath}`);
            setSpriteError(true);
          }}
        />
        
        {/* Rarity stars overlay */}
        {slime.rarityStars && slime.rarityStars > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1">
            {[...Array(slime.rarityStars)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-xs" style={{ fontSize: `${10 * finalSizeMultiplier}px` }}>⭐</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback to canvas rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      try {
        const { drawSlime } = await import('@/utils/slimeRenderer');
        // Pass the actual size, not multiplied by sizeMultiplier
        drawSlime(ctx, slime, size, animated ? frameRef.current : 0, animated, isHurt, {
          enhanced3D: renderEnhancement === 'enhanced3d',
          isSilhouette: isSilhouette,
        });
      } catch (error) {
        console.warn('Procedural rendering failed:', error);
      }
      
      if (animated) {
        frameRef.current++;
        rafRef.current = requestAnimationFrame(render);
      }
    };

    if (animated) {
      render();
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    } else {
      render();
    }
  }, [slime, size, animated, isHurt, renderEnhancement]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={128}
      style={{ 
        width: size * finalSizeMultiplier, 
        height: size * finalSizeMultiplier, 
        imageRendering: 'auto'
      }}
      className={`${className} cursor-pointer`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    />
  );
}
