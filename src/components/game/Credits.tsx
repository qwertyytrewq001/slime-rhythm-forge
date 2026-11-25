/**
 * Who made the sounds. The two OpenGameArt tracks require this (title, author, licence, source, and that
 * the file was changed), so do not remove them while those tracks are in the game. See public/audio/CREDITS.txt.
 * The addresses are plain text on purpose: portals do not allow links that leave the game.
 */
const ENTRIES = [
  { title: 'Battle music: "Battle midi" (acción) by djsaryon', licence: 'CC BY-SA 3.0, creativecommons.org/licenses/by-sa/3.0', source: 'opengameart.org/content/battle-midi' },
  { title: 'Bazaar music: "Medieval" by Miguel Herrero, submitted by remaxim', licence: 'CC BY-SA 3.0, creativecommons.org/licenses/by-sa/3.0', source: 'opengameart.org/content/medieval' },
];

export function Credits({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(15,8,30,0.75)' }} onClick={onClose}>
      <div role="dialog" aria-label="Credits" className="rounded-2xl text-left overflow-y-auto" onClick={e => e.stopPropagation()} style={{ width: 'min(92cqw, 520px)', maxHeight: '90cqh', background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: '4px solid #4a2f17', color: '#4a2f17', padding: '12px 18px', fontSize: 12, lineHeight: 1.35 }}>
        <div className="font-bold text-center" style={{ fontSize: 17, marginBottom: 6 }}>Credits</div>
        {ENTRIES.map(e => (
          <p key={e.source} style={{ marginBottom: 8, userSelect: 'text' }}>
            <b>{e.title}</b><br />{e.licence}<br />{e.source} (compressed for this game)
          </p>
        ))}
        <p style={{ marginBottom: 8 }}>Other music and ambience: zephiramusic, atlasaudio, andriih and alex_jauk (Pixabay).<br />Sound effects: Kenney (kenney.nl) and Mixkit.</p>
        <div className="text-center">
          <button type="button" onClick={onClose} className="rounded-full font-bold px-5 py-1" style={{ background: '#fff7dc', border: '3px solid #4a2f17', fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  );
}
