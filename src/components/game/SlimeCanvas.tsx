import { useRef, useEffect } from 'react';
import { Slime } from '@/types/slime';
import { drawSlime } from '@/utils/slimeRenderer';

interface SlimeCanvasProps {
  slime: Slime;
  size: number;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  isHurt?: boolean;
}

export function SlimeCanvas({ slime, size, animated = false, className = '', onClick, draggable, onDragStart, isHurt = false }: SlimeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSlime(ctx, slime, size, animated ? frameRef.current : 0, animated);
      
      if (isHurt) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
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
  }, [slime, size, animated, isHurt]);

  // Pause when tab hidden
  useEffect(() => {
    if (!animated) return;
    const onVisibility = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      } else if (!document.hidden) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const animate = () => {
          drawSlime(ctx, slime, size, frameRef.current, true);
          frameRef.current++;
          rafRef.current = requestAnimationFrame(animate);
        };
        animate();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [animated, slime, size]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={64}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
      className={`${className} cursor-pointer`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    />
  );
}
