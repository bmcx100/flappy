# Flappy Bird Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a faithful Flappy Bird clone with code-generated pixel art, playable on mobile and desktop.

**Architecture:** Phaser 3 game with two scenes (BootScene generates textures, PlayScene runs all gameplay). All art is drawn to off-screen canvases at boot time and registered as Phaser textures. A single config object holds all tuning constants.

**Tech Stack:** Phaser 3 (CDN), vanilla JavaScript (ES modules), Arcade Physics, no build step.

**Spec:** `docs/superpowers/specs/2026-04-07-flappy-bird-design.md`

---

## File Structure

```
index.html              — Host page, loads Phaser CDN + main.js
src/
  config.js             — Game constants (gravity, speeds, dimensions)
  main.js               — Phaser GameConfig, game instantiation
  scenes/
    BootScene.js         — Calls asset generators, transitions to PlayScene
    PlayScene.js         — All gameplay: READY → PLAYING → GAME_OVER
  assets/
    background.js        — Generates 'background' texture (sky, clouds, city)
    ground.js            — Generates 'ground' texture (tileable strip)
    pipe.js              — Generates 'pipe-body' and 'pipe-cap' textures
    bird.js              — Generates 'bird' spritesheet texture (3 frames)
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `src/config.js`
- Create: `src/main.js`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Flappy Bird</title>
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

- [ ] **Step 2: Create `src/config.js`**

```javascript
export const CONFIG = {
  gameWidth: 360,
  gameHeight: 640,
  gravity: 1200,
  flapVelocity: -400,
  pipeSpeed: 200,
  pipeGap: 130,
  pipeInterval: 1500,
  birdX: 90,
  groundHeight: 78,
  pipeCapWidth: 48,
  pipeCapHeight: 18,
  pipeBodyWidth: 40,
  birdWidth: 34,
  birdHeight: 24,
};
```

- [ ] **Step 3: Create `src/main.js`** (minimal — just boots into a placeholder scene)

```javascript
import { CONFIG } from './config.js';

const config = {
  type: Phaser.AUTO,
  width: CONFIG.gameWidth,
  height: CONFIG.gameHeight,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: CONFIG.gravity },
      debug: false,
    },
  },
  scene: [],
};

const game = new Phaser.Game(config);
```

- [ ] **Step 4: Serve and verify blank canvas**

Run: `cd /home/data/Documents/webapps/games/flappy && python3 -m http.server 8080`

Open `http://localhost:8080`. Expected: light blue 360x640 canvas centered on screen.

- [ ] **Step 5: Commit**

```bash
git init
echo "node_modules/" > .gitignore
echo ".superpowers/" >> .gitignore
git add index.html src/config.js src/main.js .gitignore
git commit -m "feat: scaffold project with Phaser 3 config"
```

---

### Task 2: Background Asset Generator

**Files:**
- Create: `src/assets/background.js`

- [ ] **Step 1: Create `src/assets/background.js`**

This generates the full background texture: solid sky, soft hazy clouds fading down, and subtle translucent city buildings.

```javascript
import { CONFIG } from '../config.js';

export function createBackgroundTexture(scene) {
  const w = CONFIG.gameWidth;
  const h = CONFIG.gameHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#87CEEB');
  skyGrad.addColorStop(1, '#87CEEB');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Haze / atmosphere layer (white gradient fading in around cloud/city area)
  const hazeGrad = ctx.createLinearGradient(0, h * 0.28, 0, h * 0.55);
  hazeGrad.addColorStop(0, 'rgba(255,255,255,0)');
  hazeGrad.addColorStop(0.3, 'rgba(255,255,255,0.3)');
  hazeGrad.addColorStop(0.55, 'rgba(255,255,255,0.6)');
  hazeGrad.addColorStop(0.75, 'rgba(255,255,255,0.8)');
  hazeGrad.addColorStop(1, 'rgba(255,255,255,0.5)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, h * 0.28, w, h * 0.27);

  // Cloud wisps (scattered blurred ellipses at varying heights and opacities)
  ctx.save();
  const cloudRows = [
    { y: h * 0.27, count: 7, sizeRange: [40, 60], alphaRange: [0.3, 0.45], blur: 4 },
    { y: h * 0.34, count: 5, sizeRange: [50, 70], alphaRange: [0.2, 0.3], blur: 6 },
    { y: h * 0.40, count: 4, sizeRange: [60, 80], alphaRange: [0.12, 0.2], blur: 8 },
  ];

  for (const row of cloudRows) {
    ctx.filter = `blur(${row.blur}px)`;
    for (let i = 0; i < row.count; i++) {
      const cx = (w / row.count) * i + Math.random() * 30;
      const cy = row.y + (Math.random() - 0.5) * 20;
      const rw = row.sizeRange[0] + Math.random() * (row.sizeRange[1] - row.sizeRange[0]);
      const rh = rw * 0.5;
      const alpha = row.alphaRange[0] + Math.random() * (row.alphaRange[1] - row.alphaRange[0]);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw / 2, rh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Background buildings (very faint, ghostly)
  const bgBuildingsY = h - CONFIG.groundHeight;
  ctx.fillStyle = 'rgba(200,230,215,0.3)';
  ctx.fillRect(0, bgBuildingsY - 65, w, 65);

  const bgBuildings = [
    { x: 5, w: 35, h: 42 },
    { x: 48, w: 28, h: 58 },
    { x: 85, w: 40, h: 32 },
    { x: 135, w: 32, h: 48 },
    { x: 180, w: 35, h: 38 },
    { x: 225, w: 28, h: 52 },
    { x: 265, w: 30, h: 44 },
    { x: 300, w: 25, h: 36 },
    { x: 335, w: 20, h: 50 },
  ];
  ctx.fillStyle = 'rgba(200,230,215,0.25)';
  for (const b of bgBuildings) {
    ctx.fillRect(b.x, bgBuildingsY - 65 - b.h, b.w, b.h);
  }

  // Foreground buildings (subtle, muted, with faint windows)
  const fgBuildings = [
    { x: 10, w: 40, h: 88, windowCols: 3 },
    { x: 56, w: 32, h: 115, windowCols: 2 },
    { x: 94, w: 45, h: 72, windowCols: 3 },
    { x: 145, w: 34, h: 98, windowCols: 2 },
    { x: 185, w: 38, h: 60, windowCols: 3 },
    { x: 228, w: 32, h: 82, windowCols: 2 },
    { x: 268, w: 36, h: 70, windowCols: 3 },
    { x: 310, w: 30, h: 90, windowCols: 2 },
    { x: 346, w: 14, h: 65, windowCols: 1 },
  ];

  for (const b of fgBuildings) {
    const by = bgBuildingsY - b.h;
    // Building body
    ctx.fillStyle = `rgba(${175 + (b.windowCols % 2) * 15},${218 + (b.windowCols % 2) * 7},${225 + (b.windowCols % 2) * 7},0.4)`;
    ctx.fillRect(b.x, by, b.w, b.h);
    // Windows
    ctx.fillStyle = 'rgba(220,245,250,0.5)';
    const winSize = 7;
    const winGap = 4;
    const padX = 5;
    const padY = 6;
    for (let row = 0; row < Math.floor((b.h - padY * 2) / (winSize + winGap)); row++) {
      for (let col = 0; col < b.windowCols; col++) {
        ctx.fillRect(
          b.x + padX + col * (winSize + winGap),
          by + padY + row * (winSize + winGap),
          winSize,
          winSize
        );
      }
    }
  }

  scene.textures.addCanvas('background', canvas);
}
```

- [ ] **Step 2: Verify — will test visually after BootScene is wired up (Task 5)**

- [ ] **Step 3: Commit**

```bash
git add src/assets/background.js
git commit -m "feat: add background texture generator"
```

---

### Task 3: Ground Asset Generator

**Files:**
- Create: `src/assets/ground.js`

- [ ] **Step 1: Create `src/assets/ground.js`**

Generates a tileable ground strip: green top edge, brown border, then alternating tan stripes.

```javascript
import { CONFIG } from '../config.js';

export function createGroundTexture(scene) {
  const w = CONFIG.gameWidth;
  const h = CONFIG.groundHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Green top edge
  ctx.fillStyle = '#5ba35b';
  ctx.fillRect(0, 0, w, 4);

  // Brown border
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(0, 4, w, 3);

  // Sandy stripes
  const stripeWidth = 12;
  for (let x = 0; x < w; x += stripeWidth * 2) {
    ctx.fillStyle = '#ded895';
    ctx.fillRect(x, 7, stripeWidth, h - 7);
    ctx.fillStyle = '#d4c87a';
    ctx.fillRect(x + stripeWidth, 7, stripeWidth, h - 7);
  }

  scene.textures.addCanvas('ground', canvas);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/assets/ground.js
git commit -m "feat: add ground texture generator"
```

---

### Task 4: Pipe and Bird Asset Generators

**Files:**
- Create: `src/assets/pipe.js`
- Create: `src/assets/bird.js`

- [ ] **Step 1: Create `src/assets/pipe.js`**

Generates two textures: `pipe-body` (rectangular with green gradient) and `pipe-cap` (wider lip).

```javascript
import { CONFIG } from '../config.js';

export function createPipeTextures(scene) {
  // Pipe body — tall green rectangle with gradient shading
  const bodyW = CONFIG.pipeBodyWidth;
  const bodyH = CONFIG.gameHeight; // tall enough to cover any position
  const bodyCanvas = document.createElement('canvas');
  bodyCanvas.width = bodyW;
  bodyCanvas.height = bodyH;
  const bodyCtx = bodyCanvas.getContext('2d');

  const bodyGrad = bodyCtx.createLinearGradient(0, 0, bodyW, 0);
  bodyGrad.addColorStop(0, '#73bf2e');
  bodyGrad.addColorStop(0.3, '#6ab42a');
  bodyGrad.addColorStop(0.7, '#82d636');
  bodyGrad.addColorStop(1, '#73bf2e');
  bodyCtx.fillStyle = bodyGrad;
  bodyCtx.fillRect(0, 0, bodyW, bodyH);

  // Dark green border
  bodyCtx.strokeStyle = '#2d5a1b';
  bodyCtx.lineWidth = 2;
  bodyCtx.strokeRect(1, 0, bodyW - 2, bodyH);

  scene.textures.addCanvas('pipe-body', bodyCanvas);

  // Pipe cap — wider lip
  const capW = CONFIG.pipeCapWidth;
  const capH = CONFIG.pipeCapHeight;
  const capCanvas = document.createElement('canvas');
  capCanvas.width = capW;
  capCanvas.height = capH;
  const capCtx = capCanvas.getContext('2d');

  const capGrad = capCtx.createLinearGradient(0, 0, capW, 0);
  capGrad.addColorStop(0, '#73bf2e');
  capGrad.addColorStop(0.3, '#6ab42a');
  capGrad.addColorStop(0.7, '#82d636');
  capGrad.addColorStop(1, '#73bf2e');
  capCtx.fillStyle = capGrad;
  capCtx.fillRect(0, 0, capW, capH);

  capCtx.strokeStyle = '#2d5a1b';
  capCtx.lineWidth = 2;
  capCtx.strokeRect(1, 1, capW - 2, capH - 2);

  scene.textures.addCanvas('pipe-cap', capCanvas);
}
```

- [ ] **Step 2: Create `src/assets/bird.js`**

Generates a 3-frame spritesheet: wing up, wing mid, wing down. Each frame is `birdWidth x birdHeight`.

```javascript
import { CONFIG } from '../config.js';

export function createBirdTexture(scene) {
  const fw = CONFIG.birdWidth;
  const fh = CONFIG.birdHeight;
  const frames = 3;
  const canvas = document.createElement('canvas');
  canvas.width = fw * frames;
  canvas.height = fh;
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < frames; i++) {
    const ox = i * fw; // x offset for this frame
    drawBirdFrame(ctx, ox, fw, fh, i);
  }

  scene.textures.addSpriteSheet('bird', canvas, { frameWidth: fw, frameHeight: fh });
}

function drawBirdFrame(ctx, ox, fw, fh, wingPhase) {
  // Body (yellow rounded rect)
  ctx.fillStyle = '#f7dc6f';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  roundRect(ctx, ox + 2, 2, fw - 12, fh - 4, 4);

  // Wing (darker yellow) — position varies by phase
  const wingX = ox + 3;
  const wingW = 10;
  const wingH = 7;
  let wingY;
  if (wingPhase === 0) wingY = 4;        // up
  else if (wingPhase === 1) wingY = 9;   // mid
  else wingY = 13;                        // down

  ctx.fillStyle = '#f0c040';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(wingX, wingY, wingW, wingH);
  ctx.fill();
  ctx.stroke();

  // Eye (white circle with black pupil)
  const eyeX = ox + fw - 14;
  const eyeY = 6;
  ctx.fillStyle = 'white';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupil
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.arc(eyeX + 1.5, eyeY + 1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Beak (red/orange)
  ctx.fillStyle = '#e74c3c';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(ox + fw - 8, 10, 10, 7);
  ctx.fill();
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
```

- [ ] **Step 3: Commit**

```bash
git add src/assets/pipe.js src/assets/bird.js
git commit -m "feat: add pipe and bird texture generators"
```

---

### Task 5: BootScene — Wire Up Asset Generation

**Files:**
- Create: `src/scenes/BootScene.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/scenes/BootScene.js`**

```javascript
import { createBackgroundTexture } from '../assets/background.js';
import { createGroundTexture } from '../assets/ground.js';
import { createPipeTextures } from '../assets/pipe.js';
import { createBirdTexture } from '../assets/bird.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    createBackgroundTexture(this);
    createGroundTexture(this);
    createPipeTextures(this);
    createBirdTexture(this);

    // Bird flap animation
    this.anims.create({
      key: 'flap',
      frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.start('PlayScene');
  }
}
```

- [ ] **Step 2: Update `src/main.js` to register scenes**

Replace the entire file:

```javascript
import { CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { PlayScene } from './scenes/PlayScene.js';

const config = {
  type: Phaser.AUTO,
  width: CONFIG.gameWidth,
  height: CONFIG.gameHeight,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: CONFIG.gravity },
      debug: false,
    },
  },
  scene: [BootScene, PlayScene],
};

const game = new Phaser.Game(config);
```

- [ ] **Step 3: Create a stub `src/scenes/PlayScene.js`** so the game boots without error

```javascript
import { CONFIG } from '../config.js';

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    // Background
    this.add.image(0, 0, 'background').setOrigin(0, 0);

    // Ground (static, no scroll yet)
    this.add.image(0, CONFIG.gameHeight - CONFIG.groundHeight, 'ground').setOrigin(0, 0);

    // Bird (static, just to verify texture)
    const bird = this.add.sprite(CONFIG.birdX, CONFIG.gameHeight / 2, 'bird');
    bird.play('flap');

    // Pipe pair (static, just to verify textures)
    const pipeX = 250;
    const gapCenterY = 250;
    const halfGap = CONFIG.pipeGap / 2;

    // Bottom pipe
    this.add.image(pipeX, gapCenterY + halfGap, 'pipe-cap').setOrigin(0.5, 0);
    this.add.image(pipeX, gapCenterY + halfGap + CONFIG.pipeCapHeight, 'pipe-body').setOrigin(0.5, 0);

    // Top pipe (flipped)
    this.add.image(pipeX, gapCenterY - halfGap, 'pipe-cap').setOrigin(0.5, 1).setFlipY(true);
    this.add.image(pipeX, gapCenterY - halfGap - CONFIG.pipeCapHeight, 'pipe-body').setOrigin(0.5, 1).setFlipY(true);
  }
}
```

- [ ] **Step 4: Serve and verify visuals**

Run: `python3 -m http.server 8080`

Open `http://localhost:8080`. Expected: background with clouds/city, ground strip at bottom, a flapping bird sprite, and one static pipe pair. All textures should render cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/scenes/BootScene.js src/scenes/PlayScene.js src/main.js
git commit -m "feat: wire up BootScene and verify all textures render"
```

---

### Task 6: PlayScene — READY State

**Files:**
- Modify: `src/scenes/PlayScene.js`

- [ ] **Step 1: Replace `src/scenes/PlayScene.js` with full READY state implementation**

This adds the state machine, scrolling ground, bird hovering, and "Get Ready" text. No physics yet — bird bobs gently.

```javascript
import { CONFIG } from '../config.js';

const State = { READY: 0, PLAYING: 1, GAME_OVER: 2 };

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    this.state = State.READY;

    // Background (static)
    this.add.image(0, 0, 'background').setOrigin(0, 0);

    // Ground (two copies for seamless scroll)
    this.ground1 = this.add.image(0, CONFIG.gameHeight - CONFIG.groundHeight, 'ground').setOrigin(0, 0);
    this.ground2 = this.add.image(CONFIG.gameWidth, CONFIG.gameHeight - CONFIG.groundHeight, 'ground').setOrigin(0, 0);

    // Ground physics body (invisible, for collision)
    this.groundBody = this.physics.add.staticImage(
      CONFIG.gameWidth / 2,
      CONFIG.gameHeight - CONFIG.groundHeight / 2,
      'ground'
    );
    this.groundBody.setDisplaySize(CONFIG.gameWidth, CONFIG.groundHeight);
    this.groundBody.setVisible(false);
    this.groundBody.refreshBody();

    // Bird
    this.bird = this.physics.add.sprite(CONFIG.birdX, CONFIG.gameHeight / 2, 'bird');
    this.bird.play('flap');
    this.bird.body.setAllowGravity(false);
    this.bird.body.setSize(CONFIG.birdWidth - 6, CONFIG.birdHeight - 6); // forgiving hitbox
    this.bird.setDepth(10);

    // "Get Ready" text
    this.readyText = this.add.text(
      CONFIG.gameWidth / 2,
      CONFIG.gameHeight / 3,
      'Get Ready!',
      {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setDepth(20);

    this.tapText = this.add.text(
      CONFIG.gameWidth / 2,
      CONFIG.gameHeight / 3 + 50,
      'Tap or press Space',
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 3,
      }
    ).setOrigin(0.5).setDepth(20);

    // Score text (hidden during READY)
    this.scoreText = this.add.text(
      CONFIG.gameWidth / 2,
      40,
      '0',
      {
        fontSize: '48px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 5,
      }
    ).setOrigin(0.5).setDepth(20).setVisible(false);

    this.score = 0;

    // Bob timer for READY state
    this.bobTime = 0;

    // Input
    this.input.on('pointerdown', () => this.handleInput());
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => this.handleInput());
  }

  handleInput() {
    if (this.state === State.READY) {
      this.startPlaying();
    } else if (this.state === State.PLAYING) {
      this.flap();
    } else if (this.state === State.GAME_OVER) {
      this.restartGame();
    }
  }

  startPlaying() {
    this.state = State.PLAYING;
    this.readyText.setVisible(false);
    this.tapText.setVisible(false);
    this.scoreText.setVisible(true);
    this.bird.body.setAllowGravity(true);
    this.flap();
  }

  flap() {
    this.bird.body.setVelocityY(CONFIG.flapVelocity);
  }

  restartGame() {
    this.scene.restart();
  }

  update(time, delta) {
    // Scroll ground
    if (this.state !== State.GAME_OVER) {
      const groundSpeed = CONFIG.pipeSpeed * (delta / 1000);
      this.ground1.x -= groundSpeed;
      this.ground2.x -= groundSpeed;

      if (this.ground1.x <= -CONFIG.gameWidth) {
        this.ground1.x = this.ground2.x + CONFIG.gameWidth;
      }
      if (this.ground2.x <= -CONFIG.gameWidth) {
        this.ground2.x = this.ground1.x + CONFIG.gameWidth;
      }
    }

    // READY: bird bobs up and down
    if (this.state === State.READY) {
      this.bobTime += delta;
      this.bird.y = (CONFIG.gameHeight / 2) + Math.sin(this.bobTime / 300) * 8;
    }

    // PLAYING: rotate bird based on velocity, clamp top
    if (this.state === State.PLAYING) {
      // Rotation follows velocity
      const vy = this.bird.body.velocity.y;
      if (vy < 0) {
        this.bird.angle = -20;
      } else {
        this.bird.angle = Math.min(vy * 0.15, 90);
      }

      // Clamp bird to top of screen
      if (this.bird.y < 0) {
        this.bird.y = 0;
        this.bird.body.setVelocityY(0);
      }
    }
  }
}
```

- [ ] **Step 2: Verify READY state**

Serve and open. Expected:
- Background + scrolling ground
- Bird bobs gently in center
- "Get Ready!" and "Tap or press Space" text visible
- Tap/click/spacebar starts game — bird falls with gravity, "Get Ready" disappears, score shows

- [ ] **Step 3: Commit**

```bash
git add src/scenes/PlayScene.js
git commit -m "feat: implement READY state with bird bob, scrolling ground, input handling"
```

---

### Task 7: PlayScene — Pipes (Spawning, Scrolling, Pooling)

**Files:**
- Modify: `src/scenes/PlayScene.js`

- [ ] **Step 1: Add pipe groups and spawning to `create()`**

Add these lines in `create()`, after the bird setup and before the input setup:

```javascript
    // Pipe groups (object pooling)
    this.pipeBodyGroup = this.physics.add.group();
    this.pipeCapGroup = this.physics.add.group();
    this.scoreTriggers = this.physics.add.group();

    this.pipeTimer = null;
```

- [ ] **Step 2: Add `spawnPipePair()` method and timer start**

Add these methods to the class:

```javascript
  startPipeTimer() {
    this.pipeTimer = this.time.addEvent({
      delay: CONFIG.pipeInterval,
      callback: this.spawnPipePair,
      callbackScope: this,
      loop: true,
    });
    // Spawn first pair immediately
    this.spawnPipePair();
  }

  spawnPipePair() {
    const minGapY = 80 + CONFIG.pipeGap / 2;
    const maxGapY = CONFIG.gameHeight - CONFIG.groundHeight - 80 - CONFIG.pipeGap / 2;
    const gapCenterY = Phaser.Math.Between(minGapY, maxGapY);
    const halfGap = CONFIG.pipeGap / 2;
    const x = CONFIG.gameWidth + CONFIG.pipeCapWidth / 2;

    // Bottom pipe cap
    const bottomCap = this.pipeCapGroup.create(x, gapCenterY + halfGap, 'pipe-cap');
    bottomCap.setOrigin(0.5, 0);
    bottomCap.body.setAllowGravity(false);
    bottomCap.body.setVelocityX(-CONFIG.pipeSpeed);
    bottomCap.body.setImmovable(true);

    // Bottom pipe body
    const bottomBodyY = gapCenterY + halfGap + CONFIG.pipeCapHeight;
    const bottomBodyH = CONFIG.gameHeight - CONFIG.groundHeight - bottomBodyY;
    const bottomBody = this.pipeBodyGroup.create(x, bottomBodyY, 'pipe-body');
    bottomBody.setOrigin(0.5, 0);
    bottomBody.setDisplaySize(CONFIG.pipeBodyWidth, bottomBodyH);
    bottomBody.body.setSize(CONFIG.pipeBodyWidth, bottomBodyH);
    bottomBody.body.setAllowGravity(false);
    bottomBody.body.setVelocityX(-CONFIG.pipeSpeed);
    bottomBody.body.setImmovable(true);

    // Top pipe cap (flipped)
    const topCap = this.pipeCapGroup.create(x, gapCenterY - halfGap, 'pipe-cap');
    topCap.setOrigin(0.5, 1);
    topCap.setFlipY(true);
    topCap.body.setAllowGravity(false);
    topCap.body.setVelocityX(-CONFIG.pipeSpeed);
    topCap.body.setImmovable(true);

    // Top pipe body (flipped)
    const topBodyBottom = gapCenterY - halfGap - CONFIG.pipeCapHeight;
    const topBodyH = topBodyBottom;
    const topBody = this.pipeBodyGroup.create(x, 0, 'pipe-body');
    topBody.setOrigin(0.5, 0);
    topBody.setDisplaySize(CONFIG.pipeBodyWidth, topBodyH);
    topBody.body.setSize(CONFIG.pipeBodyWidth, topBodyH);
    topBody.body.setAllowGravity(false);
    topBody.body.setVelocityX(-CONFIG.pipeSpeed);
    topBody.body.setImmovable(true);

    // Score trigger (invisible, positioned at pipe center)
    const trigger = this.scoreTriggers.create(x, gapCenterY, null);
    trigger.setVisible(false);
    trigger.body.setSize(4, CONFIG.pipeGap);
    trigger.body.setAllowGravity(false);
    trigger.body.setVelocityX(-CONFIG.pipeSpeed);
    trigger.scored = false;
  }
```

- [ ] **Step 3: Call `startPipeTimer()` in `startPlaying()`**

Add this line at the end of the `startPlaying()` method:

```javascript
    this.startPipeTimer();
```

- [ ] **Step 4: Add pipe cleanup in `update()`**

Add this at the end of `update()`, inside the `if (this.state === State.PLAYING)` block:

```javascript
      // Remove off-screen pipes
      const destroyX = -CONFIG.pipeCapWidth;
      this.pipeBodyGroup.children.each((pipe) => {
        if (pipe.active && pipe.x < destroyX) {
          pipe.destroy();
        }
      });
      this.pipeCapGroup.children.each((cap) => {
        if (cap.active && cap.x < destroyX) {
          cap.destroy();
        }
      });
      this.scoreTriggers.children.each((trigger) => {
        if (trigger.active && trigger.x < destroyX) {
          trigger.destroy();
        }
      });
```

- [ ] **Step 5: Verify pipes spawn and scroll**

Serve and open. Expected: after tapping to start, green pipes scroll in from right, new pairs appear every 1.5s, old ones are destroyed off-screen.

- [ ] **Step 6: Commit**

```bash
git add src/scenes/PlayScene.js
git commit -m "feat: add pipe spawning, scrolling, and cleanup"
```

---

### Task 8: PlayScene — Scoring and Collisions

**Files:**
- Modify: `src/scenes/PlayScene.js`

- [ ] **Step 1: Add collision detection in `create()`**

Add these lines after the pipe group setup:

```javascript
    // Collisions
    this.physics.add.collider(this.bird, this.groundBody, () => this.die());
    this.physics.add.overlap(this.bird, this.pipeBodyGroup, () => this.die());
    this.physics.add.overlap(this.bird, this.pipeCapGroup, () => this.die());
```

- [ ] **Step 2: Add scoring logic in `update()`**

Add inside the `if (this.state === State.PLAYING)` block, before the pipe cleanup:

```javascript
      // Score — check if bird passed a trigger
      this.scoreTriggers.children.each((trigger) => {
        if (trigger.active && !trigger.scored && trigger.x < this.bird.x) {
          trigger.scored = true;
          this.score++;
          this.scoreText.setText(String(this.score));
        }
      });
```

- [ ] **Step 3: Add `die()` method**

```javascript
  die() {
    if (this.state === State.GAME_OVER) return;
    this.state = State.GAME_OVER;

    // Stop all movement
    this.bird.body.setVelocity(0, 0);
    this.bird.body.setAllowGravity(false);
    this.bird.anims.stop();

    if (this.pipeTimer) this.pipeTimer.remove();

    this.pipeBodyGroup.children.each((pipe) => {
      if (pipe.body) pipe.body.setVelocityX(0);
    });
    this.pipeCapGroup.children.each((cap) => {
      if (cap.body) cap.body.setVelocityX(0);
    });
    this.scoreTriggers.children.each((trigger) => {
      if (trigger.body) trigger.body.setVelocityX(0);
    });

    // Game Over text
    this.add.text(
      CONFIG.gameWidth / 2,
      CONFIG.gameHeight / 3,
      'Game Over',
      {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 5,
      }
    ).setOrigin(0.5).setDepth(20);

    this.add.text(
      CONFIG.gameWidth / 2,
      CONFIG.gameHeight / 3 + 50,
      `Score: ${this.score}`,
      {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setDepth(20);

    // Delay restart input to avoid accidental tap
    this.time.delayedCall(500, () => {
      this.add.text(
        CONFIG.gameWidth / 2,
        CONFIG.gameHeight / 3 + 100,
        'Tap to restart',
        {
          fontSize: '18px',
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff',
          stroke: '#333333',
          strokeThickness: 3,
        }
      ).setOrigin(0.5).setDepth(20);
      this.canRestart = true;
    });
  }
```

- [ ] **Step 4: Update `restartGame()` to check `canRestart` flag**

Replace the existing `restartGame()`:

```javascript
  restartGame() {
    if (!this.canRestart) return;
    this.scene.restart();
  }
```

And add `this.canRestart = false;` in `create()` after `this.score = 0;`.

- [ ] **Step 5: Verify full game loop**

Serve and open. Expected:
1. "Get Ready" screen with bobbing bird
2. Tap → bird falls, pipes scroll, score counts up
3. Hit pipe or ground → everything stops, "Game Over" + score shown
4. After 0.5s delay, "Tap to restart" appears, tap restarts

- [ ] **Step 6: Commit**

```bash
git add src/scenes/PlayScene.js
git commit -m "feat: add scoring, collisions, game over, and restart"
```

---

### Task 9: Polish and Tuning

**Files:**
- Modify: `src/scenes/PlayScene.js`
- Modify: `src/config.js` (if tuning values need adjustment)

- [ ] **Step 1: Add bird death animation (tumble down)**

Replace the `die()` body setup with a tumble effect. In `die()`, instead of stopping gravity immediately, let the bird tumble:

```javascript
  die() {
    if (this.state === State.GAME_OVER) return;
    this.state = State.GAME_OVER;

    // Bird tumbles
    this.bird.anims.stop();
    this.bird.body.setVelocityY(-200); // small upward bump
    this.bird.angle = 0;

    if (this.pipeTimer) this.pipeTimer.remove();

    // Stop pipes
    this.pipeBodyGroup.children.each((pipe) => {
      if (pipe.body) pipe.body.setVelocityX(0);
    });
    this.pipeCapGroup.children.each((cap) => {
      if (cap.body) cap.body.setVelocityX(0);
    });
    this.scoreTriggers.children.each((trigger) => {
      if (trigger.body) trigger.body.setVelocityX(0);
    });

    // Game Over text (after bird lands)
    this.time.delayedCall(800, () => {
      this.add.text(
        CONFIG.gameWidth / 2,
        CONFIG.gameHeight / 3,
        'Game Over',
        {
          fontSize: '36px',
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          color: '#ffffff',
          stroke: '#333333',
          strokeThickness: 5,
        }
      ).setOrigin(0.5).setDepth(20);

      this.add.text(
        CONFIG.gameWidth / 2,
        CONFIG.gameHeight / 3 + 50,
        `Score: ${this.score}`,
        {
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff',
          stroke: '#333333',
          strokeThickness: 4,
        }
      ).setOrigin(0.5).setDepth(20);

      this.time.delayedCall(500, () => {
        this.add.text(
          CONFIG.gameWidth / 2,
          CONFIG.gameHeight / 3 + 100,
          'Tap to restart',
          {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#333333',
            strokeThickness: 3,
          }
        ).setOrigin(0.5).setDepth(20);
        this.canRestart = true;
      });
    });
  }
```

- [ ] **Step 2: Add bird tumble rotation in `update()` GAME_OVER block**

Add a new block at the end of `update()`:

```javascript
    // GAME_OVER: bird tumbles down
    if (this.state === State.GAME_OVER) {
      if (this.bird.y < CONFIG.gameHeight - CONFIG.groundHeight - CONFIG.birdHeight) {
        this.bird.angle = Math.min(this.bird.angle + 8, 90);
      } else {
        // Bird hit ground — stop
        this.bird.body.setVelocity(0, 0);
        this.bird.body.setAllowGravity(false);
        this.bird.angle = 90;
      }
    }
```

- [ ] **Step 3: Ensure ground collision stops bird during GAME_OVER**

Update the ground collider in `create()` to handle both playing and game over:

```javascript
    this.physics.add.collider(this.bird, this.groundBody, () => {
      if (this.state === State.PLAYING) {
        this.die();
      }
      // During GAME_OVER, bird just rests on ground (handled by physics)
    });
```

- [ ] **Step 4: Playtest and tune**

Open in browser and play several rounds. Check:
- Bird flap feels responsive (adjust `CONFIG.flapVelocity` if needed)
- Pipe gap is fair but challenging (adjust `CONFIG.pipeGap` if needed)
- Pipe speed feels right (adjust `CONFIG.pipeSpeed` if needed)
- Ground scrolls smoothly with no gaps between tiles
- Score increments exactly once per pipe pair

- [ ] **Step 5: Commit**

```bash
git add src/scenes/PlayScene.js src/config.js
git commit -m "feat: add death animation, polish game feel"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Test on mobile viewport**

Open Chrome DevTools → toggle device toolbar → select a phone (iPhone SE or similar). Verify:
- Game scales correctly to fit screen
- Tap input works
- No horizontal scrolling or overflow

- [ ] **Step 2: Test on desktop**

Full browser window. Verify:
- Game is centered with black bars
- Spacebar and click both work
- No console errors

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Flappy Bird game — ready for deployment"
```
