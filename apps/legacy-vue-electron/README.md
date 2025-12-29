# Legacy Vue/Electron App

This folder contains the original Vue 2 + Electron implementation of Trixelator. It is preserved for reference while the modern Next.js/Electron rewrite lives in `apps/web` and `apps/desktop`.

Notes:
- The code targets an old Electron release (`electron-prebuilt@1.4.x`) and Vue 2.5. Running it today may require using `npm install` with an older Node/Electron toolchain.
- The `electron-prebuilt` dependency is marked optional and is not part of the pnpm workspace install. If you want to run this app on modern macOS hardware, you may need Rosetta or an x64 Node/Electron toolchain.
- Core behaviors (SVG-only export, palette JSON files, and the triangle generation loop) were ported into `packages/trixelator-core` for the new apps.

If you need to experiment with the legacy build, from this directory you can try:

```bash
npm install
npm start
```

…but expect dependency issues on modern Node versions.
