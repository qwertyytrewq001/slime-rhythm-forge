# Free sound and music: where to download, and what to search for

Everything here is free. Rule for a game you will put on a portal and earn ad money from: **only use files that say CC0 / public domain, or "free for commercial use, no attribution"**. Avoid anything marked "NC" (non-commercial) or "BY-NC". Check the licence on **each file's own page**, because one site can mix licences.

## Best sites (in the order I would use them)

| Site | Good for | Licence | Notes |
|---|---|---|---|
| [Kenney.nl audio packs](https://kenney.nl/assets?q=audio) | UI clicks, bonks, coins, jingles | CC0 (no credit, commercial OK) | Safest source. Download whole packs: "Interface Sounds", "UI Audio", "Digital Audio", "Impact Sounds". |
| [Pixabay Music](https://pixabay.com/music/) and [Pixabay Sound Effects](https://pixabay.com/sound-effects/) | All 10 music tracks, stingers, most effects | Pixabay Content License (commercial OK, no credit; you may not resell the file alone) | Easiest for music. Filter by "Loopable" tag where it exists. Read their licence page once before launch. |
| [Mixkit sound effects](https://mixkit.co/free-sound-effects/) | Effects: pops, chimes, whooshes, magic | Mixkit licence (commercial OK, no credit) | Their *music* has a different licence, so use only the effects. |
| [OpenGameArt.org](https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12&field_art_type_tid%5B%5D=13) | Game-ready loops and effects | Per file: choose **CC0** (or CC-BY and then credit the author) | Filter licence to CC0. Great for cozy fantasy loops. |
| [Freesound.org](https://freesound.org/) | Real recordings: squish, splash, snore, munch | Per file: **CC0** only, or CC-BY with credit | Needs a free account to download. Use the search filter "License: Creative Commons 0". |
| [Sonniss GDC audio bundle](https://sonniss.com/gameaudiogdc) | Big professional effects bundles (huge, hundreds of GB) | Royalty-free for games | Probably overkill. Fine to grab one year if you want quality. |
| [incompetech](https://incompetech.com/music/royalty-free/) (Kevin MacLeod) | Music | CC-BY: you must credit him in the game's credits | Only if you add a Credits screen (I can add one). |

Avoid for a shipped game: BBC Sound Effects (non-commercial licence), Free Music Archive tracks marked NC, Uppbeat free tier (credit and limits).

## What to search for, file by file

Use these exact file names when you save them into `public/audio/music/` or `public/audio/sfx/` (see AUDIO_SPEC.md). Download **.mp3 or .ogg**, I will handle the rest. Keep a note of the source and licence of each file in a text file called `audio/CREDITS.txt` (I can build the credits screen from it).

### Music (10 loops; search + filter "loop")
| File | Search words |
|---|---|
| title.mp3 | "magical fantasy theme", "music box fantasy", "fairy tale intro" |
| home.mp3 | "dreamy ambient fantasy", "twilight harp", "calm magical ambient" |
| farm.mp3 | "cozy farm", "pastoral acoustic", "village peaceful guitar flute" |
| sanctuary_day.mp3 | "floating island", "peaceful glockenspiel piano", "cute relaxing game" |
| sanctuary_night.mp3 | "lullaby", "music box night", "sleepy piano" |
| battle_map.mp3 | "adventure map theme", "journey fantasy strings", "overworld" |
| battle.mp3 | "upbeat fantasy battle", "rhythm game energetic", "playful action loop" |
| den.mp3 | "mystical crystal ambient", "romantic fantasy cello", "shimmering pads" |
| bazaar.mp3 | "whimsical market", "pizzicato marimba", "quirky shop theme" |
| library.mp3 | "calm library piano", "curious wonder soft", "reflective ambient" |

### Stingers (2 to 6 seconds)
ritual_start ("magic build up", "spell charge"), new_slime ("level complete jingle", "discovery fanfare"), new_species ("victory fanfare short"), level_up ("level up chime", "power up"), evolve ("transformation", "magic evolve"), achievement ("achievement unlocked", "reward jingle"), visitor_arrives ("shop bell", "door chime"), night_falls ("descending chimes", "night magic"), golden_harvest ("golden shimmer", "treasure sparkle").

### Interface effects
ui_click ("ui click soft", Kenney Interface Sounds), ui_back ("back button", "cancel"), ui_hover ("tick soft"), ui_open ("whoosh soft", "panel open"), ui_error ("error soft", "negative blip"), ui_toggle ("switch", "toggle click").

### Slime effects
slime_tap_1/2/3 ("slime squish", "jelly boing", "bubble pop wet"; get three different ones), slime_pet ("happy squeak", "cute squeak"), slime_happy ("giggle cute", "chirp happy"), slime_sleep ("snore cartoon"), feed_munch ("cartoon chomp", "bite crunchy small"), slime_shy ("tiny squeak").

### Breeding and eggs
ritual_loop ("magic hum loop", "energy loop"), bond_chime ("two note chime", "magic ding"), egg_form ("sparkle pop"), egg_crack_1/2/3 ("egg crack", "shell crack", "ice crack"; three strengths), egg_hatch ("magic burst", "shell break pop").

### Farm
plant_dig ("dig dirt small", "shovel soil"), water_splash ("water pour", "splash small"), harvest_pop ("pop plant", "pluck veggie"), rush_zap ("magic zap short"), buy_land ("wood thunk" plus a "coin chime").

### Habitats and economy
gift_ready ("bubble pop bell"), gift_collect ("sparkle whoosh", "collect item"), decor_place ("soft thud", "place object"), coin ("coin drop", "water drop plink"), purchase ("cash register" or "buy item"), claim ("reward ding", "bonus collected").

## Tips
- Loops: if a music track is not loopable, tell me. I can add a smooth crossfade at the loop point.
- Total size budget is about 8 MB. Pick 1 to 2 minute tracks and short effects. Pixabay lets you sort by duration.
- Quality beats quantity: five great effects chosen carefully feel better than fifty random ones.
- You can send me files in batches. Anything missing still falls back to the built-in synthesised sounds.
