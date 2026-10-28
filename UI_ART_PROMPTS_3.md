# Art pack 3: toolbar, Bazaar, Achievements, Codex backdrop, reactions, dialogue

8 generations. One chat thread, MASTER STYLE first on sprite sheets, save in this order. Scenes (U2, U4, U6) have NO magenta.

## MASTER STYLE (prepend to U1, U3, U5, U7, U8)

> Hand-painted fantasy mobile-game asset, matching a cozy magical slime game. Soft painterly shading with visible brush texture, rich saturated colours, warm light from the top-left, a thin dark-purple outline (#3a2150), gentle rim highlights, clean crisp shapes, no photo-realism, no flat vector look, no AI-slop smudging, no text, no watermark. Camera: front view tilted down about 30 degrees. Background: one flat solid pure magenta (#FF00FF) colour with nothing else on it, no shadow on the background, no checkerboard, no gradient. Leave generous empty margin around every object, and wide gaps between objects on a sheet.

---

## U1. `toolbar_icons_sheet.png` – the bottom-left buttons (replaces the generic icons)
> [MASTER STYLE] A sheet of 6 round button icons in a 3x2 grid, equal cells, very wide gaps, 3072x2048. Each is a chunky round wooden button with a gold rim and a small vine and leaf, matching a fantasy wooden sign style, with a painted symbol in the centre: (1) a speaker playing sound with little music notes (sound on); (2) the same speaker with a small slash and dull colours (sound off); (3) a little market stall or shopping bag with a star (Bazaar); (4) an open ancient spellbook with a glowing page (Codex); (5) a golden trophy cup (Achievements); (6) a framed picture or a small stack of slime cards (Collection).

## U2. `bazaar_bg.png` – the Mystic Bazaar scene
(No magenta. Full painted scene.)
> Hand-painted fantasy game background, 16:9, 1920x1080, same cozy painted style as a polished mobile game. The inside of a magical night-market tent, "the Mystic Bazaar": warm draped fabric ceiling in plum and gold, hanging paper lanterns and glowing crystals, wooden shelves on both sides stocked with colourful jars, potions, eggs and trinkets, a friendly wooden counter at the bottom with a small brass scale and a coin dish, soft golden light, drifting sparkles. IMPORTANT: leave the centre of the picture (middle 60% width, 20% to 80% height) fairly calm and uncluttered because shop cards will be placed there. NO characters, NO text.

## U3. `bazaar_ui_sheet.png` – Bazaar interface pieces
> [MASTER STYLE] A sheet of 9 UI pieces, equal cells, very wide gaps, 3072x3072: (1) a portrait shop-item card frame: parchment with a gold border and a small ribbon at the top, empty inside; (2) the same card in a "can't afford" greyed, dim version; (3) a price tag plate: a small wooden tag with a round empty slot on the left for a coin, empty on the right for numbers; (4) a round glossy blue goo-drop coin icon (the currency); (5) a tab button, wooden, empty centre, normal state; (6) the same tab button glowing gold (selected); (7) a "SOLD OUT" round red wax stamp, no text, just a blank stamp with a cross; (8) a small "NEW" ribbon tag with a star, blank; (9) a round wooden close button with a gold X.

## U4. `achievements_bg.png` – the trophy hall
(No magenta. Full painted scene.)
> Hand-painted fantasy game background, 16:9, 1920x1080, same cozy painted style as a polished mobile game. A grand magical trophy hall at golden hour: tall arched windows with soft god-rays, polished stone floor, carved wooden shelves and empty trophy pedestals along the sides, banners in violet and gold hanging from the ceiling, a few floating sparkles. IMPORTANT: keep the middle (60% width, 15% to 85% height) calm and fairly plain because a list of achievements will sit on it. NO characters, NO text.

## U5. `achievements_ui_sheet.png` – Achievements pieces
> [MASTER STYLE] A sheet of 9 pieces, equal cells, very wide gaps, 3072x3072: (1) a wide achievement row card frame: parchment with gold trim and a round medallion slot on the left, empty; (2) the same row greyed and dim (locked); (3) the same row glowing gold (ready to claim); (4) a round bronze medal with a star; (5) a round silver medal with a star; (6) a round gold medal with a star; (7) a wide progress bar frame: an empty carved wooden trough; (8) a green "claim" button, wooden and gold, empty centre; (9) a small padlock medallion in dull grey-gold.

## U6. `codex_bg.png` – a backdrop behind the Codex (the Codex layout stays exactly as it is)
(No magenta. Full painted scene.)
> Hand-painted fantasy game background, 16:9, 1920x1080, same cozy painted style as a polished mobile game. A vast ancient library at night, seen from afar: towering curved bookshelves, floating glowing pages and tiny floating books, soft violet and teal lantern light, warm dust motes and sparkles, deep calm colours so UI cards on top stay readable. Everything slightly blurred and soft like a dreamy depth-of-field background, darker toward the edges. NO characters, NO text, nothing bright or busy in the middle.

## U7. `reaction_sheet.png` – extra slime reactions for breeding (shy, cool, smitten)
> [MASTER STYLE] A sheet of 6 small overlay sprites in a 3x2 grid, equal cells, very wide gaps, 3072x2048, each simple and readable at a small size: (1) a pair of cool dark sunglasses with a tiny shine, front view; (2) a pair of pink heart-shaped eyes to overlay on a slime's face; (3) a pair of golden sparkly star eyes to overlay on a slime's face; (4) a cluster of three floating musical notes; (5) a tiny glowing lightbulb; (6) a little wreath of flowers worn like a crown.

## U8. `dialogue_ui_sheet.png` – the new dialogue and tutorial interface
> [MASTER STYLE] A sheet of 8 pieces, equal cells, very wide gaps, 3072x3072: (1) a wide dialogue box frame: parchment with a gold-and-vine border and rounded corners, with a small speech tail at the top-left, empty inside; (2) a small name tab ribbon that attaches to the box's top edge, empty inside; (3) a round "next" arrow button, wooden and gold; (4) a round "skip" double-arrow button, wooden and grey-gold; (5) a wide choice button: a parchment pill with gold trim, empty; (6) the same choice button glowing (hover); (7) a glowing golden pointing hand pointing down-left, with a soft glow (for tutorial hints); (8) a soft round spotlight ring: a glowing gold circle outline with a faint inner sparkle, transparent in the middle (to highlight a button).

---

## What I build with them
- **U1:** painted bottom-left buttons, with a mute button that visibly toggles and remembers its state.
- **U2, U3:** the Bazaar becomes the Mystic Bazaar: painted tent, shop cards with price tags and the goo coin, tabs. Sanctuary items reuse your element islands and emblems.
- **U4, U5:** Achievements: the trophy hall with medal tiers, locked, claimable and claimed rows, and a painted claim button.
- **U6:** a soft backdrop behind the Codex. I will not touch its layout or the silhouettes you like. I only place the picture behind them, dimmed, and show you before and after.
- **U7:** more personality in the Breeding Den. Slimes react differently when a partner is picked: some turn shy, some act cool in sunglasses, some go heart-eyed.
- **U8:** the reworked dialogue and tutorial interface, with a pointing hand and spotlight ring.
