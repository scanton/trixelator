## Legacy Findings
- Entry: `index.html` + `js/script.js` bootstrap Vue 2.5 app inside Electron; `main.js` launches Electron with `index.html`.
- Core generation: `views/Trixelator.js` builds SVG triangles on a grid. Inputs: `baseWidth` (default 40), `sampleSize` (default 15), image element `#trixelator-target`. Steps: draw image to canvas (with optional CSS filter string from global color adjustments), loop grid (`halfBase = base/2`, `eqSin = sin(60°)`) and average pixel data per cell, choose color (raw hex or nearest palette color), emit `<polygon>` points alternating orientation with small overlap, assemble SVG string. Save SVG via `fs-extra` when user clicks “Save SVG”.
- Palette management: palettes stored as JSON in `/palettes` (`{name, colors[]}`). `ColorManager` toggles palette mapping, loads palette list, selects palette, shows colors, and can simplify palette (`SimplifyPaletteView` removes colors within threshold using Manhattan distance). `PaletteNameView` samples the current image grid to create a new palette by deduping averaged hex colors; palettes sorted with `colorSort`.
- Color adjustments: `ColorManager` builds CSS filter string (hue-rotate, saturate, brightness, blur, grayscale, sepia, contrast, invert) applied to the preview and used when sampling pixels for trixelation/palette creation.
- State: Vuex store holds `baseWidth`, `sampleSize`, `imagePath`, `trixelationOutput`, palette flags, modal visibility, etc. Palette mapping uses nearest-color matching to map each averaged pixel to the closest palette entry.
- Export: SVG generation only; PNG export not implemented. UI includes sub-select toggle but no implementation. No randomness/jitter settings surfaced.

## Mapping to New Architecture
- `apps/legacy-vue-electron/`: Move entire legacy tree (css, js, views, palettes, images, fonts, index.html, main.js, etc.) unchanged; add a short README noting archived status.
- `packages/trixelator-core/`: Pure TypeScript library exposing:
  - Image sampling helpers (average pixels from ImageData, color conversions).
  - Palette utilities (nearest color mapping, simplification, palette load helpers).
  - Trixelation generator: given pixel sampler + params (`baseWidth`, `sampleSize`, palette mapping toggle, optional filters hook) return structured triangle data + SVG/PNG render helpers.
  - Shared types for params/results used by web and desktop.
- `apps/web/` (Next.js + React, TS):
  - Single-page UI with image upload/drop, preview canvas, controls for base width, sample size, palette mapping toggle, palette selection, palette simplification, CSS-like filter controls, and “Generate” button.
  - Run generation on a worker (off main thread) using `trixelator-core`; render to canvas for preview; export PNG (and optional SVG via generated string).
  - Load default palettes from migrated `/palettes` data (copied into a public/data location).
  - Dev port 3001 via env/config.
- `apps/desktop/` (Electron + electron-builder):
  - Dev: concurrently start Next dev (3001) and Electron (loads http://localhost:3001) with preload and contextIsolation.
  - Prod: build static export from Next (`output: "export"`) and load `apps/web/out/index.html` via `file://`; package with electron-builder config.
  - Provide basic menu + window lifecycle.
- Root workspace: `pnpm-workspace.yaml` covering `apps/*` and `packages/*`; root `package.json` scripts proxy to app/package scripts; shared tooling for lint/typecheck.

## Behavior Differences / Risks
- Legacy SVG output used only; PNG export is new and will rely on canvas draw of triangle data—should match SVG visually but may differ slightly in antialiasing.
- Palette storage shifts to bundled JSON assets for web build; persistence (saving new palettes) in browser will need in-memory/download approach instead of filesystem writes—Electron can still write to disk. Need to clarify saving UX differences.
- CSS filter application will be approximated via canvas context filters; browser compatibility acceptable in modern Next/Electron but might differ from legacy Electron 1.4 rendering.
- Sub-select feature is stubbed in legacy; will remain unimplemented unless clarified.
- Triangulation grid in legacy uses overlap padding and integer rounding; reproduction will follow same math but minor rounding differences may occur due to typed arrays/worker transfer.
