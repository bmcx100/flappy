const DEPTH = 55;

/**
 * Create a procedural back-arrow texture if it doesn't exist yet.
 */
function ensureBackTexture(scene) {
  if (scene.textures.exists('back-btn')) return;

  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Circle background
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  // Left arrow
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(18, 8);
  ctx.lineTo(10, 16);
  ctx.lineTo(18, 24);
  ctx.stroke();

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(10, 16);
  ctx.lineTo(22, 16);
  ctx.stroke();

  scene.textures.addCanvas('back-btn', canvas);
}

/**
 * Add a back button to the top-left of a game scene.
 * On tap: calls optional cleanup callback, then returns to MenuScene.
 * @param {Phaser.Scene} scene
 * @param {Function} [onExit] - optional cleanup (e.g., stop audio)
 */
export function createBackButton(scene, onExit) {
  ensureBackTexture(scene);

  const btn = scene.add.image(24, 24, 'back-btn')
    .setDepth(DEPTH)
    .setInteractive({ useHandCursor: true })
    .setScrollFactor(0);

  btn.on('pointerdown', () => {
    // Consume input so the game doesn't also react
    scene._settingsInputConsumed = true;

    if (onExit) onExit();

    scene.scene.start('MenuScene');
  });

  return btn;
}
