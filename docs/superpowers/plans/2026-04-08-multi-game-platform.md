# Multi-Game Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Flappy Bird game into a multi-game platform with a game selector screen, back button navigation, and a registry for adding future games.

**Architecture:** Single Phaser.Game instance created by a new platform `src/main.js`. A `MenuScene` renders a vertical list of game cards read from `src/registry.js`. Each game lives in `src/games/<name>/` and exports its scene classes + a `drawThumbnail` function. Games use prefixed scene keys to avoid collisions.

**Tech Stack:** Phaser 3.80.1 (CDN), vanilla JS (ES modules), Canvas 2D API for thumbnails, no build step.

**Note:** This is a browser-only Phaser game with no test framework. Verification is done by running a local HTTP server and checking in the browser.

---

### Task 1: Rename Flappy Scene Keys

**Files:**
- Modify: `src/games/flappy/scenes/BootScene.js`
- Modify: `src/games/flappy/scenes/PlayScene.js`

Rename scene keys from `'BootScene'`/`'PlayScene'` to `'FlappyBoot'`/`'FlappyPlay'` so they don't collide with other games.

- [ ] **Step 1: Update BootScene key and its target**

In `src/games/flappy/scenes/BootScene.js`, change:
```js
// Line 9: change scene key
super('FlappyBoot');

// Line 28: change target scene
this.scene.start('FlappyPlay');
```

- [ ] **Step 2: Update PlayScene key**

In `src/games/flappy/scenes/PlayScene.js`, change:
```js
// Line 11: change scene key
super('FlappyPlay');
```

- [ ] **Step 3: Verify the game still works standalone**

Temporarily keep `index.html` pointing to `src/games/flappy/main.js`. Start a local server and confirm the game loads, plays, and restarts normally.

```bash
python3 -m http.server 8080 &
# Open http://localhost:8080 in browser — should see "Get Ready!" screen
kill %1
```

- [ ] **Step 4: Update flappy main.js to use new scene keys**

No change needed — `src/games/flappy/main.js` imports the classes directly (`BootScene`, `PlayScene`), not by string key. The Phaser config uses the class references, so this already works.

- [ ] **Step 5: Commit**

```bash
git add src/games/flappy/scenes/BootScene.js src/games/flappy/scenes/PlayScene.js
git commit -m "refactor: rename flappy scene keys to FlappyBoot/FlappyPlay"
```

---

### Task 2: Create Flappy Thumbnail and Index Export

**Files:**
- Create: `src/games/flappy/thumbnail.js`
- Create: `src/games/flappy/index.js`

Create the procedural thumbnail drawing function and a barrel export for the flappy game.

- [ ] **Step 1: Create thumbnail.js**

Create `src/games/flappy/thumbnail.js`:

```js
/**
 * Draw a 72x72 mini-preview of Flappy Bird using Canvas 2D.
 * Reuses color values from the procedural asset generators.
 */
export function drawFlappyThumbnail(canvas) {
  canvas.width = 72;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  const w = 72;
  const h = 72;

  // Sky
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, w, h);

  // Ground (bottom ~12px)
  const groundY = h - 12;
  ctx.fillStyle = '#5ba35b';
  ctx.fillRect(0, groundY, w, 1);
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, groundY + 1, w, 11);

  // Buildings (faint silhouettes)
  ctx.fillStyle = 'rgba(175,218,225,0.5)';
  ctx.fillRect(5, groundY - 18, 10, 18);
  ctx.fillRect(18, groundY - 24, 8, 24);
  ctx.fillRect(30, groundY - 14, 12, 14);
  ctx.fillRect(50, groundY - 20, 9, 20);

  // Pipe (right side)
  const pipeX = 48;
  const pipeW = 12;
  const capW = 16;
  const capH = 5;
  const gapTop = 22;
  const gapBottom = 42;

  // Top pipe
  ctx.fillStyle = '#73bf2e';
  ctx.fillRect(pipeX, 0, pipeW, gapTop);
  ctx.fillStyle = '#6ab42a';
  ctx.fillRect(pipeX - (capW - pipeW) / 2, gapTop, capW, capH);

  // Bottom pipe
  ctx.fillStyle = '#73bf2e';
  ctx.fillRect(pipeX, gapBottom, pipeW, groundY - gapBottom);
  ctx.fillStyle = '#6ab42a';
  ctx.fillRect(pipeX - (capW - pipeW) / 2, gapBottom - capH, capW, capH);

  // Bird (simple yellow rect with eye and beak)
  const bx = 18;
  const by = 30;
  const bw = 14;
  const bh = 10;

  // Body
  ctx.fillStyle = '#f7dc6f';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 1;
  ctx.fillRect(bx, by, bw - 4, bh);
  ctx.strokeRect(bx, by, bw - 4, bh);

  // Wing
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(bx + 1, by + 2, 5, 4);

  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(bx + bw - 6, by + 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.arc(bx + bw - 5, by + 3.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(bx + bw - 3, by + 5, 5, 3);
}
```

- [ ] **Step 2: Create index.js barrel export**

Create `src/games/flappy/index.js`:

```js
export { BootScene as FlappyBootScene } from './scenes/BootScene.js';
export { PlayScene as FlappyPlayScene } from './scenes/PlayScene.js';
export { drawFlappyThumbnail } from './thumbnail.js';
```

- [ ] **Step 3: Commit**

```bash
git add src/games/flappy/thumbnail.js src/games/flappy/index.js
git commit -m "feat: add flappy thumbnail and barrel export"
```

---

### Task 3: Create Shared Back Button Utility

**Files:**
- Create: `src/ui/backButton.js`

A shared utility that any game can use to add a back-to-menu button.

- [ ] **Step 1: Create backButton.js**

Create `src/ui/backButton.js`:

```js
const DEPTH = 55;

/**
 * Create a procedural back-arrow texture if it doesn't exist yet.
 */
function ensureBackTexture(scene) {
  if (scene.textures.exists('back-btn')) return;

  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Circle background
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  // Left arrow
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(18, 8);
  ctx.lineTo(10, 16);
  ctx.lineTo(18, 24);
  ctx.stroke();

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(10, 16);
  ctx.lineTo(22, 16);
  ctx.stroke();

  scene.textures.addCanvas('back-btn', canvas);
}

/**
 * Add a back button to the top-left of a game scene.
 * On tap: calls optional cleanup callback, then returns to MenuScene.
 * @param {Phaser.Scene} scene
 * @param {Function} [onExit] - optional cleanup (e.g., stop audio)
 */
export function createBackButton(scene, onExit) {
  ensureBackTexture(scene);

  const btn = scene.add.image(24, 24, 'back-btn')
    .setDepth(DEPTH)
    .setInteractive({ useHandCursor: true })
    .setScrollFactor(0);

  btn.on('pointerdown', () => {
    // Consume input so the game doesn't also react
    scene._settingsInputConsumed = true;

    if (onExit) onExit();

    scene.scene.start('MenuScene');
  });

  return btn;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/backButton.js
git commit -m "feat: add shared back button utility"
```

---

### Task 4: Add Back Button to Flappy PlayScene

**Files:**
- Modify: `src/games/flappy/scenes/PlayScene.js`

- [ ] **Step 1: Add import and create back button in PlayScene.create()**

In `src/games/flappy/scenes/PlayScene.js`, add the import at the top (after the existing imports):

```js
import { createBackButton } from '../../../ui/backButton.js';
```

Then in the `create()` method, add the back button right after the settings UI creation (after line 105 `this.settingsUI = createSettingsUI(this, ...)`):

```js
    // Back to menu button
    this.backBtn = createBackButton(this, () => stopMusic());
```

- [ ] **Step 2: Verify the import path is correct**

The path from `src/games/flappy/scenes/PlayScene.js` to `src/ui/backButton.js` is `../../../ui/backButton.js`. Verify this resolves:
- `src/games/flappy/scenes/` → `../` = `src/games/flappy/`
- → `../` = `src/games/`
- → `../` = `src/`
- → `ui/backButton.js` ✓

- [ ] **Step 3: Commit**

```bash
git add src/games/flappy/scenes/PlayScene.js
git commit -m "feat: add back button to flappy PlayScene"
```

---

### Task 5: Create Game Registry

**Files:**
- Create: `src/registry.js`

- [ ] **Step 1: Create registry.js**

Create `src/registry.js`:

```js
import { FlappyBootScene, FlappyPlayScene, drawFlappyThumbnail } from './games/flappy/index.js';

export const GAMES = [
  {
    id: 'flappy',
    name: 'Flappy Bird',
    subtitle: 'Tap to fly through pipes',
    bootScene: 'FlappyBoot',
    scenes: [FlappyBootScene, FlappyPlayScene],
    drawThumbnail: drawFlappyThumbnail,
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/registry.js
git commit -m "feat: add game registry with flappy entry"
```

---

### Task 6: Create MenuScene

**Files:**
- Create: `src/scenes/MenuScene.js`

The selector screen with light background, title, and vertical list of game cards.

- [ ] **Step 1: Create MenuScene.js**

Create `src/scenes/MenuScene.js`:

```js
import { GAMES } from '../registry.js';

const CARD_H = 72;
const CARD_GAP = 12;
const CARD_PAD_X = 20;
const THUMB_SIZE = 72;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const w = this.sys.game.config.width;
    const h = this.sys.game.config.height;

    // Light gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xf0f4f8, 0xf0f4f8, 0xd9e2ec, 0xd9e2ec, 1);
    bg.fillRect(0, 0, w, h);

    // Title
    this.add.text(w / 2, 50, 'Game Arcade', {
      fontSize: '30px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#2d3748',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(w / 2, 82, 'Pick a game to play', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#718096',
    }).setOrigin(0.5);

    // Game cards
    const startY = 120;

    GAMES.forEach((game, i) => {
      const y = startY + i * (CARD_H + CARD_GAP);
      this._createCard(game, CARD_PAD_X, y, w - CARD_PAD_X * 2);
    });

    // "Coming soon" placeholder
    const comingSoonY = startY + GAMES.length * (CARD_H + CARD_GAP);
    this._createComingSoon(CARD_PAD_X, comingSoonY, w - CARD_PAD_X * 2);
  }

  _createCard(game, x, y, cardW) {
    // Generate thumbnail
    const thumbKey = `thumb-${game.id}`;
    if (!this.textures.exists(thumbKey)) {
      const canvas = document.createElement('canvas');
      game.drawThumbnail(canvas);
      this.textures.addCanvas(thumbKey, canvas);
    }

    // Card background (white, rounded via nine-slice or rectangle)
    const cardBg = this.add.rectangle(
      x + cardW / 2, y + CARD_H / 2,
      cardW, CARD_H,
      0xffffff, 1
    ).setOrigin(0.5).setStrokeStyle(1, 0xe2e8f0);

    // Thumbnail image
    const thumb = this.add.image(x, y, thumbKey)
      .setOrigin(0, 0)
      .setDisplaySize(THUMB_SIZE, THUMB_SIZE);

    // Clip thumbnail to card bounds (round left corners effect via mask)
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRoundedRect(x, y, THUMB_SIZE, THUMB_SIZE, { tl: 4, tr: 0, bl: 4, br: 0 });
    thumb.setMask(maskShape.createGeometryMask());

    // Game name
    this.add.text(x + THUMB_SIZE + 14, y + 18, game.name, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#2d3748',
    }).setOrigin(0, 0);

    // Subtitle
    this.add.text(x + THUMB_SIZE + 14, y + 40, game.subtitle, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#a0aec0',
    }).setOrigin(0, 0);

    // Play arrow
    this.add.text(x + cardW - 20, y + CARD_H / 2, '\u25B6', {
      fontSize: '16px',
      color: '#cbd5e0',
    }).setOrigin(0.5);

    // Make card interactive
    cardBg.setInteractive({ useHandCursor: true });
    cardBg.on('pointerover', () => {
      cardBg.setFillStyle(0xedf2f7);
    });
    cardBg.on('pointerout', () => {
      cardBg.setFillStyle(0xffffff);
    });
    cardBg.on('pointerdown', () => {
      this.scene.start(game.bootScene);
    });
  }

  _createComingSoon(x, y, cardW) {
    // Dashed border effect via rectangle with stroke
    const placeholder = this.add.rectangle(
      x + cardW / 2, y + CARD_H / 2,
      cardW, CARD_H,
      0xf7fafc, 0.5
    ).setOrigin(0.5).setStrokeStyle(1.5, 0xe2e8f0);

    // Plus icon
    this.add.text(x + 28, y + CARD_H / 2, '+', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#cbd5e0',
    }).setOrigin(0.5);

    // Text
    this.add.text(x + THUMB_SIZE + 14, y + CARD_H / 2, 'More games coming soon...', {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#a0aec0',
    }).setOrigin(0, 0.5);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scenes/MenuScene.js
git commit -m "feat: add MenuScene game selector"
```

---

### Task 7: Create Platform Entry Point and Update index.html

**Files:**
- Create: `src/main.js`
- Modify: `index.html`

- [ ] **Step 1: Create platform main.js**

Create `src/main.js`:

```js
import { GAMES } from './registry.js';
import { MenuScene } from './scenes/MenuScene.js';

// Collect all game scenes from registry
const gameScenes = GAMES.flatMap((game) => game.scenes);

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: '#f0f4f8',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false,
    },
  },
  scene: [MenuScene, ...gameScenes],
};

const game = new Phaser.Game(config);
```

- [ ] **Step 2: Update index.html**

Change the script src and title in `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Game Arcade</title>
  <style>
    * { margin: 0; padding: 0; }
    body { background: #000; overflow: hidden; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add src/main.js index.html
git commit -m "feat: add platform entry point and update index.html"
```

---

### Task 8: End-to-End Browser Verification

**Files:** None (verification only)

- [ ] **Step 1: Start local server and open in browser**

```bash
python3 -m http.server 8080 &
```

Open `http://localhost:8080` in the browser.

- [ ] **Step 2: Verify MenuScene loads**

Expected: Light gradient background, "Game Arcade" title, one Flappy Bird card with procedural thumbnail showing sky/bird/pipe, a "Coming soon" placeholder below.

- [ ] **Step 3: Verify game launch**

Click the Flappy Bird card. Expected: FlappyBoot creates textures, then FlappyPlay shows the "Get Ready!" screen with bird bobbing.

- [ ] **Step 4: Verify back button**

In the Flappy game, verify the back button (circle with arrow) appears in the top-left. Click it. Expected: Returns to MenuScene.

- [ ] **Step 5: Verify gameplay still works**

Click Flappy Bird card again, tap to play, verify pipes spawn, scoring works, death/quiz flow works. Then use back button to return.

- [ ] **Step 6: Kill server**

```bash
kill %1
```

- [ ] **Step 7: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: adjustments from end-to-end testing"
```
