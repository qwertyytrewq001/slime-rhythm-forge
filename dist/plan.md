A cozy, full-screen pixel art breeding simulator where you hatch, mix, and collect procedurally generated slimes. Canvas-rendered creatures with lofi synth music that pulses to slime rhythms. All client-side with LocalStorage persistence.

## Layout & UI (Pixel Art Theme)
Top Bar: Goo currency display (animated counter), game title "RareSlime Forge", mute/settings buttons
Left Sidebar: Scrollable slime gallery grid with search bar and 12-per-page pagination, sortable by rarity stars (1-5★), filterable by trait
Center Area: Breeding Pod — two drop zones with glowing animation, "BREED" button, merge animation sequence, plus a breed history log showing the last 5 merges (parent thumbnails → child thumbnail)
Right Panel: Selected slime stats — trait list with icons, rarity score + star rating, goo/sec production rate
Pastel pixel art aesthetic: Soft backgrounds, chunky pixel fonts, subtle scanline overlay
## Slime Data Model (JSON, 12 Traits + Procedural Name)
Each slime is a procedurally generated JSON object with:

Procedural Name: Auto-generated from traits (e.g. a fire-spiked, galaxy-eyed pink blob → "Blazing Cosmos Globbius"). Name built from adjective (pattern/glow/aura) + descriptor (eyes/spikes) + noun (shape). Ensures every slime has a unique, memorable name.
Shape (15 types), Color1 / Color2 (20-color palette each), Eyes (15 types), Mouth (10 types), Spikes (10 types), Pattern (15 types), Glow (6 levels), Size (0.5x–2x), Aura (5 types), Rhythm (6 beat strengths), Accessory (11 types)
Rarity Score: Calculated from trait rarity weights (Common 1★ = 0-10pts, Mythic 5★ = 50+pts)
Unique hash/ID per slime
## Canvas Rendering Engine (Performance-Optimized)
Each slime rendered on HTML5 Canvas with layered pixel drawing:
Body shape with gradient fill (color1 → color2)
Overlay traits: eyes, mouth, spikes, pattern, accessories
Particle effects for glow/aura traits
Soft glow shader effect for rare slimes
Idle animations: Bounce cycle + squash/stretch
Phase cycling: 3 palette modes (Normal / Chill Dreamy / Inverted Spooky) — rare quantum-phase slimes glitch between them
Performance guardrail: Only slimes currently visible on screen run full animations and particle effects. Off-screen and gallery thumbnails use static frames or reduced-frame rendering. RequestAnimationFrame paused when tab is hidden.
## Breeding Mechanics
Drag & drop two slimes from gallery onto breeding pod slots
Merge animation: Slimes slide together, particle burst, new slime emerges
Trait inheritance: 60% from parents / 20% mutation / 20% wild random / 5% ultra-rare combo chance
Breed History Log: Below the pod, show the last 5 breed results as a mini timeline (parent pair thumbnails → arrow → child thumbnail + name). Clickable to select that slime in the stats panel.
New slime added to gallery with calculated rarity and procedural name
 ## Economy & Progression
Goo generation: Each slime produces goo/sec = rarity × 0.1, auto-collected
Rhythm tap bonus: Rarer slimes pulse to a beat; tapping in sync gives a goo burst
Shop (spend goo):
"Mutation Juice" — next breed has 50% mutation rate
"Wild Food" — RNG boost to one trait on an existing slime
"Starter Egg" — buy a random new basic slime
Start with 3 free basic slimes (green blob, blue puddle, pink drop)
## Achievements System (5 Achievements)
"First Fusion" — Breed your first slime → Reward: 50 goo
"Rare Find" — Obtain a 3★+ slime → Reward: free Mutation Juice
"Slime Hoarder" — Collect 20 slimes → Reward: 200 goo
"Mythic Hunter" — Obtain a 5★ Mythic slime → Reward: 500 goo + unique "Crown" accessory unlocked
"Rhythm Master" — Hit 10 perfect rhythm taps in a row → Reward: 100 goo burst
Achievements displayed as pixel badge icons in a popup/toast when unlocked, with a viewable trophy shelf accessible from the top bar
Habitat system - after a slime hatches, you should have the option to click on a habitat, and place the slime inside an habitat, only 2 slimes per habitat, a slime can only go inside an habitat IF the the slime has an element that matches the element of a habitat