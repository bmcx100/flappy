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
    this.canRestart = false;

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
    if (!this.canRestart) return;
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
