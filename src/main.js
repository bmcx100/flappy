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
