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
    // Generate plausible wrong answers near the correct one
    const offset = Phaser.Math.Between(1, Math.max(5, Math.floor(correct * 0.4)));
    const wrong = correct + (Math.random() < 0.5 ? offset : -offset);
    if (wrong > 0 && wrong !== correct) choices.add(wrong);
  }
  // Shuffle
  const arr = [...choices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Phaser.Math.Between(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
  let wrongCount = 0;
  let questionsNeeded = 1;
  let questionsCorrect = 0;
  let question = generateQuestion();
  let locked = false; // prevent taps during feedback delay

  const choiceBtns = []; // { bg, txt } for each of 4 choices

  function consumeInput() {
    scene._settingsInputConsumed = true;
  }

  // Modal background
  const modalBg = scene.add.rectangle(cx, cy, 220, 260, 0x000000, 0.8)
    .setOrigin(0.5).setDepth(25).setStrokeStyle(2, 0xffffff);
  objects.push(modalBg);

  // Question text
  const questionText = scene.add.text(cx, cy - 100, '', {
    ...TEXT_STYLE,
    fontSize: '22px',
  }).setOrigin(0.5).setDepth(DEPTH);
  objects.push(questionText);

  // 4 choice buttons — 2×2 grid
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

  // Status counter — always visible
  const statusText = scene.add.text(cx, cy + 110, '', {
    ...TEXT_STYLE,
    fontSize: '16px',
    color: '#aaaaaa',
  }).setOrigin(0.5).setDepth(DEPTH);
  objects.push(statusText);

  function showQuestion() {
    questionText.setText(`What is ${question.text}?`);
    for (let i = 0; i < 4; i++) {
      choiceBtns[i].txt.setText(String(question.choices[i]));
      choiceBtns[i].bg.setFillStyle(0x444444, 0.9);
      choiceBtns[i].txt.setColor('#ffffff');
    }
    locked = false;
  }

  function updateStatus() {
    statusText.setText(`${questionsCorrect} of ${questionsNeeded}`);
  }

  function selectChoice(index) {
    locked = true;
    const chosen = question.choices[index];
    const correct = question.answer;

    if (chosen === correct) {
      // Flash green
      choiceBtns[index].bg.setFillStyle(0x44aa44, 1);
      questionsCorrect++;
      if (questionsCorrect >= questionsNeeded) {
        scene.time.delayedCall(300, () => onPass());
        return;
      }
      updateStatus();
      scene.time.delayedCall(400, () => {
        question = generateQuestion();
        showQuestion();
      });
    } else {
      // Flash red on wrong, green on correct
      choiceBtns[index].bg.setFillStyle(0xaa4444, 1);
      const correctIdx = question.choices.indexOf(correct);
      choiceBtns[correctIdx].bg.setFillStyle(0x44aa44, 1);

      wrongCount++;
      if (wrongCount > 2) {
        questionsNeeded = 3;
        questionsCorrect = 0;
        updateStatus();
      }
      scene.time.delayedCall(800, () => {
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
  showQuestion();
  updateStatus();

  return {
    destroy() {
      scene.input.keyboard.off('keydown', keyHandler);
      for (const obj of objects) {
        obj.destroy();
      }
    },
  };
}
