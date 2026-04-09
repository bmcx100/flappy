// Geometry Dash background — layered purple cityscape silhouettes

function drawSkylineLayer(ctx, canvasW, baseY, minW, maxW, minH, maxH) {
  let x = 0;
  let seed = 42;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  while (x < canvasW) {
    const bw = minW + rand() * (maxW - minW);
    const bh = minH + rand() * (maxH - minH);
    const gap = 2 + rand() * 6;
    ctx.fillRect(x, baseY - bh, bw, bh + 60);
    x += bw + gap;
  }
}

export function createBackgroundTexture(scene) {
  const w = 640;
  const h = 360;
  const tex = scene.textures.createCanvas('gd-background', w, h);
  const ctx = tex.context;

  // Deep purple gradient base
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a0a2e');
  grad.addColorStop(0.5, '#2d1b4e');
  grad.addColorStop(1, '#0d0618');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Layer 1 (farthest) — very dark purple rectangles
  ctx.fillStyle = 'rgba(40, 15, 60, 0.5)';
  drawSkylineLayer(ctx, w, 280, 20, 60, 40, 120);

  // Layer 2 (mid) — slightly brighter purple
  ctx.fillStyle = 'rgba(50, 20, 80, 0.6)';
  drawSkylineLayer(ctx, w, 300, 15, 50, 30, 90);

  // Layer 3 (closest) — darkest rectangles
  ctx.fillStyle = 'rgba(25, 8, 45, 0.7)';
  drawSkylineLayer(ctx, w, 310, 10, 40, 25, 70);

  tex.refresh();
}
