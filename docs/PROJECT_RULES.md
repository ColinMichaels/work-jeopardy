# Project Rules

## Purpose

Work Jeopardy is a self-contained, local-only Jeopardy-style game for internal team meetings. It should remain simple, reliable, typed, and easy to hand off.

## Core Constraints

- Use `TypeScript` throughout.
- Use `React + Vite + Tailwind CSS` unless there is a strong technical reason to change.
- Keep the app frontend-only.
- Do not add a backend, database, authentication, or cloud dependency.
- Do not require internet access after the app is built.
- Keep the final output suitable for local use and screen sharing.

## Architecture Rules

- Prefer small, focused files.
- Keep UI components separate from game logic.
- Keep config parsing and validation separate from rendering.
- Avoid unnecessary abstractions, state libraries, and complex patterns.
- Favor explicit, readable code over clever code.

## Content Rules

- All game data must come from a JSON config file.
- The JSON format must stay easy for non-developers to edit manually.
- Keep strong TypeScript types for the config model.
- Bad JSON must fail gracefully with clear errors.

## UI Rules

- Optimize for meeting-room readability.
- Use large text, high contrast, and obvious click targets.
- Maintain clear states for unused, used, selected, and revealed clues.
- Keep the host workflow simple and fast.

## Feature Priorities

1. App shell
2. JSON config loading
3. Jeopardy board rendering
4. Clue modal and reveal flow
5. Team score tracking
6. Reset controls
7. Optional `localStorage`
8. Quality-of-life improvements

## Non-Goals

Do not spend time on:

- backend APIs
- multiplayer sync
- login systems
- hosting pipelines
- heavy animation systems
- overbuilt sound systems
- advanced editor tooling before MVP

## Coding Standards

- Use strict typing where practical.
- Prefer named types and interfaces for game structures.
- Avoid `any` unless there is no reasonable alternative.
- Add comments only where they improve clarity.
- Keep helper functions pure when practical.
- Keep components presentation-focused.

## File Organization

Target a structure like:

```text
/src
  /components
  /data
  /lib
  /models
  /styles
  /types
  App.tsx
  main.tsx
```

## Naming Conventions

- Use PascalCase for components.
- Use camelCase for functions and variables.
- Use kebab-case for non-component file names where it improves readability.

## Delivery Expectations

- The project must build cleanly.
- The final game must run locally.
- Documentation must cover install, run, build, JSON editing, and local handoff.

## Decision Rule

When in doubt, choose the option that is:

1. simpler
2. easier to maintain
3. easier to hand off
4. easier to edit for future games
