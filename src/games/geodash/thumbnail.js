/**
 * Draw a 72x72 mini-preview of Geometry Dash using Canvas 2D.
 * Purple background with cityscape, purple ground, blue cube, pink spike.
 */
export function drawGeoDashThumbnail(canvas) {
  canvas.width = 72;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  const w = 72;
  const h = 72;

  // Deep purple background
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a0a2e');
  grad.addColorStop(1, '#0d0618');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Purple cityscape silhouettes
  ctx.fillStyle = 'rgba(40, 15, 60, 0.6)';
  ctx.fillRect(5, 30, 10, 30);
  ctx.fillRect(18, 35, 8, 25);
  ctx.fillRect(30, 25, 12, 35);
  ctx.fillRect(46, 32, 9, 28);
  ctx.fillRect(58, 28, 10, 32);

  // Ground
  const groundY = h - 12;

  // Ground body (dark purple)
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(0, groundY, w, h - groundY);

  // Ground top edge (purple)
  ctx.strokeStyle = '#8040c0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();

  // Blue cube
  const cubeSize = 12;
  const cubeX = 16;
  const cubeY = groundY - cubeSize;

  ctx.fillStyle = '#3080e0';
  ctx.fillRect(cubeX, cubeY, cubeSize, cubeSize);

  ctx.fillStyle = '#4090f0';
  ctx.fillRect(cubeX + 2, cubeY + 2, cubeSize - 4, cubeSize - 4);

  // Pink spike (triangle on ground ahead of cube)
  const spikeX = 46;
  const spikeW = 12;
  const spikeH = 12;
  const spikeBaseY = groundY;

  ctx.fillStyle = '#e040a0';
  ctx.beginPath();
  ctx.moveTo(spikeX, spikeBaseY);
  ctx.lineTo(spikeX + spikeW / 2, spikeBaseY - spikeH);
  ctx.lineTo(spikeX + spikeW, spikeBaseY);
  ctx.closePath();
  ctx.fill();
}
