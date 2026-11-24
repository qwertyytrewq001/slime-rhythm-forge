import React, { useState } from 'react';

/**
 * The goo currency icon, in one place. Drop painted art at public/ui/icon_goo.png and every goo amount in the game uses it.
 * Until then a round, glossy jelly blob is drawn (not a water drop, goo is a slime thing).
 */
let artMissing = false;

export const GooIcon: React.FC<{ size?: number | string; className?: string; style?: React.CSSProperties }> = ({ size = '1.1em', className, style }) => {
  const [missing, setMissing] = useState(artMissing);
  const box: React.CSSProperties = { width: size, height: size, display: 'inline-block', verticalAlign: '-0.2em', flexShrink: 0, ...style };
  if (!missing) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}ui/icon_goo.png`}
        alt="goo"
        draggable={false}
        className={className}
        style={{ ...box, objectFit: 'contain', imageRendering: 'auto' }}
        onError={() => { artMissing = true; setMissing(true); }}
      />
    );
  }
  return (
    <svg viewBox="0 0 32 32" className={className} style={box} role="img" aria-label="goo">
      <defs>
        <radialGradient id="gooFill" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#b9f4ff" />
          <stop offset="0.45" stopColor="#4fc3f7" />
          <stop offset="1" stopColor="#1c6fd1" />
        </radialGradient>
      </defs>
      <path d="M16 4c5.5 0 11 3.6 11.4 10 .2 3.4-1 5-1.2 7.4-.3 3.4-4.3 6.6-10.2 6.6S6.2 24.600 5.800 21.400C5.500 18.900 4.400 17.300 4.600 14 5 7.600 10.500 4 16 4z" fill="url(#gooFill)" stroke="#143d7a" strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="11.500" cy="11" rx="3.200" ry="2" fill="#fff" opacity="0.8" transform="rotate(-25 11.500 11)" />
      <circle cx="21" cy="19" r="1.300" fill="#fff" opacity="0.55" />
    </svg>
  );
};
