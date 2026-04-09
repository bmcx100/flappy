# Geometry Dash Clone — Design Spec

## Overview

A side-scrolling auto-runner where the player controls a square cube that automatically moves right. Tap/click/spacebar to jump over obstacles. One-hit death restarts from the beginning of the level. The visual style is neon geometric shapes on a dark background — the signature Geometry Dash aesthetic.

## Core Mechanics

### Player
- A square cube (24x24) that auto-scrolls rightward
- The cube stays at a fixed X position on screen; the world scrolls left
- Single tap = jump (fixed height, no variable jump)
- Cube rotates while airborne (visual only, hitbox stays square)
- Lands on ground or platforms; gravity pulls it down
- One-hit death on any obstacle collision

### Obstacles
Three obstacle types, all defined in level data:

1. **Spikes** — Triangles sitting on the ground. Touch = death. Come in singles, doubles, or triples.
2. **Platforms** — Elevated solid blocks the cube can land on. May have spikes on top.
3. **Gaps** — Missing sections of ground the cube must jump over.

### Level Structure
- One predefined level made of sequential segments
- Each segment is ~360px wide (one screen width)
- Level data is an array of obstacle descriptors with x-position and type
- Total level length: ~8000px (roughly 25-30 seconds at default speed)
- Level ends with a finish line; reaching it = win

### Progression
- **Progress bar** at top of screen showing percentage through the level (0%–100%)
- **Attempt counter** displayed on death screen
- **Best percentage** saved to localStorage
- On death: show "X%" reached + best %, tap to retry
- On completion: celebration screen with attempt count

## Visual Design

### Color Palette
- **Background**: Dark blue-black (#1a1a2e) with subtle grid lines
- **Ground**: Neon cyan (#00d4ff) top edge, darker body (#0a3d5c)
- **Cube**: Bright neon green (#39ff14) with lighter inner square
- **Spikes**: Neon red/pink (#ff1744)
- **Platforms**: Neon purple (#b24dff)
- **UI text**: White with neon glow effect (stroke)
- **Progress bar**: Neon green fill on dark track

### Particle Effects
- **Death**: Cube shatters into 8-12 square fragments that scatter with physics
- **Jump**: Small dust puff at feet on takeoff
- **Landing**: Small dust puff on landing
- **Win**: Firework-style particle burst

### Background
- Dark gradient with faint grid pattern (parallax, slower than foreground)
- Subtle stars/dots for depth

## Audio

### Music
- Chiptune auto-runner track using Web Audio API
- Faster tempo than Flappy (~140 BPM)
- Electronic/square wave feel
- Loops continuously during gameplay

### SFX
- **Jump**: Short rising blip
- **Death**: Crash/shatter sound
- **Level complete**: Victory fanfare
- **Restart**: Quick whoosh

## UI Layout

### During Gameplay
- **Top-left**: Progress bar (thin horizontal bar, full width minus padding)
- **Top-right**: Settings gear + Home button (reuse shared back button)
- **No visible score during play** — progress bar is the indicator

### Ready State
- "Tap to Start" text centered
- Cube visible, bobbing slightly
- Level preview visible (ground + first few obstacles)

### Death State
- Cube shatters (particle effect)
- Brief pause (500ms)
- Modal: "You reached X%" + "Best: Y%" + "Attempt #N"
- "Tap to retry"

### Win State
- Firework particles
- Modal: "Level Complete!" + "Attempts: N"
- "Tap to continue" → return to menu

## Architecture

### File Structure
```
src/games/geodash/
  config.js         — Constants (speed, jump force, cube size, etc.)
  index.js          — Barrel export
  thumbnail.js      — 72x72 Canvas 2D preview
  level.js          — Level data arrays
  scenes/
    BootScene.js    — Texture creation (key: 'GeoDashBoot')
    PlayScene.js    — Main gameplay (key: 'GeoDashPlay')
  assets/
    background.js   — Dark grid background texture
    cube.js         — Player cube texture
    obstacles.js    — Spike + platform textures
    ground.js       — Neon ground texture
    audio.js        — Web Audio music + SFX + settings state
  ui/
    settingsButton.js — Gear + panel (same pattern as Flappy)
```

### Scene Flow
1. `GeoDashBoot` → creates all textures → starts `GeoDashPlay`
2. `GeoDashPlay` → READY state → tap → PLAYING → death/win → retry/menu

### Physics
- Uses platform's Arcade physics (gravity already set globally at 1200)
- Cube: dynamic body with gravity
- Ground/platforms: static bodies
- Spikes: static overlap triggers (not colliders)
- Jump velocity: ~-500 (tuned for feel)

### Level Data Format
```js
export const LEVEL_1 = [
  { type: 'spike', x: 400 },
  { type: 'spike', x: 440 },
  { type: 'gap', x: 600, width: 80 },
  { type: 'platform', x: 800, y: 480, width: 120 },
  { type: 'spike', x: 860, onPlatform: true, platformY: 480 },
  // ...
];
export const LEVEL_LENGTH = 8000;
```

### Scrolling System
- Camera doesn't move; instead, obstacles and ground scroll left
- Ground is two tiled strips that wrap seamlessly (same pattern as Flappy)
- Obstacles are spawned ahead and destroyed when off-screen left
- Cube stays at fixed screen X (~90px from left)

## Platform Integration

### Registry Entry
```js
{
  id: 'geodash',
  name: 'Geometry Dash',
  subtitle: 'Jump over obstacles',
  bootScene: 'GeoDashBoot',
  scenes: [GeoDashBootScene, GeoDashPlayScene],
  drawThumbnail: drawGeoDashThumbnail,
}
```

### Shared Components
- `src/ui/backButton.js` — Home button (reused as-is)
- Settings UI follows same pattern as Flappy but with its own audio module

### localStorage Keys
- `geodash-best-pct` — Best percentage reached (0–100)
- `geodash-attempts` — Total attempt count
