# Submitting RareSlime Forge to CrazyGames and Poki

Researched 2026-11-23 from the portals' own docs (links at the bottom). Rules and money terms change, so re-read the official pages on the day you submit.

## 1. The honest answer: will it be successful?

Nobody can promise this, and I found no published pass rate for either portal. What I can say:

**Working for us**
- Long-session meta loop (breed, collect, habitat, farm, battles) is what portals reward: time on site and retention.
- Painted art is well above the average web game. Thumbnails and the first screenshot decide clicks, and ours are strong.
- Size is tiny to start: about 2 MB loads before the Play button (measured on the portal build), about 10 MB with music. CrazyGames wants 20 MB or less for the mobile homepage.

**Working against us**
- A lot of reading and menus before the first fun moment. CrazyGames Full Launch asks players to land in gameplay with at most one click. We have a title screen click, then the altar, then a tutorial with dialogue.
- Portal players skew young and casual and quit fast. CrazyGames says its good games average 10+ minutes of play and 10-15% day-1 retention. We have not measured ours.
- Mobile is only checked on a desktop browser pane. It has not been tested on a real phone.
- Both portals review by hand. A rejection ("not original", "unclear first minute") is possible and common.

My estimate: a decent chance of passing review and reaching Basic Launch, a smaller chance of graduating to Full Launch, and a small chance of a big hit. Treat the first submission as a test that gives you real numbers.

## 2. How the process works

### CrazyGames (non-exclusive, our first choice)
1. Make a developer account and upload the `dist-crazygames` zip, plus covers and a description.
2. QA reviews every game by hand. No review time is published. Updates are usually processed the same working day.
3. **Basic Launch.** A small share of players see it. The SDK is optional and **ads are off, so you earn nothing**. It ends once the game has been live at least 7 days and has 500 plays, or automatically after 21 days. From 23 Nov 2026 it is scored on four metrics: average play time, day-1 retention, conversion to play, and click-through rate (clicks on your thumbnail).
4. **Full Launch.** If it performs, you update to the full requirements (SDK, ads, saves), get one more QA review, then it is promoted and earns money.
5. **Payment.** Monthly, once you have at least 100 EUR, usually by the 10th of the next month (their terms say NET 60). Through Tipalti: wire, ACH, PayPal. You keep 100% ownership and can publish elsewhere too.

### Poki
1. Apply through Poki for Developers (developers.poki.com), upload the `dist-poki` build.
2. A **Web Fit Test**: about 10,000 real players see the game on category pages for 3 to 5 days. It is scored on click-through, time on page and conversion to play. Pass and it goes to final review. The game earns nothing until then.
3. **Money.** If a player comes to your game directly you keep 100%. If they come through Poki.com or Poki marketing, revenue is split 50/50 (their stated default; terms are set in your agreement).
4. **The catch: exclusivity.** Poki prefers web-exclusive deals, 5 years by default. You could not publish on other web portals. Steam and app stores are allowed. A non-exclusive deal is a one-time flat fee with no revenue share. **Do not sign anything with Poki until you have decided this**, because it blocks CrazyGames.

**Portrait on phones (checked 24 Nov 2026).** Poki's requirements page still says a game may cover the screen in portrait, landscape or both, but Poki's own blog (5 June 2026, https://poki.com/blog/building-web-browser-games-2026) says every game needs to work in portrait and that QA tests it. This game only shows a "turn your phone sideways" screen in portrait, so expect Poki to reject it until there is a real portrait layout.

Suggested order: CrazyGames first (no exclusivity; it allows landscape-only mobile games if you set the orientation when you submit), measure for a month, then decide on Poki with real numbers.

## 3. Money, with the assumptions shown

These are estimates, not promises. Neither portal publishes a per-play rate.

- One 2018 developer measured about 1.20 EUR per 1,000 CrazyGames plays across eight games.
- A 2026 launch-planning post models 1 to 15 USD per 1,000 plays depending on ads per session and ad rates, but that is an assumption, not portal data.
- CrazyGames does not publish its developer share. Only a 2026 GameMaker jam gave 60% of ad revenue and 70% of purchases.

I use 1 to 8 USD per 1,000 plays as the range you take home, which is cautious.

| Plays per month | At 1 USD per 1,000 | At 8 USD per 1,000 |
|---|---|---|
| 5,000 | 5 | 40 |
| 50,000 | 50 | 400 |
| 500,000 | 500 | 4,000 |
| 5,000,000 | 5,000 | 40,000 |

- Under 100 EUR a month you will not be paid that month; it rolls over.
- Most web games sit in the first two rows. Reaching 500,000 plays a month needs the portal to actively promote the game.
- Basic Launch earns nothing, so month 1 is 0.

### Timeline (if it all goes well)
- Week 0: submit.
- Weeks 1-4: QA review, then Basic Launch (7 to 21 days live).
- Weeks 4-8: Full Launch review.
- Month 2-3: first ad revenue. First payout usually month 3 or 4, because of the 100 EUR minimum.

## 4. What is ready, what you must do

### Ready in the game
- Portal builds: `npm run build:crazy` and `npm run build:poki` (53 MB total, 542 files; limits are 250 MB and 1500 files).
- SDK: loading, gameplay start/stop, a midgame ad after battles, and rewarded video buttons (portal builds only, never rewarding if the ad fails, a minute of rest between uses): "Hatch twice as fast" (hatchery), "Breed twice as fast" (Breeding Den), "Grow twice as fast" (farm), "Free food" (habitat, only when the food bag is empty, gives 3 basic food) and "double Goo" on the battle result screen.
- Ad rules: game paused and muted during ads, still works with an ad blocker, no internal ad timer, rewarded button smaller than Continue and not green, with the film-clip icon Poki requires.
- Storage: if the portal blocks storage (incognito, iframe), the game now falls back to memory instead of crashing. Progress is then not saved.
- No outside requests (fonts bundled), no outgoing links, no in-game purchases, English only, no custom fullscreen button, no cross-promotion.
- Build is not checking for a newer version on the portal builds.

### You must do
1. **Confirm the music licences.** `public/audio/CREDITS.txt` lists tracks marked "licence to confirm" (the Pixabay and other music). Open each download page, confirm commercial use in a game is allowed, or replace the track. This can get a game removed.
2. **Covers and screenshots.** I saved three low-resolution drafts in `store/` (800x450). Take real ones at 1920x1080 from a normal browser. Check the current cover sizes on the CrazyGames "game covers" page and Poki's thumbnail guide (static and animated thumbnails). The thumbnail is now scored directly (click-through), so spend time on it.
3. **Developer accounts and the submit button.** Only you can create these and accept terms. Also set up payouts (Tipalti for CrazyGames) after the first payment is due.
4. **AI art.** Read each portal's current rule on AI-generated art and disclose if asked. CrazyGames rejects unoriginal content; be ready to explain how the art was made.
5. **Test on a real phone** in landscape through the portal's test link, and send me anything that is cut off.

### Store text (copy and paste)

**Name:** RareSlime Forge

**Short description (one line):** Breed rare slimes, build cosy habitats and battle through 50 levels.

**Long description:** Collect over 85 painted slimes in RareSlime Forge. Pair two slimes at the altar and discover which hybrid hatches. Every pair has surprises, and the rarest slimes need real luck and well-raised parents. Give each slime a home, watch them play, become friends and collect their gifts. Grow crops on your farm to feed them, then take your team into turn-based battles with a tap-timing bonus across the Verdant Lowlands, the Frostpeak Skyway and the Forgotten Castle, following Glim's story.

**Controls:** Mouse or touch. Tap and drag to pet, carry and throw slimes. Tap the ground to call a slime. Drag food onto a slime to feed it.

**Tags:** slime, breeding, collecting, pets, idle, cozy, turn-based, strategy, farm, cute

**Age:** suitable for 12 and up (cartoon fighting, no blood).

## 5. Sources
- CrazyGames requirements: https://docs.crazygames.com/requirements/intro/ and https://docs.crazygames.com/requirements/technical/
- CrazyGames Basic Launch metrics: https://docs.crazygames.com/resources/basic-launch-metrics/
- CrazyGames payouts: https://docs.crazygames.com/payouts/
- CrazyGames FAQ: https://docs.crazygames.com/faq/
- Poki requirements: https://developers.poki.com/guide/requirements-quality
- Poki deals: https://developers.poki.com/guide/revenue-deal-types
- Poki Web Fit Test: https://developers.poki.com/guide/web-fit-test
- Money estimates (secondary, treat with care): https://app.cinevva.com/guides/web-game-monetization and https://donislawdev.com/earnings-and-statistics-from-my-8-games-android-ios-webgl/
