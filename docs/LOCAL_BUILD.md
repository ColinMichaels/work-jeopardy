# Local Build And Distribution

This project is designed to build into static files that can be copied to another machine and opened locally during a meeting.

For the actual meeting run flow after the build is ready, see the [host manual](./HOST_MANUAL.md).
For a hosted static demo, see the [GitHub Pages deployment guide](./GITHUB_PAGES.md).

## Prerequisites

- Node.js 20+ recommended
- npm

Install dependencies once:

```bash
npm install
```

## Development

Run the local dev server:

```bash
npm run dev
```

Vite will print a local URL, typically `http://localhost:5173`.

## Production Build

Create the distributable static bundle:

```bash
npm run build
```

This runs TypeScript checks and writes the compiled app into `dist/`.

Optional local preview:

```bash
npm run preview
```

## What To Hand Off

The deliverable is the full `dist/` folder.

Recommended process:

1. Choose which bundled game in [`src/data/`](../src/data/) should ship for the upcoming meeting, or edit one of those files.
2. Run `npm run build`.
3. Zip or copy the full `dist/` folder.
4. Send that folder to the meeting host.

Important:

- The in-app host editor saves a browser-local override only.
- Browser-local overrides are useful for meeting-time tweaks, but they do not change the source files in this repo.
- If a local edit should become part of the distributable build, copy that change into the matching file under `src/data/` and rebuild.

## Sound Assets

The app uses built-in sound cues from `public/sounds/`.

How it works:

1. Add or replace audio files in `public/sounds/`.
2. Run `npm run build`.

Example:

```json
"sounds": {
  "enabled": true,
  "volume": 0.85
}
```

Important:

- Files placed in `public/sounds/` are copied to the final build automatically.
- If a bundled file is missing, the app falls back to an internal synth cue so gameplay still works.
- In dual-window mode, sound playback is triggered from the host-control window because that is the reliable user-interaction source for browsers.

## Running The Built Game On Another Computer

Preferred option:

1. Open `dist/index.html` in a modern browser.
2. Use fullscreen or browser zoom as needed for screen sharing.

The Vite config uses relative asset paths, so direct local opening should work for normal desktop browser usage.

Fallback if the target browser is restrictive about `file://` behavior:

```bash
cd dist
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Dual-Window Host Mode

The app can run as a synced two-window session:

1. Open the game.
2. Click `Board Window` to open a presentation-only board.
3. Click `Host Window` to open the host-control view.
4. Share the board window in the meeting and keep the host window off-screen.

Both windows stay in sync for:

- clue selection
- reveal state
- score changes
- resets
- local config edits
- bundled game selection

Important:

- Dual-window sync is most reliable when the app is served from `http://localhost`, not directly from `file://`.
- For meeting use, prefer `npm run preview` during development or `python3 -m http.server` from `dist/` after building.
- If you need meeting audio, share system audio or the host-control window; browsers do not reliably allow the presentation window to auto-play audio that was triggered elsewhere.

## Notes On Persistence

- If `enableLocalStorage` is `true`, the board state and scores persist in that browser.
- Persistence is local to the machine and browser profile running the game.
- `Reset Game` clears the board and resets scores.
- `Clear Saved State` removes the saved browser state for the current storage key.

## Packaging Guidance

- Do not hand off only `index.html`; the `assets/` folder inside `dist/` is required.
- Do not edit files inside `dist/` manually. Edit the JSON in `src/data/` and rebuild.
- The built game does not require a backend, database, login, or internet access once the `dist/` folder exists.
