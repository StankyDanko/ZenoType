# ZenoType — AI Typing Coach

## Identity

ZenoType is a terminal-inspired typing coach powered by AI via Ollama. It dynamically generates educational typing text on any topic, tracks detailed keystroke analytics, and gamifies the typing experience with Transformer words, flow states, and adaptive difficulty.

| | |
|---|---|
| **Current Version** | 0.8.0 |
| **Status** | Portfolio project, active development |
| **Deployment** | GitHub Pages — https://stankydanko.github.io/ZenoType/ (auto-deploy on push to main) |
| **AI Endpoint** | `https://zenotype-api.southernsky.cloud` (Reliable VPS) |

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Language** | TypeScript | 5.x | Strict mode via `tsconfig.app.json` |
| **UI** | React | 19.2 | Functional components + hooks |
| **Styling** | Tailwind CSS | 4.2 | v4 native Vite plugin (`@tailwindcss/vite`) |
| **Icons** | lucide-react | 0.575 | UI icons |
| **Build** | Vite | 7.x | Fast builds, HMR |
| **AI Backend** | Ollama | Remote | Custom `zenotype-backend` model (qwen2.5:7b) |

## Quick Start

```bash
npm install
npm run dev       # Vite dev server with HMR
npm run build     # tsc -b && vite build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint
```

### Ollama Configuration

By default, the app connects to the remote endpoint at `https://zenotype-api.southernsky.cloud`. To use a local Ollama instance during development:

```bash
# Create .env.local (gitignored)
echo 'VITE_OLLAMA_URL=http://localhost:11434' > .env.local
```

See `SERVER.md` for remote server setup details.

## Project Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Orchestrator (~340 lines)
├── App.css                     # Custom animations (pop-glow keyframes)
├── index.css                   # Tailwind base styles
├── config.ts                   # OLLAMA_BASE_URL (env-configurable)
├── types.ts                    # Shared types (Difficulty, Word, ThemeConfig, etc.)
├── vite-env.d.ts               # Vite env type declarations
├── constants/
│   ├── keyboard.ts             # KEYBOARD_ROWS, FINGER_MAP, SHIFT_CHARS
│   ├── sentences.ts            # Offline sentence pools, generateWords()
│   ├── bible.ts                # BIBLE_BOOKS, CHAPTER_COUNTS, CURATED_PASSAGES
│   └── theme.ts                # THEME_CLASSES, getThemeForTPM() heat engine
├── hooks/
│   ├── useOllama.ts            # AI model detection, topic + text generation
│   ├── useScripture.ts         # Bible API, chapter nav, scholar insight
│   ├── useGameEngine.ts        # TPM, timer, scoring, chart data
│   ├── useKeyStats.ts          # Keystroke accuracy (localStorage-backed)
│   └── useHotkeys.ts           # Global keyboard shortcuts
└── components/
    ├── Header.tsx              # Dynamic island nav + thread/scripture banner
    ├── Settings.tsx             # Settings dropdown panel
    ├── Analytics.tsx            # Full-screen analytics overlay + heatmap
    ├── TopicSelect.tsx          # Neural Uplink topic grid
    ├── ScriptureSelect.tsx      # Bible book/chapter picker
    ├── TypingArea.tsx           # Core typing canvas
    ├── WordRenderer.tsx         # Single word render (active/past/future)
    └── GuideHands.tsx           # CSS finger overlay
```

## Architecture

**Props-over-Context** — no React Context or state management library. App.tsx composes all hooks and passes props down. Hooks never call each other directly; all cross-hook coordination goes through App.tsx.

**Hook ownership:** Each hook owns its domain state. Key owners:
- `useOllama` — AI state, `flowMilestone`, `activeThread`
- `useGameEngine` — timer, TPM, scoring, `resetGameState()`
- `useKeyStats` — keystroke accuracy (localStorage)
- `useScripture` — Bible progress, scholar insight
- `useHotkeys` — dispatches callbacks (owns no state)

**Session starters** live in App.tsx: `startSessionWithTopic()`, `startSessionOffline()`, `handleReset()`.

**Input handler** (`handleInputChange`) lives in App.tsx — coordinates across hooks.

## Core Features

- **Neural Uplink:** AI-generated topic synthesis (8 topics per session)
- **Persistent Neural Thread:** Context maintained across paragraphs
- **ASCII Sanitization:** Curly quotes → straight quotes, strips non-typeable characters
- **Terminal Analytics:** Rolling TPM graph, raw keystroke accuracy, worst keys metric
- **QWERTY Heatmap:** Color-coded key proficiency (green >90%, amber 60-90%, rose <60%)
- **Cybernetic Guide Hands:** Geometric hand overlays showing correct finger/shift
- **Transformer Words:** 5% purple "Transformer" words; 5 captures → Flow State sprint
- **5 Text Modes:** Standard, Code, Syntax, Scripture, Adaptive
- **Heat Engine Theme:** Color shifts from blue→cyan→green→amber→rose based on TPM

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Toggle Session Analytics (pause/unpause) |
| `Alt+S` | Toggle Session Analytics |
| `Alt+O` | Toggle Settings |
| `Alt+H` | Toggle Guide Hands |
| `Alt+R` | Return to Neural Uplink (new topics) |
| `Alt+↓/↑` | Cycle text visibility depth (2-10 lines) |

## Development Notes

- Deployed via GitHub Actions (`.github/workflows/deploy.yml`) — push to main auto-deploys to gh-pages
- Vite `base: "/ZenoType/"` is required for GitHub Pages subdirectory hosting
- Scripture mode uses bible-api.com (free, no auth) + Ollama for scholar commentary
- Remote AI endpoint documented in `SERVER.md`
- All `localhost:11434` references replaced with `OLLAMA_BASE_URL` from `config.ts`

## Code Conventions

- TypeScript strict mode
- React functional components with hooks
- Tailwind CSS v4 for styling
- lucide-react for icons
- camelCase for functions/variables, PascalCase for components
- SCREAMING_SNAKE_CASE for game constants
- Named exports for components
