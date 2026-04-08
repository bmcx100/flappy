import { CONFIG } from '../config.js';

export function createGroundTexture(scene) {
  const w = CONFIG.gameWidth;
  const h = CONFIG.groundHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Green top edge
  ctx.fillStyle = '#5ba35b';
  ctx.fillRect(0, 0, w, 4);

  // Brown border
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(0, 4, w, 3);

  // Sandy stripes
  const stripeWidth = 12;
  for (let x = 0; x < w; x += stripeWidth * 2) {
    ctx.fillStyle = '#ded895';
    ctx.fillRect(x, 7, stripeWidth, h - 7);
    ctx.fillStyle = '#d4c87a';
    ctx.fillRect(x + stripeWidth, 7, stripeWidth, h - 7);
  }

  scene.textures.addCanvas('ground', canvas);
}
