// Math quiz gate — must answer correctly before restarting

function generateQuestion() {
  const type = Phaser.Math.Between(0, 2);
  if (type === 0) {
    // Addition
    const a = Phaser.Math.Between(2, 12);
    const b = Phaser.Math.Between(2, 12);
    return { text: `${a} + ${b}`, answer: a + b };
  } else if (type === 1) {
    // Subtraction (always positive result)
    const a = Phaser.Math.Between(5, 15);
    const b = Phaser.Math.Between(1, a - 2);
    return { text: `${a} - ${b}`, answer: a - b };
  } else {
    // Multiplication
    const a = Phaser.Math.Between(2, 9);
    const b = Phaser.Math.Between(2, 9);
    return { text: `${a} × ${b}`, answer: a * b };
  }
}

const TEXT_STYLE = {
  fontSize: '20px',
  fontFamily: 'Arial, sans-serif',
  fontStyle: 'bold',
  color: '#ffffff',
  stroke: '#333333',
  strokeThickness: 3,
};

const BTN_SIZE = 40;
const BTN_GAP = 6;
const DEPTH = 26;

/**
 * Create the math quiz UI inside the game-over modal.
 * @param {Phaser.Scene} scene
 * @param {number} cx - center X
 * @param {number} cy - center Y of quiz area
 * @param {Function} onPass - called when player passes the quiz
 * @returns {{ destroy(): void }}
 */
export function createMathQuiz(scene, cx, cy, onPass) {
  const objects = [];
  let currentAnswer = '';
  let wrongCount = 0;
  let questionsNeeded = 1;
  let questionsCorrect = 0;
  let question = generateQuestion();

  function consumeInput() {
    scene._settingsInputConsumed = true;
  }

  // Question text
  const questionText = scene.add.text(cx, cy - 10, '', {
    ...TEXT_STYLE,
    fontSize: '22px',
  }).setOrigin(0.5).setDepth(DEPTH);
  objects.push(questionText);

  // Answer display
  const answerText = scene.add.text(cx, cy + 20, '?', {
    ...TEXT_STYLE,
    fontSize: '24px',
    color: '#f7dc6f',
  }).setOrigin(0.5).setDepth(DEPTH);
  objects.push(answerText);

  // Status counter (e.g. "1/3") — only visible in penalty mode
  const statusText = scene.add.text(cx, cy + 170, '', {
    ...TEXT_STYLE,
    fontSize: '16px',
    color: '#aaaaaa',
  }).setOrigin(0.5).setDepth(DEPTH).setVisible(false);
  objects.push(statusText);

  // Penalty message
  const penaltyText = scene.add.text(cx, cy + 190, '', {
    ...TEXT_STYLE,
    fontSize: '13px',
    color: '#ff6666',
  }).setOrigin(0.5).setDepth(DEPTH).setVisible(false);
  objects.push(penaltyText);

  function showQuestion() {
    questionText.setText(`What is ${question.text}?`);
    answerText.setText('?').setColor('#f7dc6f');
    currentAnswer = '';
  }

  function updateStatus() {
    if (questionsNeeded > 1) {
      statusText.setText(`${questionsCorrect}/${questionsNeeded}`).setVisible(true);
    } else {
      statusText.setVisible(false);
    }
  }

  function appendDigit(d) {
    if (currentAnswer.length >= 3) return;
    currentAnswer += d;
    answerText.setText(currentAnswer).setColor('#ffffff');
  }

  function deleteDigit() {
    if (currentAnswer.length === 0) return;
    currentAnswer = currentAnswer.slice(0, -1);
    answerText.setText(currentAnswer || '?').setColor(currentAnswer ? '#ffffff' : '#f7dc6f');
  }

  function submit() {
    if (currentAnswer === '') return;
    const val = parseInt(currentAnswer, 10);
    if (val === question.answer) {
      // Correct
      questionsCorrect++;
      if (questionsCorrect >= questionsNeeded) {
        onPass();
        return;
      }
      // Flash green, new question
      answerText.setColor('#44ff44');
      updateStatus();
      scene.time.delayedCall(400, () => {
        question = generateQuestion();
        showQuestion();
      });
    } else {
      // Wrong
      wrongCount++;
      questionsNeeded = 3;
      questionsCorrect = 0;
      answerText.setColor('#ff4444');
      penaltyText.setText('Wrong! Answer 3 to continue').setVisible(true);
      updateStatus();
      scene.time.delayedCall(600, () => {
        question = generateQuestion();
        showQuestion();
      });
    }
  }

  // Number pad — 4×3 grid
  const padLabels = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['\u232b', '0', 'GO'],
  ];

  const gridW = 3 * BTN_SIZE + 2 * BTN_GAP;
  const startX = cx - gridW / 2 + BTN_SIZE / 2;
  const startY = cy + 55;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const label = padLabels[row][col];
      const bx = startX + col * (BTN_SIZE + BTN_GAP);
      const by = startY + row * 30;

      const isGo = label === 'GO';
      const bgColor = isGo ? 0x44aa44 : 0x444444;

      const bg = scene.add.rectangle(bx, by, BTN_SIZE, BTN_SIZE - 10, bgColor, 0.9)
        .setOrigin(0.5).setDepth(DEPTH).setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x888888);
      objects.push(bg);

      const txt = scene.add.text(bx, by, label, {
        fontSize: isGo ? '14px' : '18px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(DEPTH + 1);
      objects.push(txt);

      bg.on('pointerdown', () => {
        consumeInput();
        if (label === '\u232b') {
          deleteDigit();
        } else if (label === 'GO') {
          submit();
        } else {
          appendDigit(label);
        }
      });
    }
  }

  // Keyboard support for desktop
  const keyHandler = (event) => {
    if (event.key >= '0' && event.key <= '9') {
      appendDigit(event.key);
    } else if (event.key === 'Backspace') {
      deleteDigit();
    } else if (event.key === 'Enter') {
      submit();
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
