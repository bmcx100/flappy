import { FlappyBootScene, FlappyPlayScene, drawFlappyThumbnail } from './games/flappy/index.js';
import { GeoDashBootScene, GeoDashPlayScene, drawGeoDashThumbnail } from './games/geodash/index.js';

export const GAMES = [
  {
    id: 'flappy',
    name: 'Flappy Bird',
    subtitle: 'Tap to fly through pipes',
    bootScene: 'FlappyBoot',
    scenes: [FlappyBootScene, FlappyPlayScene],
    drawThumbnail: drawFlappyThumbnail,
  },
  {
    id: 'geodash',
    name: 'Geometry Dash',
    subtitle: 'Jump over obstacles',
    bootScene: 'GeoDashBoot',
    scenes: [GeoDashBootScene, GeoDashPlayScene],
    drawThumbnail: drawGeoDashThumbnail,
    width: 640,
    height: 360,
  },
];
