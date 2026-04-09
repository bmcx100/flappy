import { CONFIG } from '../config.js';
import { LEVEL_1, LEVEL_LENGTH } from '../level.js';
import { initAudio, playJump, playDeath, playComplete, playGravityFlip, startMusic, stopMusic } from '../assets/audio.js';
import { createSettingsUI } from '../ui/settingsButton.js';
import { createBackButton } from '../../../ui/backButton.js';

const READY = 0;
const PLAYING = 1;
const DEAD = 2;
const COMPLETE = 3;

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('GeoDashPlay');
  }

  create() {
    // --- State init ---
    this.state = READY;
    this.levelProgress = 0;
    this.distanceTraveled = 0;
    this.canRestart = false;
    this.gravityFlipped = false;
    this.isOnSurface = true;

    // --- Attempt counter ---
    const prevAttempts = parseInt(localStorage.getItem('geodash-attempts') || '0', 10);
    this.attempts = prevAttempts + 1;
    localStorage.setItem('geodash-attempts', String(this.attempts));

    // --- Best percentage ---
    this.bestPct = parseInt(localStorage.getItem('geodash-best-pct') || '0', 10);

    // --- Disable world gravity (manage per-body instead) ---
    this.physics.world.gravity.y = 0;

    // --- Background ---
    this.add.image(0, 0, 'gd-background').setOrigin(0, 0);

    // --- Ceiling (two copies for seamless scroll) ---
    this.ceiling1 = this.add.image(0, 0, 'gd-ceiling').setOrigin(0, 0);
    this.ceiling2 = this.add.image(CONFIG.gameWidth, 0, 'gd-ceiling').setOrigin(0, 0);
    this.ceiling1.setDepth(4);
    this.ceiling2.setDepth(4);

    // --- Ceiling physics body ---
    this.ceilingBody = this.physics.add.staticImage(
      CONFIG.gameWidth / 2,
      CONFIG.ceilingHeight / 2,
      'gd-ceiling'
    );
    this.ceilingBody.setDisplaySize(CONFIG.gameWidth, CONFIG.ceilingHeight);
    this.ceilingBody.setVisible(false);
    this.ceilingBody.refreshBody();

    // --- Ground (two copies for seamless scroll) ---
    this.ground1 = this.add.image(0, CONFIG.groundY, 'gd-ground').setOrigin(0, 0);
    this.ground2 = this.add.image(CONFIG.gameWidth, CONFIG.groundY, 'gd-ground').setOrigin(0, 0);
    this.ground1.setDepth(4);
    this.ground2.setDepth(4);

    // --- Ground physics body (invisible, for collision) ---
    this.groundBody = this.physics.add.staticImage(
      CONFIG.gameWidth / 2,
      CONFIG.groundY + CONFIG.groundHeight / 2,
      'gd-ground'
    );
    this.groundBody.setDisplaySize(CONFIG.gameWidth, CONFIG.groundHeight);
    this.groundBody.setVisible(false);
    this.groundBody.refreshBody();

    // --- Player cube ---
    this.cube = this.physics.add.image(CONFIG.cubeX, CONFIG.groundY - CONFIG.cubeSize / 2, 'gd-cube');
    this.cube.body.setAllowGravity(false);
    this.cube.setDepth(10);
    this.cube.body.setSize(CONFIG.cubeSize - 4, CONFIG.cubeSize - 4);
    this.cube.body.setGravityY(CONFIG.gravity);

    // --- Obstacle groups ---
    this.spikeGroup = this.physics.add.group();
    this.platformGroup = this.physics.add.group();
    this.hoopGroup = this.physics.add.group();

    // --- Spawn level obstacles ---
    this.obstacles = [];
    this.gaps = [];
    this.ceilingGaps = [];

    for (const entry of LEVEL_1) {
      switch (entry.type) {
        case 'spike': {
          const spike = this.spikeGroup.create(entry.x, CONFIG.groundY - CONFIG.spikeHeight / 2, 'gd-spike');
          spike.body.setImmovable(true);
          spike.body.setAllowGravity(false);
          spike.setDepth(6);
          this.obstacles.push(spike);
          break;
        }

        case 'ceiling-spike': {
          const cSpike = this.spikeGroup.create(
            entry.x,
            CONFIG.ceilingBottomEdge + CONFIG.spikeHeight / 2,
            'gd-ceiling-spike'
          );
          cSpike.body.setImmovable(true);
          cSpike.body.setAllowGravity(false);
          cSpike.setDepth(6);
          this.obstacles.push(cSpike);
          break;
        }

        case 'gap': {
          this.gaps.push({ x: entry.x, width: entry.width });

          // Kill zone at the bottom of the gap
          const killZone = this.physics.add.image(
            entry.x + entry.width / 2,
            CONFIG.groundY + 20,
            null
          );
          killZone.setVisible(false);
          killZone.body.setSize(entry.width, 40);
          killZone.body.setImmovable(true);
          killZone.body.setAllowGravity(false);
          this.spikeGroup.add(killZone);
          this.obstacles.push(killZone);

          // Visual gap cover
          const cover = this.add.rectangle(
            entry.x + entry.width / 2,
            CONFIG.groundY + CONFIG.groundHeight / 2,
            entry.width,
            CONFIG.groundHeight,
            0x1a1a2e
          );
          cover.setDepth(5);
          this.obstacles.push(cover);
          break;
        }

        case 'ceiling-gap': {
          this.ceilingGaps.push({ x: entry.x, width: entry.width });

          // Kill zone at the top of the ceiling gap
          const cKillZone = this.physics.add.image(
            entry.x + entry.width / 2,
            CONFIG.ceilingHeight / 2 - 20,
            null
          );
          cKillZone.setVisible(false);
          cKillZone.body.setSize(entry.width, 40);
          cKillZone.body.setImmovable(true);
          cKillZone.body.setAllowGravity(false);
          this.spikeGroup.add(cKillZone);
          this.obstacles.push(cKillZone);

          // Visual ceiling gap cover
          const cCover = this.add.rectangle(
            entry.x + entry.width / 2,
            CONFIG.ceilingHeight / 2,
            entry.width,
            CONFIG.ceilingHeight,
            0x1a1a2e
          );
          cCover.setDepth(5);
          this.obstacles.push(cCover);
          break;
        }

        case 'hoop': {
          const midY = (CONFIG.ceilingBottomEdge + CONFIG.groundY) / 2;
          const hoop = this.hoopGroup.create(entry.x, midY, 'gd-hoop');
          hoop.body.setImmovable(true);
          hoop.body.setAllowGravity(false);
          hoop.setDepth(8);
          hoop._triggered = false;
          this.obstacles.push(hoop);
          break;
        }

        case 'platform': {
          const plat = this.platformGroup.create(
            entry.x + entry.width / 2,
            entry.y,
            'gd-platform'
          );
          plat.setDisplaySize(entry.width, CONFIG.platformHeight);
          plat.body.setImmovable(true);
          plat.body.setAllowGravity(false);
          plat.refreshBody();
          plat.setDepth(6);
          this.obstacles.push(plat);
          break;
        }

        case 'spike-platform': {
          const spikePlat = this.spikeGroup.create(
            entry.x,
            entry.platformY - CONFIG.spikeHeight / 2,
            'gd-spike'
          );
          spikePlat.body.setImmovable(true);
          spikePlat.body.setAllowGravity(false);
          spikePlat.setDepth(6);
          this.obstacles.push(spikePlat);
          break;
        }

        case 'pillar': {
          const h = entry.height;
          const topY = CONFIG.groundY - h;
          const plat = this.platformGroup.create(
            entry.x + entry.width / 2,
            topY + h / 2,
            'gd-platform'
          );
          plat.setDisplaySize(entry.width, h);
          plat.body.setImmovable(true);
          plat.body.setAllowGravity(false);
          plat.refreshBody();
          plat.setDepth(6);
          this.obstacles.push(plat);
          break;
        }

        case 'spike-row': {
          const count = Math.floor(entry.width / CONFIG.spikeWidth);
          for (let i = 0; i < count; i++) {
            const sx = entry.x + i * CONFIG.spikeWidth + CONFIG.spikeWidth / 2;
            const spike = this.spikeGroup.create(
              sx,
              CONFIG.groundY - CONFIG.spikeHeight / 2,
              'gd-spike'
            );
            spike.body.setImmovable(true);
            spike.body.setAllowGravity(false);
            spike.setDepth(6);
            this.obstacles.push(spike);
          }
          break;
        }
      }
    }

    // --- Collisions ---
    this.groundCollider = this.physics.add.collider(this.cube, this.groundBody);
    this.ceilingCollider = this.physics.add.collider(this.cube, this.ceilingBody);
    this.physics.add.collider(this.cube, this.platformGroup, () => {
      this.isOnSurface = true;
    });
    this.physics.add.overlap(this.cube, this.spikeGroup, () => this.die());
    this.physics.add.overlap(this.cube, this.hoopGroup, (cube, hoop) => {
      if (hoop._triggered) return;
      hoop._triggered = true;
      this.flipGravity();
      playGravityFlip();
      // Fade hoop out
      this.tweens.add({
        targets: hoop,
        alpha: 0.2,
        duration: 300,
      });
    });

    // --- Progress bar (HUD) ---
    const barW = CONFIG.gameWidth - CONFIG.progressBarPad * 2;
    this.progressBg = this.add.rectangle(
      CONFIG.progressBarPad, CONFIG.progressBarY,
      barW, CONFIG.progressBarH, 0x333333
    ).setOrigin(0, 0.5).setDepth(20).setScrollFactor(0);

    this.progressFill = this.add.rectangle(
      CONFIG.progressBarPad, CONFIG.progressBarY,
      0, CONFIG.progressBarH, 0xe040a0
    ).setOrigin(0, 0.5).setDepth(21).setScrollFactor(0);

    this.progressText = this.add.text(
      CONFIG.gameWidth / 2, CONFIG.progressBarY + 12, '0%',
      {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }
    ).setOrigin(0.5, 0).setDepth(21).setScrollFactor(0);

    // --- Ready state UI ---
    this.readyText = this.add.text(
      CONFIG.gameWidth / 2, CONFIG.gameHeight / 3, 'Ready!',
      {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setDepth(20);

    this.tapText = this.add.text(
      CONFIG.gameWidth / 2, CONFIG.gameHeight / 3 + 50, 'Tap or press Space',
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5).setDepth(20);

    // --- Settings UI and Back button ---
    this.settingsUI = createSettingsUI(this, () => this.state === PLAYING);
    this.backBtn = createBackButton(this, () => stopMusic());

    // --- Input (variable jump: hold = full, tap = short) ---
    this._jumpHeld = false;

    this.input.on('pointerdown', () => {
      if (this._settingsInputConsumed) {
        this._settingsInputConsumed = false;
        return;
      }
      this._jumpHeld = true;
      this.handleInput();
    });
    this.input.on('pointerup', () => {
      this._jumpHeld = false;
    });

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this._jumpHeld = true;
      this.handleInput();
    });
    this.spaceKey.on('up', () => {
      this._jumpHeld = false;
    });

    // --- Bob timer for ready state ---
    this.bobTime = 0;
  }

  handleInput() {
    if (this.state === READY) {
      this.startPlaying();
    } else if (this.state === PLAYING) {
      this.jump();
    } else if (this.state === DEAD) {
      if (this.canRestart) {
        this.scene.restart();
      }
    } else if (this.state === COMPLETE) {
      window.__destroyGame();
    }
  }

  startPlaying() {
    this.state = PLAYING;
    this.readyText.setVisible(false);
    this.tapText.setVisible(false);
    this.cube.body.setAllowGravity(true);
    initAudio();
    startMusic();
    this.jump();
  }

  jump() {
    if (this.isOnSurface) {
      if (this.gravityFlipped) {
        // Reversed gravity: jump pushes DOWN (away from ceiling)
        this.cube.body.setVelocityY(-CONFIG.jumpVelocity);
      } else {
        // Normal gravity: jump pushes UP
        this.cube.body.setVelocityY(CONFIG.jumpVelocity);
      }
      this.isOnSurface = false;
      playJump();
    }
  }

  flipGravity() {
    this.gravityFlipped = !this.gravityFlipped;
    if (this.gravityFlipped) {
      this.cube.body.setGravityY(-CONFIG.gravity);
    } else {
      this.cube.body.setGravityY(CONFIG.gravity);
    }
    // Reset velocity for a clean transition
    this.cube.body.setVelocityY(0);
    this.isOnSurface = false;
  }

  die() {
    if (this.state === DEAD) return;
    this.state = DEAD;

    stopMusic();
    playDeath();

    // --- Particle explosion ---
    const cx = this.cube.x;
    const cy = this.cube.y;

    const emitter = this.add.particles(cx, cy, 'gd-cube-particle', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      alpha: { start: 1, end: 0 },
      scale: { start: 1, end: 0.3 },
      lifespan: { min: 600, max: 1000 },
      gravityY: 300,
      quantity: 10,
      emitting: false,
    });
    emitter.setDepth(15);
    emitter.explode();

    // Hide cube, stop physics
    this.cube.setVisible(false);
    this.cube.body.setVelocity(0, 0);
    this.cube.body.setAllowGravity(false);

    // Calculate current percentage
    const currentPct = Math.floor(this.levelProgress * 100);

    // Save best percentage if improved
    if (currentPct > this.bestPct) {
      this.bestPct = currentPct;
      localStorage.setItem('geodash-best-pct', String(this.bestPct));
    }

    // --- Death modal (after 800ms) ---
    this.canRestart = false;
    this._modalObjects = [];

    this.time.delayedCall(800, () => {
      const mx = CONFIG.gameWidth / 2;
      const my = CONFIG.gameHeight / 2 - 20;
      const mw = 220;
      const mh = 200;
      const m = this._modalObjects;

      // Dark overlay
      m.push(
        this.add.rectangle(mx, my, mw, mh, 0x000000, 0.8)
          .setOrigin(0.5).setDepth(25).setStrokeStyle(2, 0xffffff)
      );

      // Percentage text (large)
      m.push(
        this.add.text(mx, my - 60, `${currentPct}%`, {
          fontSize: '42px',
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          color: '#ff4444',
          stroke: '#000000',
          strokeThickness: 4,
        }).setOrigin(0.5).setDepth(26)
      );

      // Best percentage
      const bestColor = currentPct >= this.bestPct ? '#f7dc6f' : '#aaaaaa';
      m.push(
        this.add.text(mx, my - 10, `Best: ${this.bestPct}%`, {
          fontSize: '22px',
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          color: bestColor,
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(26)
      );

      // Attempt number
      m.push(
        this.add.text(mx, my + 30, `Attempt #${this.attempts}`, {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: '#aaaaaa',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(26)
      );

      // "Tap to retry" after 500ms more
      this.time.delayedCall(500, () => {
        const tapPrompt = this.add.text(mx, my + 70, 'Tap to retry', {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: '#aaaaaa',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(26);
        m.push(tapPrompt);
        this.canRestart = true;
      });
    });
  }

  complete() {
    if (this.state === COMPLETE) return;
    this.state = COMPLETE;

    stopMusic();
    playComplete();

    // Save 100% best
    this.bestPct = 100;
    localStorage.setItem('geodash-best-pct', '100');

    // Celebration particles
    const cx = this.cube.x;
    const cy = this.cube.y;

    const emitter = this.add.particles(cx, cy, 'gd-cube-particle', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      alpha: { start: 1, end: 0 },
      scale: { start: 1.2, end: 0.2 },
      lifespan: { min: 800, max: 1400 },
      gravityY: 200,
      quantity: 15,
      emitting: false,
    });
    emitter.setDepth(15);
    emitter.explode();

    // Show completion modal after 500ms
    this._modalObjects = [];

    this.time.delayedCall(500, () => {
      const mx = CONFIG.gameWidth / 2;
      const my = CONFIG.gameHeight / 2 - 20;
      const mw = 240;
      const mh = 200;
      const m = this._modalObjects;

      // Dark overlay
      m.push(
        this.add.rectangle(mx, my, mw, mh, 0x000000, 0.8)
          .setOrigin(0.5).setDepth(25).setStrokeStyle(2, 0x3080e0)
      );

      // "Level Complete!" title
      m.push(
        this.add.text(mx, my - 60, 'Level Complete!', {
          fontSize: '26px',
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          color: '#3080e0',
          stroke: '#000000',
          strokeThickness: 4,
        }).setOrigin(0.5).setDepth(26)
      );

      // Attempts
      m.push(
        this.add.text(mx, my - 10, `Attempts: ${this.attempts}`, {
          fontSize: '20px',
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(26)
      );

      // "Tap to continue"
      m.push(
        this.add.text(mx, my + 40, 'Tap to continue', {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: '#aaaaaa',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(26)
      );
    });
  }

  update(time, delta) {
    // --- READY: bob the cube ---
    if (this.state === READY) {
      this.bobTime += delta;
      this.cube.y = (CONFIG.groundY - CONFIG.cubeSize / 2) + Math.sin(this.bobTime / 300) * 4;
      return;
    }

    // --- PLAYING ---
    if (this.state === PLAYING) {
      const scrollDist = CONFIG.scrollSpeed * delta / 1000;

      // Scroll ground
      this.ground1.x -= scrollDist;
      this.ground2.x -= scrollDist;

      if (this.ground1.x <= -CONFIG.gameWidth) {
        this.ground1.x = this.ground2.x + CONFIG.gameWidth;
      }
      if (this.ground2.x <= -CONFIG.gameWidth) {
        this.ground2.x = this.ground1.x + CONFIG.gameWidth;
      }

      // Scroll ceiling
      this.ceiling1.x -= scrollDist;
      this.ceiling2.x -= scrollDist;

      if (this.ceiling1.x <= -CONFIG.gameWidth) {
        this.ceiling1.x = this.ceiling2.x + CONFIG.gameWidth;
      }
      if (this.ceiling2.x <= -CONFIG.gameWidth) {
        this.ceiling2.x = this.ceiling1.x + CONFIG.gameWidth;
      }

      // Scroll all obstacles
      for (const obj of this.obstacles) {
        obj.x -= scrollDist;
        // Also refresh physics body position for physics objects
        if (obj.body) {
          obj.body.reset(obj.x, obj.y);
        }
      }

      // Track distance
      this.distanceTraveled += scrollDist;

      // Update progress
      this.levelProgress = Math.min(this.distanceTraveled / LEVEL_LENGTH, 1);
      const barW = CONFIG.gameWidth - CONFIG.progressBarPad * 2;
      this.progressFill.width = barW * this.levelProgress;
      const pctDisplay = Math.floor(this.levelProgress * 100);
      this.progressText.setText(`${pctDisplay}%`);

      // Cube rotation while airborne
      if (!this.isOnSurface) {
        const rotDir = this.gravityFlipped ? -1 : 1;
        this.cube.angle += rotDir * 400 * delta / 1000;
      } else {
        // Snap to nearest 90 degrees
        this.cube.angle = Math.round(this.cube.angle / 90) * 90;
      }

      // Surface check — depends on gravity direction
      if (this.gravityFlipped) {
        this.isOnSurface = this.cube.body.blocked.up || this.cube.body.touching.up;
      } else {
        this.isOnSurface = this.cube.body.blocked.down || this.cube.body.touching.down;
      }

      // Wall collision — if a pillar pushed the cube sideways, die
      if (this.cube.x < CONFIG.cubeX - 3) {
        this.die();
        return;
      }
      this.cube.x = CONFIG.cubeX;

      // Variable jump — boost upward while button held and ascending
      if (this._jumpHeld && !this.isOnSurface) {
        const vy = this.cube.body.velocity.y;
        const ascending = this.gravityFlipped ? vy > 0 : vy < 0;
        if (ascending) {
          const boost = CONFIG.jumpBoost * delta / 1000;
          if (this.gravityFlipped) {
            this.cube.body.velocity.y += boost;
          } else {
            this.cube.body.velocity.y -= boost;
          }
        }
      }

      // Gap handling — check if cube's world position is inside a ground gap
      const cubeWorldX = CONFIG.cubeX + this.distanceTraveled;
      let inGap = false;
      for (const gap of this.gaps) {
        if (cubeWorldX >= gap.x - 5 && cubeWorldX <= gap.x + gap.width + 5) {
          inGap = true;
          break;
        }
      }

      // Move ground body based on gap state
      if (inGap) {
        this.groundBody.setPosition(CONFIG.gameWidth / 2, CONFIG.gameHeight + 100);
        this.groundBody.refreshBody();
      } else {
        this.groundBody.setPosition(CONFIG.gameWidth / 2, CONFIG.groundY + CONFIG.groundHeight / 2);
        this.groundBody.refreshBody();
      }

      // Ceiling gap handling
      let inCeilingGap = false;
      for (const gap of this.ceilingGaps) {
        if (cubeWorldX >= gap.x - 5 && cubeWorldX <= gap.x + gap.width + 5) {
          inCeilingGap = true;
          break;
        }
      }

      if (inCeilingGap) {
        this.ceilingBody.setPosition(CONFIG.gameWidth / 2, -100);
        this.ceilingBody.refreshBody();
      } else {
        this.ceilingBody.setPosition(CONFIG.gameWidth / 2, CONFIG.ceilingHeight / 2);
        this.ceilingBody.refreshBody();
      }

      // Kill if fell off screen (bottom or top)
      if (this.cube.y > CONFIG.gameHeight || this.cube.y < 0) {
        this.die();
        return;
      }

      // Check level complete
      if (this.distanceTraveled >= LEVEL_LENGTH) {
        this.complete();
      }
    }
  }
}
