# Host Manual

This guide is for the meeting host running the board.

## Recommended Setup

Best presentation setup:

1. Open the app.
2. Click `Board` to open the presentation window.
3. Click `Host` to open the private control window.
4. Share only the board window in the meeting.

Why:

- The board window stays presentation-safe.
- The host window shows controls, score tools, local config editing, and the private answer preview.

## Pre-Meeting Checklist

Before the meeting starts:

1. Confirm the correct game content in [`src/data/sample-game.json`](../src/data/sample-game.json), or load your local browser override if you are using one.
2. Verify team names.
3. Check the scoring rule for incorrect answers.
4. Test the board and host windows once.
5. Preview sound cues if you plan to use audio.
6. Reset scores and board state before the meeting begins.

## During The Meeting

### Running A Clue

1. Select a tile from the board or host view.
2. Read or display the clue.
3. Let teams answer using your chosen process.
4. Use the host window to preview the correct response privately.
5. Reveal the response publicly when needed.
6. Mark the clue correct or incorrect.

### Scoring

- The active team is the team that receives clue scoring.
- Switch the active team from the scoreboard or host controls before scoring a clue if needed.
- Use `Mark Correct` to award the clue value.
- Use `Mark Incorrect` to apply the incorrect-answer rule.
- Use manual score controls when you need an adjustment outside normal clue scoring.

### Final Jeopardy

If Final Jeopardy is enabled in the game config:

1. Finish the main board.
2. Use `Start Final` from the host controls.
3. Reveal the category and move to wagers.
4. Enter wagers for each eligible team and lock them.
5. Reveal the final clue.
6. Record each team response.
7. Judge each response as correct or incorrect.
8. Apply the results and announce the winner.

Important:

- The host view sees the correct response during the clue and review phases before the board does.
- The board window never shows wagers during the wager phase.
- By default, only teams above `0` can participate unless the config allows otherwise.

### Sounds

- Sound playback is most reliable from the host window.
- Use the host sound controls to mute, unmute, and preview cues.
- If browser auto-play blocks a sound, interact with the host window first and try again.

## Host-Only Controls

The host tools include:

- active team selection
- reveal controls
- clue scoring controls
- manual score adjustment
- reset scores
- reset game
- clear saved state
- local config editing
- sound previews and mute control

## Private Host Preview

The host window always shows the correct response for the active clue before it is revealed on the board.

Use this to:

- confirm the expected wording
- decide whether a team answer is close enough
- avoid showing the answer too early

## Local Config Editing

The in-app editor is useful for last-minute changes during a meeting.

Important:

- Those edits are browser-local only.
- They do not change the source JSON in the repo.
- If you want those edits in the next distributable build, copy them back into [`src/data/sample-game.json`](../src/data/sample-game.json) and rebuild.
- Final Jeopardy content can also be edited from the local host editor.
- If you want an AI to create a new full game set, start with [AI_GAMESET_AUTHORING.md](./AI_GAMESET_AUTHORING.md).

## Resets And Persistence

- `Reset Scores` keeps the played board but zeros all teams.
- `Reset Game` clears scores and restores all clues.
- `Clear Saved State` removes persisted board data for the current browser storage key.

If the game reopens with old state you did not want, use `Clear Saved State` and then `Reset Game`.

## Keyboard Shortcuts

In host-capable views:

- `Space` or `Enter`: reveal the current response
- `Escape`: close the current clue

These shortcuts are ignored while typing in form fields.

## Troubleshooting

### The wrong window is being shared

- Share only the board window.
- Keep the host window private.
- Use the page title to identify each tab:
  - `Board View`
  - `Host View`
  - `Single View`

### A second board or host window opened unexpectedly

- Use the top `Board` and `Host` buttons again.
- The app reuses named windows for the current session and should focus the existing one.

### The board looks out of date

- Make sure both windows belong to the same session.
- If needed, reopen the board and host windows from the same source tab.

### Sounds are not playing

- Make sure sound is enabled in the game config.
- Make sure the host window is not muted.
- Click in the host window once to satisfy browser audio restrictions.
- Verify the sound files exist in `public/sounds/`.

### The meeting build is wrong

- Edit [`src/data/sample-game.json`](../src/data/sample-game.json).
- Rebuild with `npm run build`.
- Hand off the full `dist/` folder again.

### Final Jeopardy will not start

- Confirm the game config has `finalJeopardy.enabled` set to `true`.
- Finish the main board first.
- Check whether any teams are eligible under the current score rules.
- If needed, enable `allowNonPositiveScores` in the config.
