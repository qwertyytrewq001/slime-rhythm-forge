# Painted thought-bubble icons for slime behaviour

The game already has painted bubbles for: calm, happy (heart), curious (?), lonely, sleep, gift.
Right now eating, startled, dizzy, excited, hungry and a few more reuse those. These prompts make the missing ones.

Use the same recipe as the other sheets: ask for a flat magenta background (#FF00FF) so I can cut them out.
Send me the images and I will cut them to 256px, save them in `public/sanctuary/`, and wire them in.

## Prompt A: one sheet with all 8 (try this first)

> A sheet of 8 small video-game thought-bubble icons, 4 across and 2 down, evenly spaced, on a flat solid magenta (#FF00FF) background with nothing else. Every icon is the SAME style: a cream parchment speech bubble with a rounded body and a small tail at the bottom left, a thick dark purple-brown outline, soft painted shading, a faint inner glow, and one painted symbol in the middle. Hand-painted storybook look like a cozy fantasy creature-collector game, clean edges, no text, no letters, no drop shadow on the background. The 8 symbols, left to right, top row then bottom row:
> 1. a happy open mouth taking a bite with two tiny crumbs flying off (eating)
> 2. a bold red-orange exclamation mark with three small shock lines around it (startled)
> 3. a spiral with three small yellow stars circling it (dizzy)
> 4. an empty round wooden bowl with a tiny growling-tummy squiggle above it (hungry)
> 5. a big golden sparkle star with two small sparkles (excited)
> 6. a small striped bouncy ball with two little motion arcs (wants to play)
> 7. a small waving hand, soft warm skin tone, with two tiny hearts (saying hi to a friend)
> 8. a cozy folded blanket with a tiny moon and a single "z" shape drawn as a swirl, no letters (sleepy and cosy)

## Prompt B: if the sheet comes out messy, do them one at a time

> One single video-game thought-bubble icon, centred, on a flat solid magenta (#FF00FF) background. Cream parchment speech bubble with a small tail at the bottom left, thick dark purple-brown outline, soft painted shading and a faint inner glow, hand-painted storybook style for a cozy fantasy creature game. In the middle: [SYMBOL FROM THE LIST ABOVE]. No text, no letters, no shadow on the background.

## What the words are (no art needed)

These are drawn as text in a painted bubble, so you can change them in `src/components/game/HabitatViewer.tsx`
(search for `DECOR_PLAY` and `txt:`). Current words:

| When | Says |
|---|---|
| Meets a friend | Hi! / Hello! / Hey you! and the friend answers Hi hi! / Oh, hello! / Yay, a friend! |
| Ball | Pop pop! / Boing! / Bob bob! |
| Mushroom | Boing boing! / Wheee! |
| Stump | Hup! / Up I go! |
| Swing | Wheee! / Swish swish |
| Fountain | Splish! / Splash! |
| Flowers | Sniff sniff / So pretty |
| Lantern | Ooh, glowy / So warm |
| Hammock | Cosy... / Zzz... |
| Sees food | Food! / Ooh, snack! / Me! Me! |
| Eats | Nom nom! / Yum! / Tasty! |
| Hungry | Hungry... / Snack? |
| Picked up | Whoa! / Eep! / Up we go! |
| Thrown | Wheeee! / Flyyy! |
| Put down | Yay! / Again! / Boing! |
| Lonely | Hello...? / Anyone? / Pssst... / Play with me? |
| Dizzy | Dizzy... |
