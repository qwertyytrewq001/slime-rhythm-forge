# Publishing on Poki and CrazyGames

Checked 2026-11-23 from each portal's own docs. Always re-read the official pages before submitting, the rules change.
- CrazyGames: https://docs.crazygames.com/requirements/technical/
- Poki: https://sdk.poki.com/requirements and https://developers.poki.com

## What they ask for, and where we are

| Requirement | Portal | Status |
|---|---|---|
| Initial download 50 MB or less (20 MB or less for the mobile homepage) | CrazyGames | Done. Whole game is 49 MB, first screen loads about 2 MB, about 10 MB once music and sounds load after Play |
| Total 250 MB or less, 1500 files or less | CrazyGames | Done (49 MB, 498 files) |
| Aim for roughly 8 to 10 MB loaded | Poki | Close. About 10 MB after Play. Could lazy-load music per screen to get lower |
| Works on mobile and tablet | Poki (required), CrazyGames (mobile homepage) | NOT done. Game is built for desktop screens |
| Their SDK added (init, gameplay start/stop, ads) | both | NOT done |
| No other ads, no splash screens, no outgoing links | Poki | To check (no external links in game, remove any about/credits links) |
| Mute sound and pause while an ad plays | both | NOT done (needs SDK) |
| Player lands directly in gameplay | CrazyGames full launch | Title screen needs a "skip" for portal builds |
| Game name, thumbnails, description | both | NOT done |

## Already done
- PNGs squashed from 114 MB to 28 MB (same file names), music re-encoded at 96 kbps, WAV effects turned into OGG.
- Originals are backed up in `%TEMP%\png_backup_full` and `%TEMP%\audio_backup_full`.

## Still to do, in this order
1. Mobile and small-screen layout (biggest piece of work).
2. Add the portal SDK behind a build switch (one build for Poki, one for CrazyGames, one for GitHub Pages): init, gameplay start/stop, mute and pause around ads.
3. Portal build: skip the title screen, remove outgoing links.
4. Confirm music licences (`public/audio/CREDITS.txt`), pick the final game name, make thumbnails.
5. Check each portal's current AI-art disclosure rule before submitting.
