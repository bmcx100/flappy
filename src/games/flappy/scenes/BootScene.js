import { createBackgroundTexture } from '../assets/background.js';
import { createGroundTexture } from '../assets/ground.js';
import { createPipeTextures } from '../assets/pipe.js';
import { createBirdTexture, createFeatherTextures } from '../assets/bird.js';
import { createGearTexture } from '../assets/audio.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('FlappyBoot');
  }

  create() {
    // Only create textures on first boot (they persist across scene changes)
    if (!this.textures.exists('background')) {
      createBackgroundTexture(this);
      createGroundTexture(this);
      createPipeTextures(this);
      createBirdTexture(this);
      createFeatherTextures(this);
      createGearTexture(this);

      this.anims.create({
        key: 'flap',
        frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    this.scene.start('FlappyPlay');
  }
}
