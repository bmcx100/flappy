const DEPTH = 55;

/**
 * Create a procedural house-icon texture if it doesn't exist yet.
 * Style matches the gear icon: 28x28, white fill, #333 stroke, 1.5 lineWidth.
 */
function ensureHomeTexture(scene) {
  if (scene.textures.exists('home-btn')) return;

  const size = 28;
  const g = scene.textures.createCanvas('home-btn', size, size);
  const ctx = g.context;
  const cx = size / 2;

  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';

  // Roof (triangle)
  ctx.beginPath();
  ctx.moveTo(cx, 4);       // peak
  ctx.lineTo(cx + 11, 14); // right eave
  ctx.lineTo(cx - 11, 14); // left eave
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // House body (rectangle)
  ctx.beginPath();
  ctx.rect(cx - 7, 14, 14, 10);
  ctx.fill();
  ctx.stroke();

  // Door (small rectangle)
  ctx.fillStyle = '#333333';
  ctx.fillRect(cx - 2, 18, 4, 6);

  g.refresh();
}

/**
 * Add a home button to the bottom-left of a game scene.
 * On tap: calls optional cleanup callback, then destroys Phaser and shows menu.
 * @param {Phaser.Scene} scene
 * @param {Function} [onExit] - optional cleanup (e.g., stop audio)
 */
export function createBackButton(scene, onExit) {
  ensureHomeTexture(scene);

  const h = scene.sys.game.config.height;
  const btn = scene.add.image(20, h - 20, 'home-btn')
    .setDepth(DEPTH)
    .setInteractive({ useHandCursor: true })
    .setScrollFactor(0);

  btn.on('pointerdown', () => {
    // Consume input so the game doesn't also react
    scene._settingsInputConsumed = true;

    if (onExit) onExit();

    // Defer destruction out of Phaser's input loop
    setTimeout(() => window.__destroyGame(), 0);
  });

  return btn;
}
