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
