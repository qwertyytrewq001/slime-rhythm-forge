# Audio plan: music and sound effects

The game currently has only a few synthesised sound effects and **no music**. Music and sound do an enormous amount for how a game feels. This is the full plan.

## How I will build it (code)
- A new audio manager that plays real files and **falls back to the current synthesised sounds if a file is missing**, so nothing breaks while you add files gradually.
- **Music per screen** with smooth crossfades (about 1.5 s) and a quieter "ducking" when a dialogue or fanfare plays.
- **Mute and volume** (separate music and effects sliders) remembered between visits; the mute button visibly toggles.
- Sound starts only after the title screen's Play press (browsers require it).
- Files go in `public/audio/music/` and `public/audio/sfx/`. Please use **.mp3 at about 128 kbps** (smaller than .wav, works everywhere). Total budget: under **8 MB**, which matters for web portals.

## Music: 10 loops, 60 to 120 seconds, seamless loop, no vocals
Suggested tool: Suno or Udio. Add "seamless loop, no vocals, instrumental, game soundtrack" to each prompt.

| File | Where | Prompt idea |
|---|---|---|
| `title.mp3` | Title screen | Magical, hopeful, slightly epic, music box and strings with a gentle choir pad, mid tempo |
| `home.mp3` | Home screen / altar | Dreamy twilight, harp, soft celesta, warm synth pad, mysterious but cozy, slow |
| `farm.mp3` | Farm | Cozy pastoral, acoustic guitar, light flute, plucked strings, cheerful and relaxed |
| `sanctuary_day.mp3` | Sanctuary Isles, day | Floating islands, gentle piano and glockenspiel, airy and peaceful, bright |
| `sanctuary_night.mp3` | Sanctuary Isles, night | Lullaby, soft music box, slow piano, warm pads, sleepy and tender |
| `battle_map.mp3` | Battle map | Adventurous journey, hopeful strings and light percussion, mid tempo |
| `battle.mp3` | Battles | Energetic fantasy, driving rhythm, bouncy, playful tension (fits a rhythm game) |
| `den.mp3` | Breeding Den | Romantic mystical, soft crystalline chimes, warm cello, shimmering pads, slow |
| `bazaar.mp3` | Bazaar | Whimsical market, pizzicato strings, marimba, light jaunty tempo, friendly |
| `library.mp3` | Codex and Achievements | Reverent and calm, soft piano and strings, curious wonder, very quiet |

## Stingers: short one-shot tunes, 2 to 6 seconds
`ritual_start.mp3` (swelling magical build-up), `new_slime.mp3` (joyful discovery fanfare, sparkling), `new_species.mp3` (bigger, triumphant version), `level_up.mp3` (bright rising chime), `evolve.mp3` (grand transformation), `achievement.mp3` (warm triumphant sparkle), `visitor_arrives.mp3` (small bell with a cheerful flutter), `night_falls.mp3` (soft descending chimes), `golden_harvest.mp3` (shimmering gold chime).

## Sound effects: short one-shots, 0.1 to 1.5 seconds
Suggested tool: ElevenLabs sound effects, or freesound.org (check each licence).

**Interface:** `ui_click`, `ui_back`, `ui_hover` (very soft), `ui_open` (a panel slides in), `ui_error` (a soft "nope", not harsh), `ui_toggle`.
**Slimes:** `slime_tap_1` / `_2` / `_3` (squishy boing variations), `slime_pet` (happy squeak), `slime_happy` (a giggle-like squeak), `slime_sleep` (a tiny snore), `feed_munch` (a cute chomp), `slime_shy` (a tiny embarrassed squeak).
**Breeding:** `ritual_loop` (a looping magical hum, 8 s), `bond_chime` (two notes joining), `egg_form` (sparkly pop), `egg_crack_1` / `_2` / `_3` (increasingly strong cracks), `egg_hatch` (a burst and shell pieces).
**Farm:** `plant_dig`, `water_splash`, `harvest_pop`, `rush_zap`, `buy_land` (a wooden thunk plus a chime).
**Sanctuary:** `gift_ready` (a soft bubble pop with a bell), `gift_collect` (a sparkly swoosh), `decor_place` (a soft thud).
**Economy:** `coin` (goo-drop plink), `purchase` (a register chime), `claim` (a bright reward ding).

## Prompt template for effects
> "[Sound], cute fantasy mobile game, soft and rounded, short, clean, no reverb tail, high quality"

## Delivery
Put files in a folder named `audio` with `music` and `sfx` subfolders, using the exact file names above, and tell me. Partial delivery is fine: whatever exists plays, everything else falls back to the synthesised sounds.
