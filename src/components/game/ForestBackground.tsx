import type { FC } from 'react';

interface ForestBackgroundProps {
  /**
   * Kept for API compatibility with previous implementation.
   * The new background image is not tinted per element.
   */
  elementTint?: string;
  /**
   * Scroll offset from the main content area, used for subtle parallax.
   */
  parallaxOffset?: number;
}

const BackgroundSparkle = ({ x, y, color, delay }: { x: string, y: string, color: string, delay: string }) => (
  <div 
    className="absolute w-1.5 h-1.5 rounded-full blur-[1px] animate-fairy-sparkle"
    style={{
      left: x,
      top: y,
      backgroundColor: color,
      animationDelay: delay,
      '--tx': '20px',
      '--ty': '-30px',
    } as any}
  />
);

export const ForestBackground: FC<ForestBackgroundProps> = ({ parallaxOffset = 0 }) => {
  const parallaxY = -(parallaxOffset * 0.2);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          // Uses your uploaded public asset.
          backgroundImage: "url('/Gemini_Generated_Image_m175nhm175nhm175.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${parallaxY}px)`,
        }}
      >
        {/* Ambient Background Sparkles */}
        <BackgroundSparkle x="15%" y="25%" color="#FF7EB6" delay="0s" />
        <BackgroundSparkle x="85%" y="35%" color="#40E0D0" delay="1.5s" />
        <BackgroundSparkle x="45%" y="15%" color="#FFD700" delay="0.8s" />
        <BackgroundSparkle x="25%" y="65%" color="#FF7EB6" delay="2.2s" />
        <BackgroundSparkle x="75%" y="75%" color="#40E0D0" delay="1.1s" />
        <BackgroundSparkle x="10%" y="85%" color="#FFD700" delay="3s" />
        <BackgroundSparkle x="90%" y="10%" color="#FF7EB6" delay="0.5s" />
        
        {/* Glow filters for background interest */}
        <div className="absolute top-[20%] left-[15%] w-32 h-32 bg-[#FF7EB6]/10 blur-[60px] rounded-full animate-soft-pulse" />
        <div className="absolute top-[40%] right-[10%] w-40 h-40 bg-[#40E0D0]/10 blur-[80px] rounded-full animate-soft-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

