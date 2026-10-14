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

## Sculpted collection verification
- Parsed all 23 new GLBs with the bundled loader; checked finite positions, normals, bounds, and articulated transforms.
- Verified each asset is under 1.7 MB and 65,000 triangles, and the manifest covers locations 1–23.
- Tested opacity transitions, near-player disappearance, and reduced-motion transforms for every model.
- Inspected the entire collection in the model gallery and revised faces, hands, and creature proportions.
- Walked from the gate to the fen in the live forest; the new orbiting spirits loaded and rendered without captured errors or warnings.
- Existing observation, route planning, and uploaded-gatekeeper tests pass.
- Gallery and new-model forest rendering were checked in the desktop preview. Requested viewport overrides did not change the gallery size in this browser session, so a fresh narrow-screen gallery check and physical mobile hardware testing remain outstanding.

## Head attachment correction
- Removed added face/head geometry from every wraith-based figure, preserving the source mesh's existing head.
- Removed the detached auxiliary bog faces and attached the oak/river heads with neck geometry.
- Inspected all 23 revised thumbnails and rotated the moth queen to check front and side views.
- Added regression assertions: wraith-based models contain no extra carved-head group; only the three purpose-built creatures have one.
- The refreshed gallery rendered successfully in the narrow browser viewport.
