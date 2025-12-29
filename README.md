# Trixelator (Next.js + Electron)

Modern rewrite of the triangle mosaic generator with a shared TypeScript core, a Next.js web UI, and an Electron desktop shell. The original Vue/Electron app is archived in `apps/legacy-vue-electron` for reference.

## Repository Layout
- `apps/web` — Next.js + React (TS) web UI; also used by Electron.
- `apps/desktop` — Electron shell + packaging via electron-builder.
- `packages/trixelator-core` — Pure TypeScript trixelation/palette logic.
- `apps/legacy-vue-electron` — Original Vue 2 app (unchanged, may need old Node/Electron to run).
- `MIGRATION_PLAN.md` — Notes on the legacy behavior and porting approach.

## Prerequisites
- Node.js (LTS recommended)
- pnpm (`npm install -g pnpm`)

## Install
From the repository root:
```bash
pnpm install
```

## Development
- Web app (port 3001):  
  ```bash
  pnpm dev:web
  ```
- Electron app (Next dev server + Electron pointed at http://localhost:3001):  
  ```bash
  pnpm dev:desktop
  ```

## Build
- Static web export (outputs to `apps/web/out`):  
  ```bash
  pnpm build:web
  ```
- Package Electron app (includes web export; dev artifacts in `apps/desktop/dist`):  
  ```bash
  pnpm build:desktop   # unpacked build
  pnpm dist            # installers for mac/win/linux
  ```

## Palettes
Default palettes live in `apps/web/public/palettes/*.json` (ported from the legacy app). You can load them in the UI, map trixels to the palette, simplify the palette, or sample a new palette from the current image. In-browser palette edits are in-memory; Electron builds can later add persistence if desired.

## Troubleshooting (Electron)
- macOS: On first build you may need Xcode command line tools (`xcode-select --install`). Notarization/signing is optional for local testing; unsigned apps run with a right-click → Open prompt.
- Windows: Ensure Visual Studio Build Tools / Desktop development with C++ are installed; PowerShell execution policy sometimes blocks scripts—run your shell as Administrator.
- Linux: electron-builder targets AppImage and deb by default. Install system deps for your distro (e.g., `libX11-dev`, `libxcb` variants).  
- If the renderer stays blank in dev, confirm port 3001 is free and Next started; restart `pnpm dev:desktop` after closing stale Electron windows.

## Legacy App
The Vue/Electron build remains in `apps/legacy-vue-electron` with its original `package.json`. It still generates SVG-only mosaics and manages palettes from the filesystem; expect dependency issues on modern Node versions.
