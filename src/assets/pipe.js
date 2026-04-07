import { CONFIG } from '../config.js';

export function createPipeTextures(scene) {
  // Pipe body — tall green rectangle with gradient shading
  const bodyW = CONFIG.pipeBodyWidth;
  const bodyH = CONFIG.gameHeight; // tall enough to cover any position
  const bodyCanvas = document.createElement('canvas');
  bodyCanvas.width = bodyW;
  bodyCanvas.height = bodyH;
  const bodyCtx = bodyCanvas.getContext('2d');

  const bodyGrad = bodyCtx.createLinearGradient(0, 0, bodyW, 0);
  bodyGrad.addColorStop(0, '#73bf2e');
  bodyGrad.addColorStop(0.3, '#6ab42a');
  bodyGrad.addColorStop(0.7, '#82d636');
  bodyGrad.addColorStop(1, '#73bf2e');
  bodyCtx.fillStyle = bodyGrad;
  bodyCtx.fillRect(0, 0, bodyW, bodyH);

  // Dark green border
  bodyCtx.strokeStyle = '#2d5a1b';
  bodyCtx.lineWidth = 2;
  bodyCtx.strokeRect(1, 0, bodyW - 2, bodyH);

  scene.textures.addCanvas('pipe-body', bodyCanvas);

  // Pipe cap — wider lip
  const capW = CONFIG.pipeCapWidth;
  const capH = CONFIG.pipeCapHeight;
  const capCanvas = document.createElement('canvas');
  capCanvas.width = capW;
  capCanvas.height = capH;
  const capCtx = capCanvas.getContext('2d');

  const capGrad = capCtx.createLinearGradient(0, 0, capW, 0);
  capGrad.addColorStop(0, '#73bf2e');
  capGrad.addColorStop(0.3, '#6ab42a');
  capGrad.addColorStop(0.7, '#82d636');
  capGrad.addColorStop(1, '#73bf2e');
  capCtx.fillStyle = capGrad;
  capCtx.fillRect(0, 0, capW, capH);

  capCtx.strokeStyle = '#2d5a1b';
  capCtx.lineWidth = 2;
  capCtx.strokeRect(1, 1, capW - 2, capH - 2);

  scene.textures.addCanvas('pipe-cap', capCanvas);
}
