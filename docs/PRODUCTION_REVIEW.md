# Production Review

Date: 2026-03-12

## Scope Completed

- Host view workflow was reorganized so clue actions, clue preview, and setup tools are grouped more tightly.
- Player-facing notifications were added for clue starts, scoring events, board-complete states, and Final Jeopardy phase changes.
- Daily Double now uses a featured notification treatment with stronger animation and centered messaging.
- Negative team scores now render in muted red across the main scoreboard and Final Jeopardy score views.
- Host helper text was reduced in the highest-noise areas, especially the clue action deck.

## Review Outcome

- No blocking code issues were found after the final build verification.
- Automated QA coverage now exists for core game-state flows, session sync URL behavior, Final Jeopardy scoring rules, negative-score rendering, and the Daily Double featured notification path.
- Current verification includes `npm test` and `npm run build`.
- Visual regression coverage and a live multi-window manual QA pass are still missing.

## Open Items

- A live manual QA pass across `single`, `host`, and `board` windows is still recommended before calling the build fully release-ready.
- There is still no screenshot-based or browser-automation regression suite for layout, animation timing, or multi-window interaction fidelity.
- Workspace hygiene is still imperfect: there are `.DS_Store` files in the worktree and an unrelated page-title change already present in `src/App.tsx`. Those were left untouched in this pass.

## Future Ideas Discussed

- Continue reducing or muting remaining host-only helper copy if the host screens still feel too chatty during live play.
- Reuse the new featured notification path for other “moment” events, such as end-of-round, Final Jeopardy reveal, or winner announcement.
- Expand the new Vitest baseline with browser-level tests for host-to-board sync, host control emphasis states, and notification/banner timing.
- If multi-device sync ever becomes a requirement, replace the current browser-local `BroadcastChannel` / `localStorage` sync layer with a server-backed WebSocket approach while keeping the same session/snapshot model.
