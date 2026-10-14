# Hollowmere — The Living Forest

A real-time **first-person 3D haunted forest**, built with Three.js / WebGL 2. Walk freely through a continuous world with 24 haunted locations, enter buildings, and follow the cave mouth through two connected chambers. Desktop and touch controls, no gore.

## Run
Serve this directory over HTTP; JavaScript modules require a web server (double-clicking `index.html` is not supported).

```sh
python3 -m http.server 8766
```

Open http://localhost:8766. No build or dependency install needed: Three.js and all textures are included locally. The full download is about 10 MB. After loading, no external service or account is required.

## Controls
- **Desktop:** W/A/S/D or arrows to walk, Shift to move faster. Click the scene to capture the mouse; drag to look when pointer lock is unavailable. Escape releases the mouse. Pause opens the pause menu.
- **Mobile:** left thumb joystick walks; drag the scene with the right thumb to look. Touch buttons operate the lantern, map and journal.
- **F:** lantern; **M:** map; **J:** journal.
- Hauntings are already present as you approach. Look around to discover them; there is no encounter button or popup. Sightings are recorded quietly in the journal.
- Select a landmark on the map to illuminate a walkable route from your current position. You stay where you are and follow the faint green trail. Auto walk is available for one-handed navigation.
- Turn **Sound on** to start audio; headphones reveal the stereo whisper effects.
- Settings include High / Balanced / Battery saver, reduced motion and volume. Touch devices start with reduced forest density and Balanced graphics.

## World and graphics
- 24 individually built landmarks, including an enterable shack, chapel and mill; bogs; stone circle; cornfield; graveyard; bridge; campsite; and three connected cave spaces.
- Approximately 1,450 trees on desktop or 900 on touch devices, with roots, branches and layered leaf geometry; instanced ferns, grass, rocks, mushrooms and fallen logs.
- CC0 photographic bark, forest floor and mossy stone textures with normal and roughness maps.
- Moving foliage, dynamic moon shadows, animated water, low mist, intermittent moonbeams, particles, a handheld lantern and illuminated trail markers.
- Distinct 3D spectral creatures: humanoid apparitions, antlered old gods, wisps, water creatures, a scarecrow, a wolf and a moth queen.
- Synthesized wind, footsteps, water, distant calls and stereo breath-like whispers. These are atmospheric sound effects, not recorded dialogue.
- Tree, wall and stone collision; continuous walking between locations; map guidance; locally saved journal. See all 24 hauntings to complete the journal.

## GitHub Pages
Push the repository to GitHub. Under Settings → Pages, publish `main` from `/(root)`. All imports and asset paths are relative and work under a project URL. The repository is currently private; GitHub Pages availability depends on the account plan. Visibility has not been changed automatically.

## itch.io
Upload `hauntedforest-itch.zip` as an HTML game with **This file will be played in the browser** enabled. `index.html` must stay at the ZIP root with `assets/` and `vendor/` intact. Enable mobile support and fullscreen. Use a 1280 × 800 embed or fullscreen. Pointer lock can be blocked by an iframe; drag-to-look remains available.

## Files
- `game.js`: first-person movement, input, lighting, interface, journal and game loop
- `world.js`: world generation, structures, dense trail-edge vegetation, hauntings and shaders
- `navigation.js`: obstacle-aware route planning that prefers trails
- `guidance.js`: terrain-following guiding light, rerouting and arrival handling
- `locations.js`: 24 locations and encounter stories
- `audio.js`: browser audio synthesis
- `apparitions.js`: detailed characters, spectral materials, cloth, faces, hands, wings and animation rigs
- `hauntings.js`: automatic sight-based journal discovery, with view and obstacle checks
- `tests/hauntings.test.js`: discovery and model integrity checks
- `assets/`: locally packaged photographic texture maps
- `vendor/`: Three.js and its MIT license
- `CREDITS.md`: asset sources and licenses

## Requirements and limits
Current desktop/mobile browser with WebGL 2 and hardware acceleration. This is a detailed procedural browser environment, not photorealistic scanned scenery. Creature encounters are environmental exploration events, without combat. Browser storage can be cleared and is not shared across devices. On slower devices choose Battery saver. Real-device phone GPU, touch and audio behavior should be tested before a public launch.

## Apparition update
Hauntings fade naturally into view between 42 and 28 metres. They remain visible without any input, whether or not their story has been recorded. Looking at an unobstructed figure within 24 metres records its story after a brief glance. No encounter dialog opens; narrative remains in the journal.

Characters have woven, folded and frayed garments; layered veils and hair; modelled brows, cheeks, noses and mouths; jointed fingers; moving arms, heads and cloth; spectral edge lighting and drifting motes. Creature variants include branching antlers and lichen, patterned and veined moth wings, a furred spectral wolf, water creatures with moving tendrils, and groups at the chapel and campsite. Reduced motion also stops apparition idle animation.

Run `npm test` (or `node tests/hauntings.test.js`) to verify automatic sightings and geometry for all 24 characters.

## Trail guidance
The map selects destinations without teleportation. A faint, soft-edged green glow highlights the next stretch of the route, following terrain and avoiding tree trunks, stonework, walls and shrub centres. Walking off-route triggers a new route from your current position. The light ends at the landmark approach; you can clear it at any time from the map. Dense shrubs, ferns and taller undergrowth define the trail edges, with open junctions and landmark entrances.

Apparitions dissolve as you approach (fully gone within 4 m). Seven hauntings appear only at the edges of vision. Brief visible glimpses record automatically; the compact HUD shows apparitions seen and remaining.

The Black Gate now uses the supplied Wraith of the Void sculpt, optimized to 59,852 triangles (about 1.1 MB), with spectral shading, hover, and proximity fading. It is an untextured, unrigged model; movement is applied to the whole figure. 

## Sculpted apparition collection
All 23 remaining locations now have separate GLB models. Human-like figures adapt the supplied Wraith of the Void mesh with different proportions, robes, crowns, and props; their original sculpted heads are preserved. The rooted oak god, river creature, sleeper, and spectral wolf have newly constructed bodies. The collection also includes moth wings, raven feathers, orbiting wisps, a chapel choir, and four lost travellers.

Open `models.html` to browse, rotate, and download each model. These are geometric sculptures with procedural spectral materials, not photorealistic textured characters or skeletal motion-capture assets. Moving parts use articulated scene nodes; cloth has subtle shader movement. The supplied gatekeeper remains unchanged.

The 23 new files total about 32 MB, with around 47–56 thousand triangles each. Nearby models load two at a time; failed loads retain the original procedural apparition. Existing proximity fading, peripheral-only hauntings, journal counts, and saved progress remain active. Actual phone performance still needs device testing.

To rebuild the models, run `npm install` followed by `npm run models:build`. The generator uses the bundled gatekeeper mesh and the pinned meshoptimizer development dependency. Serving the game requires no installation or build step.
