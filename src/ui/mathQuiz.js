// Math quiz gate — multiple choice, must answer correctly before restarting

function generateQuestion() {
  const type = Phaser.Math.Between(0, 2);
  let text, answer;
  if (type === 0) {
    const a = Phaser.Math.Between(2, 12);
    const b = Phaser.Math.Between(2, 12);
    text = `${a} + ${b}`;
    answer = a + b;
  } else if (type === 1) {
    const a = Phaser.Math.Between(5, 15);
    const b = Phaser.Math.Between(1, a - 2);
    text = `${a} - ${b}`;
    answer = a - b;
  } else {
    const a = Phaser.Math.Between(2, 9);
    const b = Phaser.Math.Between(2, 9);
    text = `${a} × ${b}`;
    answer = a * b;
  }
  return { text, answer, choices: generateChoices(answer) };
}

function generateChoices(correct) {
  const choices = new Set([correct]);
  while (choices.size < 4) {
    const offset = Phaser.Math.Between(1, Math.max(5, Math.floor(correct * 0.4)));
    const wrong = correct + (Math.random() < 0.5 ? offset : -offset);
    if (wrong > 0 && wrong !== correct) choices.add(wrong);
  }
  const arr = [...choices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Phaser.Math.Between(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ensureStarTexture(scene) {
  if (scene.textures.exists('quiz-star')) return;
  const size = 8;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const half = size / 2;
  const outer = half;
  const inner = size / 5;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const x = half + r * Math.cos(angle);
    const y = half + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  scene.textures.addCanvas('quiz-star', canvas);
}

const TEXT_STYLE = {
  fontSize: '20px',
  fontFamily: 'Arial, sans-serif',
  fontStyle: 'bold',
  color: '#ffffff',
  stroke: '#333333',
  strokeThickness: 3,
};

const DEPTH = 26;

/**
 * Create a self-contained multiple-choice math quiz modal.
 * @param {Phaser.Scene} scene
 * @param {number} cx - center X
 * @param {number} cy - center Y of modal
 * @param {Function} onPass - called when player passes the quiz
 * @returns {{ destroy(): void }}
 */
export function createMathQuiz(scene, cx, cy, onPass) {
  const objects = [];
  let alive = true;
  let wrongCount = 0;
  let questionsNeeded = 1;
  let questionsCorrect = 0;
  let question = generateQuestion();
  let locked = false;

  const choiceBtns = [];
  let circles = []; // { container, circle, label }
  const circleY = cy + 75;
  const circleR = 14;
  const circleGap = 36;

  ensureStarTexture(scene);

  function consumeInput() {
    scene._settingsInputConsumed = true;
  }

  // --- Modal background ---
  const modalBg = scene.add.rectangle(cx, cy, 220, 260, 0x000000, 0.8)
    .setOrigin(0.5).setDepth(25).setStrokeStyle(2, 0xffffff);
  objects.push(modalBg);

  // --- Question text ---
  const questionText = scene.add.text(cx, cy - 100, '', {
    ...TEXT_STYLE,
    fontSize: '22px',
  }).setOrigin(0.5).setDepth(DEPTH);
  objects.push(questionText);

  // --- 4 choice buttons (2x2 grid) ---
  const btnW = 90;
  const btnH = 44;
  const btnGapX = 10;
  const btnGapY = 10;
  const gridStartY = cy - 45;

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = cx + (col === 0 ? -(btnW + btnGapX) / 2 : (btnW + btnGapX) / 2);
    const by = gridStartY + row * (btnH + btnGapY);

    const bg = scene.add.rectangle(bx, by, btnW, btnH, 0x444444, 0.9)
      .setOrigin(0.5).setDepth(DEPTH).setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x888888);
    objects.push(bg);

    const txt = scene.add.text(bx, by, '', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(DEPTH + 1);
    objects.push(txt);

    bg.on('pointerdown', () => {
      consumeInput();
      if (locked) return;
      selectChoice(i);
    });

    choiceBtns.push({ bg, txt });
  }

  // --- Progress circles ---

  function createCircles(count, animate) {
    for (const c of circles) c.container.destroy();
    circles = [];

    const totalWidth = (count - 1) * circleGap;
    const startX = cx - totalWidth / 2;

    for (let i = 0; i < count; i++) {
      const x = startX + i * circleGap;
      const solved = i < questionsCorrect;

      const circle = scene.add.circle(0, 0, circleR, solved ? 0x44aa44 : 0x555555)
        .setStrokeStyle(1.5, 0x888888);
      const label = scene.add.text(0, 0, solved ? '\u2713' : '?', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5);

      const container = scene.add.container(x, circleY, [circle, label])
        .setDepth(DEPTH + 1);

      if (animate) {
        container.setScale(0);
        scene.tweens.add({
          targets: container,
          scaleX: 1, scaleY: 1,
          duration: 250,
          ease: 'Back.easeOut',
          delay: i * 80,
        });
      }

      circles.push({ container, circle, label });
    }
  }

  function resetCircles() {
    for (const c of circles) {
      c.circle.setFillStyle(0x555555);
      c.label.setText('?');
      c.container.setScale(1);
    }
  }

  function markCircleSolved(index) {
    if (index >= circles.length) return;
    const c = circles[index];
    c.circle.setFillStyle(0x44aa44);
    c.label.setText('\u2713');

    scene.tweens.add({
      targets: c.container,
      scaleX: 1.4, scaleY: 1.4,
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    emitSparkles(c.container.x, c.container.y);
  }

  // --- Particles ---

  function emitSparkles(x, y) {
    const emitter = scene.add.particles(x, y, 'quiz-star', {
      speed: { min: 40, max: 120 },
      scale: { start: 1.2, end: 0 },
      lifespan: 500,
      tint: [0xffd700, 0xffea00, 0xffffff],
      emitting: false,
    });
    emitter.setDepth(DEPTH + 2);
    objects.push(emitter);
    emitter.explode(Phaser.Math.Between(8, 12));
  }

  function playFireworks(callback) {
    const positions = [
      { x: cx - 40, y: cy - 30 },
      { x: cx + 30, y: cy - 60 },
      { x: cx, y: cy + 20 },
    ];
    const colors = [0xffd700, 0x44aa44, 0xffffff, 0xff6600];

    positions.forEach((pos, i) => {
      scene.time.delayedCall(i * 300, () => {
        if (!alive) return;
        const emitter = scene.add.particles(pos.x, pos.y, 'quiz-star', {
          speed: { min: 60, max: 180 },
          scale: { start: 1.5, end: 0 },
          lifespan: 600,
          tint: colors,
          emitting: false,
        });
        emitter.setDepth(DEPTH + 3);
        objects.push(emitter);
        emitter.explode(Phaser.Math.Between(15, 20));
      });
    });

    // Glow modal border
    scene.tweens.addCounter({
      from: 0, to: 1,
      duration: 400,
      yoyo: true,
      onUpdate: (tween) => {
        if (!alive) return;
        const v = tween.getValue();
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(
          new Phaser.Display.Color(255, 255, 255),
          new Phaser.Display.Color(255, 215, 0),
          1, v
        );
        modalBg.setStrokeStyle(3, Phaser.Display.Color.GetColor(c.r, c.g, c.b));
      },
      onComplete: () => {
        if (!alive) return;
        modalBg.setStrokeStyle(2, 0xffffff);
      },
    });

    // "Great!" text
    const greatText = scene.add.text(cx, cy, 'Great!', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#333333',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(DEPTH + 4).setScale(0);
    objects.push(greatText);

    scene.tweens.add({
      targets: greatText,
      scaleX: 1.2, scaleY: 1.2,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      delay: 200,
      ease: 'Quad.easeOut',
    });

    scene.time.delayedCall(1200, () => {
      if (alive) callback();
    });
  }

  // --- Shake effect for wrong answers ---

  function shakeModal() {
    const targets = [
      modalBg, questionText,
      ...choiceBtns.map(b => b.bg),
      ...choiceBtns.map(b => b.txt),
      ...circles.map(c => c.container),
    ];
    scene.tweens.add({
      targets,
      x: '+=3',
      duration: 50,
      yoyo: true,
      repeat: 1,
    });
  }

  // --- Core quiz logic ---

  function showQuestion() {
    questionText.setText(`What is ${question.text}?`);
    for (let i = 0; i < 4; i++) {
      choiceBtns[i].txt.setText(String(question.choices[i]));
      choiceBtns[i].bg.setFillStyle(0x444444, 0.9);
      choiceBtns[i].txt.setColor('#ffffff');
    }
    locked = false;
  }

  function selectChoice(index) {
    locked = true;
    const chosen = question.choices[index];
    const correct = question.answer;

    if (chosen === correct) {
      choiceBtns[index].bg.setFillStyle(0x44aa44, 1);
      questionsCorrect++;
      markCircleSolved(questionsCorrect - 1);

      if (questionsCorrect >= questionsNeeded) {
        scene.time.delayedCall(350, () => {
          if (alive) playFireworks(() => onPass());
        });
        return;
      }

      scene.time.delayedCall(400, () => {
        if (!alive) return;
        question = generateQuestion();
        showQuestion();
      });
    } else {
      choiceBtns[index].bg.setFillStyle(0xaa4444, 1);
      const correctIdx = question.choices.indexOf(correct);
      choiceBtns[correctIdx].bg.setFillStyle(0x44aa44, 1);

      shakeModal();

      wrongCount++;
      if (wrongCount > 2) {
        questionsNeeded = 3;
        if (circles.length < 3) {
          // First time entering penalty — animate 1 → 3 circles
          questionsCorrect = 0;
          scene.time.delayedCall(400, () => {
            if (alive) createCircles(3, true);
          });
        } else {
          // Already in penalty — reset progress
          questionsCorrect = 0;
          resetCircles();
        }
      }

      scene.time.delayedCall(800, () => {
        if (!alive) return;
        question = generateQuestion();
        showQuestion();
      });
    }
  }

  // Keyboard support: 1-4 keys select choices
  const keyHandler = (event) => {
    if (locked) return;
    const num = parseInt(event.key, 10);
    if (num >= 1 && num <= 4) {
      selectChoice(num - 1);
    }
  };
  scene.input.keyboard.on('keydown', keyHandler);

  // Initialize
  createCircles(questionsNeeded, false);
  showQuestion();

  return {
    destroy() {
      alive = false;
      scene.input.keyboard.off('keydown', keyHandler);
      for (const c of circles) c.container.destroy();
      circles = [];
      for (const obj of objects) {
        if (obj && obj.destroy) obj.destroy();
      }
    },
  };
}
