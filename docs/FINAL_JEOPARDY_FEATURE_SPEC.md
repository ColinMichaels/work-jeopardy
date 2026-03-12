# Final Jeopardy Feature Specification

## Goal

Add an optional **Final Jeopardy** round to the local Jeopardy-style meeting game. The implementation should remain simple, host‑controlled, and compatible with the JSON‑driven architecture already used in the app.

The feature should prioritize:

* simplicity
* maintainability
* local execution
* host-controlled input
* minimal complexity

Avoid building unnecessary multiplayer networking or hidden team input systems.

---

# Gameplay Overview

Final Jeopardy is the last round of the game. It occurs after the main board is completed.

The flow is:

1. Reveal the Final Jeopardy category
2. Teams secretly choose wagers
3. Lock wagers
4. Reveal the final clue
5. Teams submit responses
6. Host judges responses
7. Wagers are applied
8. Final scores determine the winner

---

# Scope

## In Scope

* Optional Final Jeopardy round
* JSON configuration support
* UI flow for wagering and response entry
* Automatic score calculation
* Clear round phases

## Out of Scope

* Real-time multiplayer response systems
* network communication
* buzzer systems
* complex tie-breaking logic

---

# Functional Requirements

## 1. Optional Round

The game configuration may include a Final Jeopardy section.

If the section does not exist or is disabled, the game ends normally after the main board.

If enabled, the host can transition to Final Jeopardy after the board completes.

---

## 2. Configuration Schema

Example configuration:

```json
{
  "finalJeopardy": {
    "enabled": true,
    "category": "Programming Languages",
    "clue": "This language introduced the phrase 'write once, run anywhere.'",
    "correctResponse": "What is Java?",
    "timerSeconds": 30,
    "allowNonPositiveScores": false
  }
}
```

Fields:

* `enabled` — enable the round
* `category` — displayed before wagers
* `clue` — the final clue
* `correctResponse` — correct answer
* `timerSeconds` — optional response timer
* `allowNonPositiveScores` — allow teams with <=0 score

---

# Team Eligibility

Default rules:

* Teams must have score > 0
* Teams with 0 or negative score cannot participate

If `allowNonPositiveScores` is true, all teams may participate.

---

# Round Phases

The round should be implemented as a simple state machine.

```ts
type FinalJeopardyPhase =
  | 'category'
  | 'wager'
  | 'clue'
  | 'responses'
  | 'review'
  | 'results';
```

---

# Phase Behavior

## Category Phase

Display:

* "Final Jeopardy"
* category text

Controls:

* start wagering button

---

## Wager Phase

Host enters wagers for each eligible team.

Validation rules:

* wager >= 0
* wager <= team score

All wagers must be entered before continuing.

Controls:

* lock wagers

---

## Clue Phase

Display the final clue.

Optional features:

* countdown timer

Controls:

* continue to responses

---

## Responses Phase

Host enters each team’s response.

Implementation:

* text input per team

No automatic correctness checking required.

Controls:

* continue to review

---

## Review Phase

Display per team:

* original score
* wager
* response

Host selects:

* correct
* incorrect

After judgments are entered the scoring phase can begin.

---

## Results Phase

Apply scoring automatically.

Rules:

* correct → add wager
* incorrect → subtract wager

Display:

* updated scores
* winner

If tied, show multiple winners.

---

# Data Models

## Config Model

```ts
export interface FinalJeopardyConfig {
  enabled: boolean;
  category: string;
  clue: string;
  correctResponse: string;
  timerSeconds?: number;
  allowNonPositiveScores?: boolean;
}
```

Extend the game config:

```ts
export interface GameConfig {
  title: string;
  teams: TeamConfig[];
  categories: CategoryConfig[];
  settings: GameSettings;
  finalJeopardy?: FinalJeopardyConfig;
}
```

---

## Runtime State

```ts
export interface FinalJeopardyState {
  phase: 'category' | 'wager' | 'clue' | 'responses' | 'review' | 'results';
  eligibleTeamIds: string[];
  wagers: Record<string, number>;
  responses: Record<string, string>;
  judgments: Record<string, boolean>;
  scoresApplied: boolean;
}
```

---

# UI Requirements

The Final Jeopardy screen should feel distinct from the normal board.

Recommended layout:

## Category Screen

Large centered category display.

Controls:

* Start wagering

---

## Wager Screen

List of teams with:

* current score
* wager input

Validation feedback should appear inline.

---

## Clue Screen

Display:

* category
* clue text

Optional timer countdown.

---

## Response Screen

Text input per team.

Simple host-controlled entry.

---

## Review Screen

Display:

* team
* score
* wager
* response

Controls:

* mark correct
* mark incorrect

---

## Results Screen

Display:

* updated scores
* winning team

Provide:

* reset game option

---

# Scoring Rules

Example:

Team score: 1200

Wager: 400

Correct → 1600

Incorrect → 800

Scores must only be applied once.

---

# Persistence Behavior

If localStorage is enabled, persist:

* current phase
* wagers
* responses
* judgments

This prevents loss of progress after refresh.

---

# Validation Requirements

## Config Validation

If Final Jeopardy is enabled:

* category must exist
* clue must exist
* correctResponse must exist

If invalid, show a friendly configuration error.

---

## Wager Validation

Rules:

* numeric
* > = 0
* <= team score

---

# Suggested Component Structure

```
/src/components/final-jeopardy
  FinalJeopardyScreen.tsx
  FinalJeopardyCategory.tsx
  FinalJeopardyWagers.tsx
  FinalJeopardyClue.tsx
  FinalJeopardyResponses.tsx
  FinalJeopardyReview.tsx
  FinalJeopardyResults.tsx
```

---

# Suggested Utility Functions

```ts
getEligibleFinalJeopardyTeams()
validateFinalJeopardyWager()
applyFinalJeopardyScores()
getFinalJeopardyWinners()
```

Utilities should remain pure and easily testable.

---

# Implementation Steps

1. Extend the JSON schema
2. Add TypeScript types
3. Update sample game configuration
4. Implement phase state
5. Build category screen
6. Implement wager entry
7. Implement clue screen
8. Implement response entry
9. Implement review phase
10. Implement scoring and results

---

# Acceptance Criteria

The feature is complete when:

1. Final Jeopardy can be enabled via JSON
2. The game transitions correctly from the main board
3. Wagers are validated
4. Clue appears only after wagers lock
5. Responses can be entered and judged
6. Scores update correctly
7. Winners display correctly
8. State persists if local storage enabled

---

# Codex Instruction

Add an optional Final Jeopardy round to the Jeopardy game. Implement a simple host-controlled flow with phases: category, wager, clue, responses, review, and results. Teams wager before seeing the clue. Scores are updated based on correctness and wagers. Keep the implementation local-only, typed, modular, and simple.
