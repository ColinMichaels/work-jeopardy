# Codex Kickoff Prompt — Local Jeopardy-Style Team Game

You are helping build a **self-contained Jeopardy-style trivia game** for internal team meetings.

The goal is a **simple, polished, local-only web app** that runs entirely in the browser and can be packaged as static files, with the final result compiled into a playable bundle that can be opened locally on another person’s computer and screen shared during meetings.

## Core project requirements

Build a **frontend-only application** using:

- **TypeScript**
- **TailwindCSS**
- A lightweight build setup such as **Vite**
- No backend
- No database
- No authentication
- No hosting assumptions
- No external runtime dependencies that require internet access once built

The game should behave like a **Jeopardy-style board** where the “questions” shown to players are actually **answers**, and players respond with the correct question.

## Primary design goals

- Keep the architecture **simple, modular, typed, and maintainable**
- Prioritize **clarity and reliability** over flashy complexity
- Make it easy to **edit game content through JSON config files**
- Make the app usable by a **single host controlling the board locally**
- Make the final build easy to hand off to another person to run locally
- Keep the UI clean and presentation-friendly for screen sharing in meetings
- Avoid unnecessary frameworks or heavy state libraries unless clearly justified

## Functional requirements

### 1. Game board
- Display a classic Jeopardy-style grid
- Categories across the top
- Point values beneath each category
- Support a configurable number of categories and clue values through JSON
- Clicking a tile opens the clue/answer modal or screen
- Once used, a tile should become marked as answered and no longer selectable unless reset

### 2. Question/clue presentation
- Show the selected clue prominently
- Support optional fields such as:
    - answer text
    - optional notes
    - optional daily double flag
    - optional media references if we decide to extend later
- Include a reveal control for showing the correct “question”
- Include controls for:
    - mark correct
    - mark incorrect
    - close and return to board

### 3. Team scoring
- Support multiple teams
- Team names should be configurable or editable in the UI
- Allow manual score updates by the host
- Correct answers should add the clue value
- Incorrect answers should optionally subtract the clue value
- Make scoring rules easy to adjust in code/config
- Show a persistent scoreboard on screen

### 4. Game state
- Track:
    - answered clues
    - scores
    - active teams
    - selected clue
- Include a reset game option
- Include a reset scores option
- Consider optional save/load to localStorage, but keep it isolated so it can be disabled easily

### 5. JSON-driven content
- All game data should come from structured JSON
- Design a clean schema for:
    - game title
    - categories
    - clue values
    - answer text
    - correct response
    - optional metadata
- Add TypeScript interfaces/types for the full config model
- Add runtime validation or at least a safe parsing layer so malformed JSON fails gracefully

### 6. Local-first distribution
- The finished project must build into static assets
- Final output should be something like a `/dist` folder containing compiled assets
- The handoff target is another person opening the game locally, ideally with minimal friction
- Prefer approaches compatible with:
    - opening `index.html` locally if feasible
    - or running a tiny local static server if absolutely necessary
- Document the best packaging and usage option clearly

## Non-functional requirements

- Strong TypeScript typing throughout
- Clean folder structure
- Reusable components
- Keep business logic separate from presentation
- Write code that is easy for another developer to understand quickly
- Keep CSS utility-first with Tailwind
- Avoid bloated abstractions
- Avoid premature optimization
- Prefer explicit, boring, maintainable code over clever code

## Suggested project structure

Use a structure similar to this unless a better one is justified:

```text
/src
  /components
    GameBoard.tsx
    CategoryHeader.tsx
    ClueTile.tsx
    ClueModal.tsx
    ScoreBoard.tsx
    TeamControls.tsx
    ControlBar.tsx
  /models
    game.ts
    team.ts
  /types
    game-config.ts
  /data
    sample-game.json
  /lib
    game-engine.ts
    score-utils.ts
    config-loader.ts
    storage.ts
  /styles
  main.tsx
  App.tsx
```

If using a non-React setup is simpler and better for this use case, explain why and structure accordingly. Do not force React unless it clearly improves maintainability. If React is used, keep it lightweight and typed.

## JSON schema expectations

Create a config shape similar to this:

```json
{
  "title": "Team Jeopardy",
  "teams": [
    { "id": "team-1", "name": "Team A" },
    { "id": "team-2", "name": "Team B" }
  ],
  "categories": [
    {
      "id": "cat-1",
      "title": "TypeScript",
      "clues": [
        {
          "id": "ts-100",
          "value": 100,
          "answer": "A typed superset of JavaScript.",
          "question": "What is TypeScript?",
          "dailyDouble": false
        }
      ]
    }
  ],
  "settings": {
    "subtractOnIncorrect": true,
    "enableLocalStorage": true
  }
}
```

Refine this schema as needed, but keep it intuitive and hand-editable.

## UX expectations

- Large readable typography for meeting-room screen sharing
- Clear visual states for unused, used, active, and revealed clues
- Smooth keyboard and mouse usability for a single host
- Responsive enough for laptop display, but optimized for desktop presentation
- Clean dark-mode-friendly styling
- Avoid clutter
- The host should be able to run the meeting without fumbling through controls

## Technical expectations

Please do the following:

1. Propose the best stack choice for this project.
2. Generate the initial folder structure.
3. Create the TypeScript types and interfaces.
4. Create a sample JSON game file.
5. Build the base UI shell.
6. Implement the board rendering.
7. Implement clue selection and reveal flow.
8. Implement multi-team score handling.
9. Add reset controls.
10. Add basic validation and error handling for bad config.
11. Add developer-friendly comments where useful.
12. Add a README with:
- setup
- run
- build
- local handoff instructions
- how to edit questions via JSON

## Development approach

Work incrementally in small, reviewable steps.

For each step:
- explain what you are changing
- keep files focused
- do not dump everything into one file
- prefer production-style organization even though the app is small

## Important guardrails

- Do not introduce a backend
- Do not introduce Firebase, auth, or unnecessary persistence
- Do not overbuild animation systems
- Do not add networking requirements
- Do not depend on cloud services
- Do not make the JSON format hard to edit manually
- Do not create a fragile solution that only works in dev mode

## Stretch goals only after the core app works

Only after the MVP is stable, consider optional enhancements such as:
- fullscreen/presenter mode
- import/export custom game JSON
- sound effects toggle
- Daily Double styling
- Final Jeopardy round
- timer per clue
- keyboard shortcuts for host control
- printable answer key

## Final instruction

Start by recommending the best stack and folder structure, then scaffold the initial project files for the MVP.

---

## Short follow-up instruction for Codex

Favor a lightweight **React + TypeScript + Vite + Tailwind** solution unless there is a strong reason to go framework-free. Keep the codebase small, readable, and easy to hand off. Build MVP first, then enhancements.

---

## Suggested follow-up prompts

### Prompt 1
```text
Scaffold the project and create the initial folder structure, types, sample JSON config, and base App shell.
```

### Prompt 2
```text
Implement the Jeopardy board grid from the JSON config and support marking clues as used when selected.
```

### Prompt 3
```text
Implement the clue modal flow with reveal answer, mark correct/incorrect, and return to board.
```

### Prompt 4
```text
Implement team score management with configurable subtract-on-incorrect behavior.
```

### Prompt 5
```text
Add README documentation explaining how to edit the game JSON and build a distributable local version.
```
