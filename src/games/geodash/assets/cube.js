// Geometry Dash cube (player) and death particle textures — blue with expressive face

export function createCubeTexture(scene) {
  const size = 32;
  const tex = scene.textures.createCanvas('gd-cube', size, size);
  const ctx = tex.context;

  // Blue body
  ctx.fillStyle = '#3080e0';
  ctx.fillRect(0, 0, size, size);

  // Darker blue border
  ctx.strokeStyle = '#2060b0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);

  // Inner highlight square
  ctx.fillStyle = '#4090f0';
  ctx.fillRect(4, 4, size - 8, size - 8);

  // Shine in top-left
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(5, 5, 3, 3);

  // --- Eyes (large, expressive) ---
  // White sclera
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(11, 12, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 12, 5, 0, Math.PI * 2);
  ctx.fill();

  // Dark iris (looking slightly right)
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(12.5, 12, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(23.5, 12, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // White highlight dots
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(11, 10.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 10.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // --- Mouth (wide toothy grin) ---
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, 21, 18, 5);

  // Tooth gap lines
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 0.7;
  for (let tx = 10; tx <= 22; tx += 3) {
    ctx.beginPath();
    ctx.moveTo(tx, 21);
    ctx.lineTo(tx, 26);
    ctx.stroke();
  }

  // Dark outline around mouth
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(7, 21, 18, 5);

  tex.refresh();
}

export function createCubeParticleTexture(scene) {
  const size = 8;
  const tex = scene.textures.createCanvas('gd-cube-particle', size, size);
  const ctx = tex.context;

  // Blue square particle
  ctx.fillStyle = '#3080e0';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#2060b0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1);

  tex.refresh();
}
