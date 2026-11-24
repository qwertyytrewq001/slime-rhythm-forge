import React from 'react';

export type VossMood = 'calm' | 'amused' | 'cold' | 'angry';

/**
 * Voss's face. He is a Forger who went bad: polite, patient, and smarter than he looks, with goggles for his Goo machines
 * and a vial of stolen Goo at his throat. Drawn in code so he has a face in every dialogue until painted art replaces it
 * (if public/ui/voss_<mood>.png exists it is used instead).
 */
export function VossPortrait({ mood = 'calm' }: { mood?: string }) {
  const [art, setArt] = React.useState<'try' | 'yes' | 'no'>('try');
  const m: VossMood = (['calm', 'amused', 'cold', 'angry'] as const).includes(mood as VossMood) ? (mood as VossMood) : 'calm';
  const angry = m === 'angry';
  const amused = m === 'amused';
  const src = `${import.meta.env.BASE_URL}ui/voss_${m}.png`;
  return (
    <div className="relative w-full h-full" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.55))' }}>
      {art !== 'no' && (
        <img src={src} alt="" draggable={false} onLoad={() => setArt('yes')} onError={() => setArt('no')} className="absolute inset-0 w-full h-full object-contain" style={{ display: art === 'yes' ? 'block' : 'none' }} />
      )}
      {art !== 'yes' && (
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" role="img" aria-label="Voss">
          <defs>
            <radialGradient id="vossEye" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#fff6b0" />
              <stop offset="1" stopColor="#ffb62e" />
            </radialGradient>
            <linearGradient id="vossHood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b2566" />
              <stop offset="1" stopColor="#150c28" />
            </linearGradient>
            <radialGradient id="vossLens" cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#d6fff2" />
              <stop offset="1" stopColor="#35c9a0" />
            </radialGradient>
          </defs>
          {/* cloak and high collar */}
          <path d="M10 200 C14 150 50 138 100 138 C150 138 186 150 190 200 Z" fill="url(#vossHood)" stroke="#0a0614" strokeWidth="4" />
          <path d="M62 140 L100 176 L138 140 L124 134 L100 158 L76 134 Z" fill="#241540" stroke="#0a0614" strokeWidth="3" />
          {/* stolen Goo vial */}
          <rect x="94" y="168" width="12" height="20" rx="5" fill="#5ff0c8" stroke="#0a0614" strokeWidth="3" />
          <circle cx="100" cy="165" r="4" fill="#c8963c" stroke="#0a0614" strokeWidth="2" />
          {/* hood */}
          <path d="M34 150 C20 90 46 22 100 18 C154 22 180 90 166 150 C150 130 128 124 100 124 C72 124 50 130 34 150 Z" fill="url(#vossHood)" stroke="#0a0614" strokeWidth="4" />
          {/* shadowed inside of the hood */}
          <path d="M54 128 C46 86 62 46 100 44 C138 46 154 86 146 128 C134 118 118 114 100 114 C82 114 66 118 54 128 Z" fill="#0c0618" />
          {/* face */}
          <path d="M66 90 C66 64 82 52 100 52 C118 52 134 64 134 90 C134 112 122 128 100 136 C78 128 66 112 66 90 Z" fill="#e6d3c1" stroke="#0a0614" strokeWidth="3" />
          <path d="M66 90 C66 64 82 52 100 52 C100 80 90 112 100 136 C78 128 66 112 66 90 Z" fill="#b89d8a" opacity="0.55" />
          {/* goggles pushed up on the forehead */}
          <path d="M60 66 C80 56 120 56 140 66" stroke="#6a4a1c" strokeWidth="9" fill="none" strokeLinecap="round" />
          <circle cx="82" cy="62" r="13" fill="url(#vossLens)" stroke="#c8963c" strokeWidth="5" />
          <circle cx="118" cy="62" r="13" fill="url(#vossLens)" stroke="#c8963c" strokeWidth="5" />
          <circle cx="78" cy="57" r="4" fill="#fff" opacity="0.7" />
          <circle cx="114" cy="57" r="4" fill="#fff" opacity="0.7" />
          {/* eyebrows */}
          <path d={angry ? 'M72 86 L92 94' : amused ? 'M72 90 Q82 82 92 88' : 'M72 90 L92 90'} stroke="#1a1020" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d={angry ? 'M128 86 L108 94' : amused ? 'M128 86 Q118 80 108 88' : 'M128 90 L108 90'} stroke="#1a1020" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* glowing eyes */}
          <ellipse cx="82" cy="99" rx="8" ry={angry || m === 'cold' ? 4.5 : 7} fill="url(#vossEye)" stroke="#0a0614" strokeWidth="2" />
          <ellipse cx="118" cy="99" rx="8" ry={angry || m === 'cold' ? 4.5 : 7} fill="url(#vossEye)" stroke="#0a0614" strokeWidth="2" />
          <circle cx="82" cy="99" r="2.5" fill="#2a1500" />
          <circle cx="118" cy="99" r="2.5" fill="#2a1500" />
          {/* nose and cheek lines */}
          <path d="M100 100 L96 116 L103 116" stroke="#8a6f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M74 112 Q78 120 84 124 M126 112 Q122 120 116 124" stroke="#a88c79" strokeWidth="2" fill="none" opacity="0.7" />
          {/* mouth */}
          <path d={angry ? 'M86 128 Q100 120 114 128' : amused ? 'M84 124 Q100 138 118 120' : m === 'cold' ? 'M88 126 L112 126' : 'M88 125 Q100 130 112 125'} stroke="#3a1e22" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {amused && <path d="M116 121 L120 118" stroke="#3a1e22" strokeWidth="3" strokeLinecap="round" />}
        </svg>
      )}
    </div>
  );
}
