import React, { type FC } from 'react';

interface ForestBackgroundProps {
  elementTint?: string;
  parallaxOffset?: number;
}

const BackgroundSparkle = ({ x, y, color, delay, size = "1.5px", duration = "4s" }: { x: string, y: string, color: string, delay: string, size?: string, duration?: string }) => (
  <div 
    className="absolute rounded-full blur-[0.5px] animate-fairy-sparkle pointer-events-none"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      backgroundColor: color,
      animationDelay: delay,
      animationDuration: duration,
      boxShadow: `0 0 8px ${color}`,
      '--tx': '15px',
      '--ty': '-25px',
    } as any}
  />
);

export const ForestBackground: FC<ForestBackgroundProps> = ({ parallaxOffset = 0 }) => {
  const parallaxY = -(parallaxOffset * 0.2);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/Gemini_Generated_Image_m175nhm175nhm175.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${parallaxY}px)`,
        }}
      >
        {/* --- ALGAE MIST (Fine Green Dust clusters) --- */}
        <BackgroundSparkle x="15%" y="75%" color="#4ADE80" delay="0s" size="2px" />
        <BackgroundSparkle x="18%" y="78%" color="#22C55E" delay="1s" size="1px" />
        <BackgroundSparkle x="12%" y="72%" color="#86EFAC" delay="2s" size="1.5px" />
        <BackgroundSparkle x="65%" y="82%" color="#4ADE80" delay="0.5s" size="2px" />
        <BackgroundSparkle x="68%" y="85%" color="#22C55E" delay="1.5s" size="1.5px" />

        {/* --- CRYSTAL SHIMMER (Turquoise Dust clusters) --- */}
        <BackgroundSparkle x="75%" y="45%" color="#40E0D0" delay="0.2s" size="2.5px" duration="3s" />
        <BackgroundSparkle x="78%" y="48%" color="#00CED1" delay="1.2s" size="2px" duration="2.5s" />
        <BackgroundSparkle x="72%" y="42%" color="#60A5FA" delay="2.2s" size="1.5px" duration="4s" />
        <BackgroundSparkle x="30%" y="35%" color="#40E0D0" delay="0.8s" size="2px" />
        <BackgroundSparkle x="33%" y="38%" color="#00CED1" delay="1.8s" size="1.5px" />

        {/* --- LEAF & FLOWER GLITTER --- */}
        <BackgroundSparkle x="25%" y="65%" color="#BBF7D0" delay="0.3s" size="2px" />
        <BackgroundSparkle x="45%" y="25%" color="#FDE68A" delay="1.1s" size="1px" />
        <BackgroundSparkle x="85%" y="30%" color="#FF7EB6" delay="2.5s" size="1.5px" />
        <BackgroundSparkle x="55%" y="60%" color="#BBF7D0" delay="0.7s" size="2px" />

        {/* --- AMBIENT FLOATING MANA --- */}
        <BackgroundSparkle x="50%" y="20%" color="#FFD700" delay="0.8s" size="1px" />
        <BackgroundSparkle x="10%" y="85%" color="#40E0D0" delay="3s" size="1.5px" />
        <BackgroundSparkle x="90%" y="10%" color="#FF7EB6" delay="0.5s" size="1px" />
        
        {/* Subtle radial depth gradient (not circles, just edge lighting) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7EB6]/5 via-transparent to-[#40E0D0]/5 pointer-events-none" />
        
        {/* Grounding Mist */}
        <div className="absolute bottom-0 left-0 w-full h-[25%] bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    </div>
  );
};
