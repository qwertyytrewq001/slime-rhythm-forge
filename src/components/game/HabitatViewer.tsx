import { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { HABITAT_THEMES, ELEMENT_DISPLAY_NAMES } from '@/data/traitData';
import { Habitat } from '@/types/slime';
import { ChevronLeft, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SlimeGallery } from './SlimeGallery';

interface HabitatViewerProps {
  habitatId: string;
  onClose: () => void;
}

// Pixel-art layered backgrounds for each element type
const ENVIRONMENT_LAYERS: Record<string, { ground: string; midground: string; backdrop: string; details: JSX.Element }> = {
  fire: {
    ground: 'linear-gradient(to top, #1a0a00 0%, #3a1a00 50%, #8B4513 100%)',
    midground: 'linear-gradient(180deg, rgba(255,69,0,0.3) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #FF6347 0%, #3D1408 100%)',
    details: (
      <>
        {/* Volcano */}
        <div className="absolute bottom-0 left-1/4 w-32 h-40" style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #1a0a00 50%, #FF4500 100%)',
          clipPath: 'polygon(20% 100%, 0% 0%, 50% 20%, 100% 0%, 80% 100%)',
          filter: 'drop-shadow(-4px 0px 8px rgba(255,69,0,0.4))'
        }} />
        {/* Lava flows */}
        <div className="absolute bottom-8 right-12 w-16 h-2 rounded-full" style={{ background: '#FF4500', filter: 'blur(2px)' }} />
        <div className="absolute bottom-4 right-24 w-12 h-1.5 rounded-full" style={{ background: '#FF6347', opacity: 0.7, filter: 'blur(1px)' }} />
      </>
    )
  },
  water: {
    ground: 'linear-gradient(to top, #001a3a 0%, #003a6a 50%, #4169E1 100%)',
    midground: 'linear-gradient(180deg, rgba(65,169,225,0.4) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 40%, #87CEEB 0%, #082038 100%)',
    details: (
      <>
        {/* Water reflection */}
        <div className="absolute inset-x-0 bottom-1/3 h-1/3 opacity-20" style={{
          background: 'linear-gradient(180deg, transparent, #87CEEB)',
          animation: 'wave 3s ease-in-out infinite'
        }} />
        {/* Bubbles */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full border border-blue-300" style={{
            width: '8px',
            height: '8px',
            left: `${20 + i * 15}%`,
            bottom: `${10 + i % 3 * 20}%`,
            animation: `float 2s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.5
          }} />
        ))}
      </>
    )
  },
  plant: {
    ground: 'linear-gradient(to top, #0a2810 0%, #1a4a20 50%, #32CD32 80%, #228B22 100%)',
    midground: 'linear-gradient(180deg, rgba(50,205,50,0.3) 0%, transparent 60%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #90EE90 0%, #0A2810 100%)',
    details: (
      <>
        {/* Trees/Vines */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute" style={{
            left: `${15 + i * 20}%`,
            bottom: '0',
            width: '24px',
            height: '120px',
            background: 'linear-gradient(180deg, transparent, #228B22 50%, #1a4a20)',
            opacity: 0.8,
            filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.4))'
          }}>
            {/* Leaf clusters */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '-20px',
              width: '60px',
              height: '60px',
              background: 'radial-gradient(circle, #32CD32 0%, transparent 70%)',
              borderRadius: '50% 50% 30% 70%'
            }} />
          </div>
        ))}
        {/* Ground grass */}
        <div className="absolute bottom-0 left-0 right-0 h-6" style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 4px, #32CD32 4px, #32CD32 8px)',
          opacity: 0.7
        }} />
      </>
    )
  },
  ice: {
    ground: 'linear-gradient(to top, #0a1a38 0%, #1a3a68 50%, #B0E0E6 100%)',
    midground: 'linear-gradient(180deg, rgba(175,238,238,0.3) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #E0FFFF 0%, #102838 100%)',
    details: (
      <>
        {/* Icicles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute" style={{
            left: `${10 + i * 15}%`,
            top: '20px',
            width: '6px',
            height: `${40 + i % 3 * 20}px`,
            background: 'linear-gradient(180deg, #E0FFFF 0%, #B0E0E6 100%)',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            opacity: 0.8
          }} />
        ))}
        {/* Ice crystals on ground */}
        <div className="absolute bottom-0 left-0 right-0 h-8" style={{
          background: 'linear-gradient(90deg, transparent 0%, #ADD8E6 25%, transparent 50%, #ADD8E6 75%, transparent 100%)',
          opacity: 0.6
        }} />
      </>
    )
  },
  electric: {
    ground: 'linear-gradient(to top, #2a1a08 0%, #4a2a08 50%, #FFD700 80%, #3a3a20 100%)',
    midground: 'linear-gradient(180deg, rgba(255,215,0,0.2) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #FFF8DC 0%, #282008 100%)',
    details: (
      <>
        {/* Tesla coils */}
        <div className="absolute bottom-16 left-1/4 w-8 h-32 border-2 border-yellow-300" style={{
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
          opacity: 0.6
        }} />
        {/* Sparks */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: '3px',
            height: '3px',
            left: `${30 + i * 10}%`,
            bottom: `${50 + (i % 4) * 15}%`,
            background: '#FFD700',
            animation: `spark-flash 0.5s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            opacity: 0.8
          }} />
        ))}
      </>
    )
  },
  earth: {
    ground: 'linear-gradient(to top, #1a0a00 0%, #3a2a08 50%, #A0522D 80%, #8B4513 100%)',
    midground: 'linear-gradient(180deg, rgba(160,82,45,0.3) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #DEB887 0%, #2A1A08 100%)',
    details: (
      <>
        {/* Rocks scattered */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute rounded-lg" style={{
            left: `${10 + (i * 11) % 80}%`,
            bottom: `${5 + (i % 3) * 20}%`,
            width: `${12 + (i % 3) * 8}px`,
            height: `${12 + (i % 3) * 8}px`,
            background: `linear-gradient(135deg, #A0522D 0%, #8B4513 100%)`,
            opacity: 0.7 + (i % 3) * 0.1,
            transform: `rotate(${i * 45}deg)`
          }} />
        ))}
        {/* Dirt layers */}
        <div className="absolute bottom-0 left-0 right-0 h-4" style={{
          background: 'repeating-linear-gradient(90deg, #8B4513, #8B4513 3px, #A0522D 3px, #A0522D 6px)'
        }} />
      </>
    )
  },
  wind: {
    ground: 'linear-gradient(to top, #1a2838 0%, #3a4858 50%, #E0E8F0 80%, #B0C4DE 100%)',
    midground: 'linear-gradient(180deg, rgba(176,196,222,0.3) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 50%, #F0F8FF 0%, #1A2838 100%)',
    details: (
      <>
        {/* Clouds */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="absolute opacity-70" style={{
            left: `${10 + i * 30}%`,
            top: `${20 + i * 15}%`,
            width: '60px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.1)',
            animation: `drift 4s linear infinite`,
            animationDelay: `${i * 1}s`
          }} />
        ))}
        {/* Wind wisps */}
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 60px)',
          animation: `float 3s ease-in-out infinite`
        }} />
      </>
    )
  },
  default: {
    ground: 'linear-gradient(to top, #1a1a2a 0%, #2a2a3a 50%, #4a4a5a 100%)',
    midground: 'linear-gradient(180deg, rgba(100,100,150,0.2) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #6a6a8a 0%, #0a0a1a 100%)',
    details: null
  }
};

// Component for animated bouncing slimes with personality-based movement
function BouncingSlime({ slime, habitatId }: { slime: Slime; habitatId: string }) {
  const [position, setPosition] = useState({ x: Math.random() * 60 + 20, y: 60 });
  const [velocity, setVelocity] = useState({ x: (Math.random() - 0.5) * 1.5, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const startTime = useRef(Date.now() + Math.random() * 2000);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const element = slime.element;
      
      setPosition(prev => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelX = velocity.x;
        let newVelY = velocity.y;

        // Apply personality-based physics/logic
        switch(element) {
          case 'fire':
          case 'electric':
            // High energy, jittery
            newVelX += (Math.random() - 0.5) * 0.4;
            newVelY += (Math.random() - 0.5) * 0.4;
            break;
          case 'water':
          case 'wind':
            // Floating, wavy
            newVelY = Math.sin(elapsed * 2) * 0.5;
            break;
          case 'plant':
          case 'earth':
            // Slow, heavy
            newVelX *= 0.98; 
            break;
          default:
            newVelY += 0.12; // Standard Gravity
        }

        // Standard physics for those not floating
        if (!['water', 'wind', 'cosmic', 'void'].includes(element)) {
          newVelY += 0.15; // Gravity
        }

        // Bounce off walls
        if (newX < 10 || newX > 90) {
          newVelX *= -0.8;
          newX = newX < 10 ? 10 : 90;
        }

        // Ground collision
        const groundLevel = 75;
        if (newY > groundLevel) {
          newVelY *= -0.6;
          newY = groundLevel;
          // Small jump logic for heavy/standard
          if (Math.random() > 0.97) newVelY = -3 - (Math.random() * 2);
        }

        // Apply air friction
        newVelX *= 0.99;
        newVelY *= 0.99;

        setVelocity({ x: newVelX, y: newVelY });
        
        // Visual polish
        setRotation(newVelX * 10);
        setScale(1 + Math.sin(elapsed * 4) * 0.05); // Idle breathing

        return { x: newX, y: newY };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [velocity, slime.element]);

  return (
    <div
      className="absolute transition-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        zIndex: 20,
        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
      }}
    >
      <SlimeCanvas slime={slime} size={120} animated={true} />
    </div>
  );
}

export function HabitatViewer({ habitatId, onClose }: HabitatViewerProps) {
  const { state, dispatch } = useGameState();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const habitat = state.habitats.find(h => h.id === habitatId);

  if (!habitat) return null;

  const theme = HABITAT_THEMES[habitat.element];
  const layers = ENVIRONMENT_LAYERS[habitat.element] || ENVIRONMENT_LAYERS.default;
  const assignedSlimes = habitat.assignedSlimeIds
    .map(id => state.slimes.find(s => s.id === id))
    .filter(Boolean);

  const handleSlimeSelect = (slimeId: string) => {
    const slime = state.slimes.find(s => s.id === slimeId);
    if (slime && slime.elements.includes(habitat.element)) {
      dispatch({ type: 'ASSIGN_SLIME_TO_HABITAT', habitatId, slimeId });
      setGalleryOpen(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 overflow-hidden" style={{ pointerEvents: 'auto' }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 flex-shrink-0 bg-gradient-to-b from-black/95 via-black/90 to-black/70 pt-4 pb-8 px-6 backdrop-blur-md border-b border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-lg transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-[#FF7EB6]" />
        </button>
        <h2 
          className="text-center text-2xl font-black uppercase tracking-widest"
          style={{ fontFamily: "'Press Start 2P', cursive", color: theme.accent }}
        >
          {ELEMENT_DISPLAY_NAMES[habitat.element]} Sanctuary
        </h2>
        <p className="text-center text-xs text-white/60 mt-2 font-bold tracking-wider">
          {theme.desc}
        </p>
      </div>

      {/* Habitat Viewport */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: theme.bgImage ? `url("${theme.bgImage}")` : layers.backdrop,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Midground effect (only if no bgImage) */}
        {!theme.bgImage && (
          <div 
            className="absolute inset-0"
            style={{ background: layers.midground }}
          />
        )}

        {/* Ground (only if no bgImage) */}
        {!theme.bgImage && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{ background: layers.ground }}
          />
        )}

        {/* Environment Details Layer (only if no bgImage) */}
        {!theme.bgImage && (
          <div className="absolute inset-0 pointer-events-none">
            {layers.details}
          </div>
        )}

        {/* Slimes Container */}
        <div className="absolute inset-0">
          {assignedSlimes.map((slime) => slime && (
            <BouncingSlime key={slime.id} slime={slime} habitatId={habitatId} />
          ))}
          
          {/* Plus button for adding slimes */}
          {assignedSlimes.length < habitat.capacity && (
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={() => setGalleryOpen(true)}
                className="w-16 h-16 rounded-full bg-black/60 border-4 border-dashed border-white/40 hover:border-[#FF7EB6] hover:scale-110 transition-all flex items-center justify-center group"
              >
                <Plus className="w-8 h-8 text-white/40 group-hover:text-[#FF7EB6]" />
              </button>
            </div>
          )}
        </div>

        {/* Empty state (handled by the plus button above now, but keeping text) */}
        {assignedSlimes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center translate-y-20">
              <p className="text-white/40 font-bold text-sm tracking-wider">
                This sanctuary is empty...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="sticky bottom-0 z-40 flex-shrink-0 bg-gradient-to-t from-black/95 via-black/90 to-black/70 px-6 py-4 mt-4 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-bold tracking-wider uppercase">Inhabitants</p>
            <p className="text-lg font-black text-white">
              {assignedSlimes.length} <span className="text-white/60">/ {habitat.capacity}</span>
            </p>
          </div>
          {assignedSlimes.some(s => s && s.elements.includes(habitat.element)) && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg px-4 py-2">
              <p className="text-xs font-black text-green-400 tracking-wider">ELEMENT MATCH!</p>
              <p className="text-sm font-bold text-green-300">2x Goo Production</p>
            </div>
          )}
        </div>
      </div>

      {/* Slime Selection Gallery */}
      <Sheet open={galleryOpen} onOpenChange={setGalleryOpen}>
        <SheetContent side="bottom" className="h-[80vh] bg-obsidian-glass p-0 border-t-4 border-[#FF7EB6]/50 shadow-2xl">
          <SheetHeader className="p-4 border-b border-white/10 bg-black/40">
            <SheetTitle className="text-center text-sm font-black text-[#FF7EB6] uppercase tracking-[0.3em]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Select {ELEMENT_DISPLAY_NAMES[habitat.element]} Slime
            </SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-hidden">
             <SlimeGallery onSelect={handleSlimeSelect} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Styles for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.8); }
        }
        @keyframes spark-flash {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes drift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
}
