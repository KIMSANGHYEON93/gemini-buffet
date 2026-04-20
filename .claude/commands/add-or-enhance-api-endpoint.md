---
name: add-or-enhance-api-endpoint
description: Workflow command scaffold for add-or-enhance-api-endpoint in gemini-buffet.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-enhance-api-endpoint

Use this workflow when working on **add-or-enhance-api-endpoint** in `gemini-buffet`.

## Goal

Adds a new API endpoint or significantly enhances an existing one, including implementation, updating related UI, and sometimes updating dependencies or documentation.

## Common Files

- `app/api/*/route.ts`
- `app/page.tsx`
- `app/components/*`
- `package.json`
- `package-lock.json`
- `README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update app/api/[endpoint]/route.ts with new logic.
- Update or create related UI files (e.g., app/page.tsx, app/components/*) if the endpoint is user-facing.
- Update package.json and package-lock.json if new dependencies are needed.
- Update README.md if public API or usage changes.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.