# Farm art pack – prompts

12 generations in total. Paste the MASTER STYLE block at the start of every prompt, then the specific prompt.
Save the results in your Downloads folder and tell me; I will cut, clean and wire them in.

## MASTER STYLE (prepend to every prompt)

> Hand-painted fantasy mobile-game asset, matching a cozy magical slime-farm game. Soft painterly shading with visible brush texture, rich saturated colours, warm light coming from the top-left, a thin dark-purple outline (#3a2150), gentle rim highlights, no photo-realism, no flat vector look, no text, no watermark. Camera: front view, tilted down about 30 degrees. Background: one flat solid pure magenta (#FF00FF) colour with nothing else on it, no shadow on the background, no checkerboard, no gradient. Leave generous empty margin around every object.

If the generator ignores the magenta, ask it again for "solid flat magenta background". If it draws a checkerboard, that is fine; I can remove it.
Keep the SAME chat/thread for all 12 so the style stays consistent.

---

## A. GROUND (most important)

### 1. `farm_soil_bed.png` – tilled soil mound (one image, reused for all 16 plots)
> [MASTER STYLE] A single round-oval raised mound of freshly tilled dark chocolate-brown garden soil, seen from the front tilted down 30 degrees, wide and flat like a low cushion. Soft curved furrow lines across the top, a few small pebbles and tiny clumps of dirt, lighter crumbly highlights on the top-left, deeper shadow on the lower-right rim. A thin darker edge of packed earth around the base. Empty and ready for planting, nothing growing on it. Centred. Aspect ratio 2:1 (wide), 1536x768.

### 2. `farm_soil_wet.png` – same mound, watered
> [MASTER STYLE] Exactly the same round-oval tilled soil mound as the previous image, same shape, size, angle and position, but freshly watered: the soil is darker and richer, glossy, with small shiny wet highlights and two or three tiny puddle glints. Still empty, nothing growing. 1536x768.

### 3. `farm_plot_locked.png` – overgrown land not yet owned
> [MASTER STYLE] Same round-oval footprint as a garden plot, but this plot is overgrown: tall wild grass tufts, a few weeds, tiny wildflowers and a mossy rock on top of untilled green-brown earth, and a small cute wooden "for sale" stake leaning in the front-right with a blank plank (no text). Soft, slightly desaturated so it reads as "not available yet". 1536x768.

### 4. `farm_fence_rail.png` – tileable fence rail
> [MASTER STYLE] A straight horizontal section of rustic wooden garden fence, two parallel weathered planks with rope ties and small knots in the wood, seen front-on, designed to tile seamlessly left and right (the left and right ends must match exactly and be cut off flat, no posts). 1536x384.

### 5. `farm_fence_post.png` – fence post
> [MASTER STYLE] One tall sturdy rustic wooden fence post with a rounded cap, a bit of rope wrapped around it, and a tiny glowing mushroom at its base, same weathered wood as the fence rail. 512x1024.

---

## B. CROPS (sheets: 4 stages in one row, so the style matches)

For every crop sheet: ONE image, four plants in a single horizontal row, equal spacing, each the same scale reference (the ripe one is the biggest), each with its stem base on the SAME imaginary line at the bottom, NO soil or ground under them, nothing touching, wide gaps between them. 3072x768.
Stages left to right: 1 seedling (two tiny leaves), 2 young sprout (thin stem, four small leaves), 3 growing (taller, bushy leaves, first visible buds or unripe fruit), 4 fully ripe (lush, glowing slightly, fruit or flower very prominent).

### 6. `crop_basic_sheet.png` – Glimberries
> [MASTER STYLE] [CROP SHEET RULES] Crop: Glimberries. Fresh green leafy bush. Stage 3 has small pale-blue unripe berries; stage 4 is covered in about 6 big glossy sapphire-blue berries with white highlights and a faint blue glow.

### 7. `crop_elemental_sheet.png` – Moonpetal Blossom
> [MASTER STYLE] [CROP SHEET RULES] Crop: Moonpetal Blossom. Teal-mint leaves. Stage 3 has a closed pale-lavender bud; stage 4 is an open flower with five soft glowing moon-white and lavender petals, a golden centre, and a few floating sparkles.

### 8. `crop_royal_sheet.png` – Starfruit Vine
> [MASTER STYLE] [CROP SHEET RULES] Crop: Starfruit Vine. Lime-green leaves on a curling vine. Stage 3 has small pale-green star-shaped fruits; stage 4 has three large glossy golden star-shaped fruits with a warm magical glow and tiny sparkles.

### 9. `crop_golden_sheet.png` – Golden ripe versions (stage 4 only)
> [MASTER STYLE] Three plants in one horizontal row, equal spacing, no ground, wide gaps, 2304x768. They are the RARE GOLDEN versions of the ripe Glimberries bush, Moonpetal Blossom and Starfruit Vine: same shapes as the normal ripe plants, but every leaf, berry and petal is shimmering metallic gold with a soft white-gold aura, bright sparkles and a subtle rim of light. Magical and valuable looking.

---

## C. ICONS AND SEEDS (sheets)

### 10. `farm_icons_sheet.png` – UI icons
> [MASTER STYLE] A sheet of 8 chunky game-UI icons in a 4x2 grid, equal cell size, wide gaps, each icon centred and clearly separate, thick soft outline, glossy painted look, 3072x1536. Left to right, top row: (1) a cute round watering can tipping with water drops, (2) a woven wicker harvest basket full of colourful fruit, (3) a small cloth seed pouch with a sprout on it, (4) a golden lightning bolt in a glowing circle. Bottom row: (5) two curved arrows forming a loop in green, (6) a golden shield-shaped medallion with a leaf in the middle and a small gem on top (the Farm Level badge, empty centre area for a number), (7) a bright golden star with sparkles, (8) a single round blue water droplet with a highlight.

### 11. `seed_packets_sheet.png` – seed packets
> [MASTER STYLE] Three little paper seed packets in one horizontal row, equal spacing, wide gaps, 2304x768. Each packet stands slightly tilted, with a folded top, a small painted picture and no text. Packet 1: blue with a blue berry bush picture (Glimberries). Packet 2: lavender with a glowing white-lavender flower (Moonpetal). Packet 3: golden with a gold star fruit (Starfruit).

---

## D. EFFECT (optional, finishes the "golden harvest" moment)

### 12. `fx_golden_burst.png` – golden harvest burst
> [MASTER STYLE] A radial burst of golden light: a soft glowing core with thin light rays, four-point sparkles and a few small stars flying outward, symmetrical, painterly glow, 1024x1024. Background solid magenta as above.

---

## What I do with them
- Cut sheets into single sprites, remove the background, trim, and put them in `public/farm/`.
- Crops: `crop_<type>_0..3.png` plus `crop_<type>_gold.png`; set `FARM_ART_READY = true` in `src/components/game/farm/CropArt.tsx`.
- Replace the CSS soil, mounds, locked land and emoji icons with these images, and build the fence frame from the rail and post.
- Add the code-only polish: dirt puff on planting, water splash, plant squash on harvest, an animated watering can, and golden glow on golden plants.

## Order if you want to send in batches
1. Images 1, 2, 3 and 6, 7, 8 (ground and crops: biggest visual change)
2. Images 10, 11 (icons and seeds)
3. Images 4, 5, 9, 12 (fence, golden crops, burst)
