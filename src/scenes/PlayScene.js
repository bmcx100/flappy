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
