# AI Game Set Authoring Guide

This guide is for an AI agent that needs to research and produce a new Jeopardy-style game set for this project.

The expected output is a complete JSON game file that matches the app schema and can be:

- copied into a file under [`src/data/`](../src/data/) for a bundled build
- pasted or adapted into the host-side editor
- used by a future host-panel import or upload flow without further restructuring

## Prompt Builder

If you want a reusable prompt instead of writing one from scratch, use the static prompt builder at:

- `/gameset-prompt-builder.html` while running the app locally
- `dist/gameset-prompt-builder.html` after a production build

That tool supports two flows:

- creating a new game from a theme, era, genre, and category seeds
- enriching an existing JSON game with verified media

For the bundled demo boards in this repo, you can also run `npm run enrich:samples` to backfill
remote media in place. It uses Wikipedia lead images plus YouTube watch URLs where configured and
prints any unresolved clues so they can be reviewed manually.

## Goal

Produce a clean, meeting-ready game set with:

- a clear theme
- readable category names
- balanced clue difficulty
- correct factual content
- valid JSON matching the app schema

The app shows the `answer` first and reveals the `question` later. Every clue must follow that format.

## Required Deliverables

The agent should return:

1. One complete JSON object matching the game schema.
2. A short summary of the game theme and intended audience.
3. A brief note listing any categories or clues that may need human review.

If the task includes research, the agent should also keep a short internal source list for factual verification, even if that source list is not embedded in the final JSON.

## Content Standards

The generated game should be usable in a live meeting without heavy editing.

### Category Rules

- Prefer 5 to 6 categories for a standard board.
- Category titles should be short enough to fit on screen.
- Each category should feel internally consistent.
- Avoid overly similar categories unless the user explicitly requests a niche game.

### Clue Rules

- Each clue must be factually correct.
- The visible `answer` should be concise and presentation-friendly.
- The revealed `question` should be the expected Jeopardy-style response.
- Avoid vague wording, trivia with multiple equally valid answers, or clues that require long debate.
- Difficulty should generally increase with clue value.
- Lower-value clues should be broadly accessible.
- Higher-value clues can be harder, but should still be defensible and solvable.

### Writing Rules

- Keep on-screen clue text readable from a shared screen.
- Avoid paragraphs unless the user explicitly wants a dense academic game.
- Prefer plain language over clever wordplay unless the whole game is built around wordplay.
- Use host `notes` only when clarification is genuinely helpful.

## Research Rules

If the game depends on factual material:

- verify facts before writing final clues
- prefer primary or authoritative sources when practical
- avoid unstable facts unless the game is explicitly about current events
- if a fact is recent or likely to change, note that it should be rechecked before the meeting

Examples of facts that should be handled carefully:

- current office holders
- recent award winners
- active product versions
- live sports results
- fast-changing company leadership

## Media Authoring Rules

If the user wants media-rich clues:

- use verified real URLs only
- do not invent media links
- prefer official YouTube watch URLs for video
- prefer stable cover art, item images, or artist photos for image media
- include short alt text for each media item
- if a clue has no confident media match, leave it without media and mention that in review notes

Useful media-rich clue types include:

- songs
- artists
- albums
- films
- products
- spacecraft
- landmarks
- famous photos or archival moments

## Recommended Workflow

1. Confirm the requested theme, audience, and tone.
2. Decide the board size.
3. Draft categories first.
4. Research and outline clue topics per category.
5. Write clue `answer` text.
6. Write the correct `question` response for each clue.
7. Add optional `notes`, `dailyDouble`, `media`, and `finalJeopardy` only if useful.
8. Validate the JSON structure before delivery.
9. Review for ambiguity, repetition, and screen readability.

## Default Board Shape

Use this unless the user asks for a different board size:

- 6 categories
- 5 clues per category
- clue values of `100`, `200`, `300`, `400`, `500`

## Schema Checklist

The final JSON should include:

- `title`
- optional `subtitle`
- `teams`
- `categories`
- `settings`
- optional `finalJeopardy`

Each category must include:

- `id`
- `title`
- `clues`

Each clue must include:

- `id`
- `value`
- `answer`
- `question`

Optional clue fields:

- `notes`
- `dailyDouble`
- `media`

## Practical Authoring Rules

- Keep all ids unique.
- Keep clue values numeric and positive.
- Use stable slug-like ids such as `history-300` or `cat-science`.
- Make the `question` field the exact answer the host should reveal.
- Do not invent media references unless the user specifically asked for media assets.
- When media is requested, prefer a smaller number of verified assets over a larger number of questionable links.
- If `finalJeopardy.enabled` is `true`, include valid `category`, `clue`, and `correctResponse`.

## Quality Review Checklist

Before delivering the JSON, confirm:

- the JSON is syntactically valid
- every category has at least one clue
- no duplicate ids exist
- clue values rise in a sensible order
- wording is readable on a large shared screen
- answers and questions are not accidentally reversed
- the game feels coherent as a whole
- there are no obviously contentious or under-specified clues

## Output Template

```json
{
  "title": "New Game Title",
  "subtitle": "Optional subtitle",
  "teams": [
    { "id": "team-1", "name": "Team A" },
    { "id": "team-2", "name": "Team B" }
  ],
  "categories": [
    {
      "id": "cat-example",
      "title": "Example",
      "clues": [
        {
          "id": "example-100",
          "value": 100,
          "answer": "Visible clue text shown first.",
          "question": "What is the correct response?"
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
      "volume": 0.85
    }
  },
  "finalJeopardy": {
    "enabled": false,
    "category": "",
    "clue": "",
    "correctResponse": ""
  }
}
```

## Recommended Agent Prompt

Use or adapt this prompt when asking an AI agent to build a new game:

```text
Research and create a complete Jeopardy-style game set for this project.

Requirements:
- Return valid JSON only, matching the documented game schema.
- Build a board with 6 categories and 5 clues per category unless I specify otherwise.
- The visible clue must go in "answer".
- The revealed Jeopardy-style response must go in "question".
- Keep clue text concise and readable on a shared meeting screen.
- Increase difficulty with clue value.
- Avoid ambiguous or weak clues.
- Use unique ids throughout.
- Include Final Jeopardy only if it improves the set.
- If facts are used, verify them before writing the final JSON.

Also provide a short summary of the theme and any clues that may need human review.
```

## Handoff And Use

After the JSON is created:

1. Validate it against the schema expectations in [GAME_SCHEMA.md](./GAME_SCHEMA.md).
2. If you generated or enriched media, spot-check a few links before the meeting.
3. If you want the game bundled into the distributable build, add or replace a JSON file under [`src/data/`](../src/data/) and rebuild.
4. If you only need a local host copy, use the host-side editing flow now.
5. If a host-panel upload or import flow is added later, this same JSON should be the input format.

## Human Review Recommendation

Even if an AI generates the full game set successfully, a human should still do one fast review before the meeting:

- read every category title
- spot-check a few clues per category
- check Final Jeopardy for fairness
- confirm the theme matches the meeting audience
