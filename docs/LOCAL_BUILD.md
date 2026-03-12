# Local Build And Distribution

This project is designed to build into static files that can be copied to another machine and opened locally during a meeting.

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

1. Update [`src/data/sample-game.json`](../src/data/sample-game.json) for the upcoming meeting.
2. Run `npm run build`.
3. Zip or copy the full `dist/` folder.
4. Send that folder to the meeting host.

Important:

- The in-app host editor saves a browser-local override only.
- Browser-local overrides are useful for meeting-time tweaks, but they do not change the source files in this repo.
- If a local edit should become part of the distributable build, copy that change into `src/data/sample-game.json` and rebuild.

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

## Notes On Persistence

- If `enableLocalStorage` is `true`, the board state and scores persist in that browser.
- Persistence is local to the machine and browser profile running the game.
- `Reset Game` clears the board and resets scores.
- `Clear Saved State` removes the saved browser state for the current storage key.

## Packaging Guidance

- Do not hand off only `index.html`; the `assets/` folder inside `dist/` is required.
- Do not edit files inside `dist/` manually. Edit the JSON in `src/data/` and rebuild.
- The built game does not require a backend, database, login, or internet access once the `dist/` folder exists.
