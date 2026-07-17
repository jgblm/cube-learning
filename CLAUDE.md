# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a Vite + React app. There is **no test suite and no linter configured** (no `jest`/`vitest`/`eslint` in `package.json`), so there are no test/lint commands to run.

```bash
npm install        # install deps
npm run dev        # dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # preview the production build
```

To sanity-check a change, run `npm run build` (it fails on syntax/import errors) and `npm run dev` to verify in the browser.

## Architecture

The defining decision is a **strict split between a framework-agnostic 3D engine and React**:

- **`src/cube/CubeEngine.js`** — a plain Three.js class (no React). It owns the scene, camera, lighting, the 26 cubies, the render loop, and all animation. A React component instantiates it via `new CubeEngine(containerEl)`, drives it through its public methods (`enqueue`/`play`, `scramble`, `reset`, `setSpeed`), and must call `engine.dispose()` on unmount to free GL resources.
- **Move notation is a pure, dependency-free layer** in `src/cube/moves.js` (`normalize`, `invert`, `invertSequence`, `toSequence`, `randomScramble`, plus `FACE_DEF`). It has no Three.js import and can be used/tested in isolation. `CubeEngine._resolve` maps a move string → `{ axis, layer, axisVec, angle }` using `FACE_DEF` + `normalize`, so the turn geometry and the notation stay decoupled.
- **`src/components/CubeViewer.jsx`** — the only React↔engine bridge. It is a `forwardRef` component exposing an imperative handle `{ play(seq), scramble(n), reset(), setSpeed(mult) }` via `useImperativeHandle`. Feature pages hold a `ref` to `CubeViewer` and call these to drive the cube. Keyboard turns (letter = CW, `Shift`+letter = prime) and on-screen buttons also route through `engine.enqueue`.

Feature pages (`LessonView`, `FormulaSheet`, `SolverDemo`, `Home`) each mount their **own** `CubeViewer`, so the engine is per-page and torn down on navigation. They are thin: they pull data from `src/content/lessons.js` (`LEVELS` → lessons → steps) and `src/cube/algorithms.js` (`OLL_2LOOK`, `PLL_COMMON`), and pass an entry's `algorithm` string to `ref.current.play(...)`.

### Rotation / animation model (non-obvious)

Each cubie is an independent `THREE.Group` carrying its own sticker meshes. A face turn does **not** mutate a data model — it:
1. selects the 9 cubies whose `userData.pos[axis]` equals the layer coordinate,
2. reparents them under a temporary `pivot` group,
3. eases the pivot 90°/180° via the `requestAnimationFrame` loop,
4. on completion, reparents them back and updates `userData.pos` (rotated + rounded) — this keeps sticker colours correct for free.

Moves are processed one at a time from `this.queue` (`scramble` clears the queue first). `BASE_DURATION / speed` sets per-turn timing.

### Internationalisation

Lightweight `src/i18n/LangContext.jsx` (`useLang()` + `tx(value, lang)`). There are **no separate locale files** — every user-facing string is an inline `{ zh, en }` object, and `tx()` picks by current lang (falling back to `zh`). Add UI text as `{ zh, en }` objects, not raw strings.

### Solver

`src/cube/solver.js` exposes `planInverseSolve(seq)` (reverse + invert each move → guaranteed solve) used by `SolverDemo`. `solveLBL()` is a **placeholder stub that throws**; a real LBL/two-phase solver is not implemented.

### Notation conventions

Algorithms are space-separated move strings understood by `toSequence`/`normalize`: faces `U D L R F B` plus slices `M E S`, each optionally followed by `'` (prime) or `2`. Keep new algorithm data in this form so it plays directly on the cube.
