# Publishing on Poki and CrazyGames

Checked 2026-11-23 from each portal's own docs. Always re-read the official pages before submitting, the rules change.
- CrazyGames: https://docs.crazygames.com/requirements/technical/ and https://docs.crazygames.com/sdk/intro/
- Poki: https://developers.poki.com/guide/sdk-html5 and https://sdk.poki.com/requirements

## Three builds from one game

| Command | Output | For |
|---|---|---|
| `npm run build` | `docs/` | GitHub Pages (the live site). No portal code runs |
| `npm run build:poki` | `dist-poki/` | Zip the contents of this folder and upload to Poki |
| `npm run build:crazy` | `dist-crazygames/` | Zip the contents of this folder and upload to CrazyGames |

The portal folders are not committed. Each one loads that portal's SDK, tells it when play starts and stops, shows an ad after each battle, and silences the game during ads.
All the portal code is in `src/utils/portal.ts` (tested in `portal.test.ts`).

## Where we are

| Requirement | Portal | Status |
|---|---|---|
| Initial download 50 MB or less (20 MB or less for mobile) | CrazyGames | Done. Whole game is 49 MB, about 10 MB once music and sounds load after Play |
| Total 250 MB or less, 1500 files or less | CrazyGames | Done (49 MB, about 510 files) |
| Aim for roughly 8 to 10 MB loaded | Poki | Close, about 10 MB. Loading music per screen would lower it |
| Works on phones and tablets | Poki (required), CrazyGames | Landscape only. Fine for CrazyGames (set the orientation when submitting). **Risk for Poki:** its 2026 blog says portrait must work. The game is drawn on a virtual screen that scales to any size, with a "turn your phone sideways" screen in portrait (see `src/utils/stage.ts`). Not tested on a real phone |
| Their SDK: start, gameplay start/stop, ads | both | Done |
| Mute the sound and block input during ads | both | Done |
| Game still works if the SDK or ads fail or an ad blocker is on | both | Done (tested) |
| Honour the portal's "no sound" setting | CrazyGames | Done |
| Silent when the tab is hidden | both | Done |
| No outside requests (fonts were loaded from Google) | both | Done, fonts are bundled |
| No splash screens, no outgoing links | Poki | None in the game |
| Player lands in gameplay | CrazyGames full launch | Not done: there is a title screen with a Play button (browsers need a click before any sound can play) |
| Game name, thumbnails, description, screenshots | both | NOT done |
| Music licences confirmed | both | NOT done (`public/audio/CREDITS.txt`) |
| AI-art disclosure rules | both | NOT checked, read each portal's current rule before submitting |

## Not built yet (see SUBMISSION.md for the full plan; the rewarded "double Goo" button on the battle result is done)
- Saving progress through each portal's own cloud save (the game saves in the browser).
- A real phone test, and a pass on the long text screens (Codex, Achievements) at phone size.

## How to test a portal build on your computer
Run `npx vite preview --outDir dist-crazygames --port 4174` (or `dist-poki`) and open `http://127.0.0.1:4174/`. The CrazyGames SDK treats localhost as a test place and shows a text overlay instead of real ads.
