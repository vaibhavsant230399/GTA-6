# GTA VI — Worth the wait.

An immersive GTA VI fan countdown with a real 3D emblem, scroll-linked scenes, and an interactive photo gallery. Built as a multi-file static website with HTML, CSS, JavaScript, and a locally hosted copy of Three.js 0.180.0. No build step, package installation, or third-party runtime requests are required; `dist/` is the complete deployable site.

## Run

With Python 3 installed, run from this folder:

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. Serve over HTTP because the JavaScript uses ES modules.

## Experience

- A beveled, metallic VI emblem rendered in WebGL with studio lighting. It responds to scrolling and pointer movement.
- A pinned introduction that transitions from the emblem into the Vice City waterfront.
- Photo cards arranged in 3D space, with scroll-linked parallax and selectable daylight, golden-hour, and nighttime scenes.
- Native scrolling, anchor navigation, and a page-progress indicator.
- Both a compact opening countdown and a full closing countdown.
- A persistent motion control, automatic support for system reduced-motion preferences, and a static fallback if WebGL is unavailable.
- Keyboard-operable scene buttons. Use the arrow keys or Home/End while a scene selector is focused.

Animation frames run only while values are changing; scrolling is never intercepted. Three.js loads only when motion is enabled. Text enlargement and short landscape viewports use a regular document layout instead of pinned sections.

## Verify

With Node.js 18 or later:

```sh
node --test tests/countdown.test.js
```

## Release timing

The announced date is **November 19, 2026**, verified on September 22, 2026 against [Rockstar's store](https://store.rockstargames.com/game/buy-gta-vi).

The timer targets **midnight in the visitor's local timezone**. This is a calendar countdown convention, not a claim about a precise regional unlock time. At zero it stops and directs visitors to Rockstar for current availability. If the announced date changes, update `dist/countdown.js`, both visible date labels, metadata, and this note.

## Files

- `dist/index.html`: semantic content, navigation, scene controls, and countdowns.
- `dist/styles.css`: responsive layout, typography, 3D photo panels, and motion fallbacks.
- `dist/app.js`: countdown synchronization, scroll timeline, scene selection, and accessibility preferences.
- `dist/emblem.js`: 3D geometry, reflective materials, lighting, and on-demand WebGL rendering.
- `dist/countdown.js`: testable date calculation.
- `dist/vendor/`: pinned Three.js modules and MIT license.
- `dist/assets/`: self-hosted official screenshots, typefaces, and font license.
- `tests/countdown.test.js`: timing boundary and release-date checks.

## Credits

Unofficial fan project; not affiliated with Rockstar Games or Take-Two Interactive. The VI geometry is a fan-made typographic emblem.

Official screenshots from [Rockstar's GTA VI screenshot gallery](https://www.rockstargames.com/VI/media/screenshots): **Vice City 11**, **Vice City 08**, and **Leonida Keys 01**. Imagery © Rockstar Games; no ownership of the game imagery or trademarks is claimed.

- Sunset image: https://www.rockstargames.com/VI/_next/static/media/Vice_City_11.09paum3g942sc.jpg?akim=1&imdensity=1&imwidth=1920
- Night image: https://www.rockstargames.com/VI/_next/static/media/Vice_City_08.0bbg_xp4hqdvz.jpg?akim=1&imdensity=1&imwidth=3840
- Day image: https://www.rockstargames.com/VI/_next/static/media/Leonida_Keys_01.0zgz7tveur6y8.jpg?akim=1&imdensity=1&imwidth=1920

Typeface: Barlow Condensed by Jeremy Tribby, SIL Open Font License (`dist/assets/OFL.txt`). Three.js: MIT License (`dist/vendor/THREE-LICENSE.txt`).
