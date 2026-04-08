// Web Audio API sound generator — retro chiptune-style
// All sounds are code-generated, no external files needed.

let audioCtx = null;

// Module-level toggle state (survives scene restart)
export let musicEnabled = true;
export let sfxEnabled = true;

// Volume levels (0.0–1.0, survive scene restart)
export let musicVolume = 0.2;
export let sfxVolume = 0.2;

// Music state
let musicInterval = null;
let musicOscillators = [];
let musicGain = null;

/** Lazy-init AudioContext on first user interaction */
export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function setMusicEnabled(val) {
  musicEnabled = val;
  if (!val) stopMusic();
}

export function setSfxEnabled(val) {
  sfxEnabled = val;
}

export function setMusicVolume(val) {
  musicVolume = Math.max(0, Math.min(1, val));
  if (musicGain) {
    musicGain.gain.setValueAtTime(musicVolume, audioCtx.currentTime);
  }
}

export function setSfxVolume(val) {
  sfxVolume = Math.max(0, Math.min(1, val));
}

// ─── Sound Effects ───────────────────────────────────────

/** Short upward chirp (~50ms) */
export function playFlap() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
  gain.gain.setValueAtTime(0.15 * sfxVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

/** Happy ding — two quick ascending tones (~100ms) */
export function playScore() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;

  // First tone
  const osc1 = audioCtx.createOscillator();
  const g1 = audioCtx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(587, t); // D5
  g1.gain.setValueAtTime(0.15 * sfxVolume, t);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc1.connect(g1).connect(audioCtx.destination);
  osc1.start(t);
  osc1.stop(t + 0.08);

  // Second tone (higher)
  const osc2 = audioCtx.createOscillator();
  const g2 = audioCtx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(880, t + 0.05); // A5
  g2.gain.setValueAtTime(0.15 * sfxVolume, t + 0.05);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  osc2.connect(g2).connect(audioCtx.destination);
  osc2.start(t + 0.05);
  osc2.stop(t + 0.13);
}

/** Low thud/impact (~80ms) */
export function playHit() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
  gain.gain.setValueAtTime(0.3 * sfxVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Sad descending tone (~300ms) */
export function playDie() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
  gain.gain.setValueAtTime(0.12 * sfxVolume, t);
  gain.gain.linearRampToValueAtTime(0.001, t + 0.35);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.35);
}

/** Screechy death splat — 3-layer (~300ms) */
export function playDeathSplat() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;

  // Layer 1: Sawtooth screech with rapid frequency wobble (800→200Hz)
  const osc1 = audioCtx.createOscillator();
  const g1 = audioCtx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(800, t);
  for (let i = 0; i < 8; i++) {
    const tt = t + i * 0.035;
    osc1.frequency.setValueAtTime(800 - i * 75 + (i % 2 ? 120 : 0), tt);
  }
  osc1.frequency.exponentialRampToValueAtTime(200, t + 0.3);
  g1.gain.setValueAtTime(0.18 * sfxVolume, t);
  g1.gain.linearRampToValueAtTime(0.001, t + 0.3);
  osc1.connect(g1).connect(audioCtx.destination);
  osc1.start(t);
  osc1.stop(t + 0.3);

  // Layer 2: Square wave noise burst for impact texture (~80ms)
  const osc2 = audioCtx.createOscillator();
  const g2 = audioCtx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(120, t);
  osc2.frequency.setValueAtTime(90, t + 0.03);
  osc2.frequency.setValueAtTime(60, t + 0.06);
  g2.gain.setValueAtTime(0.25 * sfxVolume, t);
  g2.gain.linearRampToValueAtTime(0.001, t + 0.08);
  osc2.connect(g2).connect(audioCtx.destination);
  osc2.start(t);
  osc2.stop(t + 0.08);

  // Layer 3: Triangle wave descending squawk (1200→150Hz)
  const osc3 = audioCtx.createOscillator();
  const g3 = audioCtx.createGain();
  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(1200, t);
  osc3.frequency.exponentialRampToValueAtTime(150, t + 0.25);
  g3.gain.setValueAtTime(0.12 * sfxVolume, t);
  g3.gain.linearRampToValueAtTime(0.001, t + 0.3);
  osc3.connect(g3).connect(audioCtx.destination);
  osc3.start(t);
  osc3.stop(t + 0.3);
}

// ─── Background Music ────────────────────────────────────

// Simple cheerful chiptune melody (C major, 4 bars, ~4 seconds loop)
const MELODY = [
  // [frequency, duration in beats]  (1 beat = 0.15s)
  [523, 1], // C5
  [587, 1], // D5
  [659, 1], // E5
  [523, 1], // C5
  [659, 1], // E5
  [784, 1], // G5
  [784, 2], // G5 (hold)

  [784, 1], // G5
  [698, 1], // F5
  [659, 1], // E5
  [587, 1], // D5
  [523, 1], // C5
  [587, 1], // D5
  [523, 2], // C5 (hold)

  [392, 1], // G4
  [440, 1], // A4
  [523, 1], // C5
  [440, 1], // A4
  [523, 1], // C5
  [659, 1], // E5
  [587, 2], // D5 (hold)

  [659, 1], // E5
  [587, 1], // D5
  [523, 1], // C5
  [440, 1], // A4
  [392, 1], // G4
  [440, 1], // A4
  [523, 2], // C5 (hold)
];

const BEAT_TIME = 0.15; // seconds per beat

function getMelodyDuration() {
  let total = 0;
  for (const [, dur] of MELODY) total += dur;
  return total * BEAT_TIME;
}

function scheduleLoop() {
  if (!audioCtx || !musicEnabled) return;

  const loopDuration = getMelodyDuration();
  const now = audioCtx.currentTime;

  // Schedule melody notes
  let noteTime = now;
  for (const [freq, dur] of MELODY) {
    const noteDuration = dur * BEAT_TIME;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.06, noteTime);
    // Small fade out at end of note for articulation
    gain.gain.setValueAtTime(0.06, noteTime + noteDuration - 0.02);
    gain.gain.linearRampToValueAtTime(0.001, noteTime + noteDuration);

    osc.connect(gain);
    if (musicGain) {
      gain.connect(musicGain);
    } else {
      gain.connect(audioCtx.destination);
    }

    osc.start(noteTime);
    osc.stop(noteTime + noteDuration);
    musicOscillators.push(osc);

    noteTime += noteDuration;
  }

  // Bass line — simple root notes
  const BASS = [
    [262, 8],  // C4 (bar 1)
    [262, 8],  // C4 (bar 2)
    [220, 8],  // A3 (bar 3)
    [196, 4],  // G3 (bar 4, first half)
    [262, 4],  // C4 (bar 4, second half)
  ];

  let bassTime = now;
  for (const [freq, dur] of BASS) {
    const noteDuration = dur * BEAT_TIME;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, bassTime);
    gain.gain.setValueAtTime(0.05, bassTime);
    gain.gain.setValueAtTime(0.05, bassTime + noteDuration - 0.02);
    gain.gain.linearRampToValueAtTime(0.001, bassTime + noteDuration);

    osc.connect(gain);
    if (musicGain) {
      gain.connect(musicGain);
    } else {
      gain.connect(audioCtx.destination);
    }

    osc.start(bassTime);
    osc.stop(bassTime + noteDuration);
    musicOscillators.push(osc);

    bassTime += noteDuration;
  }

  // Schedule next loop
  musicInterval = setTimeout(() => {
    // Clean up ended oscillators
    musicOscillators = musicOscillators.filter(o => {
      try { o.stop(); } catch (_) { /* already stopped */ }
      return false;
    });
    scheduleLoop();
  }, loopDuration * 1000);
}

export function startMusic() {
  if (!musicEnabled || !audioCtx) return;
  stopMusic(); // ensure clean state

  musicGain = audioCtx.createGain();
  musicGain.gain.setValueAtTime(musicVolume, audioCtx.currentTime);
  musicGain.connect(audioCtx.destination);

  scheduleLoop();
}

export function stopMusic() {
  if (musicInterval) {
    clearTimeout(musicInterval);
    musicInterval = null;
  }
  // Stop all active oscillators
  for (const osc of musicOscillators) {
    try { osc.stop(); } catch (_) { /* already stopped */ }
  }
  musicOscillators = [];
  if (musicGain) {
    musicGain.disconnect();
    musicGain = null;
  }
}

/** Create the gear icon texture in a Phaser scene */
export function createGearTexture(scene) {
  const size = 28;
  const g = scene.textures.createCanvas('gear-icon', size, size);
  const ctx = g.context;
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  // Gear teeth
  const teeth = 8;
  const outerR = 11;
  const innerR = 8;
  const toothW = 0.22; // radians half-width

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    // Outer tooth points
    ctx.lineTo(cx + Math.cos(angle - toothW) * outerR, cy + Math.sin(angle - toothW) * outerR);
    ctx.lineTo(cx + Math.cos(angle + toothW) * outerR, cy + Math.sin(angle + toothW) * outerR);
    // Inner valley
    const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2;
    ctx.lineTo(cx + Math.cos(nextAngle - toothW) * innerR, cy + Math.sin(nextAngle - toothW) * innerR);
    ctx.lineTo(cx + Math.cos(nextAngle + toothW) * innerR, cy + Math.sin(nextAngle + toothW) * innerR);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Center hole
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#333333';
  ctx.fill();

  g.refresh();
}
