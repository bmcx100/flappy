import { createBackgroundTexture } from '../assets/background.js';
import { createGroundTexture } from '../assets/ground.js';
import { createCubeTexture, createCubeParticleTexture } from '../assets/cube.js';
import { createSpikeTexture, createPlatformTexture, createCeilingSpikeTexture, createHoopTexture, createCeilingTexture } from '../assets/obstacles.js';
import { createGearTexture } from '../assets/audio.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('GeoDashBoot');
  }

  create() {
    if (!this.textures.exists('gd-background')) {
      createBackgroundTexture(this);
      createGroundTexture(this);
      createCubeTexture(this);
      createCubeParticleTexture(this);
      createSpikeTexture(this);
      createPlatformTexture(this);
      createCeilingSpikeTexture(this);
      createHoopTexture(this);
      createCeilingTexture(this);
      createGearTexture(this);
    }
    this.scene.start('GeoDashPlay');
  }
}
