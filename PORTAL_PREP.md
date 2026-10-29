# Poki / CrazyGames prep (status)

Done: assets slimmed (slime sprites 143 MB -> 17 MB; `public` is now ~117 MB, ~441 files, loaded on demand), title screen with Play (needed for audio autoplay rules), mute remembered, painted UI.

Still to do (I will check each portal's CURRENT rules before submitting, since limits and SDK details change):
1. Size: confirm each portal's package-size and initial-load limits. If needed, shrink the 20 pixel-art habitat backgrounds (about 2 MB each) and convert PNGs to WebP.
2. SDK: add the portal SDK (loading events, gameplay start/stop, optional ads and rewarded ads) behind a small wrapper so it can be turned off for GitHub Pages.
3. Pause when the tab is hidden (music and timers behave), and make sure nothing breaks on mobile touch.
4. Store page: title, short and long description, 3-5 screenshots, a 512px icon, trailer or GIF (I can capture screenshots).
5. Legal: age rating answers, privacy (the game saves only in the browser), credits.
6. Test on a phone-sized screen and a slow connection.

You will need to create the developer accounts and press submit; I will prepare everything else.
