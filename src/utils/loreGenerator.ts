import { Slime, SlimeElement } from '@/types/slime';
import { ELEMENT_DISPLAY_NAMES } from '@/data/traitData';

const TONES = ['silly', 'funny', 'serious', 'cringe', 'badass'];

const ELEMENT_LORE: Record<SlimeElement, string[]> = {
  fire: [
    "Once accidentally set a merchant's beard on fire just by sneezing.",
    "Claims to be the descendant of a supernova, but mostly just uses its heat to toast marshmallows.",
    "This spirit was born from the first ember of a dying campfire.",
    "Legend says it can melt through solid steel, but it refuses to melt through a locked refrigerator door.",
  ],
  water: [
    "Can mimic the sound of a bubbling brook, which it uses to trick hikers into falling into puddles.",
    "Prefers sparkling water over still because 'the bubbles tickle its soul'.",
    "Born from a single tear shed by a cloud that lost its way.",
    "Is 99% water and 1% pure, unadulterated sass.",
  ],
  plant: [
    "Has a symbiotic relationship with a specific type of moss that only grows on Tuesdays.",
    "Thinks it's a mighty oak, despite being roughly the size of a cabbage.",
    "Actually just a collection of sentient vines pretending to be a slime.",
    "Spends most of its time trying to photosynthesize under moonlight because 'it's more aesthetic'.",
  ],
  earth: [
    "Is technically heavier than it looks, often causing minor localized earthquakes when it hops.",
    "Collects rare pebbles and treats them like its own children.",
    "Formed over a thousand years from the dust of a forgotten mountain.",
    "Once won a staring contest against a literal boulder. It took three years.",
  ],
  wind: [
    "Whistles a tune that can only be heard by birds and very confused dogs.",
    "Is constantly worried it's going to drift away, so it carries a heavy heart (literally).",
    "A fragment of a hurricane that decided it wanted to settle down and be cozy.",
    "Can't stay still for more than five seconds without accidentally creating a small dust devil.",
  ],
  ice: [
    "Is so cold that it once froze time for exactly 0.0001 seconds.",
    "Secretly wishes it was a tropical fruit punch flavor.",
    "Born in the heart of a glacier that had a particularly vivid dream.",
    "Uses its own body to keep its owner's drinks cold. A true hero.",
  ],
  electric: [
    "Can power a small village for a week, but mostly just uses its energy to vibrate rapidly.",
    "Is the primary cause of static shock in the forest.",
    "Was once a lightning bolt that got stuck in a jar of jelly.",
    "Claims to hear the thoughts of every toaster within a ten-mile radius.",
  ],
  metal: [
    "Is surprisingly magnetic, often found covered in lost spoons and paperclips.",
    "Forged in the heart of a falling star that hit a blacksmith's shop.",
    "Does not rust, it just 'gains character'.",
    "Its internal organs are actually just a very complex set of clockwork gears.",
  ],
  light: [
    "Is so bright that it technically doesn't have a shadow.",
    "Once outshone the sun, but only because it was being particularly dramatic that day.",
    "A physical manifestation of a 'good idea' that was never acted upon.",
    "Can turn invisible, but only when no one is looking at it.",
  ],
  shadow: [
    "Lives in the corners of your eyes. Yes, right now.",
    "Is actually quite cheerful, but its aesthetic demands that it remains 'edge-lordy'.",
    "Born from the shadow of a shadow.",
    "Secretly afraid of the dark, which is quite an identity crisis.",
  ],
  };

const TRIVIA_FRAGMENTS = [
  "Can eat its own weight in pixels every hour.",
  "Secretly dreams of becoming a professional dancer.",
  "Is the only slime that can't be seen by cats.",
  "Its favorite hobby is judging your interior design choices.",
  "Once won a marathon by simply rolling downhill.",
  "Is technically a fruit, but don't try to eat it.",
  "Can sleep for three years without waking up.",
  "Its sneezes sound exactly like a slide whistle.",
  "Is the primary reason why socks go missing in the dryer.",
  "Can speak 14 languages, all of them dead.",
];

export function generateSlimeLore(slime: Slime): string {
  // Use slime.id as seed for deterministic lore
  const seed = slime.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const element = slime.elements[0];
  const elementLoreList = ELEMENT_LORE[element] || ELEMENT_LORE['plant'];
  
  const loreIdx = seed % elementLoreList.length;
  const triviaIdx = (seed * 7) % TRIVIA_FRAGMENTS.length;
  
  const mainLore = elementLoreList[loreIdx];
  const trivia = TRIVIA_FRAGMENTS[triviaIdx];
  
  // Choose a tone based on rarity
  let toneText = "";
  if (slime.rarityStars >= 6) {
    toneText = "This ancient being emanates a terrifyingly cool aura.";
  } else if (slime.rarityStars >= 4) {
    toneText = "A spirit of great renown, though it has some... quirks.";
  } else {
    toneText = "A humble but spirited companion.";
  }

  return `${toneText} ${mainLore} Cool Trivia: ${trivia}`;
}
