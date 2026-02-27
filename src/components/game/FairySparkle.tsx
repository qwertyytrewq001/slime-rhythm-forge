export const FairySparkle = ({ index, color }: { index: number; color?: string }) => {
  const style = {
    '--tx': `${(Math.sin(index) * 40)}px`,
    '--ty': `${-20 - (Math.cos(index) * 30)}px`,
    left: `${40 + (Math.sin(index * 1.5) * 30)}%`,
    top: `${50 + (Math.cos(index * 1.2) * 20)}%`,
    animationDelay: `${index * 0.3}s`,
    backgroundColor: color || (index % 2 === 0 ? '#FFD700' : '#FFFACD'),
  } as React.CSSProperties;
  
  return (
    <div 
      className="absolute w-1 h-1 rounded-full blur-[1px] animate-fairy-sparkle pointer-events-none z-0"
      style={style}
    />
  );
};
