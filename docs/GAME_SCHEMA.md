# Game Schema

This project reads all trivia content from [`src/data/sample-game.json`](../src/data/sample-game.json). The file is intended to stay hand-editable so a new game can be prepared without touching application code.

The app also includes a host-side local editor. Those edits are stored in the browser only and do not change the source JSON file in the repo.

## Editing Workflow

1. Open `src/data/sample-game.json`.
2. Update the title, teams, categories, and clues.
3. Save the file.
4. Run `npm run build` to produce a fresh distributable bundle.
5. If the JSON is malformed, the app shows a readable config error screen when opened.

If you use the in-app editor instead, those edits apply only to the current browser unless you manually copy them back into `src/data/sample-game.json`.

## Top-Level Shape

```json
{
  "title": "Team Jeopardy",
  "subtitle": "A browser-only board for local team meetings.",
  "teams": [
    { "id": "team-1", "name": "Blue Team" },
    { "id": "team-2", "name": "Gold Team" }
  ],
  "categories": [
    {
      "id": "cat-typescript",
      "title": "TypeScript",
      "clues": [
        {
          "id": "ts-100",
          "value": 100,
          "answer": "A typed superset of JavaScript that compiles to plain JS.",
          "question": "What is TypeScript?",
          "notes": "Optional host note",
          "dailyDouble": false,
          "media": [
            {
              "type": "image",
              "src": "optional/path.png",
              "alt": "Optional description"
            }
          ]
        }
      ]
    }
  ],
  "settings": {
    "subtractOnIncorrect": true,
    "enableLocalStorage": true,
    "storageKey": "work-jeopardy-state",
    "sounds": {
      "enabled": true,
      "volume": 0.85,
      "cues": {
        "boardFill": "sounds/jeopardy-ding.mp3",
        "dailyDouble": "sounds/daily-double.mp3"
      }
    }
  }
}
```

## Field Reference

### `title`

- Type: `string`
- Required: yes
- Used for the main heading in the app

Example:

```json
"title": "Engineering Team Jeopardy"
```

### `subtitle`

- Type: `string`
- Required: no
- Short supporting text shown under the title

### `teams`

- Type: `Team[]`
- Required: yes
- Defines the starting teams shown in the scoreboard

Team object:

```json
{
  "id": "team-1",
  "name": "Blue Team"
}
```

Rules:

- `id` must be unique
- `name` must be a non-empty string

### `categories`

- Type: `Category[]`
- Required: yes
- Each category becomes one board column

Category object:

```json
{
  "id": "cat-typescript",
  "title": "TypeScript",
  "clues": []
}
```

Rules:

- `id` must be unique
- `title` must be a non-empty string
- `clues` must contain at least one clue

### `clues`

- Type: `Clue[]`
- Required: yes
- Each clue becomes one selectable tile under a category

Clue object:

```json
{
  "id": "ts-100",
  "value": 100,
  "answer": "A typed superset of JavaScript.",
  "question": "What is TypeScript?",
  "notes": "Optional host note",
  "dailyDouble": false
}
```

Fields:

- `id`: unique string
- `value`: positive number used for scoring and tile labels
- `answer`: text shown first to the room
- `question`: correct Jeopardy-style response revealed by the host
- `notes`: optional host-only supporting text
- `dailyDouble`: optional boolean flag for special styling
- `media`: optional array of references for future extensions

Media entry:

```json
{
  "type": "image",
  "src": "assets/logo.png",
  "alt": "Company logo"
}
```

Allowed media types:

- `image`
- `audio`
- `video`

The current MVP displays media references as metadata only. It does not yet render embedded media.

### `settings`

- Type: `GameSettings`
- Required: no
- Controls small runtime behaviors

Settings object:

```json
{
  "subtractOnIncorrect": true,
  "enableLocalStorage": true,
  "storageKey": "work-jeopardy-state",
  "sounds": {
    "enabled": true,
    "volume": 0.85,
    "cues": {
      "boardFill": "sounds/jeopardy-ding.mp3",
      "dailyDouble": "sounds/daily-double.mp3",
      "tripleStumper": "sounds/jeopardy-incorrect-answer.mp3",
      "endRound": "sounds/end-round.mp3",
      "contestantBuzzer": "sounds/jeopardy-ding.mp3",
      "correctAnswer": "sounds/correct-answer.mp3",
      "thinkMusic": "sounds/think-music.mp3"
    }
  }
}
```

Fields:

- `subtractOnIncorrect`: when `true`, wrong answers subtract the clue value
- `enableLocalStorage`: when `true`, board state and scores persist in the browser
- `storageKey`: optional override for the browser storage key
- `sounds`: optional sound cue settings

### `settings.sounds`

- Type: `GameSoundSettings`
- Required: no
- Controls whether sound is enabled, the default volume, and optional per-cue file paths

Sound settings object:

```json
{
  "enabled": true,
  "volume": 0.85,
  "cues": {
    "thinkMusic": "sounds/think-music.mp3",
    "boardFill": "sounds/jeopardy-ding.mp3",
    "dailyDouble": "sounds/daily-double.mp3",
    "tripleStumper": "sounds/jeopardy-incorrect-answer.mp3",
    "endRound": "sounds/end-round.mp3",
    "contestantBuzzer": "sounds/jeopardy-ding.mp3",
    "correctAnswer": "sounds/correct-answer.mp3"
  }
}
```

Fields:

- `enabled`: master switch for game sounds
- `volume`: optional number from `0` to `1`
- `cues`: optional map of cue ids to audio file paths

Supported cue ids:

- `thinkMusic`
- `boardFill`
- `dailyDouble`
- `tripleStumper`
- `endRound`
- `contestantBuzzer`
- `correctAnswer`

Notes:

- Paths should usually point at files inside `public/sounds/`.
- Use relative paths like `sounds/daily-double.mp3` so local `dist/index.html` handoff still works.
- If a sound file is missing, the app falls back to a small built-in synth cue instead of failing.

## Validation Rules

The app validates the JSON at runtime before rendering the board. The config fails if any of these are invalid:

- top-level JSON is not an object
- `title` is missing or empty
- `teams` is missing, not an array, or empty
- `categories` is missing, not an array, or empty
- any team, category, or clue `id` is duplicated
- any clue `value` is not a positive number
- `answer` or `question` is empty
- `dailyDouble`, `subtractOnIncorrect`, or `enableLocalStorage` is not a boolean
- `settings.sounds.enabled` is not a boolean
- `settings.sounds.volume` is outside `0` to `1`
- `settings.sounds.cues` includes an unknown cue key or a non-string path
- `media` is present but not an array of valid objects

## Authoring Guidelines

- Keep clue values consistent across categories where possible.
- Prefer five clues per category for a classic board.
- Keep answers concise so they are readable when screen sharing.
- Use `notes` only for host context, not required clue text.
- Stick to simple IDs like `react-200` or `history-400`.
- Treat `src/data/sample-game.json` as the source of truth for each game build.

## Current TypeScript Model

The runtime schema is represented in [`src/types/game-config.ts`](../src/types/game-config.ts).

```ts
export interface TeamConfig {
  id: string;
  name: string;
}

export interface ClueConfig {
  id: string;
  value: number;
  answer: string;
  question: string;
  notes?: string;
  dailyDouble?: boolean;
  media?: GameMediaReference[];
}

export interface CategoryConfig {
  id: string;
  title: string;
  clues: ClueConfig[];
}

export interface GameSoundSettings {
  enabled: boolean;
  volume?: number;
  cues?: Partial<
    Record<
      'thinkMusic' | 'boardFill' | 'dailyDouble' | 'tripleStumper' | 'endRound' | 'contestantBuzzer',
      string
    >
  >;
}

export interface GameSettings {
  subtractOnIncorrect: boolean;
  enableLocalStorage: boolean;
  storageKey?: string;
  sounds: GameSoundSettings;
}

export interface GameConfig {
  title: string;
  subtitle?: string;
  teams: TeamConfig[];
  categories: CategoryConfig[];
  settings: GameSettings;
}
```
