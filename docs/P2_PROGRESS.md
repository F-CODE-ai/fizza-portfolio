# P2 progress: Explore 3D mode (X1)

- [x] Lazy-loaded separate chunk (`src/explore/index.js`, `src/explore/scene.js`, `src/explore/spots.js`, `src/explore/avatar.js`) loaded via dynamic `import('./explore/index.js')` only when the visitor clicks "Explore 3D".
- [x] Low-poly "Pink Travel Kitchen" floating island diorama built with `three.js` geometries, procedural canvas textures (checkerboard floor, world map with flight routes, globe, sunset sky gradient), soft directional shadow map, floating clouds, and gentle idle bobbing.
- [x] 6 interactive 3D hotspots mapped to every portfolio section:
  1. Recipe book → About
  2. Spice rack → Skills
  3. Retro pink fridge with postcards → Projects
  4. Spinning globe → Experience
  5. Wall frames → Education & achievements
  6. Travel suitcase → Contact
- [x] Raycaster hover glow + click-to-focus camera tween (GSAP), plus keyboard-accessible 2D projected floating pill buttons for every hotspot, `aria-modal` dialog overlay, Escape to close, WebGL context-loss handler, and full geometry/material/renderer disposal on exit.
- [x] Avatar loader hook (`src/explore/avatar.js`) ready for `public/models/chef-fizz.glb` in P3.
- [x] Bundle size verified: Classic JS 44.7 KB gzip (budget 60 KB), Explore 3D chunk 165.3 KB gzip (budget 260 KB), CSS 4.5 KB gzip (budget 25 KB).
