# Work Jeopardy

Work Jeopardy is a browser-only Jeopardy-style trivia board for internal team meetings. It is built as a static frontend app, with all game content stored in editable JSON and no backend or online runtime requirements.

## Overview

- Built with `React`, `TypeScript`, `Vite`, and `Tailwind CSS`
- Runs locally in the browser
- Builds to a static `dist/` bundle for handoff
- Keeps clue content editable through JSON
- Includes a host-only local config editor for browser-local tweaks during a meeting
- Includes host-side JSON export and import for saving and reloading custom games
- Supports linked `board` and `host` windows for dual-screen control
- Includes an optional Final Jeopardy round with wagers, response entry, review, and results
- Supports optional clue images, direct video URLs, audio clips, and YouTube embeds
- Supports built-in game sound cues with browser-safe synth fallbacks
- Designed for one host controlling the board during a meeting

## Docs

- [Gameplay guide for players](./docs/GAMEPLAY_GUIDE.md)
- [Host manual and meeting runbook](./docs/HOST_MANUAL.md)
- [Game schema and JSON editing guide](./docs/GAME_SCHEMA.md)
- [AI game-set authoring guide](./docs/AI_GAMESET_AUTHORING.md)
- [Prompt builder workflow](./docs/PROMPT_BUILDER_WORKFLOW.md)
- [GitHub Pages deployment guide](./docs/GITHUB_PAGES.md)
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

For repeatable AI prompt generation, run the dev server and open
`/gameset-prompt-builder.html`. The same page is also copied to `dist/` during a build so it can
be shared with a host as a static helper.

To refresh the bundled sample boards with remote media examples, run:

```bash
npm run enrich:samples
```

That script enriches the sample JSON files in `src/data/`, skips clues that already have the
needed image or video types, and prints a missing-media summary for manual cleanup.

To publish a GitHub Pages demo:

```bash
npm run deploy
```

Bundled game content lives in [`src/data/`](./src/data/). The app now ships with multiple sample boards that hosts can choose from in the host controls, and each file is a valid hand-editable JSON config. Bundled sound files live in [`public/sounds`](./public/sounds).

For actual meeting use, start with the [host manual](./docs/HOST_MANUAL.md). For participants, share the [gameplay guide](./docs/GAMEPLAY_GUIDE.md).
