import { CONFIG } from '../config.js';
import { initAudio, playFlap, playScore, playHit, playDeathSplat, startMusic, stopMusic } from '../assets/audio.js';
import { createSettingsUI } from '../ui/settingsButton.js';
import { createMathQuiz } from '../ui/mathQuiz.js';

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

    // Pipe groups (object pooling)
    this.pipeBodyGroup = this.physics.add.group();
    this.pipeCapGroup = this.physics.add.group();
    this.scoreTriggers = this.physics.add.group();

    this.pipeTimer = null;

    // Collisions
    this.physics.add.collider(this.bird, this.groundBody, () => this.die());
    this.physics.add.overlap(this.bird, this.pipeBodyGroup, () => this.die());
    this.physics.add.overlap(this.bird, this.pipeCapGroup, () => this.die());

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

    // Settings UI (must be created before scene-level input so it can stopPropagation)
    this.settingsUI = createSettingsUI(this, () => this.state === State.PLAYING);

    // Input — skip if settings UI consumed this event
    this.input.on('pointerdown', () => {
      if (this._settingsInputConsumed) {
        this._settingsInputConsumed = false;
        return;
      }
      this.handleInput();
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => this.handleInput());
  }

  handleInput() {
    if (this.state === State.READY) {
      this.startPlaying();
    } else if (this.state === State.PLAYING) {
      this.flap();
    } else if (this.state === State.GAME_OVER) {
      // Quiz handles restart — do nothing
    }
  }

  startPlaying() {
    this.state = State.PLAYING;
    this.readyText.setVisible(false);
    this.tapText.setVisible(false);
    this.scoreText.setVisible(true);
    this.bird.body.setAllowGravity(true);
    initAudio();
    startMusic();
    this.flap();
    this.startPipeTimer();
  }

  flap() {
    this.bird.body.setVelocityY(CONFIG.flapVelocity);
    playFlap();
  }

  die() {
    if (this.state === State.GAME_OVER) return;
    this.state = State.GAME_OVER;

    stopMusic();
    playHit();
    playDeathSplat();

    // Feather explosion at bird position
    const bx = this.bird.x;
    const by = this.bird.y;
    for (let i = 0; i < 5; i++) {
      const emitter = this.add.particles(bx, by, `feather-${i}`, {
        speed: { min: 80, max: 250 },
        angle: { min: 0, max: 360 },
        alpha: { start: 1, end: 0 },
        scale: { start: 1, end: 0.3 },
        lifespan: { min: 800, max: 1500 },
        gravityY: 300,
        quantity: i < 3 ? 4 : 3, // 4+4+4+3+3 = 18 total
        emitting: false,
      });
      emitter.setDepth(15);
      emitter.explode();
    }

    // Hide bird, stop physics
    this.bird.setVisible(false);
    this.bird.body.setVelocity(0, 0);
    this.bird.body.setAllowGravity(false);
    this.bird.anims.stop();

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

    // Update high score
    const prevBest = parseInt(localStorage.getItem('flappy-highscore') || '0', 10);
    const isNewBest = this.score > prevBest;
    const highScore = isNewBest ? this.score : prevBest;
    if (isNewBest) localStorage.setItem('flappy-highscore', String(this.score));

    // Game Over modal (after feathers settle)
    this.time.delayedCall(800, () => {
      const cx = CONFIG.gameWidth / 2;
      const cy = CONFIG.gameHeight / 2 - 20;
      const mw = 220;
      const mh = 340;

      // Modal background
      this.add.rectangle(cx, cy + 30, mw, mh, 0x000000, 0.8)
        .setOrigin(0.5).setDepth(25).setStrokeStyle(2, 0xffffff);

      // "Game Over" title
      this.add.text(cx, cy - 130, 'Game Over', {
        fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
        color: '#ffffff', stroke: '#333333', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(26);

      // Score
      this.add.text(cx, cy - 85, `Score: ${this.score}`, {
        fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
        color: '#ffffff', stroke: '#333333', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(26);

      // High score
      this.add.text(cx, cy - 50, `Best: ${highScore}`, {
        fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
        color: isNewBest ? '#f7dc6f' : '#aaaaaa', stroke: '#333333', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(26);

      // New best indicator
      if (isNewBest && this.score > 0) {
        this.add.text(cx, cy - 20, 'NEW BEST!', {
          fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
          color: '#f7dc6f', stroke: '#333333', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(26);
      }

      this.time.delayedCall(500, () => {
        createMathQuiz(this, cx, cy, () => this.scene.restart());
      });
    });
  }

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

    // Bottom pipe body (visual to ground, hitbox to screen bottom)
    const bottomBodyY = gapCenterY + halfGap + CONFIG.pipeCapHeight;
    const bottomVisualH = CONFIG.gameHeight - CONFIG.groundHeight - bottomBodyY;
    const bottomHitboxH = CONFIG.gameHeight - bottomBodyY;
    const bottomBody = this.pipeBodyGroup.create(x, bottomBodyY, 'pipe-body');
    bottomBody.setOrigin(0.5, 0);
    bottomBody.setDisplaySize(CONFIG.pipeBodyWidth, bottomVisualH);
    bottomBody.body.setSize(CONFIG.pipeBodyWidth, bottomHitboxH, false);
    bottomBody.body.setOffset(0, 0);
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

    // Top pipe body (extends to top of screen)
    const topBodyBottom = gapCenterY - halfGap - CONFIG.pipeCapHeight;
    const topBodyH = topBodyBottom;
    const topBody = this.pipeBodyGroup.create(x, 0, 'pipe-body');
    topBody.setOrigin(0.5, 0);
    topBody.setDisplaySize(CONFIG.pipeBodyWidth, topBodyH);
    topBody.body.setSize(CONFIG.pipeBodyWidth, topBodyH, false);
    topBody.body.setOffset(0, 0);
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

      // Score — check if bird passed a trigger
      this.scoreTriggers.children.each((trigger) => {
        if (trigger.active && !trigger.scored && trigger.x < this.bird.x) {
          trigger.scored = true;
          this.score++;
          this.scoreText.setText(String(this.score));
          playScore();
        }
      });

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
    }

    // GAME_OVER: bird is hidden (feather explosion handles visuals)
  }
}
