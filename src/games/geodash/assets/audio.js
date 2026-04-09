// Web Audio API sound generator for Geometry Dash — DnB breakbeat style
// All sounds are code-generated, no external files needed.

let audioCtx = null;

// Module-level toggle state (survives scene restart)
export let musicEnabled = true;
export let sfxEnabled = true;

// Volume levels (0.0-1.0, survive scene restart)
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

// --- Sound Effects ---

/** Short rising blip — square wave 200->500Hz in 40ms */
export function playJump() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(500, t + 0.04);
  gain.gain.setValueAtTime(0.15 * sfxVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

/** Crash/noise burst — 300ms white noise with decay */
export function playDeath() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;

  // White noise via buffer
  const duration = 0.3;
  const sampleRate = audioCtx.sampleRate;
  const bufferSize = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.25 * sfxVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  // Bandpass filter to shape the noise
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, t);
  filter.frequency.exponentialRampToValueAtTime(200, t + duration);
  filter.Q.value = 1.0;

  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start(t);
  noise.stop(t + duration);
}

/** Gravity flip whoosh — sawtooth sweep 400→100Hz in 150ms */
export function playGravityFlip() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
  gain.gain.setValueAtTime(0.15 * sfxVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.18);
}

/** Victory fanfare — ascending 3-note arpeggio */
export function playComplete() {
  if (!sfxEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;

  const notes = [
    { freq: 523, start: 0, dur: 0.12 },     // C5
    { freq: 659, start: 0.1, dur: 0.12 },    // E5
    { freq: 784, start: 0.2, dur: 0.25 },    // G5 (held longer)
  ];

  for (const note of notes) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(note.freq, t + note.start);
    gain.gain.setValueAtTime(0.15 * sfxVolume, t + note.start);
    gain.gain.setValueAtTime(0.15 * sfxVolume, t + note.start + note.dur - 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + note.start + note.dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t + note.start);
    osc.stop(t + note.start + note.dur);
  }
}

// --- Background Music ---

// 170 BPM DnB breakbeat loop (2 bars = 32 sixteenths)
const BPM = 170;
const BEAT = 60 / BPM;
const SIXTEENTH = BEAT / 4;
const LOOP_STEPS = 32;
const LOOP_DURATION = LOOP_STEPS * SIXTEENTH;

// Drum pattern: K = kick, S = snare, null = rest
const DRUMS = [
  'K', null, null, null, 'S', null, 'K', null,
  null, null, 'K', null, 'S', null, null, null,
  'K', null, null, null, 'S', null, null, 'K',
  null, null, 'K', null, 'S', null, null, null,
];

// Sub-bass pattern: [frequency, duration in sixteenths]
const BASS = [
  [65.41, 8],   // C2
  [61.74, 8],   // B1
  [58.27, 8],   // Bb1
  [65.41, 8],   // C2
];

// Sparse synth stabs: [step index, frequency]
const STABS = [
  [2, 523],     // C5
  [14, 659],    // E5
  [18, 523],    // C5
  [30, 784],    // G5
];

function getDest() {
  return musicGain || audioCtx.destination;
}

function scheduleKick(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  osc.connect(gain).connect(getDest());
  osc.start(time);
  osc.stop(time + 0.15);
  musicOscillators.push(osc);
}

function scheduleSnare(time) {
  // Noise burst — highpass filtered white noise
  const dur = 0.12;
  const bufSize = Math.floor(audioCtx.sampleRate * dur);
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = buf;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.15, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2000;

  noise.connect(hp).connect(noiseGain).connect(getDest());
  noise.start(time);
  noise.stop(time + dur);
  musicOscillators.push(noise);

  // Sine body thump
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);
  gain.gain.setValueAtTime(0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  osc.connect(gain).connect(getDest());
  osc.start(time);
  osc.stop(time + 0.08);
  musicOscillators.push(osc);
}

function scheduleBassNote(time, freq, duration) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const lp = audioCtx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  lp.type = 'lowpass';
  lp.frequency.value = 200;

  gain.gain.setValueAtTime(0.12, time);
  gain.gain.setValueAtTime(0.12, time + duration - 0.02);
  gain.gain.linearRampToValueAtTime(0.001, time + duration);

  osc.connect(lp).connect(gain).connect(getDest());
  osc.start(time);
  osc.stop(time + duration);
  musicOscillators.push(osc);
}

function scheduleStab(time, freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const bp = audioCtx.createBiquadFilter();

  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, time);

  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = 2;

  gain.gain.setValueAtTime(0.04, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

  osc.connect(bp).connect(gain).connect(getDest());
  osc.start(time);
  osc.stop(time + 0.1);
  musicOscillators.push(osc);
}

function scheduleLoop() {
  if (!audioCtx || !musicEnabled) return;

  const now = audioCtx.currentTime;

  // Drums
  for (let i = 0; i < DRUMS.length; i++) {
    const t = now + i * SIXTEENTH;
    if (DRUMS[i] === 'K') scheduleKick(t);
    else if (DRUMS[i] === 'S') scheduleSnare(t);
  }

  // Bass
  let bassTime = now;
  for (const [freq, dur] of BASS) {
    scheduleBassNote(bassTime, freq, dur * SIXTEENTH);
    bassTime += dur * SIXTEENTH;
  }

  // Stabs
  for (const [step, freq] of STABS) {
    scheduleStab(now + step * SIXTEENTH, freq);
  }

  // Schedule next loop
  musicInterval = setTimeout(() => {
    // Clean up ended oscillators
    musicOscillators = musicOscillators.filter(o => {
      try { o.stop(); } catch (_) { /* already stopped */ }
      return false;
    });
    scheduleLoop();
  }, LOOP_DURATION * 1000);
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
  const g = scene.textures.createCanvas('gd-gear-icon', size, size);
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
