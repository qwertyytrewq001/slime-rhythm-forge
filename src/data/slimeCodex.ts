import { SlimeElement, RarityTier } from '@/types/slime';

export interface CodexSlime {
  id: string;
  name: string;
  elements: SlimeElement[];
  rarityTier: RarityTier;
  weight: number;
  description: string;
  family?: 'elemental-foundations' | 'sweet-confections' | 'natures-garden' | 'storm-forces' | 'frozen-realms' | 'underground-depths' | 'aquatic-worlds' | 'metal-forged' | 'cosmic-elements' | 'ancient-mysteries' | 'odd-balls';
  spriteId: string;
}

// 🧬 The Primals (Core 1-Element Slimes) - Based on actual sprites
export const PRIMAL_SLIMES: CodexSlime[] = [
  {
    id: 'fire_slime',
    name: 'Fire Slime',
    elements: ['fire'],
    rarityTier: 'Common',
    weight: 100,
    description: "Thinks it invented fire, but actually just discovered it.",
    family: 'elemental-foundations',
    spriteId: 'fire_slime'
  },
  {
    id: 'water_slime',
    name: 'Water Slime',
    elements: ['water'],
    rarityTier: 'Common',
    weight: 100,
    description: "Claims to be 99% water and 1% existential dread.",
    family: 'aquatic-worlds',
    spriteId: 'water_slime'
  },
  {
    id: 'leaf_slime',
    name: 'Leaf Slime',
    elements: ['plant'],
    rarityTier: 'Common',
    weight: 100,
    description: "Secretly believes it's a mighty oak, despite being cabbage-sized.",
    family: 'natures-garden',
    spriteId: 'leaf_slime'
  },
  {
    id: 'rock_slime',
    name: 'Rock Slime',
    elements: ['earth'],
    rarityTier: 'Common',
    weight: 100,
    description: "Takes three years to win a staring contest against a boulder.",
    family: 'elemental-foundations',
    spriteId: 'rock_slime'
  },
  {
    id: 'wind_slime',
    name: 'Wind Slime',
    elements: ['wind'],
    rarityTier: 'Common',
    weight: 100,
    description: "Carries a heavy heart (literally) to avoid drifting away.",
    family: 'elemental-foundations',
    spriteId: 'wind_slime'
  },
  {
    id: 'snow_slime',
    name: 'Snow Slime',
    elements: ['ice'],
    rarityTier: 'Common',
    weight: 100,
    description: "Once froze time for exactly 0.0001 seconds and won't let anyone forget it.",
    family: 'frozen-realms',
    spriteId: 'snow_slime'
  },
  {
    id: 'bolt_slime',
    name: 'Bolt Slime',
    elements: ['fire', 'wind'],
    rarityTier: 'Common',
    weight: 100,
    description: "Can power a small village for a week, but mostly just uses its energy to vibrate dramatically.",
    family: 'storm-forces',
    spriteId: 'bolt_slime'
  },
  {
    id: 'iron_slime',
    name: 'Iron Slime',
    elements: ['metal'],
    rarityTier: 'Common',
    weight: 100,
    description: "Surprisingly magnetic, often found covered in lost spoons and paperclips it never borrowed.",
    family: 'metal-forged',
    spriteId: 'iron_slime'
  },
  {
    id: 'glow_slime',
    name: 'Glow Slime',
    elements: ['light'],
    rarityTier: 'Common',
    weight: 100,
    description: "So bright it technically doesn't cast a shadow, which really confuses photographers.",
    family: 'cosmic-elements',
    spriteId: 'glow_slime'
  },
  {
    id: 'dark_slime',
    name: 'Dark Slime',
    elements: ['shadow'],
    rarityTier: 'Common',
    weight: 100,
    description: "Lives in the corners of your eyes.",
    family: 'cosmic-elements',
    spriteId: 'dark_slime'
  },
  {
    id: 'star_slime',
    name: 'Star Slime',
    elements: ['light', 'fire'],
    rarityTier: 'Common',
    weight: 100,
    description: "Once outshone the sun, but only because it was being particularly dramatic that day.",
    family: 'cosmic-elements',
    spriteId: 'star_slime'
  },
  {
    id: 'ooze_slime',
    name: 'Ooze Slime',
    elements: ['shadow', 'water'],
    rarityTier: 'Common',
    weight: 100,
    description: "Technically a puddle with commitment issues, but don't tell it that—it gets defensive.",
    family: 'cosmic-elements',
    spriteId: 'ooze_slime'
  },
  {
    id: 'gem_slime',
    name: 'Gem Slime',
    elements: ['ice', 'earth'],
    rarityTier: 'Common',
    weight: 100,
    description: "Doesn't rust, it just 'gains character' according to its dating profile.",
    family: 'frozen-realms',
    spriteId: 'gem_slime'
  },
  {
    id: 'lava_slime',
    name: 'Lava Slime',
    elements: ['water', 'fire'],
    rarityTier: 'Common',
    weight: 100,
    description: "Prefers sparkling water over still because 'the bubbles tickle its soul'.",
    family: 'elemental-foundations',
    spriteId: 'lava_slime'
  },
  {
    id: 'nature_slime',
    name: 'Nature Slime',
    elements: ['plant', 'earth'],
    rarityTier: 'Common',
    weight: 100,
    description: "Actually just a collection of sentient vines pretending to be a slime.",
    family: 'natures-garden',
    spriteId: 'nature_slime'
  },
  {
    id: 'rune_slime',
    name: 'Rune Slime',
    elements: ['electric', 'wind'],
    rarityTier: 'Common',
    weight: 100,
    description: "Claims to hear the thoughts of every toaster within a ten-mile radius.",
    family: 'cosmic-elements',
    spriteId: 'rune_slime'
  },
  {
    id: 'angel_slime',
    name: 'Angel Slime',
    elements: ['light', 'water'],
    rarityTier: 'Common',
    weight: 100,
    description: "Can turn invisible, but only when no one is looking at it.",
    family: 'cosmic-elements',
    spriteId: 'angel_slime'
  }
];

// 🍭 The Sweet Collection - Based on actual sprites
export const SWEET_SLIMES: CodexSlime[] = [
  {
    id: 'candy_slime',
    name: 'Candy Slime',
    elements: ['plant', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Leaves a trail of wrappers wherever it goes and swears it is not littering, it is decorating.",
    family: 'sweet-confections',
    spriteId: 'candy_slime'
  },
  {
    id: 'pudding_slime',
    name: 'Pudding Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Secretly dreams of becoming a professional dancer.",
    family: 'sweet-confections',
    spriteId: 'pudding_slime'
  },
  {
    id: 'berry_slime',
    name: 'Berry Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Is absolutely convinced it is a gourmet fruit, and stains everything it touches to prove it.",
    family: 'natures-garden',
    spriteId: 'berry_slime'
  },
  {
    id: 'mint_slime',
    name: 'Mint Slime',
    elements: ['plant', 'ice'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Its favorite hobby is judging your interior design choices.",
    family: 'sweet-confections',
    spriteId: 'mint_slime'
  },
  {
    id: 'caramel_slime',
    name: 'Caramel Slime',
    elements: ['water', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Once won a marathon by simply rolling downhill.",
    family: 'sweet-confections',
    spriteId: 'caramel_slime'
  },
  {
    id: 'cotton_candy_slime',
    name: 'Cotton Candy Slime',
    elements: ['wind', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Eighty percent air and one hundred percent fluff, and very sensitive about both.",
    family: 'sweet-confections',
    spriteId: 'cotton_candy_slime'
  },
  {
    id: 'donut_slime',
    name: 'Donut Slime',
    elements: ['earth', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Can sleep for three years without waking up, and often does.",
    family: 'sweet-confections',
    spriteId: 'donut_slime'
  },
  {
    id: 'soda_slime',
    name: 'Soda Slime',
    elements: ['water', 'electric'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Its sneezes sound exactly like a slide whistle.",
    family: 'sweet-confections',
    spriteId: 'soda_slime'
  },
  {
    id: 'steam_slime',
    name: 'Steam Slime',
    elements: ['fire', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "The primary reason why socks go missing in the dryer, though it denies everything.",
    family: 'elemental-foundations',
    spriteId: 'steam_slime'
  },
  {
    id: 'toffee_slime',
    name: 'Toffee Slime',
    elements: ['metal', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Sticks to your teeth, your hands and your decisions, and considers that a feature.",
    family: 'sweet-confections',
    spriteId: 'toffee_slime'
  },
  {
    id: 'honey_slime',
    name: 'Honey Slime',
    elements: ['plant', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Slow, sweet, and absolutely sure the bees owe it money.",
    family: 'sweet-confections',
    spriteId: 'honey_slime'
  },
  {
    id: 'chocolate_slime',
    name: 'Chocolate Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Secretly wishes it was a tropical fruit punch flavor.",
    family: 'sweet-confections',
    spriteId: 'chocolate_slime'
  },
  {
    id: 'gummybear_slime',
    name: 'Gummy Bear Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Bounces back from everything, and has been told that is not a personality.",
    family: 'sweet-confections',
    spriteId: 'gummybear_slime'
  }
];

// ⚡ The Storm Collection - Based on actual sprites
export const STORM_SLIMES: CodexSlime[] = [
  {
    id: 'volcano_slime',
    name: 'Volcano Slime',
    elements: ['water', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Claims to be the descendant of a supernova, but mostly just uses its heat to toast marshmallows.",
    family: 'elemental-foundations',
    spriteId: 'volcano_slime'
  },
  {
    id: 'tornado_slime',
    name: 'Tornado Slime',
    elements: ['wind', 'electric'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Can't stay still for more than five seconds without accidentally creating a small dust devil.",
    family: 'storm-forces',
    spriteId: 'tornado_slime'
  },
  {
    id: 'tsunami_slime',
    name: 'Tsunami Slime',
    elements: ['water', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Can mimic the sound of a bubbling brook, which it uses to trick hikers into falling into puddles.",
    family: 'aquatic-worlds',
    spriteId: 'tsunami_slime'
  },
  {
    id: 'earthquake_slime',
    name: 'Earthquake Slime',
    elements: ['earth', 'metal'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Technically heavier than it looks, often causing minor earthquakes when it hops excitedly.",
    family: 'metal-forged',
    spriteId: 'earthquake_slime'
  },
  {
    id: 'wildfire_slime',
    name: 'Wildfire Slime',
    elements: ['fire', 'plant'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Started as a campfire that was told \"just one more marshmallow\" and never stopped.",
    family: 'storm-forces',
    spriteId: 'wildfire_slime'
  },
  {
    id: 'blizzard_slime',
    name: 'Blizzard Slime',
    elements: ['ice', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Arrives uninvited, stays too long, and leaves everything slightly colder.",
    family: 'frozen-realms',
    spriteId: 'blizzard_slime'
  },
  {
    id: 'sandstorm_slime',
    name: 'Sandstorm Slime',
    elements: ['earth', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Wears goggles indoors and still finds sand in places it has never been.",
    family: 'storm-forces',
    spriteId: 'sandstorm_slime'
  },
  {
    id: 'solarflare_slime',
    name: 'Solar Flare Slime',
    elements: ['light', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Gets so excited it forgets to cool down, which is how the last three picnics ended.",
    family: 'storm-forces',
    spriteId: 'solarflare_slime'
  },
  {
    id: 'meteor_slime',
    name: 'Meteor Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Was once a lightning bolt that got stuck in a jar of jelly.",
    family: 'elemental-foundations',
    spriteId: 'meteor_slime'
  }
];

// 🌟 The Lost Collection - Based on actual sprites
export const LOST_SLIMES: CodexSlime[] = [
  {
    id: 'genesis_slime',
    name: 'Genesis Slime',
    elements: ['light', 'plant', 'earth', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "The slime that seeded the first forests, and still has the receipts to prove it.",
    family: 'ancient-mysteries',
    spriteId: 'genesis_slime'
  },
  {
    id: 'apocalypse_slime',
    name: 'Apocalypse Slime',
    elements: ['shadow', 'water', 'fire'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "Born from the heat of a dying world, and still bitter about the eviction notice.",
    family: 'ancient-mysteries',
    spriteId: 'apocalypse_slime'
  },
  {
    id: 'galaxy_whale_slime',
    name: 'Galaxy Whale Slime',
    elements: ['light', 'water', 'wind'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "So large it was once mistaken for a floating island, and it's still mad about the property taxes.",
    family: 'aquatic-worlds',
    spriteId: 'galaxy_whale_slime'
  },
  {
    id: 'mechagod_slime',
    name: 'Mecha God Slime',
    elements: ['metal', 'electric', 'light'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "A slime that replaced its body with perfect machinery, but kept the original warranty.",
    family: 'ancient-mysteries',
    spriteId: 'mechagod_slime'
  },
  {
    id: 'eldritch_slime',
    name: 'Eldritch Slime',
    elements: ['shadow', 'electric', 'wind'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "Even other slimes are afraid to look at it, which it finds terribly dramatic.",
    family: 'cosmic-elements',
    spriteId: 'eldritch_slime'
  },
  {
    id: 'yggdrasil_slime',
    name: 'Yggdrasil Slime',
    elements: ['plant', 'earth', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "Grows a miniature world on its back, and charges rent to the inhabitants.",
    family: 'ancient-mysteries',
    spriteId: 'yggdrasil_slime'
  },
  {
    id: 'star_eater_slime',
    name: 'Star Eater Slime',
    elements: ['shadow', 'light'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "It consumes light to grow stronger, which makes solar panels very nervous.",
    family: 'cosmic-elements',
    spriteId: 'star_eater_slime'
  },
  {
    id: 'harmoney_slime',
    name: 'Harmony Slime',
    elements: ['light', 'plant', 'wind', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "Its presence stops all nearby battles instantly, which makes it terrible at parties.",
    family: 'cosmic-elements',
    spriteId: 'harmoney_slime'
  },
  {
    id: 'pandora_slime',
    name: 'Pandora Slime',
    elements: ['shadow', 'electric', 'fire'],
    rarityTier: 'Legendary',
    weight: 1,
    description: "Looks like a chest, acts like a library, and does not lend anything out.",
    family: 'cosmic-elements',
    spriteId: 'pandora_slime'
  },
  {
    id: 'ice_crystal_slime',
    name: 'Ice Crystal Slime',
    elements: ['ice', 'earth', 'light'],
    rarityTier: 'Legendary',
    weight: 3,
    description: "A crystalline fusion that stores memories in its facets, like a cosmic USB drive.",
    family: 'frozen-realms',
    spriteId: 'ice_crystal_slime'
  }
];

// 🌍 The Nature Collection - Based on actual sprites
export const NATURE_SLIMES: CodexSlime[] = [
  {
    id: 'acidrain_slime',
    name: 'Acid Rain Slime',
    elements: ['shadow', 'water', 'earth'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Smells like a science fair and leaves a tiny hole in everything it loves.",
    family: 'storm-forces',
    spriteId: 'acidrain_slime'
  },
  {
    id: 'alpine_slime',
    name: 'Alpine Slime',
    elements: ['wind', 'ice'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Climbed one mountain once and has never let anyone forget the view.",
    family: 'frozen-realms',
    spriteId: 'alpine_slime'
  },
  {
    id: 'bamboo_slime',
    name: 'Bamboo Slime',
    elements: ['plant', 'metal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Grows two feet overnight, mostly out of spite.",
    family: 'metal-forged',
    spriteId: 'bamboo_slime'
  },
  {
    id: 'canyon_slime',
    name: 'Canyon Slime',
    elements: ['earth', 'water', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Collects rare pebbles and treats them like its own children.",
    family: 'frozen-realms',
    spriteId: 'canyon_slime'
  },
  {
    id: 'cave_slime',
    name: 'Cave Slime',
    elements: ['earth', 'shadow'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Actually quite cheerful, but its aesthetic demands that it remains 'edge-lordy' for the brand.",
    family: 'underground-depths',
    spriteId: 'cave_slime'
  },
  {
    id: 'coral_slime',
    name: 'Coral Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Wears a tiny reef as a hat and greets every passing fish as a guest.",
    family: 'aquatic-worlds',
    spriteId: 'coral_slime'
  },
  {
    id: 'desert_slime',
    name: 'Desert Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Has not seen rain in a thousand years and will not stop mentioning it.",
    family: 'underground-depths',
    spriteId: 'desert_slime'
  },
  {
    id: 'island_slime',
    name: 'Island Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Has its own beach, one palm tree, and a strict no-visitors policy.",
    family: 'aquatic-worlds',
    spriteId: 'island_slime'
  },
  {
    id: 'jungle_slime',
    name: 'Jungle Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "All leaves, vines and attitude, and it gets louder every time it rains.",
    family: 'natures-garden',
    spriteId: 'jungle_slime'
  },
  {
    id: 'mangrove_slime',
    name: 'Mangrove Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Keeps its roots in the mud and its opinions to itself, until you ask about the tide.",
    family: 'natures-garden',
    spriteId: 'mangrove_slime'
  },
  {
    id: 'meadow_slime',
    name: 'Meadow Slime',
    elements: ['plant', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Smells like a summer afternoon and, accordingly, is always asleep.",
    family: 'natures-garden',
    spriteId: 'meadow_slime'
  },
  {
    id: 'oasis_slime',
    name: 'Oasis Slime',
    elements: ['water', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Uses its own body to keep its owner's drinks cold.",
    family: 'natures-garden',
    spriteId: 'oasis_slime'
  },
  {
    id: 'rainforest_slime',
    name: 'Rainforest Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Rains on itself, indoors, as a matter of principle.",
    family: 'aquatic-worlds',
    spriteId: 'rainforest_slime'
  },
  {
    id: 'savanna_slime',
    name: 'Savanna Slime',
    elements: ['earth', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Whistles a tune that can only be heard by birds and very confused dogs.",
    family: 'underground-depths',
    spriteId: 'savanna_slime'
  },
  {
    id: 'swamp_slime',
    name: 'Swamp Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Collects mushrooms, grudges, and one very old boot.",
    family: 'aquatic-worlds',
    spriteId: 'swamp_slime'
  },
  {
    id: 'tundra_slime',
    name: 'Tundra Slime',
    elements: ['ice', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "So cold that even its shadow wears a scarf.",
    family: 'frozen-realms',
    spriteId: 'tundra_slime'
  }
];

// 🎈 Special Slimes - Based on actual sprites
export const SPECIAL_SLIMES: CodexSlime[] = [
  {
    id: 'balloon_slime',
    name: 'Balloon Slime',
    elements: ['wind', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "A floating fusion that proves joy makes you lighter than air.",
    family: 'odd-balls',
    spriteId: 'balloon_slime'
  },
  {
    id: 'crayon_slime',
    name: 'Crayon Slime',
    elements: ['earth', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "A colorful fusion that can draw dreams into reality, but mostly just doodles.",
    family: 'odd-balls',
    spriteId: 'crayon_slime'
  },
  {
    id: 'glitched_slime',
    name: 'Glitched Slime',
    elements: ['shadow', 'electric'],
    rarityTier: 'Rare',
    weight: 25,
    description: "A flickering error in reality that exists between the code and the world.",
    family: 'cosmic-elements',
    spriteId: 'glitched_slime'
  }
];

// 🧩 Coverage Slimes - fill element-pair gaps so every parent combination has outcomes
export const COVERAGE_SLIMES: CodexSlime[] = [
  {
    id: 'chime_slime',
    name: 'Chime Slime',
    elements: ['metal', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Hums a different note every time it is startled, which is often, and it blames the breeze every time.",
    family: 'metal-forged',
    spriteId: 'chime_slime'
  },
  {
    id: 'frostbolt_slime',
    name: 'Frostbolt Slime',
    elements: ['electric', 'ice'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Gives static shocks that arrive pre-frozen, so you feel them a full minute later.",
    family: 'frozen-realms',
    spriteId: 'frostbolt_slime'
  },
  {
    id: 'rust_slime',
    name: 'Rust Slime',
    elements: ['metal', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Carries its own umbrella and still somehow always ends up the soggiest in the room.",
    family: 'metal-forged',
    spriteId: 'rust_slime'
  },
  {
    id: 'nightshade_slime',
    name: 'Nightshade Slime',
    elements: ['plant', 'shadow'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Looks delicious and knows it, which is the entire point.",
    family: 'natures-garden',
    spriteId: 'nightshade_slime'
  },
  {
    id: 'geode_spark_slime',
    name: 'Geode Spark Slime',
    elements: ['earth', 'electric'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Cracked itself open once to show off and has been too embarrassed to close back up.",
    family: 'underground-depths',
    spriteId: 'geode_spark_slime'
  },
  {
    id: 'spark_slime',
    name: 'Spark Slime',
    elements: ['electric'],
    rarityTier: 'Common',
    weight: 100,
    description: "Cannot be hugged without a small, offended zap, and has never once apologized for it.",
    family: 'storm-forces',
    spriteId: 'spark_slime'
  },
  {
    id: 'cinderfrost_slime',
    name: 'Cinderfrost Slime',
    elements: ['fire', 'ice'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Argues with itself constantly about whether the room is too hot or too cold, and both sides lose.",
    family: 'frozen-realms',
    spriteId: 'cinderfrost_slime'
  },
  {
    id: 'voltfire_slime',
    name: 'Voltfire Slime',
    elements: ['electric', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Gets overexcited at the smallest things, and anything nearby tends to catch fire as a result.",
    family: 'storm-forces',
    spriteId: 'voltfire_slime'
  },
  {
    id: 'cinder_wraith_slime',
    name: 'Cinder Wraith Slime',
    elements: ['fire', 'shadow'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Holds the record for most dramatic entrance, mostly because it hovers in a doorway until someone notices.",
    family: 'cosmic-elements',
    spriteId: 'cinder_wraith_slime'
  },
  {
    id: 'slush_slime',
    name: 'Slush Slime',
    elements: ['ice', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Cannot decide whether it is a liquid or a solid and is deeply sensitive about being asked.",
    family: 'frozen-realms',
    spriteId: 'slush_slime'
  },
  {
    id: 'sprout_spark_slime',
    name: 'Sprout Spark Slime',
    elements: ['electric', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Grows an inch every time it gets startled, and it startles at everything.",
    family: 'natures-garden',
    spriteId: 'sprout_spark_slime'
  },
  {
    id: 'phantom_gust_slime',
    name: 'Phantom Gust Slime',
    elements: ['shadow', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Slips through keyholes just to rearrange the furniture, then slips out again without a word.",
    family: 'cosmic-elements',
    spriteId: 'phantom_gust_slime'
  },
  {
    id: 'frostplate_slime',
    name: 'Frostplate Slime',
    elements: ['ice', 'metal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Wears armor it does not need, because it saw a knight do it once and thought it looked important.",
    family: 'frozen-realms',
    spriteId: 'frostplate_slime'
  },
  {
    id: 'glacier_gleam_slime',
    name: 'Glacier Gleam Slime',
    elements: ['ice', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Spends the whole day trying to catch its own reflection and is always one blink too slow.",
    family: 'frozen-realms',
    spriteId: 'glacier_gleam_slime'
  },
  {
    id: 'umbra_frost_slime',
    name: 'Umbra Frost Slime',
    elements: ['ice', 'shadow'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Gets noticeably colder whenever someone says it looks spiky, which is how you can tell it likes the attention.",
    family: 'frozen-realms',
    spriteId: 'umbra_frost_slime'
  },
  {
    id: 'cinderheart_slime',
    name: 'Cinderheart Slime',
    elements: ['fire', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Hides a warm little flame inside a pile of rubble and acts shocked when you find it.",
    family: 'elemental-foundations',
    spriteId: 'cinderheart_slime'
  },
  {
    id: 'aurora_slime',
    name: 'Aurora Slime',
    elements: ['electric', 'light'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Drifts through the air like a jellyfish and refuses to confirm it is not one.",
    family: 'cosmic-elements',
    spriteId: 'aurora_slime'
  },
  {
    id: 'dynamo_slime',
    name: 'Dynamo Slime',
    elements: ['electric', 'metal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Runs on pure enthusiasm and a suspicious amount of copper wire, and has never once been switched off.",
    family: 'metal-forged',
    spriteId: 'dynamo_slime'
  },
  {
    id: 'chrome_slime',
    name: 'Chrome Slime',
    elements: ['light', 'metal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: "Cannot walk past a puddle without checking its own reflection, and has never once been disappointed.",
    family: 'metal-forged',
    spriteId: 'chrome_slime'
  },
  {
    id: 'blightsteel_slime',
    name: 'Blightsteel Slime',
    elements: ['metal', 'shadow'],
    rarityTier: 'Rare',
    weight: 25,
    description: "Wears a stolen helmet two sizes too big and glares from under it like that was the plan all along.",
    family: 'metal-forged',
    spriteId: 'blightsteel_slime'
  }
];

// Combine all slimes for easy access
export const ALL_CODEX_SLIMES: CodexSlime[] = [
  ...PRIMAL_SLIMES,
  ...SWEET_SLIMES,
  ...STORM_SLIMES,
  ...NATURE_SLIMES,
  ...LOST_SLIMES,
  ...SPECIAL_SLIMES,
  ...COVERAGE_SLIMES
];

// Create lookup map for quick access
export const SLIME_CODEX_MAP = new Map<string, CodexSlime>(
  ALL_CODEX_SLIMES.map(slime => [slime.id, slime])
);

const CODEX_BY_NAME = new Map<string, CodexSlime>(ALL_CODEX_SLIMES.map(slime => [slime.name, slime]));

// Resolve the codex species for any slime. Bred slimes have a unique `id`, so prefer codexId,
// then id, then fall back to the species name (covers saves made before codexId existed).
export function getCodexSlime(slime: { id: string; name: string; codexId?: string }): CodexSlime | undefined {
  return (slime.codexId && SLIME_CODEX_MAP.get(slime.codexId))
    || SLIME_CODEX_MAP.get(slime.id)
    || CODEX_BY_NAME.get(slime.name);
}
