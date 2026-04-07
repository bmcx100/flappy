import { CONFIG } from '../config.js';

export function createBirdTexture(scene) {
  const fw = CONFIG.birdWidth;
  const fh = CONFIG.birdHeight;
  const frames = 3;
  const canvas = document.createElement('canvas');
  canvas.width = fw * frames;
  canvas.height = fh;
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < frames; i++) {
    const ox = i * fw; // x offset for this frame
    drawBirdFrame(ctx, ox, fw, fh, i);
  }

  scene.textures.addSpriteSheet('bird', canvas, { frameWidth: fw, frameHeight: fh });
}

function drawBirdFrame(ctx, ox, fw, fh, wingPhase) {
  // Body (yellow rounded rect)
  ctx.fillStyle = '#f7dc6f';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  roundRect(ctx, ox + 2, 2, fw - 12, fh - 4, 4);

  // Wing (darker yellow) — position varies by phase
  const wingX = ox + 3;
  const wingW = 10;
  const wingH = 7;
  let wingY;
  if (wingPhase === 0) wingY = 4;        // up
  else if (wingPhase === 1) wingY = 9;   // mid
  else wingY = 13;                        // down

  ctx.fillStyle = '#f0c040';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(wingX, wingY, wingW, wingH);
  ctx.fill();
  ctx.stroke();

  // Eye (white circle with black pupil)
  const eyeX = ox + fw - 14;
  const eyeY = 6;
  ctx.fillStyle = 'white';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupil
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.arc(eyeX + 1.5, eyeY + 1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Beak (red/orange)
  ctx.fillStyle = '#e74c3c';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(ox + fw - 8, 10, 10, 7);
  ctx.fill();
  ctx.stroke();
}

/** Generate 5 small feather textures for death explosion */
export function createFeatherTextures(scene) {
  const colors = ['#f7dc6f', '#f0c040', '#ffffff', '#e74c3c', '#d4ac0d'];
  const fw = 6;
  const fh = 10;

  colors.forEach((color, i) => {
    const key = `feather-${i}`;
    const g = scene.textures.createCanvas(key, fw, fh);
    const ctx = g.context;

    ctx.clearRect(0, 0, fw, fh);

    // Leaf/teardrop shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(fw / 2, 0);
    ctx.quadraticCurveTo(fw + 1, fh * 0.3, fw / 2, fh);
    ctx.quadraticCurveTo(-1, fh * 0.3, fw / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Faint center vein line
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(fw / 2, 1);
    ctx.lineTo(fw / 2, fh - 1);
    ctx.stroke();

    g.refresh();
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
