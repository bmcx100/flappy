import { FlappyBootScene, FlappyPlayScene, drawFlappyThumbnail } from './games/flappy/index.js';

export const GAMES = [
  {
    id: 'flappy',
    name: 'Flappy Bird',
    subtitle: 'Tap to fly through pipes',
    bootScene: 'FlappyBoot',
    scenes: [FlappyBootScene, FlappyPlayScene],
    drawThumbnail: drawFlappyThumbnail,
  },
];
