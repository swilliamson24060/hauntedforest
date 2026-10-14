# Verification of natural hauntings and detailed apparitions

- Automated tests passed for automatic discovery, once-only notification, camera direction, occlusion, paused menus, and sight lines above low obstacles.
- All 24 detailed models were constructed and animated in tests; all geometry and transforms were finite.
- Browser navigation exercised all 24 destinations with the new models. No captured JavaScript or shader errors or warnings.
- Verified there are zero activation buttons and zero encounter overlays in the rendered interface.
- Live preview recorded sightings without pressing an encounter button.
- Visually inspected the gatekeeper on the narrow layout and the moth queen at close walking distance on desktop.
- Preserved existing journal storage; no saved discoveries were cleared.

Physical iOS/Android device performance and audio quality remain unverified. Desktop pointer lock is blocked by the preview browser; drag-to-look and keyboard walking were exercised instead.

## Trail update checks
- Route planning tests found walkable paths to all 24 destination approaches using the actual world colliders, including the added shrub banks.
- Verified routes avoid blocked cells and synthetic walls, and planning leaves the supplied player position unchanged.
- In the browser, player coordinates were identical before and after selecting a distant destination.
- Inspected the dense foliage and subtle guiding light at phone and desktop widths.
- Walked from the Black Gate toward Will-o’-Wisp Fen; remaining distance updated and guidance cleared on arrival.
- No captured browser errors or warnings during route selection and walking.
