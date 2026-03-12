# Work Jeopardy

Work Jeopardy is a browser-only Jeopardy-style trivia board for internal team meetings. It is built as a static frontend app, with all game content stored in editable JSON and no backend or online runtime requirements.

## Overview

- Built with `React`, `TypeScript`, `Vite`, and `Tailwind CSS`
- Runs locally in the browser
- Builds to a static `dist/` bundle for handoff
- Keeps clue content editable through JSON
- Includes a host-only local config editor for browser-local tweaks during a meeting
- Supports linked `board` and `host` windows for dual-screen control
- Supports optional local sound cues with browser-safe synth fallbacks
- Designed for one host controlling the board during a meeting

## Docs

- [Game schema and JSON editing guide](./docs/GAME_SCHEMA.md)
- [Local build and distribution guide](./docs/LOCAL_BUILD.md)
- [Project rules and implementation constraints](./docs/PROJECT_RULES.md)
- [Original planning prompt](./docs/INITIAL_PROMPT.md)

## Quick Start

```bash
npm install
npm run dev
```

To create a distributable local build:

```bash
npm run build
```

The output is written to `dist/`.

Game content lives in [`src/data/sample-game.json`](./src/data/sample-game.json). Sound files, when used, should be placed in `public/sounds/` and are copied into the final `dist/` bundle automatically.
