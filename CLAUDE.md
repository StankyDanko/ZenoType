# ZenoType — AI Typing Coach

## Identity

ZenoType is a terminal-inspired typing coach powered by local AI via Ollama. It dynamically generates educational typing text on any topic, tracks detailed keystroke analytics, and gamifies the typing experience with Transformer words, flow states, and adaptive difficulty.

| | |
|---|---|
| **Current Version** | 0.7.1 ("The Cultural Uplink") |
| **Status** | Portfolio project, active development planned |
| **Deployment** | Local dev only (future: GitHub Pages or similar) |

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **UI** | React | 19.2 | JSX (not TypeScript yet) |
| **Styling** | Tailwind CSS | 4.2 | v4 native Vite plugin (`@tailwindcss/vite`) |
| **Icons** | lucide-react | 0.575 | UI icons |
| **Build** | Vite | 7.x | Fast builds, HMR |
| **AI Backend** | Ollama | Local | Custom "zenotype" modelfile (llama3.2:3b) |

## Quick Start

```bash
npm install
npm run dev       # Vite dev server with HMR
npm run build     # vite build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint
```

### Ollama Setup (Required for AI features)

1. Ensure Ollama is running with CORS enabled:
   ```
   Environment="OLLAMA_HOST=0.0.0.0"
   Environment="OLLAMA_ORIGINS=*"
   ```

2. Create the custom model:
   ```bash
   # Save Modelfile (see README.md for content)
   ollama create zenotype -f Modelfile
   ```

## Project Structure

```
src/
├── main.jsx          # Entry point
├── App.jsx           # Entire app (monolithic — ~2000 lines)
├── App.css           # Custom styles
├── index.css         # Tailwind base styles
└── assets/
    └── react.svg
```

**Note:** The app is currently a single monolithic `App.jsx` file. Future development should consider component extraction.

## Core Features

- **Neural Uplink:** AI-generated topic synthesis (8 topics per session)
- **Persistent Neural Thread:** Context maintained across paragraphs
- **ASCII Sanitization:** Curly quotes → straight quotes, strips non-typeable characters
- **Terminal Analytics:** Rolling TPM graph, raw keystroke accuracy, worst keys metric
- **QWERTY Heatmap:** Color-coded key proficiency (green >90%, amber 60-90%, rose <60%)
- **Cybernetic Guide Hands:** Geometric hand overlays showing correct finger/shift
- **Transformer Words:** 5% purple "Transformer" words; 5 captures → Flow State sprint
- **3 Text Modes:** Standard, Code, Syntax

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

- All game logic is in `App.jsx` — no component extraction yet
- Ollama connection is hardcoded to `http://localhost:11434`
- `.bak` files exist (App.jsx.bak, bak2, bak3) — previous iterations, can be cleaned up
- No TypeScript yet (uses `.jsx`) — migration to `.tsx` would be a good future task
- No deployment pipeline yet — local development only

## Code Conventions

- React functional components with hooks
- Tailwind CSS v4 for styling
- lucide-react for icons
- camelCase for functions/variables, PascalCase for components
- SCREAMING_SNAKE_CASE for game constants
