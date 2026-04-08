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
