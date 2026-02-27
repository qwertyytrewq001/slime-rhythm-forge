import React, { type FC } from 'react';

interface ForestBackgroundProps {
  elementTint?: string;
  parallaxOffset?: number;
  mirrored?: boolean;
  fixed?: boolean;
  onPortalClick?: () => void;
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

export const ForestBackground: FC<ForestBackgroundProps> = ({ parallaxOffset = 0, mirrored = false, fixed = true, onPortalClick }) => {
  const parallaxY = -(parallaxOffset * 0.2);
  const [isHoveringPortal, setIsHoveringPortal] = React.useState(false);

  return (
    <div
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 z-0 overflow-hidden bg-black pointer-events-none`}
    >
      <div
        className="absolute inset-0"
        style={{
          /* FIXED: Path updated to './' for GitHub Pages compatibility */
          backgroundImage: "url('./Gemini_Generated_Image_m175nhm175nhm175.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `${mirrored ? 'scaleX(-1)' : ''} translateY(${fixed ? parallaxY : 0}px)`,
        }}
      >
        {/* Interactive Floating Island Portal (Precision Hover Area) */}
        {!mirrored && onPortalClick && (
          <div 
            className="absolute left-[8%] top-[50%] -translate-y-1/2 w-32 h-32 pointer-events-auto cursor-pointer group z-[100]"
            onMouseEnter={() => setIsHoveringPortal(true)}
            onMouseLeave={() => setIsHoveringPortal(false)}
            onClick={(e) => {
              e.stopPropagation();
              onPortalClick();
            }}
          >
            {/* ETHEREAL CTA: Refined Neon green cloud glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {/* 1. Core Radiating Power (Neon Green - Softened) */}
               <div className="absolute w-40 h-40 rounded-full bg-[#39FF14]/20 blur-[50px] animate-pulse" />
               
               {/* 2. Layered "Cloud" Mists (Neon Green - Softened) */}
               <div className="absolute inset-0 flex items-center justify-center animate-cloud-drift-ultra-slow">
                  <div 
                    className="w-56 h-32 bg-[#39FF14]/25 blur-[40px] border border-[#39FF14]/10 shadow-[inset_0_0_30px_#39FF14,0_0_30px_#39FF14]"
                    style={{
                      borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                      animation: 'morph 10s ease-in-out infinite'
                    }}
                  />
               </div>
               
               <div className="absolute inset-0 flex items-center justify-center animate-drift-ultra-slow" style={{ animationDelay: '2s' }}>
                  <div 
                    className="w-48 h-24 bg-[#39FF14]/15 blur-[35px]"
                    style={{
                      borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%',
                      animation: 'morph 12s ease-in-out infinite reverse'
                    }}
                  />
               </div>

               {/* 3. Fairy Dust (Neon Green) */}
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="absolute animate-fairy-sparkle w-1 h-1 rounded-full bg-[#39FF14]"
                      style={{ 
                        left: `${30 + Math.random() * 40}%`, 
                        top: `${30 + Math.random() * 40}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: 0.4,
                        boxShadow: '0 0 8px #39FF14',
                        animationDuration: '8s'
                      }} />
               ))}
            </div>

            {/* "Habitats" Text: Only appears and GLOWS on hover */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${isHoveringPortal ? 'opacity-100 scale-110' : 'opacity-0 scale-95'}`}>
               <span 
                 className="text-[28px] text-[#4ADE80] font-black uppercase tracking-[0.2em] animate-float-slow"
                 style={{ 
                   fontFamily: "'VT323', monospace",
                   /* Noticeable neon glow only visible when the div is hovered */
                   textShadow: isHoveringPortal ? '0 0 10px #4ADE80, 0 0 20px #22C55E, 1px 1px 2px #000' : '1px 1px 2px #000',
                   animationDuration: '7s'
                 }}
               >
                 Habitats
               </span>
            </div>
          </div>
        )}

        {/* --- CUSTOM ANIMATIONS FOR THE PORTAL --- */}
        <style>{`
          @keyframes drift-ultra-slow {
            0%, 100% { transform: translate(-15px, -10px); }
            50% { transform: translate(15px, 10px); }
          }
          @keyframes cloud-drift-ultra-slow {
            0%, 100% { transform: translate(-30px, 0px) scale(1); }
            50% { transform: translate(30px, -20px) scale(1.1); }
          }
          @keyframes morph {
            0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
            33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
            66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
          }
          .animate-drift-ultra-slow {
            animation: drift-ultra-slow 15s ease-in-out infinite;
          }
          .animate-cloud-drift-ultra-slow {
            animation: cloud-drift-ultra-slow 18s ease-in-out infinite;
          }
        `}</style>

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
        
        {/* Subtle radial depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7EB6]/5 via-transparent to-[#40E0D0]/5 pointer-events-none" />
        
        {/* Grounding Mist */}
        <div className="absolute bottom-0 left-0 w-full h-[25%] bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    </div>
  );
};

export default ForestBackground;
