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
    description: 'Thinks it invented fire, but actually just discovered it. It carries the warmth of the first sunrise from the Crystal Peaks, where ancient forges still burn.',
    family: 'elemental-foundations',
    spriteId: 'fire_slime'
  },
  {
    id: 'water_slime',
    name: 'Water Slime',
    elements: ['water'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Claims to be 99% water and 1% existential dread. It remembers the currents that once flowed through the Sunken Harbor before the waters turned dark.',
    family: 'aquatic-worlds',
    spriteId: 'water_slime'
  },
  {
    id: 'leaf_slime',
    name: 'Leaf Slime',
    elements: ['plant'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Secretly believes it\'s a mighty oak, despite being cabbage-sized. It guards the seeds of the Forgotten Garden, where flowers bloom in colors that no longer exist.',
    family: 'natures-garden',
    spriteId: 'leaf_slime'
  },
  {
    id: 'rock_slime',
    name: 'Rock Slime',
    elements: ['earth'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Takes three years to win a staring contest against a boulder. It knows where the ancient pillars of the Deep Mines still stand, waiting for someone strong enough to restore them.',
    family: 'elemental-foundations',
    spriteId: 'rock_slime'
  },
  {
    id: 'wind_slime',
    name: 'Wind Slime',
    elements: ['wind'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Carries a heavy heart (literally) to avoid drifting away. It whispers warnings through the winds of the Whispering Peaks, where ancient secrets still travel on the breeze.',
    family: 'elemental-foundations',
    spriteId: 'wind_slime'
  },
  {
    id: 'snow_slime',
    name: 'Snow Slime',
    elements: ['ice'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Once froze time for exactly 0.0001 seconds and won\'t let anyone forget it. It preserves the echoes of laughter from the Frozen Peaks, where festivals still echo through eternal winter.',
    family: 'frozen-realms',
    spriteId: 'snow_slime'
  },
  {
    id: 'bolt_slime',
    name: 'Bolt Slime',
    elements: ['fire', 'wind'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Can power a small village for a week, but mostly just uses its energy to vibrate dramatically. It remembers the Storm Sanctuaries of the Thunder Peaks, where weather itself was once harnessed as a weapon.',
    family: 'storm-forces',
    spriteId: 'bolt_slime'
  },
  {
    id: 'iron_slime',
    name: 'Iron Slime',
    elements: ['metal'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Surprisingly magnetic, often found covered in lost spoons and paperclips it never borrowed. Its internal organs are actually just a very complex set of clockwork gears from the Iron Foundry.',
    family: 'metal-forged',
    spriteId: 'iron_slime'
  },
  {
    id: 'glow_slime',
    name: 'Glow Slime',
    elements: ['light'],
    rarityTier: 'Common',
    weight: 100,
    description: 'So bright it technically doesn\'t cast a shadow, which really confuses photographers. It remembers the Lighthouse Sanctuaries of the Crystal Coast, where lost Forgers once found their way home through impossible storms.',
    family: 'cosmic-elements',
    spriteId: 'glow_slime'
  },
  {
    id: 'dark_slime',
    name: 'Dark Slime',
    elements: ['shadow'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Lives in the corners of your eyes. Yes, right now. It guards the hidden libraries beneath the Forgotten Castle, where secrets are kept in shadows that even light cannot reach.',
    family: 'cosmic-elements',
    spriteId: 'dark_slime'
  },
  {
    id: 'star_slime',
    name: 'Star Slime',
    elements: ['light', 'fire'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Once outshone the sun, but only because it was being particularly dramatic that day. It remembers the Observatory Sanctuaries of the Starlight Peaks, where futures were once read in constellations.',
    family: 'cosmic-elements',
    spriteId: 'star_slime'
  },
  {
    id: 'ooze_slime',
    name: 'Ooze Slime',
    elements: ['shadow', 'water'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Technically a puddle with commitment issues, but don\'t tell it that—it gets defensive. It remembers the Alchemy Sanctuaries of the Shadow Marsh, where potions once tasted both bitter and sweet.',
    family: 'cosmic-elements',
    spriteId: 'ooze_slime'
  },
  {
    id: 'gem_slime',
    name: 'Gem Slime',
    elements: ['ice', 'earth'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Doesn\'t rust, it just \'gains character\' according to its dating profile. It remembers the Crystal Sanctuaries of the Geode Caves, where memories were once stored in facets.',
    family: 'frozen-realms',
    spriteId: 'gem_slime'
  },
  {
    id: 'lava_slime',
    name: 'Lava Slime',
    elements: ['water', 'fire'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Prefers sparkling water over still because \'the bubbles tickle its soul\'. It remembers the Volcanic Sanctuaries of the Fire Peaks, where creation once rose from destruction.',
    family: 'elemental-foundations',
    spriteId: 'lava_slime'
  },
  {
    id: 'nature_slime',
    name: 'Nature Slime',
    elements: ['plant', 'earth'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Actually just a collection of sentient vines pretending to be a slime. It remembers the Great Gardens of the Verdant Valley, where plants and fungi once communicated through light.',
    family: 'natures-garden',
    spriteId: 'nature_slime'
  },
  {
    id: 'rune_slime',
    name: 'Rune Slime',
    elements: ['electric', 'wind'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Claims to hear the thoughts of every toaster within a ten-mile radius. It remembers the Library Sanctuaries of the Rune Towers, where words once had the power to shape reality.',
    family: 'cosmic-elements',
    spriteId: 'rune_slime'
  },
  {
    id: 'angel_slime',
    name: 'Angel Slime',
    elements: ['light', 'water'],
    rarityTier: 'Common',
    weight: 100,
    description: 'Can turn invisible, but only when no one is looking at it. It remembers the Angel Sanctuaries of the Celestial Peaks, where prayers once had the power to reshape reality.',
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
    description: 'Once accidentally set a merchant\'s beard on fire just by sneezing. It remembers the Festival Sanctuaries of the Sweet Valley, where celebrations once lasted for weeks.',
    family: 'sweet-confections',
    spriteId: 'candy_slime'
  },
  {
    id: 'pudding_slime',
    name: 'Pudding Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Secretly dreams of becoming a professional dancer. It remembers the Comfort Sanctuaries of the Creamy Hills, where desserts once healed broken hearts.',
    family: 'sweet-confections',
    spriteId: 'pudding_slime'
  },
  {
    id: 'berry_slime',
    name: 'Berry Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'The only slime that can\'t be seen by cats, and it\'s very proud of this accomplishment. It remembers the Orchard Sanctuaries of the Berry Fields, where fruits once stored memories.',
    family: 'natures-garden',
    spriteId: 'berry_slime'
  },
  {
    id: 'mint_slime',
    name: 'Mint Slime',
    elements: ['plant', 'ice'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Its favorite hobby is judging your interior design choices. It remembers the Garden Sanctuaries of the Mint Meadows, where herbs once cleared troubled minds.',
    family: 'sweet-confections',
    spriteId: 'mint_slime'
  },
  {
    id: 'caramel_slime',
    name: 'Caramel Slime',
    elements: ['water', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Once won a marathon by simply rolling downhill. It remembers the Kitchen Sanctuaries of the Caramel Caverns, where patience was once the secret ingredient.',
    family: 'sweet-confections',
    spriteId: 'caramel_slime'
  },
  {
    id: 'cotton_candy_slime',
    name: 'Cotton Candy Slime',
    elements: ['wind', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Technically a fruit, but don\'t try to eat it—it gets very defensive about its botanical classification. It remembers the Carnival Sanctuaries of the Sugar Plains, where laughter once floated on the wind.',
    family: 'sweet-confections',
    spriteId: 'cotton_candy_slime'
  },
  {
    id: 'donut_slime',
    name: 'Donut Slime',
    elements: ['earth', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Can sleep for three years without waking up, and often does. It remembers the Bakery Sanctuaries of the Doughnut District, where circles once represented completeness.',
    family: 'sweet-confections',
    spriteId: 'donut_slime'
  },
  {
    id: 'soda_slime',
    name: 'Soda Slime',
    elements: ['water', 'electric'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Its sneezes sound exactly like a slide whistle. It remembers the Fountain Sanctuaries of the Soda Springs, where enthusiasm once flowed like water.',
    family: 'sweet-confections',
    spriteId: 'soda_slime'
  },
  {
    id: 'steam_slime',
    name: 'Steam Slime',
    elements: ['fire', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'The primary reason why socks go missing in the dryer, though it denies everything. It remembers the Spa Sanctuaries of the Steam Valley, where warmth once healed weary souls.',
    family: 'elemental-foundations',
    spriteId: 'steam_slime'
  },
  {
    id: 'toffee_slime',
    name: 'Toffee Slime',
    elements: ['metal', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Can speak 14 languages, all of them dead. It remembers the Confectionery Sanctuaries of the Toffee Towers, where sweetness once withstood pressure.',
    family: 'sweet-confections',
    spriteId: 'toffee_slime'
  },
  {
    id: 'honey_slime',
    name: 'Honey Slime',
    elements: ['plant', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Born from a single tear shed by a cloud that lost its way. It remembers the Hive Sanctuaries of the Golden Hives, where sunshine was once stored in jars.',
    family: 'sweet-confections',
    spriteId: 'honey_slime'
  },
  {
    id: 'chocolate_slime',
    name: 'Chocolate Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Secretly wishes it was a tropical fruit punch flavor. It remembers the Cacao Sanctuaries of the Chocolate Mountains, where darkness once created the richest flavors.',
    family: 'sweet-confections',
    spriteId: 'chocolate_slime'
  },
  {
    id: 'gummybear_slime',
    name: 'Gummy Bear Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Can eat its own weight in pixels every hour. It remembers the Candy Sanctuaries of the Gummy Grove, where happiness once bounced back from pressure.',
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
    description: 'Claims to be the descendant of a supernova, but mostly just uses its heat to toast marshmallows. It remembers the Volcanic Sanctuaries of the Fire Mountains, where land was once forged from destruction.',
    family: 'elemental-foundations',
    spriteId: 'volcano_slime'
  },
  {
    id: 'tornado_slime',
    name: 'Tornado Slime',
    elements: ['wind', 'electric'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'Can\'t stay still for more than five seconds without accidentally creating a small dust devil. It remembers the Storm Sanctuaries of the Windy Plains, where futures were once read in chaos.',
    family: 'storm-forces',
    spriteId: 'tornado_slime'
  },
  {
    id: 'tsunami_slime',
    name: 'Tsunami Slime',
    elements: ['water', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'Can mimic the sound of a bubbling brook, which it uses to trick hikers into falling into puddles. It remembers the Ocean Sanctuaries of the Deep Trench, where waves once cleansed stained souls.',
    family: 'aquatic-worlds',
    spriteId: 'tsunami_slime'
  },
  {
    id: 'earthquake_slime',
    name: 'Earthquake Slime',
    elements: ['earth', 'metal'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'Technically heavier than it looks, often causing minor earthquakes when it hops excitedly. It remembers the Forge Sanctuaries of the Shifting Ground, where foundations were once rebuilt from rubble.',
    family: 'metal-forged',
    spriteId: 'earthquake_slime'
  },
  {
    id: 'wildfire_slime',
    name: 'Wildfire Slime',
    elements: ['fire', 'plant'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'Has a symbiotic relationship with a specific type of moss that only grows on Tuesdays. It remembers the Forest Sanctuaries of the Burning Woods, where endings once became beginnings.',
    family: 'storm-forces',
    spriteId: 'wildfire_slime'
  },
  {
    id: 'blizzard_slime',
    name: 'Blizzard Slime',
    elements: ['ice', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'Spends most of its time trying to photosynthesize under moonlight because \'it\'s more aesthetic\'. It remembers the Arctic Sanctuaries of the Ice Wastes, where knowledge was once frozen in time.',
    family: 'frozen-realms',
    spriteId: 'blizzard_slime'
  },
  {
    id: 'sandstorm_slime',
    name: 'Sandstorm Slime',
    elements: ['earth', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A fragment of a hurricane that decided it wanted to settle down and be cozy. It remembers the Desert Sanctuaries of the Sandy Wastes, where winds once uncovered buried cities.',
    family: 'storm-forces',
    spriteId: 'sandstorm_slime'
  },
  {
    id: 'solarflare_slime',
    name: 'Solar Flare Slime',
    elements: ['light', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A physical manifestation of a \'good idea\' that was never acted upon. It remembers the Solar Sanctuaries of the Sun Peaks, where star-fire once powered cities of light.',
    family: 'storm-forces',
    spriteId: 'solarflare_slime'
  },
  {
    id: 'meteor_slime',
    name: 'Meteor Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'Was once a lightning bolt that got stuck in a jar of jelly. It remembers the Star Sanctuaries of the Cosmic Falls, where visitors once fell from the sky bearing gifts.',
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
    description: 'The slime that seeded the first forests, and still has the receipts to prove it. It remembers when the earth was barren and empty, and it knows Voss fears true creation more than anything.',
    family: 'ancient-mysteries',
    spriteId: 'genesis_slime'
  },
  {
    id: 'apocalypse_slime',
    name: 'Apocalypse Slime',
    elements: ['shadow', 'water', 'fire'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Born from the heat of a dying world, and still bitter about the eviction notice. It carries the memory of every civilization that chose extraction over creation, and it knows Voss is making the same mistakes.',
    family: 'ancient-mysteries',
    spriteId: 'apocalypse_slime'
  },
  {
    id: 'galaxy_whale_slime',
    name: 'Galaxy Whale Slime',
    elements: ['light', 'water', 'wind'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'So large it was once mistaken for a floating island, and it\'s still mad about the property taxes. It swims between stars carrying memories of worlds that have been and might be, proving Voss\'s machines are laughably small.',
    family: 'aquatic-worlds',
    spriteId: 'galaxy_whale_slime'
  },
  {
    id: 'mechagod_slime',
    name: 'Mecha God Slime',
    elements: ['metal', 'electric', 'light'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'A slime that replaced its body with perfect machinery, but kept the original warranty. It chose transcendence over limitation and knows Voss seeks its secrets without understanding why some things should never be mechanized.',
    family: 'ancient-mysteries',
    spriteId: 'mechagod_slime'
  },
  {
    id: 'eldritch_slime',
    name: 'Eldritch Slime',
    elements: ['shadow', 'electric', 'wind'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Even other slimes are afraid to look at it, which it finds terribly dramatic. It emerged from the first question that should never have been asked and carries knowledge that breaks minds as easily as it opens them.',
    family: 'cosmic-elements',
    spriteId: 'eldritch_slime'
  },
  {
    id: 'yggdrasil_slime',
    name: 'Yggdrasil Slime',
    elements: ['plant', 'earth', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'It grows a miniature world on its back, and charges rent to the inhabitants. It\'s the living heart of the world tree that Voss seeks to sever, remembering when nine worlds were one.',
    family: 'ancient-mysteries',
    spriteId: 'yggdrasil_slime'
  },
  {
    id: 'star_eater_slime',
    name: 'Star Eater Slime',
    elements: ['shadow', 'light'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'It consumes light to grow stronger, which makes solar panels very nervous. It embodies the cosmic paradox that darkness is created by consuming light, proving Voss\'s shadows are born from the light he fears.',
    family: 'cosmic-elements',
    spriteId: 'star_eater_slime'
  },
  {
    id: 'harmoney_slime',
    name: 'Harmony Slime',
    elements: ['light', 'plant', 'wind', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Its presence stops all nearby battles instantly, which makes it terrible at parties. It remembers the Golden Age when all elements worked together, and reminds Voss of the peace he threw away for power.',
    family: 'cosmic-elements',
    spriteId: 'harmoney_slime'
  },
  {
    id: 'pandora_slime',
    name: 'Pandora Slime',
    elements: ['shadow', 'electric', 'fire'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'A slime that contains all of the world\'s curiosities, and the receipts to prove it. It remembers the first Library of All Things where some questions were more valuable than their answers.',
    family: 'cosmic-elements',
    spriteId: 'pandora_slime'
  },
  {
    id: 'ice_crystal_slime',
    name: 'Ice Crystal Slime',
    elements: ['ice', 'earth', 'light'],
    rarityTier: 'Legendary',
    weight: 3,
    description: 'A crystalline fusion that stores memories in its facets, like a cosmic USB drive. It remembers the Great Library that Voss burned and carries the last remnants that could expose his true origins.',
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
    description: 'Born from the shadow of a shadow, which is quite an identity crisis. It remembers the Cleansing Sanctuaries of the Toxic Falls, where purification once required pain.',
    family: 'storm-forces',
    spriteId: 'acidrain_slime'
  },
  {
    id: 'alpine_slime',
    name: 'Alpine Slime',
    elements: ['wind', 'ice'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Constantly worried it\'s going to drift away, so it carries a heavy heart (literally). It remembers the Alpine Sanctuaries of the Frost Peaks, where winds once carried ancient wisdom.',
    family: 'frozen-realms',
    spriteId: 'alpine_slime'
  },
  {
    id: 'bamboo_slime',
    name: 'Bamboo Slime',
    elements: ['plant', 'metal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Thinks it\'s a mighty oak, despite being roughly the size of a cabbage. It remembers the Forest Sanctuaries of the Bamboo Grove, where homes once grew with their inhabitants.',
    family: 'metal-forged',
    spriteId: 'bamboo_slime'
  },
  {
    id: 'canyon_slime',
    name: 'Canyon Slime',
    elements: ['earth', 'water', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Collects rare pebbles and treats them like its own children. It remembers the Canyon Sanctuaries of the Deep Gorges, where history was once written in stone.',
    family: 'frozen-realms',
    spriteId: 'canyon_slime'
  },
  {
    id: 'cave_slime',
    name: 'Cave Slime',
    elements: ['earth', 'shadow'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Actually quite cheerful, but its aesthetic demands that it remains \'edge-lordy\' for the brand. It remembers the Underground Sanctuaries of the Dark Depths, where treasures once hid in shadows.',
    family: 'underground-depths',
    spriteId: 'cave_slime'
  },
  {
    id: 'coral_slime',
    name: 'Coral Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Secretly afraid of the dark, which is quite an identity crisis. It remembers the Reef Sanctuaries of the Coral Gardens, where cities once built themselves together.',
    family: 'aquatic-worlds',
    spriteId: 'coral_slime'
  },
  {
    id: 'desert_slime',
    name: 'Desert Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Formed over a thousand years from the dust of a forgotten mountain. It remembers the Desert Sanctuaries of the Sand Dunes, where life once thrived in scarcity.',
    family: 'underground-depths',
    spriteId: 'desert_slime'
  },
  {
    id: 'island_slime',
    name: 'Island Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Forged in the heart of a falling star that hit a blacksmith\'s shop. It remembers the Island Sanctuaries of the Lonely Isles, where uniqueness once created strength.',
    family: 'aquatic-worlds',
    spriteId: 'island_slime'
  },
  {
    id: 'jungle_slime',
    name: 'Jungle Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Ninety-nine percent water and one percent pure, unadulterated sass. It remembers the Jungle Sanctuaries of the Dense Canopy, where plants once supported each other.',
    family: 'natures-garden',
    spriteId: 'jungle_slime'
  },
  {
    id: 'mangrove_slime',
    name: 'Mangrove Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'This spirit was born from the first ember of a dying campfire. It remembers the Coastal Sanctuaries of the Tidal Zones, where life once thrived between worlds.',
    family: 'natures-garden',
    spriteId: 'mangrove_slime'
  },
  {
    id: 'meadow_slime',
    name: 'Meadow Slime',
    elements: ['plant', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Legend says it can melt through solid steel, but it refuses to melt through a locked refrigerator door. It remembers the Meadow Sanctuaries of the Flower Fields, where peace once bloomed in diversity.',
    family: 'natures-garden',
    spriteId: 'meadow_slime'
  },
  {
    id: 'oasis_slime',
    name: 'Oasis Slime',
    elements: ['water', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Uses its own body to keep its owner\'s drinks cold. A true hero. It remembers the Desert Sanctuaries of the Hidden Springs, where hope once created reality.',
    family: 'natures-garden',
    spriteId: 'oasis_slime'
  },
  {
    id: 'rainforest_slime',
    name: 'Rainforest Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Born in the heart of a glacier that had a particularly vivid dream. It remembers the Great Sanctuaries of the Emerald Canopy, where every plant once contributed to planetary health.',
    family: 'aquatic-worlds',
    spriteId: 'rainforest_slime'
  },
  {
    id: 'savanna_slime',
    name: 'Savanna Slime',
    elements: ['earth', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'Whistles a tune that can only be heard by birds and very confused dogs. It remembers the Grassland Sanctuaries of the Golden Plains, where seasons once taught adaptation.',
    family: 'underground-depths',
    spriteId: 'savanna_slime'
  },
  {
    id: 'swamp_slime',
    name: 'Swamp Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'The primary cause of static shock in the forest, though it blames the squirrels. It remembers the Wetland Sanctuaries of the Murky Marsh, where endings once became beginnings.',
    family: 'aquatic-worlds',
    spriteId: 'swamp_slime'
  },
  {
    id: 'tundra_slime',
    name: 'Tundra Slime',
    elements: ['ice', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'So cold it once froze time for exactly 0.0001 seconds, and it still brags about it. It remembers the Arctic Sanctuaries of the Frozen Wastes, where winter once guarded spring\'s possibilities.',
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
    description: 'A floating fusion that proves joy makes you lighter than air. It formed from the first laugh that learned to float, showing Voss that the lightest things in life are the hardest to capture in machines.',
    family: 'odd-balls',
    spriteId: 'balloon_slime'
  },
  {
    id: 'crayon_slime',
    name: 'Crayon Slime',
    elements: ['earth', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A colorful fusion that can draw dreams into reality, but mostly just doodles. It emerged from the first crayon that learned imagination could change the world as much as any machine.',
    family: 'odd-balls',
    spriteId: 'crayon_slime'
  },
  {
    id: 'glitched_slime',
    name: 'Glitched Slime',
    elements: ['shadow', 'electric'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A flickering error in reality that exists between the code and the world. Glim warns that this is the only creature Voss truly fears, as its chaos cannot be programmed.',
    family: 'cosmic-elements',
    spriteId: 'glitched_slime'
  }
];

// Combine all slimes for easy access
export const ALL_CODEX_SLIMES: CodexSlime[] = [
  ...PRIMAL_SLIMES,
  ...SWEET_SLIMES,
  ...STORM_SLIMES,
  ...NATURE_SLIMES,
  ...LOST_SLIMES,
  ...SPECIAL_SLIMES
];

// Create lookup map for quick access
export const SLIME_CODEX_MAP = new Map<string, CodexSlime>(
  ALL_CODEX_SLIMES.map(slime => [slime.id, slime])
);
