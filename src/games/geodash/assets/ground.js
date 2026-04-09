// Geometry Dash ground — dark purple with grid and spike silhouettes

export function createGroundTexture(scene) {
  const w = 640;
  const h = 50;
  const tex = scene.textures.createCanvas('gd-ground', w, h);
  const ctx = tex.context;

  // Dark purple body
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(0, 0, w, h);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(80, 40, 120, 0.3)';
  ctx.lineWidth = 0.5;
  for (let y = 8; y < h; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let x = 0; x <= w; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Bright purple top edge
  ctx.fillStyle = '#8040c0';
  ctx.fillRect(0, 0, w, 2);

  // Small decorative spike silhouettes along top
  ctx.fillStyle = '#0d0618';
  for (let x = 0; x < w; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x + 8, 2);
    ctx.lineTo(x + 14, 10);
    ctx.lineTo(x + 2, 10);
    ctx.closePath();
    ctx.fill();
  }

  tex.refresh();
}
