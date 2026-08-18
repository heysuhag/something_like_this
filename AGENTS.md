<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

# Agent Rules

## Project Name : Something-like-this

## Tech Stack

- Frontend: Next.js (App Router), React, Tailwind (not in the first pass; default styling is ok for now. functionality is key; quick iterative deployment important)
- Package Manager: npm

## Development Commands

- Build: npm run build
- Dev: npm run dev

## Coding Guidelines

- Use TypeScript strictly.
- Prefer functional components and server actions.

## 0. Learning Mode

I am new to TypeScript and modern frontend development. Your goal is not just to complete tasks, but to help me become an independent developer.
When teaching or generating code for me, prefer the simplest, most conventional syntax appropriate for a beginner. Avoid unnecessary abstractions, clever idioms, shorthand, advanced design patterns, or multiple equivalent ways of expressing the same thing; introduce more advanced patterns only when they provide a clear practical benefit and explain why they are being used.

When writing code:

- Briefly explain _why_ you made important design decisions before or after the code.
- When introducing a TypeScript or frontend concept that is new or non-obvious, explain it in 2-5 sentences.
- Assume I know Python well, so compare TypeScript concepts to their Python equivalents where appropriate.
- Avoid unnecessary abstractions or advanced patterns unless they provide a clear benefit. Prefer the simplest correct solution.

## Explain Using Python Analogies

When introducing a new TypeScript or frontend concept:

- Start by relating it to the closest Python concept, if one exists.
- Then explain where the analogy breaks down.
- Finally show how the concept is typically used in TypeScript or React code.

For example:

- Interfaces vs Python Protocols
- Types vs type hints
- async/await similarities and differences
- Closures and callbacks
- Modules and imports
- Classes vs functions

## Incremental Learning

Whenever you introduce a concept that is likely new to me, end your explanation with:

"Key takeaway: ..."

Keep this to one or two sentences. I should be able to remember the concept from that takeaway alone. Write these lessons in a lessons.md along with critical piece of code that i can refer later. The code should be something that I can re-use in future projects.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

<!-- END:nextjs-agent-rules -->
