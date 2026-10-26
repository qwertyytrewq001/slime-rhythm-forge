# Farm art prompts

Style: match the existing painted look of `farm_background.jpg` and the UI kit – soft hand-painted fantasy, dark purple outline, bright saturated colours, subtle highlight.
All sprites: **transparent background**, square, ~512x512, plant centred, base of the stem at the bottom centre. Do not paint a checkerboard.

Save as `public/farm/crop_<type>_<stage>.png`, then set `FARM_ART_READY = true` in `src/components/game/farm/CropArt.tsx`.
Types: `basic`, `elemental`, `royal`. Stages: `0` seedling, `1` sprout, `2` growing, `3` ripe.

## Crops (12 images)
Use this template and fill in the crop and stage:

> Cute hand-painted fantasy game sprite, a [CROP] plant at the [STAGE] growth stage, dark purple outline, soft highlights, transparent background, centred, stem base at bottom centre, no ground, no shadow.

| Type | Crop | Look |
|---|---|---|
| basic | Glimberries | green leafy bush, glossy blue berries (stage 3 has 5 big berries) |
| elemental | Moonpetal Blossom | teal leaves, pale lavender moon-shaped petals, golden centre |
| royal | Starfruit Vine | lime leaves, golden star-shaped fruit with sparkle |

Stages: 0 = tiny sprout with two leaves; 1 = thin stem, 4 small leaves; 2 = taller, first hint of fruit/bud; 3 = fully ripe, glowing, fruit/flowers prominent.

## Field pieces
1. **Soil mound** – a rounded mound of tilled brown soil, seen from slightly above, transparent background, 512x256.
2. **Overgrown plot (locked)** – same shape, covered in tall grass and weeds with a tiny wooden "for sale" sign.
3. **Wooden fence segment** – left, middle, right, matching the background's rustic style.

## Effect icons (transparent, 256x256)
- Watering can with a drop of water.
- Lightning-bolt "rush" icon in gold.
- Golden sparkle burst for golden harvests.
