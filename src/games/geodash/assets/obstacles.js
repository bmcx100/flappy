// Geometry Dash obstacles — spike, platform, ceiling spike, hoop, and ceiling textures

export function createSpikeTexture(scene) {
  const size = 28;
  const tex = scene.textures.createCanvas('gd-spike', size, size);
  const ctx = tex.context;

  // Outer triangle — magenta/pink
  ctx.fillStyle = '#e040a0';
  ctx.strokeStyle = '#b0307a';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(size / 2, 0);          // top center
  ctx.lineTo(size, size);            // bottom right
  ctx.lineTo(0, size);               // bottom left
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner lighter triangle for depth
  const inset = 6;
  ctx.fillStyle = '#f060c0';
  ctx.beginPath();
  ctx.moveTo(size / 2, inset);
  ctx.lineTo(size - inset, size - inset / 2);
  ctx.lineTo(inset, size - inset / 2);
  ctx.closePath();
  ctx.fill();

  tex.refresh();
}

export function createPlatformTexture(scene) {
  const w = 32;
  const h = 32;
  const tex = scene.textures.createCanvas('gd-platform', w, h);
  const ctx = tex.context;

  // Dark purple block fill
  ctx.fillStyle = '#2a1050';
  ctx.fillRect(0, 0, w, h);

  // Grid pattern
  ctx.strokeStyle = 'rgba(100, 50, 160, 0.4)';
  ctx.lineWidth = 0.5;
  for (let y = 8; y < h; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let x = 8; x < w; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // White outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.75, 0.75, w - 1.5, h - 1.5);

  // Lighter purple top edge
  ctx.fillStyle = '#4020a0';
  ctx.fillRect(1, 1, w - 2, 2);

  tex.refresh();
}

export function createCeilingSpikeTexture(scene) {
  const size = 28;
  const tex = scene.textures.createCanvas('gd-ceiling-spike', size, size);
  const ctx = tex.context;

  // Inverted triangle — points DOWN
  ctx.fillStyle = '#e040a0';
  ctx.strokeStyle = '#b0307a';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, 0);              // top left
  ctx.lineTo(size, 0);           // top right
  ctx.lineTo(size / 2, size);    // bottom center
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner lighter triangle for depth
  const inset = 6;
  ctx.fillStyle = '#f060c0';
  ctx.beginPath();
  ctx.moveTo(inset, inset / 2);
  ctx.lineTo(size - inset, inset / 2);
  ctx.lineTo(size / 2, size - inset);
  ctx.closePath();
  ctx.fill();

  tex.refresh();
}

export function createHoopTexture(scene) {
  const size = 48;
  const tex = scene.textures.createCanvas('gd-hoop', size, size);
  const ctx = tex.context;
  const cx = size / 2;
  const cy = size / 2;

  // Outer fiery ring with glow
  ctx.save();
  ctx.shadowColor = '#ff4500';
  ctx.shadowBlur = 8;

  const grad = ctx.createRadialGradient(cx, cy, 12, cx, cy, 22);
  grad.addColorStop(0, '#ff6600');
  grad.addColorStop(0.5, '#ff4500');
  grad.addColorStop(1, '#cc0000');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Cut out center hole
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Inner edge highlight
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.stroke();

  tex.refresh();
}

export function createCeilingTexture(scene) {
  const w = 640;
  const h = 50;
  const tex = scene.textures.createCanvas('gd-ceiling', w, h);
  const ctx = tex.context;

  // Dark purple body
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(80, 40, 120, 0.3)';
  ctx.lineWidth = 0.5;
  for (let y = 4; y < h - 4; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Bright purple bottom edge
  ctx.fillStyle = '#8040c0';
  ctx.fillRect(0, h - 2, w, 2);

  tex.refresh();
}
