// Settings gear button + toggle panel with volume sliders (Phaser game objects)
import {
  musicEnabled, sfxEnabled,
  setMusicEnabled, setSfxEnabled,
  startMusic, stopMusic,
  musicVolume, sfxVolume,
  setMusicVolume, setSfxVolume,
} from '../assets/audio.js';

const DEPTH = 50; // above everything
const PANEL_W = 160;
const PANEL_H = 160;
const PADDING = 8;

// Slider constants
const TRACK_W = 100;
const TRACK_H = 6;
const HANDLE_R = 8;

/**
 * Create the settings gear button and panel in a PlayScene.
 * Returns an object with { gearBtn, destroy } for the scene to manage.
 * @param {Phaser.Scene} scene - The PlayScene
 * @param {Function} isPlaying - returns true if game is in PLAYING state (for resuming music)
 */
export function createSettingsUI(scene, isPlaying) {
  const gearX = scene.sys.game.config.width - 20;
  const gearY = 20;

  // Gear button
  const gearBtn = scene.add.image(gearX, gearY, 'gear-icon')
    .setDepth(DEPTH)
    .setInteractive({ useHandCursor: true })
    .setScrollFactor(0);

  // Panel container (hidden by default)
  const panelX = gearX - PANEL_W - PADDING + 14;
  const panelY = gearY + 20;

  // Panel background
  const panelBg = scene.add.rectangle(
    panelX + PANEL_W / 2, panelY + PANEL_H / 2,
    PANEL_W, PANEL_H,
    0x000000, 0.75
  ).setDepth(DEPTH).setOrigin(0.5).setVisible(false).setInteractive();

  // Music toggle
  const musicLabel = scene.add.text(panelX + 10, panelY + 12, '', {
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
    color: '#ffffff',
  }).setDepth(DEPTH + 1).setVisible(false).setInteractive({ useHandCursor: true });

  // SFX toggle (moved down to make room for music slider)
  const sfxLabel = scene.add.text(panelX + 10, panelY + 64, '', {
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
    color: '#ffffff',
  }).setDepth(DEPTH + 1).setVisible(false).setInteractive({ useHandCursor: true });

  // Helper: mark that settings consumed this input (prevents game flap/start/restart)
  function consumeInput() {
    scene._settingsInputConsumed = true;
  }

  // --- Slider helper ---
  const allSliderObjects = [];

  function createSlider(trackX, trackY, initialValue, onChange) {
    // Gray track background
    const trackBg = scene.add.rectangle(trackX + TRACK_W / 2, trackY + TRACK_H / 2, TRACK_W, TRACK_H, 0x666666)
      .setDepth(DEPTH + 1).setOrigin(0.5).setVisible(false)
      .setInteractive({ useHandCursor: true });

    // Green fill bar
    const fillW = TRACK_W * initialValue;
    const fill = scene.add.rectangle(trackX, trackY + TRACK_H / 2, fillW, TRACK_H, 0x44cc44)
      .setDepth(DEPTH + 2).setOrigin(0, 0.5).setVisible(false);

    // White draggable handle
    const handleX = trackX + TRACK_W * initialValue;
    const handle = scene.add.circle(handleX, trackY + TRACK_H / 2, HANDLE_R, 0xffffff)
      .setDepth(DEPTH + 3).setVisible(false)
      .setInteractive({ useHandCursor: true, draggable: true });

    // Percentage label
    const pctLabel = scene.add.text(trackX + TRACK_W + 8, trackY - 2, `${Math.round(initialValue * 100)}%`, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc',
    }).setDepth(DEPTH + 2).setVisible(false);

    function updateSlider(value) {
      const v = Math.max(0, Math.min(1, value));
      handle.x = trackX + TRACK_W * v;
      fill.width = TRACK_W * v;
      pctLabel.setText(`${Math.round(v * 100)}%`);
      onChange(v);
    }

    // Drag handle
    scene.input.setDraggable(handle);
    handle.on('drag', (_pointer, dragX) => {
      consumeInput();
      const v = Math.max(0, Math.min(1, (dragX - trackX) / TRACK_W));
      updateSlider(v);
    });
    handle.on('dragstart', () => consumeInput());
    handle.on('dragend', () => consumeInput());
    handle.on('pointerdown', () => consumeInput());

    // Click on track to jump
    trackBg.on('pointerdown', (pointer) => {
      consumeInput();
      const localX = pointer.x - trackX;
      const v = Math.max(0, Math.min(1, localX / TRACK_W));
      updateSlider(v);
    });

    const objects = [trackBg, fill, handle, pctLabel];
    allSliderObjects.push(...objects);

    return {
      objects,
      setVisible(visible) {
        for (const obj of objects) obj.setVisible(visible);
      },
      destroy() {
        for (const obj of objects) obj.destroy();
      },
    };
  }

  // Create sliders
  const sliderX = panelX + 10;
  const musicSlider = createSlider(sliderX, panelY + 38, musicVolume, setMusicVolume);
  const sfxSlider = createSlider(sliderX, panelY + 90, sfxVolume, setSfxVolume);

  let panelOpen = false;

  function updateLabels() {
    const musicState = musicEnabled ? '\u2705 Music: ON' : '\u274c Music: OFF';
    const sfxState = sfxEnabled ? '\u2705 SFX: ON' : '\u274c SFX: OFF';
    musicLabel.setText(musicState);
    sfxLabel.setText(sfxState);
  }

  function showPanel() {
    panelOpen = true;
    panelBg.setVisible(true);
    musicLabel.setVisible(true);
    sfxLabel.setVisible(true);
    musicSlider.setVisible(true);
    sfxSlider.setVisible(true);
    updateLabels();
  }

  function hidePanel() {
    panelOpen = false;
    panelBg.setVisible(false);
    musicLabel.setVisible(false);
    sfxLabel.setVisible(false);
    musicSlider.setVisible(false);
    sfxSlider.setVisible(false);
  }

  // Gear tap — toggle panel
  gearBtn.on('pointerdown', () => {
    consumeInput();
    if (panelOpen) {
      hidePanel();
    } else {
      showPanel();
    }
  });

  // Panel background tap — absorb input
  panelBg.on('pointerdown', () => {
    consumeInput();
  });

  // Music toggle tap
  musicLabel.on('pointerdown', () => {
    consumeInput();
    setMusicEnabled(!musicEnabled);
    if (musicEnabled && isPlaying()) {
      startMusic();
    }
    updateLabels();
  });

  // SFX toggle tap
  sfxLabel.on('pointerdown', () => {
    consumeInput();
    setSfxEnabled(!sfxEnabled);
    updateLabels();
  });

  // Close panel when tapping outside (scene-level, but only if panel is open)
  scene.input.on('pointerdown', () => {
    if (panelOpen && !scene._settingsInputConsumed) {
      hidePanel();
      consumeInput();
    }
  });

  return {
    gearBtn,
    destroy() {
      gearBtn.destroy();
      panelBg.destroy();
      musicLabel.destroy();
      sfxLabel.destroy();
      musicSlider.destroy();
      sfxSlider.destroy();
    },
  };
}
