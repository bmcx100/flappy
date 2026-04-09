import { GAMES } from './registry.js';

let game = null;

/** Launch a Phaser game starting at the given boot scene. */
export function launchGame(bootScene, scenes, width = 360, height = 640) {
  const menuEl = document.getElementById('menu');
  menuEl.classList.add('hidden');
  window.__destroyGame = destroyGame;

  game = new Phaser.Game({
    type: Phaser.AUTO,
    width,
    height,
    backgroundColor: '#f0f4f8',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 1200 },
        debug: false,
      },
    },
    scene: scenes,
  });
}

/** Destroy the Phaser game and return to the HTML menu. */
export function destroyGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
  const menuEl = document.getElementById('menu');
  menuEl.classList.remove('hidden');
}

// --- Render menu cards from registry ---

function renderMenu() {
  const container = document.getElementById('game-cards');

  for (const entry of GAMES) {
    const card = document.createElement('div');
    card.className = 'game-card';

    // Thumbnail canvas
    const canvas = document.createElement('canvas');
    entry.drawThumbnail(canvas);
    card.appendChild(canvas);

    // Info
    const info = document.createElement('div');
    info.className = 'game-card-info';
    info.innerHTML =
      `<div class="name">${entry.name}</div>` +
      `<div class="subtitle">${entry.subtitle}</div>`;
    card.appendChild(info);

    // Arrow
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.textContent = '\u25B6';
    card.appendChild(arrow);

    card.addEventListener('click', () => {
      launchGame(entry.bootScene, entry.scenes, entry.width, entry.height);
    });

    container.appendChild(card);
  }

  // "Coming soon" placeholder
  const placeholder = document.createElement('div');
  placeholder.className = 'coming-soon';
  placeholder.innerHTML = '<div class="plus">+</div><span>More games coming soon...</span>';
  container.appendChild(placeholder);
}

renderMenu();
