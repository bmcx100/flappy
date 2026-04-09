/**
 * Level data for Geometry Dash level 1 — Landscape pillar-based gameplay.
 *
 * Obstacle types:
 *   spike       — single spike on the ground at x
 *   pillar      — tall platform block at x, rising from ground, with given width & height
 *   spike-row   — row of spikes covering ground from x to x+width
 *
 * Physics reference (scrollSpeed 220, jumpVelocity -420, gravity 1600, jumpBoost 1150):
 *   Tap jump height   ≈ 55 px  (clears 2 spikes)
 *   Full jump height  ≈ 155 px (hold — reaches tall pillars)
 *   Tap horizontal    ≈ 115 px
 *   Full horizontal   ≈ 200 px
 *
 * Ground: y=310, cubeSize=32, spikeHeight=28
 */

export const LEVEL_LENGTH = 6000;

export const LEVEL_1 = [
  // ===== SECTION 1: WARMUP (0–1200) =====
  // Singles on ground
  { type: 'spike', x: 350 },
  { type: 'spike', x: 520 },
  { type: 'spike', x: 690 },
  // Double
  { type: 'spike', x: 880 },
  { type: 'spike', x: 908 },
  // Triple
  { type: 'spike', x: 1060 },
  { type: 'spike', x: 1088 },
  { type: 'spike', x: 1116 },

  // ===== SECTION 2: INTRO PILLARS (1200–2800) =====
  // First pillar — short, easy landing
  { type: 'pillar', x: 1300, width: 80, height: 50 },
  { type: 'spike-row', x: 1380, width: 84 },
  { type: 'pillar', x: 1464, width: 80, height: 50 },

  // Back to ground, couple spikes
  { type: 'spike', x: 1650 },
  { type: 'spike', x: 1678 },

  // Taller pillars
  { type: 'pillar', x: 1820, width: 70, height: 80 },
  { type: 'spike-row', x: 1890, width: 84 },
  { type: 'pillar', x: 1974, width: 70, height: 80 },
  { type: 'spike-row', x: 2044, width: 84 },
  { type: 'pillar', x: 2128, width: 70, height: 50 },

  // Ground section with triple
  { type: 'spike', x: 2320 },
  { type: 'spike', x: 2348 },
  { type: 'spike', x: 2376 },

  // Pillar – spike – pillar
  { type: 'pillar', x: 2520, width: 60, height: 60 },
  { type: 'spike-row', x: 2580, width: 112 },
  { type: 'pillar', x: 2692, width: 80, height: 80 },

  // ===== SECTION 3: STAIRCASE UP (2800–4000) =====
  // Ascending staircase — each pillar taller than the last
  { type: 'pillar', x: 2900, width: 60, height: 50 },
  { type: 'pillar', x: 2968, width: 60, height: 80 },
  { type: 'pillar', x: 3036, width: 60, height: 110 },
  { type: 'pillar', x: 3104, width: 60, height: 140 },

  // Hold at top with spikes below
  { type: 'spike-row', x: 3164, width: 140 },
  { type: 'pillar', x: 3304, width: 80, height: 140 },

  // Descending staircase
  { type: 'pillar', x: 3392, width: 60, height: 110 },
  { type: 'pillar', x: 3460, width: 60, height: 80 },
  { type: 'pillar', x: 3528, width: 60, height: 50 },

  // Ground recovery
  { type: 'spike', x: 3700 },
  { type: 'spike', x: 3728 },

  // Short pillar hop
  { type: 'pillar', x: 3860, width: 70, height: 60 },
  { type: 'spike-row', x: 3930, width: 84 },
  { type: 'pillar', x: 4014, width: 70, height: 60 },

  // ===== SECTION 4: ADVANCED PLATFORMING (4000–5200) =====
  // Alternating heights
  { type: 'pillar', x: 4200, width: 60, height: 100 },
  { type: 'spike-row', x: 4260, width: 56 },
  { type: 'pillar', x: 4316, width: 60, height: 60 },
  { type: 'spike-row', x: 4376, width: 56 },
  { type: 'pillar', x: 4432, width: 60, height: 120 },
  { type: 'spike-row', x: 4492, width: 84 },
  { type: 'pillar', x: 4576, width: 60, height: 60 },

  // Long spike row — needs full hold jump
  { type: 'spike-row', x: 4636, width: 168 },
  { type: 'pillar', x: 4804, width: 80, height: 80 },

  // Ground spikes quad
  { type: 'spike', x: 4960 },
  { type: 'spike', x: 4988 },
  { type: 'spike', x: 5016 },
  { type: 'spike', x: 5044 },

  // ===== SECTION 5: FINALE (5200–6000) =====
  // Fast pillar hopping
  { type: 'pillar', x: 5200, width: 50, height: 70 },
  { type: 'spike-row', x: 5250, width: 56 },
  { type: 'pillar', x: 5306, width: 50, height: 90 },
  { type: 'spike-row', x: 5356, width: 56 },
  { type: 'pillar', x: 5412, width: 50, height: 60 },
  { type: 'spike-row', x: 5462, width: 84 },
  { type: 'pillar', x: 5546, width: 50, height: 110 },

  // Final staircase descent
  { type: 'pillar', x: 5604, width: 50, height: 90 },
  { type: 'pillar', x: 5662, width: 50, height: 60 },

  // Last ground spikes
  { type: 'spike', x: 5800 },
  { type: 'spike', x: 5828 },
  { type: 'spike', x: 5856 },
];
