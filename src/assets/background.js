import { CONFIG } from '../config.js';

export function createBackgroundTexture(scene) {
  const w = CONFIG.gameWidth;
  const h = CONFIG.gameHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#87CEEB');
  skyGrad.addColorStop(1, '#87CEEB');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Haze / atmosphere layer (white gradient fading in around cloud/city area)
  const hazeGrad = ctx.createLinearGradient(0, h * 0.28, 0, h * 0.55);
  hazeGrad.addColorStop(0, 'rgba(255,255,255,0)');
  hazeGrad.addColorStop(0.3, 'rgba(255,255,255,0.3)');
  hazeGrad.addColorStop(0.55, 'rgba(255,255,255,0.6)');
  hazeGrad.addColorStop(0.75, 'rgba(255,255,255,0.8)');
  hazeGrad.addColorStop(1, 'rgba(255,255,255,0.5)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, h * 0.28, w, h * 0.27);

  // Cloud wisps (scattered blurred ellipses at varying heights and opacities)
  ctx.save();
  const cloudRows = [
    { y: h * 0.27, count: 7, sizeRange: [40, 60], alphaRange: [0.3, 0.45], blur: 4 },
    { y: h * 0.34, count: 5, sizeRange: [50, 70], alphaRange: [0.2, 0.3], blur: 6 },
    { y: h * 0.40, count: 4, sizeRange: [60, 80], alphaRange: [0.12, 0.2], blur: 8 },
  ];

  for (const row of cloudRows) {
    ctx.filter = `blur(${row.blur}px)`;
    for (let i = 0; i < row.count; i++) {
      const cx = (w / row.count) * i + Math.random() * 30;
      const cy = row.y + (Math.random() - 0.5) * 20;
      const rw = row.sizeRange[0] + Math.random() * (row.sizeRange[1] - row.sizeRange[0]);
      const rh = rw * 0.5;
      const alpha = row.alphaRange[0] + Math.random() * (row.alphaRange[1] - row.alphaRange[0]);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw / 2, rh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Background buildings (very faint, ghostly)
  const bgBuildingsY = h - CONFIG.groundHeight;
  ctx.fillStyle = 'rgba(200,230,215,0.3)';
  ctx.fillRect(0, bgBuildingsY - 65, w, 65);

  const bgBuildings = [
    { x: 5, w: 35, h: 42 },
    { x: 48, w: 28, h: 58 },
    { x: 85, w: 40, h: 32 },
    { x: 135, w: 32, h: 48 },
    { x: 180, w: 35, h: 38 },
    { x: 225, w: 28, h: 52 },
    { x: 265, w: 30, h: 44 },
    { x: 300, w: 25, h: 36 },
    { x: 335, w: 20, h: 50 },
  ];
  ctx.fillStyle = 'rgba(200,230,215,0.25)';
  for (const b of bgBuildings) {
    ctx.fillRect(b.x, bgBuildingsY - 65 - b.h, b.w, b.h);
  }

  // Foreground buildings (subtle, muted, with faint windows)
  const fgBuildings = [
    { x: 10, w: 40, h: 88, windowCols: 3 },
    { x: 56, w: 32, h: 115, windowCols: 2 },
    { x: 94, w: 45, h: 72, windowCols: 3 },
    { x: 145, w: 34, h: 98, windowCols: 2 },
    { x: 185, w: 38, h: 60, windowCols: 3 },
    { x: 228, w: 32, h: 82, windowCols: 2 },
    { x: 268, w: 36, h: 70, windowCols: 3 },
    { x: 310, w: 30, h: 90, windowCols: 2 },
    { x: 346, w: 14, h: 65, windowCols: 1 },
  ];

  for (const b of fgBuildings) {
    const by = bgBuildingsY - b.h;
    ctx.fillStyle = `rgba(${175 + (b.windowCols % 2) * 15},${218 + (b.windowCols % 2) * 7},${225 + (b.windowCols % 2) * 7},0.4)`;
    ctx.fillRect(b.x, by, b.w, b.h);
    ctx.fillStyle = 'rgba(220,245,250,0.5)';
    const winSize = 7;
    const winGap = 4;
    const padX = 5;
    const padY = 6;
    for (let row = 0; row < Math.floor((b.h - padY * 2) / (winSize + winGap)); row++) {
      for (let col = 0; col < b.windowCols; col++) {
        ctx.fillRect(
          b.x + padX + col * (winSize + winGap),
          by + padY + row * (winSize + winGap),
          winSize,
          winSize
        );
      }
    }
  }

  scene.textures.addCanvas('background', canvas);
}
