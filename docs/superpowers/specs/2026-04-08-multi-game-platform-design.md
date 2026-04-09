# Multi-Game Platform Design

## Overview

Transform the existing Flappy Bird game into a multi-game platform with a game selector screen. Users pick a game from a vertical list of cards, each showing a procedural thumbnail and game name. An in-game back button returns to the selector.

## Selector Screen

- **Resolution:** 360x640 (same as games), `Phaser.Scale.FIT` + `CENTER_BOTH`
- **Background:** Light gradient (e.g., white to soft blue/gray), clean and bright
- **Title:** "Game Arcade" (or similar) centered at top with a subtitle "Pick a game to play"
- **Game List:** Vertical stack of cards, each 72px tall with 12px gap, horizontally padded ~20px

### Card Layout (per game)

Each card is a rounded rectangle row containing:
1. **Thumbnail** (72x72 square, left side) — procedurally rendered mini-preview of the game using its `drawThumbnail(canvas)` export
2. **Text area** (middle) — game name (bold, 15px) + subtitle (lighter, 11px)
3. **Play arrow** (right side) — small chevron/triangle indicating tap to play

Cards have a subtle border/shadow on a slightly raised white/light background to stand out from the page background.

### "Coming Soon" Placeholder

A dimmed, dashed-border row at the bottom with a "+" icon and "More games coming soon..." text. Shown when there's room.

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/main.js` | Platform entry point. Creates single Phaser.Game instance with all scenes. Starts `MenuScene`. |
| `src/scenes/MenuScene.js` | Selector screen. Reads game registry, renders thumbnail canvases, handles card taps. |
| `src/registry.js` | Array of game entries. Each entry: `{ id, name, subtitle, bootScene, scenes[], drawThumbnail }`. |

### Modified Files

| File | Change |
|------|--------|
| `index.html` | Point script src to `src/main.js` (platform entry) instead of `src/games/flappy/main.js` |
| `src/games/flappy/main.js` | No longer creates a Phaser.Game. Becomes an export file: exports scene classes + `drawThumbnail`. Renamed or repurposed as `index.js`. |
| `src/games/flappy/scenes/BootScene.js` | Rename scene key to `'FlappyBoot'` |
| `src/games/flappy/scenes/PlayScene.js` | Rename scene key to `'FlappyPlay'`. Add back button (top-left) that calls `this.scene.start('MenuScene')`. Update `BootScene` reference to `'FlappyPlay'`. |

### Scene Key Convention

Each game prefixes its scene keys with the game name to avoid collisions:
- Flappy Bird: `FlappyBoot`, `FlappyPlay`
- Geometry Dash (future): `GeoDashBoot`, `GeoDashPlay`

### Game Registry (`src/registry.js`)

```js
export const GAMES = [
  {
    id: 'flappy',
    name: 'Flappy Bird',
    subtitle: 'Tap to fly through pipes',
    bootScene: 'FlappyBoot',
    scenes: [FlappyBootScene, FlappyPlayScene],
    drawThumbnail: (canvas) => { /* ... */ },
  },
  // Future games added here
];
```

`MenuScene` iterates `GAMES` to render the list and register click handlers.

### Thumbnail System

Each game exports a `drawThumbnail(canvas)` function that:
- Receives an HTML canvas element (72x72)
- Uses plain Canvas 2D API (not Phaser) to draw a mini preview
- For Flappy: draws sky gradient, ground strip, a pipe, and the bird — reusing color values from the procedural asset generators

`MenuScene.create()` calls each game's `drawThumbnail`, then registers the result as a Phaser texture via `this.textures.addCanvas('thumb-{id}', canvas)`.

### Navigation Flow

```
MenuScene → tap card → scene.start(game.bootScene)
  BootScene → creates textures → scene.start('FlappyPlay')
    PlayScene → back button → scene.start('MenuScene')
```

### Back Button

A small home/arrow icon in the top-left corner of each game's play scene (above game content, high depth). Implemented as a shared utility function `createBackButton(scene)` in `src/ui/backButton.js` that:
- Draws a simple procedural back-arrow or home icon
- On tap: stops any game audio, calls `scene.start('MenuScene')`
- Consumes input to prevent game interaction

### Platform Phaser Config

The single `Phaser.Game` instance in `src/main.js`:
- Collects all scene classes from the registry + `MenuScene`
- Uses the same 360x640 resolution, Arcade physics, FIT scaling
- Starts with `MenuScene` as the first scene

## Adding a New Game

1. Create `src/games/<name>/` with asset generators, scenes, config
2. Export scene classes and `drawThumbnail` function
3. Add entry to `src/registry.js`
4. The selector auto-renders the new card

## Out of Scope

- Game-specific settings persistence (already handled per-game via localStorage)
- Global user accounts or cross-game progression
- The Geometry Dash game itself (separate spec)
