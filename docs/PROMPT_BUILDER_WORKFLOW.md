# Prompt Builder Workflow

This project includes a static prompt builder for generating repeatable AI prompts for:

- creating a brand-new game set
- enriching an existing game file with media

The builder is intended for hosts who want a structured handoff to an AI agent without retyping the same authoring instructions every time.

## Where To Open It

During local development:

- run `npm run dev`
- open `http://localhost:5173/gameset-prompt-builder.html`

From a production build:

- run `npm run build`
- open `dist/gameset-prompt-builder.html`

## Supported Flows

### Create A New Game

Use this when you want an agent to build a full new JSON board from scratch.

Recommended inputs:

- theme or subject area
- audience
- era or year range
- genre or domain
- tone
- category seeds
- how much media coverage you want

This mode generates a prompt that tells the agent to:

- follow the documented schema
- create categories and clues
- keep `answer` and `question` in the correct positions
- add verified media when requested
- validate JSON and run a build in repo-agent mode

### Enrich An Existing Game With Media

Use this when the clue set already exists and you want an agent to add:

- YouTube videos
- album art or cover art
- artist or subject images
- optional audio clips

This mode generates a prompt that tells the agent to:

- open a specific JSON file
- preserve clue wording unless there is a factual problem
- add media to as many clues as practical
- keep or replace existing media based on your choice
- avoid inventing URLs

## Media Guidance

The generated prompt is intentionally opinionated. It pushes the agent toward:

- official YouTube watch URLs for videos
- stable cover art or artwork URLs for images
- Wikipedia or Wikimedia artist images when a portrait is more useful than cover art
- concise alt text for every media item
- skipping weak or ambiguous media instead of guessing

For heavy showcase boards, use the `Link soup` coverage option. That tells the agent to attach verified media to as many clues as practical.

## Recommended User Process

1. Open the prompt builder page.
2. Pick `Create a new game` or `Enrich an existing game with media`.
3. Fill in the theme, era, genre, audience, and any specific constraints.
4. Set media coverage to `Link soup` if you want the most aggressive media pass.
5. Copy the generated prompt.
6. Paste it into your coding agent or chat model.
7. Review the resulting JSON or repo edits.
8. Validate with `npm run build`.

## Good Inputs

Stronger prompts come from stronger seed details. Good examples:

- `Theme: 90s alternative rock`
- `Era: 1991-1998`
- `Audience: music nerds`
- `Category seeds: albums, videos, producers, women-led bands, MTV, one-hit wonders`
- `Details: prefer official videos, deeper cuts over obvious radio singles, include media on as many clues as practical`

## Notes

- The prompt builder is static. It does not call any API on its own.
- It produces text only. The AI agent still does the research and editing.
- For repo-agent mode, the prompt assumes the agent can edit files and run validation commands in this repo.
