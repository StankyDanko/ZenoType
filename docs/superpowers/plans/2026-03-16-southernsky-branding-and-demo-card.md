# SouthernSky Brand Link & ZenoType Demo Card Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SouthernSky brand link to ZenoType and create an animated typing demo card for the StankyDanko portfolio.

**Architecture:** Two independent features across two repos. Feature 1 adds a fixed-position brand link element to ZenoType's App.tsx. Feature 2 creates a new self-contained ZenoTypeDemo component in StankyDanko that runs a looping typing animation with finger highlights and heat engine color progression.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react, Framer Motion (StankyDanko only)

---

## File Structure

### ZenoType (Feature 1)

| File | Action | Responsibility |
|------|--------|---------------|
| `src/App.tsx` | Modify | Add SouthernSky brand link element before Header |

### StankyDanko (Feature 2)

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/Headliners/ZenoTypeDemo.tsx` | Create | Self-contained animated typing demo component |
| `src/data/projects.ts` | Modify | Update ZenoType subtitle and description |
| `src/App.tsx` | Modify | Import ZenoTypeDemo, pass as children to ZenoType card |

---

## Chunk 1: SouthernSky Brand Link in ZenoType

### Task 1: Add SouthernSky brand link to ZenoType App.tsx

**Files:**
- Modify: `/home/danko/projects/ZenoType/src/App.tsx`

**Context:** The Header component renders at `fixed top-8 left-1/2 -translate-x-1/2 z-50`. The brand link goes outside this, anchored to the page's top-left corner at `top-8 left-4` to align vertically with the pill. The `Cloud` icon is already available from `lucide-react` (already a dependency).

- [ ] **Step 1: Add Cloud import**

At the top of `/home/danko/projects/ZenoType/src/App.tsx`, add to the existing imports:

```typescript
import { Cloud } from "lucide-react";
```

- [ ] **Step 2: Add brand link element**

In the JSX return, immediately before the `{/* HEADER */}` comment (before `<Header ...>`), add:

```tsx
      {/* SOUTHERNSKY BRAND LINK */}
      <a
        href="https://southernsky.cloud"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-8 left-4 z-50 flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity duration-300"
      >
        <Cloud className="w-5 h-5 text-blue-500" />
        <span className="hidden sm:inline text-sm font-bold tracking-wide text-white">
          SouthernSky
        </span>
      </a>
```

- [ ] **Step 3: Build and verify**

```bash
cd /home/danko/projects/ZenoType && npm run build
```

Expected: Build succeeds with zero errors.

- [ ] **Step 4: Visual verification**

```bash
cd /home/danko/projects/ZenoType && npm run dev
```

Open `http://localhost:5173/ZenoType/` and verify:
- Cloud icon + "SouthernSky" text visible in top-left on desktop
- Only cloud icon on mobile (resize to < 640px)
- Clicking opens southernsky.cloud in new tab
- Does not overlap the centered header pill
- Static blue+white colors (does not change with heat engine)

- [ ] **Step 5: Commit**

```bash
cd /home/danko/projects/ZenoType
git add src/App.tsx
git commit -m "feat: add SouthernSky Cloud brand link to top-left corner"
```

---

## Chunk 2: ZenoType Demo Card for StankyDanko Portfolio

### Task 2: Update ZenoType project data

**Files:**
- Modify: `/home/danko/projects/StankyDanko/src/data/projects.ts`

- [ ] **Step 1: Update ZenoType entry**

In `/home/danko/projects/StankyDanko/src/data/projects.ts`, replace the ZenoType entry (the third item in the `headliners` array):

```typescript
  {
    id: 'zenotype',
    title: 'ZENOTYPE',
    subtitle: 'AI Typing Coach (v0.8.0)',
    description: 'Terminal-inspired typing coach powered by remote AI. Ollama generates infinite educational text on any topic — real-time keystroke analytics, keyboard heatmaps, adaptive difficulty, gamified flow states, and Scripture mode.',
    color: '#9333EA',
    tags: ['LIVE', 'AI', 'Ollama', 'React'],
    links: [
      { label: 'LAUNCH ZENOTYPE →', url: 'https://stankydanko.github.io/ZenoType/', primary: true },
      { label: 'GitHub', url: 'https://github.com/StankyDanko/ZenoType' },
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
cd /home/danko/projects/StankyDanko
git add src/data/projects.ts
git commit -m "chore: update ZenoType card to v0.8.0"
```

---

### Task 3: Create ZenoTypeDemo component

**Files:**
- Create: `/home/danko/projects/StankyDanko/src/components/Headliners/ZenoTypeDemo.tsx`

This is the largest task. The component is self-contained — all animation logic, word data, finger mapping, and styling lives in this one file.

- [ ] **Step 1: Create the component file**

Create `/home/danko/projects/StankyDanko/src/components/Headliners/ZenoTypeDemo.tsx` with the full implementation:

```tsx
import { useReducer, useEffect, useRef } from 'react'

// --- CONSTANTS ---

const DEMO_TEXT =
  "The cosmic microwave background radiation provides a snapshot of the universe when it was just 380000 years old revealing tiny temperature fluctuations that would eventually grow into galaxies and galaxy clusters " +
  "Neural networks process information through layers of interconnected nodes each applying weighted transformations to extract increasingly abstract features from raw input data " +
  "Ocean currents transport enormous quantities of thermal energy across the planet with the Gulf Stream alone carrying roughly 1.4 petawatts of heat northward through the Atlantic basin " +
  "Quantum entanglement allows particles to share correlated states across arbitrary distances with measurements on one particle instantaneously constraining the possible outcomes for its partner"

const WORDS = DEMO_TEXT.split(' ')

// Simplified finger map: character → finger name
const FINGER_FOR_CHAR: Record<string, string> = {}
const fingerAssignments: [string, string][] = [
  ['l-pinky', 'qaz1'],
  ['l-ring', 'wsx2'],
  ['l-middle', 'edc3'],
  ['l-index', 'rtfgvb45'],
  ['r-index', 'yuhjnm67'],
  ['r-middle', 'ik8'],
  ['r-ring', 'ol9'],
  ['r-pinky', 'p0'],
]
for (const [finger, chars] of fingerAssignments) {
  for (const ch of chars) {
    FINGER_FOR_CHAR[ch] = finger
    FINGER_FOR_CHAR[ch.toUpperCase()] = finger
  }
}
FINGER_FOR_CHAR[' '] = 'thumbs'

// Heat engine color ladder (simplified 4-step)
interface ThemeStep {
  min: number
  color: string  // text/accent color
  bg: string     // background for fingers
  glow: string   // shadow glow
}

const HEAT_STEPS: ThemeStep[] = [
  { min: 0,   color: '#22d3ee', bg: 'bg-cyan-400',   glow: 'shadow-[0_0_8px_rgba(34,211,238,0.5)]' },
  { min: 80,  color: '#4ade80', bg: 'bg-green-400',   glow: 'shadow-[0_0_8px_rgba(74,222,128,0.5)]' },
  { min: 100, color: '#fbbf24', bg: 'bg-amber-400',   glow: 'shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
  { min: 120, color: '#fb7185', bg: 'bg-rose-400',    glow: 'shadow-[0_0_8px_rgba(251,113,133,0.5)]' },
]

function getTheme(tpm: number): ThemeStep {
  for (let i = HEAT_STEPS.length - 1; i >= 0; i--) {
    if (tpm >= HEAT_STEPS[i].min) return HEAT_STEPS[i]
  }
  return HEAT_STEPS[0]
}

// --- STATE MANAGEMENT (useReducer for atomic updates) ---

interface DemoState {
  wordIndex: number    // ever-increasing, use % WORDS.length to get actual word
  charIndex: number
  activeFinger: string
  tpm: number
}

const INITIAL_STATE: DemoState = {
  wordIndex: 0,
  charIndex: 0,
  activeFinger: '',
  tpm: 45,
}

type DemoAction =
  | { type: 'ADVANCE_CHAR' }
  | { type: 'TICK_TPM' }
  | { type: 'RESET' }

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'ADVANCE_CHAR': {
      const word = WORDS[state.wordIndex % WORDS.length]
      if (state.charIndex >= word.length) {
        // Word complete — advance to next word, show thumbs for space
        return {
          ...state,
          wordIndex: state.wordIndex + 1,
          charIndex: 0,
          activeFinger: 'thumbs',
        }
      }
      // Advance character within current word
      const ch = word[state.charIndex]
      return {
        ...state,
        charIndex: state.charIndex + 1,
        activeFinger: FINGER_FOR_CHAR[ch.toLowerCase()] ?? 'r-index',
      }
    }
    case 'TICK_TPM': {
      if (state.tpm >= 130) return { ...state, tpm: 45 }
      const jitter = Math.floor(Math.random() * 4) + 1
      return { ...state, tpm: state.tpm + jitter }
    }
    case 'RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

// --- FINGER COMPONENT ---

function DemoFinger({ active, h, rotate, theme }: {
  active: boolean
  h: string
  rotate?: string
  theme: ThemeStep
}) {
  return (
    <div
      className={`w-2 sm:w-2.5 rounded-full transition-all duration-150 ${h} ${rotate ?? ''} ${
        active
          ? `${theme.bg} ${theme.glow} opacity-100 scale-105`
          : 'bg-slate-800/40 opacity-50'
      }`}
    />
  )
}

// --- MAIN COMPONENT ---

export function ZenoTypeDemo() {
  const [state, dispatch] = useReducer(demoReducer, INITIAL_STATE)
  const [isVisible, setIsVisible] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tpmRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const theme = getTheme(state.tpm)

  // Intersection Observer — only animate when visible
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Start/stop animation based on visibility
  useEffect(() => {
    if (!isVisible) {
      if (typingRef.current) clearInterval(typingRef.current)
      if (tpmRef.current) clearInterval(tpmRef.current)
      return
    }

    dispatch({ type: 'RESET' })

    typingRef.current = setInterval(() => {
      dispatch({ type: 'ADVANCE_CHAR' })
    }, 100) // ~100ms per character ≈ 100 WPM

    tpmRef.current = setInterval(() => {
      dispatch({ type: 'TICK_TPM' })
    }, 500)

    return () => {
      if (typingRef.current) clearInterval(typingRef.current)
      if (tpmRef.current) clearInterval(tpmRef.current)
    }
  }, [isVisible])

  // Compute visible words — use ever-increasing wordIndex for seamless looping
  // Words behind the cursor and ahead of the cursor, wrapping via modulo
  const currentAbsIdx = state.wordIndex
  const lookBehind = 12
  const lookAhead = 20
  const visibleWords: { word: string; absIdx: number }[] = []
  for (let i = currentAbsIdx - lookBehind; i < currentAbsIdx + lookAhead; i++) {
    if (i < 0) continue
    visibleWords.push({ word: WORDS[i % WORDS.length], absIdx: i })
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-lg border border-slate-800 bg-[#090e17] overflow-hidden select-none"
    >
      {/* Neural thread label */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className="text-[10px] sm:text-xs font-mono tracking-wider opacity-80"
          style={{ color: '#22d3ee' }}
        >
          {'>> quantum mechanics'}
        </span>
      </div>

      {/* TPM counter */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold border border-white/10 bg-black/40"
          style={{ color: theme.color }}
        >
          {state.tpm} TPM
        </div>
      </div>

      {/* Typing area */}
      <div className="absolute inset-x-0 top-8 bottom-20 sm:bottom-24 px-4 sm:px-6 pt-4 overflow-hidden">
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#090e17] to-transparent z-10 pointer-events-none" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#090e17] to-transparent z-10 pointer-events-none" />

        <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-sm sm:text-base font-mono leading-relaxed">
          {visibleWords.map(({ word, absIdx }) => {
            const isTyped = absIdx < currentAbsIdx
            const isActive = absIdx === currentAbsIdx
            const isUpcoming = absIdx > currentAbsIdx

            return (
              <span
                key={absIdx}
                className={`transition-colors duration-200 ${
                  isTyped
                    ? 'text-green-500/40'
                    : isActive
                      ? 'relative'
                      : 'text-slate-600'
                }`}
              >
                {isActive ? (
                  <>
                    {/* Typed portion of active word */}
                    <span style={{ color: theme.color }}>
                      {word.slice(0, state.charIndex)}
                    </span>
                    {/* Cursor */}
                    <span
                      className="border-b-2 transition-colors duration-300"
                      style={{
                        color: 'rgba(148,163,184,0.8)',
                        borderColor: theme.color,
                      }}
                    >
                      {word[state.charIndex] ?? ''}
                    </span>
                    {/* Remaining */}
                    <span className="text-slate-500">
                      {word.slice(state.charIndex + 1)}
                    </span>
                  </>
                ) : isUpcoming ? (
                  <span className="zenotype-shimmer">{word}</span>
                ) : (
                  word
                )}
              </span>
            )
          })}
        </div>
      </div>

      {/* AI shimmer CSS */}
      <style>{`
        @keyframes zenotype-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .zenotype-shimmer {
          background: linear-gradient(
            90deg,
            #475569 0%,
            #94a3b8 50%,
            #475569 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: zenotype-shimmer 3s ease-in-out infinite;
        }
      `}</style>

      {/* Finger overlay */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-6 sm:gap-10">
        {/* Left hand */}
        <div className="flex items-end gap-0.5 sm:gap-1">
          <DemoFinger active={state.activeFinger === 'l-pinky'} h="h-5 sm:h-7" theme={theme} />
          <DemoFinger active={state.activeFinger === 'l-ring'} h="h-7 sm:h-10" theme={theme} />
          <DemoFinger active={state.activeFinger === 'l-middle'} h="h-8 sm:h-12" theme={theme} />
          <DemoFinger active={state.activeFinger === 'l-index'} h="h-7 sm:h-10" theme={theme} />
          <div className="ml-1 sm:ml-2 pb-1">
            <DemoFinger active={state.activeFinger === 'thumbs'} h="h-4 sm:h-6" rotate="-rotate-[35deg] origin-bottom-left" theme={theme} />
          </div>
        </div>

        {/* Right hand */}
        <div className="flex items-end gap-0.5 sm:gap-1">
          <div className="mr-1 sm:mr-2 pb-1">
            <DemoFinger active={state.activeFinger === 'thumbs'} h="h-4 sm:h-6" rotate="rotate-[35deg] origin-bottom-right" theme={theme} />
          </div>
          <DemoFinger active={state.activeFinger === 'r-index'} h="h-7 sm:h-10" theme={theme} />
          <DemoFinger active={state.activeFinger === 'r-middle'} h="h-8 sm:h-12" theme={theme} />
          <DemoFinger active={state.activeFinger === 'r-ring'} h="h-7 sm:h-10" theme={theme} />
          <DemoFinger active={state.activeFinger === 'r-pinky'} h="h-5 sm:h-7" theme={theme} />
        </div>
      </div>
    </div>
  )
}
```

**Note:** The `useState` import is still needed for `isVisible`. The full import line should be:
```tsx
import { useState, useReducer, useEffect, useRef } from 'react'
```

- [ ] **Step 2: Build and verify**

```bash
cd /home/danko/projects/StankyDanko && npm run build
```

Expected: Build succeeds with zero errors.

- [ ] **Step 3: Commit**

```bash
cd /home/danko/projects/StankyDanko
git add src/components/Headliners/ZenoTypeDemo.tsx
git commit -m "feat: add ZenoTypeDemo animated typing preview component"
```

---

### Task 4: Wire ZenoTypeDemo into the portfolio

**Files:**
- Modify: `/home/danko/projects/StankyDanko/src/App.tsx`

- [ ] **Step 1: Add import**

In `/home/danko/projects/StankyDanko/src/App.tsx`, add to the existing imports (after the OmniContent import on line 5):

```typescript
import { ZenoTypeDemo } from './components/Headliners/ZenoTypeDemo'
```

- [ ] **Step 2: Pass ZenoTypeDemo as children**

Replace line 42:
```tsx
          <HeadlinerCard project={zenotype} />
```

With:
```tsx
          <HeadlinerCard project={zenotype}>
            <ZenoTypeDemo />
          </HeadlinerCard>
```

- [ ] **Step 3: Build and verify**

```bash
cd /home/danko/projects/StankyDanko && npm run build
```

Expected: Build succeeds with zero errors.

- [ ] **Step 4: Visual verification**

```bash
cd /home/danko/projects/StankyDanko && npm run dev
```

Open the dev server URL and scroll to the ZenoType headliner card. Verify:
- Dark terminal viewport appears below the description
- Words are being "typed" with correct finger highlighting
- TPM counter climbs from ~45 to ~130 with color transitions (cyan → green → amber → rose)
- Neural thread label shows ">> quantum mechanics" in cyan
- AI shimmer effect visible on upcoming words
- Fingers animate at the bottom of the viewport
- Animation pauses when scrolled out of view
- Seamless loop (words wrap around without jarring reset)
- Responsive: looks good on mobile (smaller fingers, fewer visible words)

- [ ] **Step 5: Commit**

```bash
cd /home/danko/projects/StankyDanko
git add src/App.tsx
git commit -m "feat: wire ZenoTypeDemo into portfolio headliner card"
```

---

## Validation Checklist

### ZenoType (Feature 1)
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] Cloud icon + "SouthernSky" visible top-left on desktop
- [ ] Only cloud icon visible on mobile (< 640px)
- [ ] Clicking opens southernsky.cloud in new tab
- [ ] Does not overlap or interfere with the centered header pill
- [ ] Static blue+white colors (not affected by heat engine)

### StankyDanko (Feature 2)
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] ZenoType card shows animated typing demo
- [ ] Animation plays when card scrolls into view
- [ ] Animation pauses when scrolled out of view
- [ ] Words scroll continuously without jarring reset
- [ ] Fingers animate in sync with "typed" characters
- [ ] TPM counter climbs with heat engine color shift
- [ ] AI shimmer effect on upcoming words
- [ ] Responsive on mobile
