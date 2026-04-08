/**
 * Draw a 72x72 mini-preview of Flappy Bird using Canvas 2D.
 * Reuses color values from the procedural asset generators.
 */
export function drawFlappyThumbnail(canvas) {
  canvas.width = 72;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  const w = 72;
  const h = 72;

  // Sky
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, w, h);

  // Ground (bottom ~12px)
  const groundY = h - 12;
  ctx.fillStyle = '#5ba35b';
  ctx.fillRect(0, groundY, w, 1);
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, groundY + 1, w, 11);

  // Buildings (faint silhouettes)
  ctx.fillStyle = 'rgba(175,218,225,0.5)';
  ctx.fillRect(5, groundY - 18, 10, 18);
  ctx.fillRect(18, groundY - 24, 8, 24);
  ctx.fillRect(30, groundY - 14, 12, 14);
  ctx.fillRect(50, groundY - 20, 9, 20);

  // Pipe (right side)
  const pipeX = 48;
  const pipeW = 12;
  const capW = 16;
  const capH = 5;
  const gapTop = 22;
  const gapBottom = 42;

  // Top pipe
  ctx.fillStyle = '#73bf2e';
  ctx.fillRect(pipeX, 0, pipeW, gapTop);
  ctx.fillStyle = '#6ab42a';
  ctx.fillRect(pipeX - (capW - pipeW) / 2, gapTop, capW, capH);

  // Bottom pipe
  ctx.fillStyle = '#73bf2e';
  ctx.fillRect(pipeX, gapBottom, pipeW, groundY - gapBottom);
  ctx.fillStyle = '#6ab42a';
  ctx.fillRect(pipeX - (capW - pipeW) / 2, gapBottom - capH, capW, capH);

  // Bird (simple yellow rect with eye and beak)
  const bx = 18;
  const by = 30;
  const bw = 14;
  const bh = 10;

  // Body
  ctx.fillStyle = '#f7dc6f';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 1;
  ctx.fillRect(bx, by, bw - 4, bh);
  ctx.strokeRect(bx, by, bw - 4, bh);

  // Wing
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(bx + 1, by + 2, 5, 4);

  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(bx + bw - 6, by + 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.arc(bx + bw - 5, by + 3.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(bx + bw - 3, by + 5, 5, 3);
}
