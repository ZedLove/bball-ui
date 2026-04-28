# Bball-UI Agent Instructions

React/TypeScript browser SPA — real-time MLB game tracker frontend. Connects to a Socket.IO
backend (`~/workspace/bball`) and renders live game state.

## Tech Stack

- **Runtime**: Browser SPA — Vite 8 dev server / bundler
- **UI**: React 19 · TypeScript 6 · Tailwind CSS v4 (Vite plugin, no config file needed)
- **State**: Zustand v5 (`devtools` middleware; `useGameStore`)
- **Socket**: socket.io-client v4 — managed by `useSocket` hook
- **Module resolution**: `bundler` — local imports use **no file extension**
- **`verbatimModuleSyntax: true`** — `import type` required for all type-only imports
- **Tests**: Vitest v4 · @testing-library/react v16 · @testing-library/user-event · jsdom
- **Lint/format**: ESLint v10 + typescript-eslint v8 · Prettier v3

## Commands

```bash
npx tsc -b --noEmit       # type-check all tsconfig references (run after type changes)
npm run lint              # eslint . — must be clean (zero warnings, zero errors)
npx prettier --check .    # format check (run npm run format to auto-fix)
npm run format            # auto-fix formatting
npm run test:run          # vitest run — single-pass, all tests
npm run test:coverage     # vitest run --coverage
npm run dev               # Vite dev server at http://localhost:5173
npm run build             # tsc -b && vite build → dist/
```

No coverage thresholds are enforced by CI — do not let coverage regress on new code paths.

## Architecture

```
src/
  game-update.ts     # GameUpdate, TeamInfo, and all sub-types — backend socket contract
  game-events.ts     # GameEventsPayload, PitchingSubstitutionEvent — game-events socket contract
  main.tsx           # React entry point
  App.tsx            # Root — calls useSocket() + useGameTimers(), routes GameView vs IdleView
  index.css          # Global styles (Tailwind base, custom animations)
  components/        # Pure presentational React components
  hooks/             # React hooks (useSocket, useGameTimers)
  store/             # Zustand store — useGameStore (also exports ConnectionStatus type)
  test/
    setup.ts         # @testing-library/jest-dom import
    fixtures.ts      # Shared makeUpdate() factory for component tests
plans/               # Markdown feature plans — source of truth for roadmap
```

**Component tree (current — end of Phase 4):**

```
App
├── ConnectionStatus
├── GameView                          (update !== null)
│   ├── DelayBanner                   (isDelayed === true)
│   ├── Scoreboard                    (always rendered)
│   └── TrackingWidget (switch on trackingMode)
│       ├── OutsDisplay               ('outs') ← includes PitcherInfo
│       ├── RunsNeeded                ('runs')
│       ├── BetweenInningsView        ('between-innings')
│       ├── BattingView               ('batting')
│       └── GameOverView              ('final' — early return)
└── IdleView                          (update === null)
```

Phase 5 will consolidate `'outs'`/`'runs'`/`'batting'` into field-based sub-routing under `'live'`,
add full pitcher stats, upcoming pitcher, and `game-events` pitching-change detection.

**Key files:**

- `src/game-update.ts` — `GameUpdate`, `TeamInfo`, and all sub-types; keep in sync with `~/workspace/bball/src/server/socket-events.ts`
- `src/game-events.ts` — `GameEventsPayload`, `PitchingSubstitutionEvent`; types for the `game-events` socket event
- `src/store/gameStore.ts` — Zustand store; also exports `ConnectionStatus` type
- `src/hooks/useSocket.ts` — creates the socket, wires `connect`/`disconnect`/`game-update`/`game-events` events
- `.env.local` / `.env.example` — `VITE_SOCKET_URL` (backend address); all env vars must be prefixed `VITE_`

## Backend Contract

The backend emits two Socket.IO events:

### `game-update` (payload: `GameUpdate`)

| `trackingMode`      | Emit frequency        | Meaning                                    |
| ------------------- | --------------------- | ------------------------------------------ |
| `'live'`            | Every poll tick ~10 s | Game in active play (batting or defending) |
| `'between-innings'` | Once on transition    | Half-inning ended                          |
| `'final'`           | Once on transition    | Game ended                                 |
| _(no event)_        | —                     | No active game                             |

**`'live'` mode sub-routing** — the UI derives the sub-display from field presence:

| Condition                | Display       | Meaning                                    |
| ------------------------ | ------------- | ------------------------------------------ |
| `outsRemaining !== null` | `OutsDisplay` | Target team defending                      |
| `runsNeeded !== null`    | `RunsNeeded`  | Target team batting in extras, tied/losing |
| Neither                  | `BattingView` | Target team batting in regulation          |

`'between-innings'` and `'final'` are transition-only — the UI receives one event then goes
silent. `'live'` emits continuously. The design must be comfortable in silence for transition modes.

### `game-events` (payload: `GameEventsPayload`)

Batched game events emitted per poll window. Includes pitching substitutions, plate appearances,
and other in-game events. The frontend currently listens for `category: 'pitching-substitution'`
to drive the pitching-change indicator.

Socket event name strings are used directly (`'game-update'`, `'game-events'`, `'connect'`, `'disconnect'`).
There is no `SOCKET_EVENTS` constant in this repo.

## Conventions

**File structure**

- No catch-all files — `types.ts`, `constants.ts`, `utils.ts`, `helpers.ts` are forbidden. They
  become dumping grounds with no clear ownership.
- Types live in the file where they are primarily used and are exported from there. For example,
  `ConnectionStatus` lives in `store/gameStore.ts` because the store owns that state.
- When a type is genuinely shared across many files with no single owner (e.g. the backend contract
  shape), give it a purpose-named file that describes the domain concept: `game-update.ts`, not
  `types.ts`.
- Test files are co-located next to their source file (`GameView.test.tsx` beside `GameView.tsx`).
  Never create a separate `__tests__/` directory.

**Imports**

- No file extensions on local imports — `import { foo } from './foo'`
- `import type` for every type-only import (required by `verbatimModuleSyntax`)
- No barrel/index re-export files — import directly from the source module

**TypeScript**

- `strict: true` — no `any`, no non-null assertions (`!`) without a comment justifying them
- Optional fields absent in a given mode → `null` (not `undefined`, not omitted)
- Exhaustive `switch` on `trackingMode` with a `satisfies never` default branch (see `GameView.tsx`)

**React components**

- Named exports only — no default exports for components. **Exception**: `App.tsx` uses a default
  export because it is the Vite entry point imported by `main.tsx`.
- Props interfaces defined inline in the same file (no shared props files)
- Private subcomponents used only within one file (e.g. `TrackingWidget` inside `GameView.tsx`) may
  stay co-located. Extract to their own file when they grow large enough to impede readability or
  when they need to be reused or tested independently.
- Tailwind utility classes directly on JSX — no CSS modules. A `cn()` helper (clsx/tailwind-merge)
  will be added in Phase 4 when conditional class composition becomes unwieldy.
- Mobile-first layout; `max-w-sm` centred column — this is a glanceable dashboard, not a data grid

**Design tokens (Tailwind classes)**

| Role                    | Class                     |
| ----------------------- | ------------------------- |
| Page background         | `bg-gray-950`             |
| Card / panel            | `bg-gray-900`             |
| Primary text            | `text-white`              |
| Secondary text          | `text-gray-400`           |
| Muted text              | `text-gray-500`           |
| Outs recorded (filled)  | `bg-white`                |
| Outs remaining (hollow) | `border-2 border-white`   |
| Extras badge            | `bg-amber-500 text-black` |

**Testing**

Component tests use `render` + `screen` from `@testing-library/react` and `@testing-library/jest-dom`
matchers (`toBeInTheDocument`, etc.).

- **Shared fixture**: component tests import `makeUpdate` from `../test/fixtures` and pass
  `Partial<GameUpdate>` overrides. Add overrides only when they are relevant to the test.
- **Inline fixtures**: store/hook tests that need a full object define it inline in the test file.
- `renderHook` for testing hooks; `vi.mock` for external modules (e.g. `socket.io-client`).
- Exact-value assertions preferred (`toBe`, `toEqual`) over `toBeTruthy`/`toBeFalsy`.
- Prefer `screen.getByRole` / `getByText` over `getByTestId` — query by what the user sees.

**Commits** — Conventional Commits, single-line:

```
feat(scope): description
feat!: description           # breaking change
fix(scope): description
refactor(scope): description
chore(scope): description
```

Common scopes: `components`, `hooks`, `store`, `types`, `socket`, `config`, `deploy`

- Prefer including test/type changes inside the relevant `feat` commit.
- No `fix` commits on a feature branch — fix silently inside the `feat` commit or note for follow-up.
- Never mention Copilot, planning documents, or phase numbers in commit messages.
- Never run `git push` — work is complete when commits are staged locally.

## Plans

Feature roadmap lives in `plans/next-steps.md`. Phase plans are in `plans/phase-*.md`. The active
phase plan is the source of truth for scope, decisions, and task breakdown.

Current status: Phase 4 complete. Phase 5 (`plans/phase-5-backend-alignment.md`) is next.
