# SouthernSky Brand Link & ZenoType Animated Demo Card

**Date:** 2026-03-16
**Status:** Approved
**Scope:** Two features across two repos — SouthernSky brand link in ZenoType, animated typing demo card in StankyDanko portfolio.

---

## 1. Goals

1. Add a SouthernSky Cloud Services branded link to ZenoType's top-left corner, tying it to the SouthernSky ecosystem
2. Create an animated ZenoType demo card for the StankyDanko portfolio that showcases the app's AI-powered typing experience

## 2. Non-Goals

- Changing ZenoType's existing header pill layout or game mechanics
- Modifying the HeadlinerCard base component in StankyDanko
- Adding new npm dependencies to either project
- Building an interactive/playable demo (this is view-only animation)

---

## 3. Feature 1: SouthernSky Brand Link in ZenoType

### 3.1 Placement

Fixed top-left corner of the page, outside ZenoType's centered dynamic island header. Positioned at `top-8 left-4` to align vertically with the header pill (which uses `top-8`).

### 3.2 Visual

Recreate the SouthernSky navbar branding from southernsky.cloud:
- Lucide-react `Cloud` icon, `text-blue-500`, sized ~20x20 (scaled down from homepage's 40x40)
- "SouthernSky" text in white, `font-bold tracking-wide`, `text-sm`
- Horizontal flex layout with small gap between icon and text

### 3.3 Behavior

- `<a href="https://southernsky.cloud" target="_blank" rel="noopener noreferrer">`
- Hover transition: `opacity-70` resting → `opacity-100` on hover
- Static blue+white colors — does NOT inherit from ZenoType's heat engine theme. This reads as a separate brand mark, not part of the game UI.

### 3.4 Responsive

On screens < 640px, collapse to just the cloud icon (hide "SouthernSky" text) to avoid crowding the header pill.

### 3.5 Z-Index

`z-50` — same as the header, above the typing area.

### 3.6 Implementation Location

New element rendered in `App.tsx`, outside the `<Header>` component. It's a page-level element, not a header child.

---

## 4. Feature 2: ZenoType Animated Demo Card (StankyDanko Portfolio)

### 4.1 Component

New file: `src/components/Headliners/ZenoTypeDemo.tsx`

Self-contained animation component that renders inside HeadlinerCard's `{children}` slot, following the same pattern as `NaptimesOverContent` (from `NaptimesOver.tsx`) and the content in `OmniCard.tsx`.

### 4.2 Visual Structure

The component renders a dark terminal-style viewport (full-width, ~16:9 aspect ratio) containing three layers:

#### Layer 1: Typing Area (top ~75%)

- Pre-defined sentences scroll upward continuously as words are "typed"
- Three word states:
  - **Typed:** Dimmed, slight green tint (completed words)
  - **Active:** Bright, heat engine color + cursor-like underline (current word)
  - **Upcoming:** Gray (`text-slate-600`, not yet reached)
- Words wrap naturally in lines. As the active word advances, completed lines slide up and fade out at the top edge. New lines appear at the bottom.
- **AI shimmer effect:** Upcoming words have a subtle left-to-right shimmer/gradient sweep that plays occasionally — a CSS `background-clip: text` animation on a gradient, suggesting text is being "generated" by AI.
- **Neural thread label:** Small static label floats top-left of the viewport (e.g., `">> quantum mechanics"`) in cyan (`#22d3ee`), showing the AI topic context. Does not change during the animation loop.

#### Layer 2: Finger Overlay (bottom ~25%)

- Simplified recreation of ZenoType's CSS finger shapes — 10 rounded divs total (5 per hand), same height ratios and thumb rotation from `GuideHands.tsx`
- Fingers light up in sequence matching the "typed" characters, using the heat engine color
- Horizontally centered at the bottom of the viewport

#### Layer 3: TPM Counter (floating, top-right)

- Small pill showing a number that gradually climbs (e.g., 45 → 120 over ~30 seconds)
- Increments by 2-5 every 500ms with slight random variance to simulate realistic TPM fluctuation
- Color shifts through the simplified 4-step heat engine ladder as the number climbs: cyan → green → amber → rose
- Reinforces the gamification/performance tracking aspect

### 4.3 Container Styling

- Background: `bg-[#090e17]` (matching ZenoType's terminal aesthetic)
- Border: `border border-slate-800` with subtle inner glow
- Rounded corners: `rounded-lg`
- Overflow hidden (words clip at top/bottom edges)

### 4.4 Animation Engine

- A `setInterval` or `requestAnimationFrame` loop drives the entire animation
- Pre-scripted "keystrokes" fire at ~80-120ms intervals (simulating ~100 WPM typing)
- Word list: curated set of 80-100 words forming 3-4 flowing sentences on varied topics (science, space, music) to showcase AI topic variety
- **Seamless loop:** When the last word completes, text wraps back to the beginning. The continuous upward scroll means the user never sees a hard reset. Old lines fade out at the top while "new" lines (which are the beginning of the word list again) enter at the bottom.
- **Intersection Observer:** Animation only runs when the card is visible in the viewport (performance optimization — no wasted CPU when scrolled away)
- **Cleanup:** All timers and observers must be cleaned up in a `useEffect` cleanup function on unmount

### 4.5 Heat Engine Color Progression

The TPM counter climbs over ~30 seconds. As it climbs, the active word color and finger highlight color shift through ZenoType's heat engine ladder:

| TPM Range | Color | Hex |
|-----------|-------|-----|
| < 80 | Cyan | `#22d3ee` |
| 80-100 | Green | `#4ade80` |
| 100-120 | Amber | `#fbbf24` |
| > 120 | Rose | `#fb7185` |

Simplified from ZenoType's full 8-step ladder to 4 steps for the demo (enough to show the concept).

### 4.6 Responsive

On mobile: fewer visible lines of text, smaller finger shapes, same animation timing. The viewport maintains 16:9 aspect ratio and scales with card width.

### 4.7 Finger-to-Character Mapping

Use a simplified version of ZenoType's `FINGER_MAP` — map each letter to a finger (l-pinky through r-pinky) so the correct finger lights up as each character is "typed." Thumbs light for space bar.

---

## 5. Data Changes (StankyDanko)

### 5.1 `src/data/projects.ts`

Update ZenoType entry:
- `subtitle`: Update to reference v0.8.0
- `description`: Update to mention AI-powered text generation and remote inference

### 5.2 `src/App.tsx`

Import `ZenoTypeDemo` and pass as children to the ZenoType HeadlinerCard.

---

## 6. What Stays Unchanged

- ZenoType's existing header pill layout, game mechanics, all other UI
- StankyDanko's HeadlinerCard base component
- Other headliner cards (Naptime's Over, OMNI)
- No new npm dependencies in either project

---

## 7. Validation

1. **ZenoType brand link:**
   - `npm run build` passes
   - Cloud icon + "SouthernSky" visible top-left on desktop
   - Only cloud icon visible on mobile (< 640px)
   - Clicking opens southernsky.cloud in new tab
   - Does not overlap or interfere with the centered header pill

2. **StankyDanko demo card:**
   - `npm run build` passes
   - Animation plays smoothly when card scrolls into view
   - Animation pauses when scrolled out of view
   - Words scroll continuously without visible reset
   - Fingers animate in sync with "typed" characters
   - TPM counter climbs with heat engine color shift
   - Responsive on mobile
