# Breeding Altar art pack – prompts

6 generations. Same workflow as before: paste the MASTER STYLE first, do all of them in ONE chat thread, save to Downloads in this order, tell me when done.

**Direction:** the Mystic Altar scene (the looping pixel-art video, the glowing crystal, the two stone slabs) stays. It is beautiful and it is the identity of the game's heart. We add the painted UI and effects on top of it, so the altar finally matches the farm, battle map and sanctuaries.

## MASTER STYLE (prepend to every prompt)

> Hand-painted fantasy mobile-game asset, matching a cozy magical slime game. Soft painterly shading with visible brush texture, rich saturated colours, warm light from the top-left, a thin dark-purple outline (#3a2150), gentle rim highlights, no photo-realism, no flat vector look, no text, no watermark. Camera: front view tilted down about 30 degrees. Background: one flat solid pure magenta (#FF00FF) colour with nothing else on it, no shadow on the background, no checkerboard, no gradient. Leave generous empty margin around every object, and wide gaps between objects on a sheet.

---

## B1. `nav_plates_sheet.png` – the top navigation buttons (currently plain pixel text)
> [MASTER STYLE] A sheet of 5 wide wooden navigation plates, 3 on the top row and 2 centred on the bottom row, equal size, wide gaps, 3072x2048. Each plate is a rounded, weathered wooden sign about 2:1 wide with small vines and a tiny leaf, a round gold-rimmed medallion on the left holding an icon, and a clean empty wooden area on the right for text (no text drawn). Medallion icons: (1) a tiny floating island with a cottage (Sanctuaries), (2) a little red barn (Farm), (3) a heart-shaped egg in a nest (Breeding Den), (4) crossed swords over a rolled map (Battle Map), (5) a glowing blue crystal altar (Altar).

## B2. `altar_ui_sheet.png` – the breeding interface pieces
> [MASTER STYLE] A sheet of 8 UI pieces in a 4x2 grid, equal cells, wide gaps, 3072x1536. Row 1: (1) a big ornate round-ended "begin ritual" button in glowing violet-and-gold stone and crystal, empty centre for text; (2) the exact same button but dull grey stone, unlit (disabled); (3) a round parent slot: an empty carved stone ring with faint glowing runes and a soft hollow in the middle; (4) the same slot ring filled with a warm glowing aura (a slime is inside). Row 2: (5) a wide title banner plate of carved stone with golden vine trim, empty centre; (6) a parchment info card frame with soft rounded corners and a thin gold border, empty inside; (7) a round glowing blue crystal button with a small lightning spark (speed-up); (8) a round golden "collect" button with a sparkle, empty centre.

## B3. `ritual_fx_sheet.png` – the ritual effects
> [MASTER STYLE] A sheet of 6 magical effect sprites in a 3x2 grid, equal cells, wide gaps, 3072x2048, soft glow, no solid background objects: (1) a glowing ring of ancient runes lying on the ground seen at 30 degrees (an ellipse), violet and cyan light; (2) a tall vertical beam of soft white-gold light with sparkles, fading at both ends; (3) a swirl of glittering sparkles in a spiral; (4) a burst of pink hearts and tiny stars flying outward; (5) a handful of pastel egg-shell shards flying apart with sparkles; (6) a radiant starburst of golden rays with a bright soft centre (for "new discovery").

## B4. `rarity_gems_sheet.png` – the seven rarity tiers
> [MASTER STYLE] A single horizontal row of 7 faceted gems, equal spacing, very wide gaps, 3584x768, increasingly magnificent from left to right, each with a soft glow in its own colour: (1) Common: a small plain grey-white pebble gem; (2) Uncommon: a green gem; (3) Rare: a blue gem; (4) Epic: a purple gem with a bright highlight; (5) Legendary: an orange-gold gem with sparkles; (6) Divine: a white-pink radiant gem with a halo; (7) Ancient: a deep black-violet gem with a swirling galaxy inside and tiny stars.

## B5. `hatch_pieces_sheet.png` – hatching
> [MASTER STYLE] A single horizontal row of 4 items, equal spacing, very wide gaps, 3072x768: (1) a soft round nest of twigs, moss and glowing flower petals with an empty hollow on top for an egg; (2) a transparent overlay of fine hairline cracks glowing with light, drawn on a plain egg-shaped outline (just the cracks and glow on an egg silhouette, no colour fill); (3) the same egg silhouette with big deep glowing cracks and light shining through; (4) the same egg silhouette bursting open with a flash of light and shell pieces.

## B6. `shop_items_sheet.png` – Bazaar items (currently emoji)
> [MASTER STYLE] A single horizontal row of 4 collectible items, equal spacing, very wide gaps, 3072x768, each with a small sparkle: (1) a glass vial of bubbling purple "mutation juice" with a cork; (2) a lucky four-leaf-clover charm on a golden chain; (3) a glowing blue energy crystal; (4) a juicy glowing chunk of "wild food" meat with herbs.

---

## What I build with them
1. **Painted top navigation** (plates with icon medallions) replacing the pixel text, on every screen.
2. **Altar UI:** parent slots with element auras, a stone Begin Ritual button, a compatibility readout (how likely a rare, what element mix) so choosing parents is a decision, not a guess.
3. **The ritual itself:** parents glide to the crystal, the rune ring ignites, the beam rises, the crystal pulses, an egg forms. The wait becomes a show.
4. **Egg reveal:** a rarity gem and glow colour, a "New species!" starburst the first time, and a sparkle on the egg.
5. **Hatching:** nest, cracks that grow with each tap, and a shell burst when it opens.
6. **Bazaar** with real item icons.

Small habitat touches already done this round: slimes greet you when you walk in, wander to the decor you place, and tapping the ground sends sparkles in the sanctuary's own element.

---

# Extras (home screen and polish)

## B7. `title_sheet.png` – title screen pieces
> [MASTER STYLE] A sheet of 5 items in a loose layout, wide gaps, 3072x2048: (1) a large game logo for "RareSlime Forge": the words in chunky, rounded, glossy painted letters (soft violet and gold with a thin dark-purple outline and tiny sparkles), a small cute slime perched on the first letter, wide banner shape; (2) a big friendly "Play" button plate, glowing gold and pink stone and crystal, empty centre; (3) a round settings gear button, painted gold; (4) a round "sound on" speaker button, painted gold; (5) a round "sound off" speaker button with a small slash, painted grey-gold.

## B8. `element_sparkles_sheet.png` – small effect particles (replaces emoji in sparkles and bursts)
> [MASTER STYLE] A sheet of 10 tiny glossy particle sprites in a 5x2 grid, equal cells, wide gaps, 3840x1536, each centred and simple so it reads at a small size: (1) a flame, (2) a water droplet, (3) a green leaf, (4) a small earth pebble with a glint, (5) a wind swirl, (6) a snowflake, (7) a yellow lightning spark, (8) a silver gear, (9) a golden four-point star, (10) a violet crescent moon.
