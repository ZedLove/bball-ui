# bball-ui

A real-time MLB game tracking dashboard — a glanceable mobile-first SPA that connects to the [ZedLove/bball](https://github.com/ZedLove/bball) backend and renders live game state as it comes in.

## What it does

- Shows the live score, inning, and the key stat for the tracked team: outs remaining (defending), runs needed (batting in extras), or current batting state
- Displays current pitcher stats and flags pitching changes
- Handles between-innings and game-over transitions
- Supports dark and light themes (Zenburn-inspired palette) with system-preference detection and a manual toggle
- Installable as a PWA — loads from service-worker cache offline and hydrates the last-known game state from `localStorage` on cold start

## Tech stack

| Layer         | Choice                                            |
| ------------- | ------------------------------------------------- |
| Framework     | React 19 + TypeScript 6                           |
| Build         | Vite 8                                            |
| Styling       | Tailwind CSS v4 (Vite plugin)                     |
| State         | Zustand v5 with `persist` + `devtools` middleware |
| Real-time     | socket.io-client v4                               |
| PWA           | vite-plugin-pwa (Workbox)                         |
| Tests         | Vitest v4 + @testing-library/react                |
| Lint / format | ESLint v10 + typescript-eslint + Prettier         |

## Prerequisites

- Node 22+
- The [ZedLove/bball](https://github.com/ZedLove/bball) backend running locally (defaults to `http://localhost:4000`)

## Installation

```bash
git clone https://github.com/ZedLove/bball-ui.git
cd bball-ui
npm install
cp .env.example .env.local   # edit VITE_SOCKET_URL if the backend is on a different port
```

## Usage

```bash
npm run dev          # dev server at http://localhost:5173
npm run build        # type-check + Vite build → dist/
npm run preview      # serve the production build locally
npm run test:run     # run all tests once
npm run lint         # ESLint
npm run format       # Prettier auto-fix
```

## Environment variables

| Variable          | Description                        | Default                 |
| ----------------- | ---------------------------------- | ----------------------- |
| `VITE_SOCKET_URL` | URL of the bball Socket.IO backend | `http://localhost:4000` |

Set in `.env.local` for local development. In CI/production, set as a GitHub Actions secret named `VITE_SOCKET_URL`.

## Deployment

The app is deployed to GitHub Pages via GitHub Actions on every push to `main`. The built files are served from the `/bball-ui/` base path.

To enable deployment in a fork:

1. Go to **Settings → Pages → Source** and select **GitHub Actions**
2. Add a `VITE_SOCKET_URL` secret under **Settings → Secrets → Actions**
   import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
]);

```

```
