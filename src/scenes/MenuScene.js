import { GAMES } from '../registry.js';

const CARD_H = 72;
const CARD_GAP = 12;
const CARD_PAD_X = 20;
const THUMB_SIZE = 72;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const w = this.sys.game.config.width;
    const h = this.sys.game.config.height;

    // Light gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xf0f4f8, 0xf0f4f8, 0xd9e2ec, 0xd9e2ec, 1);
    bg.fillRect(0, 0, w, h);

    // Title
    this.add.text(w / 2, 50, 'Game Arcade', {
      fontSize: '30px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#2d3748',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(w / 2, 82, 'Pick a game to play', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#718096',
    }).setOrigin(0.5);

    // Game cards
    const startY = 120;

    GAMES.forEach((game, i) => {
      const y = startY + i * (CARD_H + CARD_GAP);
      this._createCard(game, CARD_PAD_X, y, w - CARD_PAD_X * 2);
    });

    // "Coming soon" placeholder
    const comingSoonY = startY + GAMES.length * (CARD_H + CARD_GAP);
    this._createComingSoon(CARD_PAD_X, comingSoonY, w - CARD_PAD_X * 2);
  }

  _createCard(game, x, y, cardW) {
    // Generate thumbnail
    const thumbKey = `thumb-${game.id}`;
    if (!this.textures.exists(thumbKey)) {
      const canvas = document.createElement('canvas');
      game.drawThumbnail(canvas);
      this.textures.addCanvas(thumbKey, canvas);
    }

    // Card background (white, rounded via nine-slice or rectangle)
    const cardBg = this.add.rectangle(
      x + cardW / 2, y + CARD_H / 2,
      cardW, CARD_H,
      0xffffff, 1
    ).setOrigin(0.5).setStrokeStyle(1, 0xe2e8f0);

    // Thumbnail image
    const thumb = this.add.image(x, y, thumbKey)
      .setOrigin(0, 0)
      .setDisplaySize(THUMB_SIZE, THUMB_SIZE);

    // Clip thumbnail to card bounds (round left corners effect via mask)
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRoundedRect(x, y, THUMB_SIZE, THUMB_SIZE, { tl: 4, tr: 0, bl: 4, br: 0 });
    thumb.setMask(maskShape.createGeometryMask());

    // Game name
    this.add.text(x + THUMB_SIZE + 14, y + 18, game.name, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#2d3748',
    }).setOrigin(0, 0);

    // Subtitle
    this.add.text(x + THUMB_SIZE + 14, y + 40, game.subtitle, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#a0aec0',
    }).setOrigin(0, 0);

    // Play arrow
    this.add.text(x + cardW - 20, y + CARD_H / 2, '\u25B6', {
      fontSize: '16px',
      color: '#cbd5e0',
    }).setOrigin(0.5);

    // Make card interactive
    cardBg.setInteractive({ useHandCursor: true });
    cardBg.on('pointerover', () => {
      cardBg.setFillStyle(0xedf2f7);
    });
    cardBg.on('pointerout', () => {
      cardBg.setFillStyle(0xffffff);
    });
    cardBg.on('pointerdown', () => {
      this.scene.start(game.bootScene);
    });
  }

  _createComingSoon(x, y, cardW) {
    // Dashed border effect via rectangle with stroke
    const placeholder = this.add.rectangle(
      x + cardW / 2, y + CARD_H / 2,
      cardW, CARD_H,
      0xf7fafc, 0.5
    ).setOrigin(0.5).setStrokeStyle(1.5, 0xe2e8f0);

    // Plus icon
    this.add.text(x + 28, y + CARD_H / 2, '+', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#cbd5e0',
    }).setOrigin(0.5);

    // Text
    this.add.text(x + THUMB_SIZE + 14, y + CARD_H / 2, 'More games coming soon...', {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#a0aec0',
    }).setOrigin(0, 0.5);
  }
}
