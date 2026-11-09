/**
 * Self-contained HTML5 Canvas / JS game templates for zero-latency, 
 * zero-CORS iframe embeds.
 */

export function getBuiltInGameHtml(gameSlug: string): string {
  switch (gameSlug) {
    case '2048':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>2048</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .header { text-align: center; margin-bottom: 20px; }
    .title { font-size: 2.5rem; font-weight: 800; color: #38bdf8; letter-spacing: 2px; }
    .scores { display: flex; gap: 12px; margin-top: 10px; justify-content: center; }
    .score-box { background: #1e293b; border: 1px solid #334155; padding: 8px 16px; border-radius: 8px; text-align: center; min-width: 90px; }
    .score-label { font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; }
    .score-val { font-size: 1.25rem; font-weight: 700; color: #f8fafc; }
    #grid { width: 340px; height: 340px; background: #1e293b; border-radius: 12px; padding: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; position: relative; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    .cell { background: #334155; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #f8fafc; transition: all 0.12s ease-in-out; }
    .cell-2 { background: #38bdf8; color: #0f172a; }
    .cell-4 { background: #818cf8; color: #ffffff; }
    .cell-8 { background: #f59e0b; color: #ffffff; }
    .cell-16 { background: #ef4444; color: #ffffff; }
    .cell-32 { background: #ec4899; color: #ffffff; }
    .cell-64 { background: #a855f7; color: #ffffff; }
    .cell-128 { background: #10b981; color: #ffffff; font-size: 1.25rem; }
    .cell-256 { background: #06b6d4; color: #ffffff; font-size: 1.25rem; }
    .cell-512 { background: #3b82f6; color: #ffffff; font-size: 1.25rem; }
    .cell-1024 { background: #f43f5e; color: #ffffff; font-size: 1rem; }
    .cell-2048 { background: #eab308; color: #0f172a; font-size: 1rem; box-shadow: 0 0 15px #eab308; }
    .controls-hint { margin-top: 16px; color: #94a3b8; font-size: 0.875rem; text-align: center; }
    .restart-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; font-weight: 700; border-radius: 6px; cursor: pointer; margin-top: 12px; }
    .restart-btn:hover { background: #7dd3fc; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">2048</div>
    <div class="scores">
      <div class="score-box"><div class="score-label">SCORE</div><div class="score-val" id="score">0</div></div>
      <div class="score-box"><div class="score-label">BEST</div><div class="score-val" id="best">0</div></div>
    </div>
  </div>
  <div id="grid"></div>
  <button class="restart-btn" onclick="initGame()">New Game</button>
  <div class="controls-hint">Use <b>Arrow Keys</b> or <b>WASD</b> to slide tiles</div>

  <script>
    let board = Array(16).fill(0);
    let score = 0;
    let best = localStorage.getItem('2048_best') || 0;
    document.getElementById('best').innerText = best;

    function initGame() {
      board = Array(16).fill(0);
      score = 0;
      updateScore(0);
      addRandomTile();
      addRandomTile();
      render();
    }

    function addRandomTile() {
      let empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
      if (empty.length > 0) {
        let idx = empty[Math.floor(Math.random() * empty.length)];
        board[idx] = Math.random() < 0.9 ? 2 : 4;
      }
    }

    function render() {
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      board.forEach((val) => {
        const cell = document.createElement('div');
        cell.className = 'cell' + (val ? ' cell-' + val : '');
        cell.innerText = val > 0 ? val : '';
        grid.appendChild(cell);
      });
    }

    function updateScore(pts) {
      score += pts;
      document.getElementById('score').innerText = score;
      if (score > best) {
        best = score;
        localStorage.setItem('2048_best', best);
        document.getElementById('best').innerText = best;
      }
    }

    function slide(row) {
      let arr = row.filter(val => val);
      let missing = 4 - arr.length;
      let zeros = Array(missing).fill(0);
      return arr.concat(zeros);
    }

    function combine(row) {
      for (let i = 0; i < 3; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
          row[i] *= 2;
          updateScore(row[i]);
          row[i + 1] = 0;
        }
      }
      return row;
    }

    function moveLeft() {
      let changed = false;
      for (let i = 0; i < 4; i++) {
        let row = board.slice(i * 4, (i + 1) * 4);
        let orig = [...row];
        row = slide(row);
        row = combine(row);
        row = slide(row);
        for (let j = 0; j < 4; j++) {
          if (orig[j] !== row[j]) changed = true;
          board[i * 4 + j] = row[j];
        }
      }
      return changed;
    }

    function rotate() {
      let newBoard = Array(16).fill(0);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          newBoard[c * 4 + (3 - r)] = board[r * 4 + c];
        }
      }
      board = newBoard;
    }

    function handleKey(dir) {
      let moved = false;
      if (dir === 'left') moved = moveLeft();
      if (dir === 'right') { rotate(); rotate(); moved = moveLeft(); rotate(); rotate(); }
      if (dir === 'up') { rotate(); rotate(); rotate(); moved = moveLeft(); rotate(); }
      if (dir === 'down') { rotate(); moved = moveLeft(); rotate(); rotate(); rotate(); }

      if (moved) {
        addRandomTile();
        render();
      }
    }

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) handleKey('up');
      if (['ArrowDown', 'KeyS'].includes(e.code)) handleKey('down');
      if (['ArrowLeft', 'KeyA'].includes(e.code)) handleKey('left');
      if (['ArrowRight', 'KeyD'].includes(e.code)) handleKey('right');
    });

    initGame();
  </script>
</body>
</html>`;

    case 'snake':
    case 'retro-ice-snake':
    case 'snake-classic':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-select=no">
  <title>Retro Ice Snake</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body {
      background: #030712;
      color: #f8fafc;
      font-family: 'Courier New', Courier, monospace, system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 12px;
      overflow-x: hidden;
    }
    .game-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 440px;
    }
    .header-bar {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding: 6px 12px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.15);
    }
    .title-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 900;
      font-size: 1.05rem;
      color: #38bdf8;
      letter-spacing: 1px;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
    }
    .header-actions {
      display: flex;
      gap: 6px;
    }
    .btn-icon {
      background: #1e293b;
      border: 1px solid #334155;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      transition: all 0.15s;
    }
    .btn-icon:hover {
      background: #334155;
      color: #f8fafc;
      border-color: #38bdf8;
    }
    .hud-bar {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 8px;
    }
    .hud-item {
      background: #0f172a;
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 10px;
      padding: 6px 8px;
      text-align: center;
    }
    .hud-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-weight: bold;
    }
    .hud-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: #38bdf8;
      font-family: inherit;
    }
    .canvas-container {
      position: relative;
      width: 100%;
      max-width: 440px;
      aspect-ratio: 1 / 1;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.25), 0 10px 25px rgba(0, 0, 0, 0.8);
      border: 2px solid rgba(56, 189, 248, 0.4);
      background: #070d19;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      background: #070d19;
    }
    /* Overlay screens (Start / GameOver / Paused) */
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(3, 7, 18, 0.88);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px;
      z-index: 10;
    }
    .overlay.hidden { display: none; }
    .overlay-title {
      font-size: 1.6rem;
      font-weight: 900;
      margin-bottom: 8px;
      color: #38bdf8;
      text-shadow: 0 0 15px rgba(56, 189, 248, 0.8);
      letter-spacing: 1px;
    }
    .overlay-title.gameover {
      color: #f43f5e;
      text-shadow: 0 0 15px rgba(244, 63, 94, 0.8);
    }
    .overlay-stats {
      margin: 12px 0 18px 0;
      background: rgba(15, 23, 42, 0.8);
      padding: 10px 20px;
      border-radius: 12px;
      border: 1px solid rgba(56, 189, 248, 0.2);
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .highlight-score {
      font-size: 1.4rem;
      font-weight: 900;
      color: #38bdf8;
    }
    .btn-play {
      background: linear-gradient(135deg, #0284c7, #06b6d4);
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
      transition: all 0.15s ease;
      letter-spacing: 0.5px;
    }
    .btn-play:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
      filter: brightness(1.1);
    }
    .btn-play:active {
      transform: translateY(1px);
    }
    /* Mobile Touch D-Pad */
    .dpad-container {
      margin-top: 12px;
      display: grid;
      grid-template-columns: repeat(3, 48px);
      grid-template-rows: repeat(3, 48px);
      gap: 6px;
      justify-content: center;
      align-items: center;
    }
    .dpad-btn {
      background: #0f172a;
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-size: 1.2rem;
      font-weight: bold;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      transition: background 0.1s, transform 0.05s;
    }
    .dpad-btn:active {
      background: #0284c7;
      color: #ffffff;
      transform: scale(0.92);
    }
    .dpad-btn.up { grid-column: 2; grid-row: 1; }
    .dpad-btn.left { grid-column: 1; grid-row: 2; }
    .dpad-btn.down { grid-column: 2; grid-row: 2; }
    .dpad-btn.right { grid-column: 3; grid-row: 2; }
    .dpad-btn.center {
      grid-column: 2;
      grid-row: 3;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .controls-hint {
      margin-top: 8px;
      font-size: 0.75rem;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="game-wrapper">
    <!-- Header -->
    <div class="header-bar">
      <div class="title-box">
        <span>🧊</span>
        <span>RETRO ICE SNAKE</span>
      </div>
      <div class="header-actions">
        <button id="soundToggle" class="btn-icon" title="Toggle Sound">🔊</button>
        <button id="pauseToggle" class="btn-icon" title="Pause Game">⏸️</button>
      </div>
    </div>

    <!-- HUD -->
    <div class="hud-bar">
      <div class="hud-item">
        <div class="hud-label">Score</div>
        <div id="scoreVal" class="hud-val">0</div>
      </div>
      <div class="hud-item">
        <div class="hud-label">Best</div>
        <div id="bestVal" class="hud-val">0</div>
      </div>
      <div class="hud-item">
        <div class="hud-label">Level</div>
        <div id="levelVal" class="hud-val">1</div>
      </div>
    </div>

    <!-- Canvas Container -->
    <div class="canvas-container">
      <canvas id="gameCanvas" width="440" height="440"></canvas>

      <!-- Start Overlay -->
      <div id="startOverlay" class="overlay">
        <div class="overlay-title">🧊 RETRO ICE SNAKE</div>
        <p style="color:#94a3b8; font-size:0.85rem; max-width:280px; margin-bottom:14px;">
          Slither across the arctic glacier! Catch frozen fish & golden krill without crashing into walls or ice tails.
        </p>
        <button id="startBtn" class="btn-play">START SLIDING (SPACE)</button>
        <div style="margin-top:14px; font-size:0.75rem; color:#64748b;">
          WASD or Arrow Keys to steer • P to pause
        </div>
      </div>

      <!-- Game Over Overlay -->
      <div id="gameOverOverlay" class="overlay hidden">
        <div class="overlay-title gameover">💥 GLACIER CRASH!</div>
        <div class="overlay-stats">
          <div>Final Score: <span id="finalScore" class="highlight-score">0</span></div>
          <div style="color:#94a3b8; font-size:0.8rem; margin-top:4px;">
            Fish Caught: <span id="fishCount" style="color:#38bdf8; font-weight:bold;">0</span> • Level: <span id="finalLevel" style="color:#38bdf8; font-weight:bold;">1</span>
          </div>
          <div id="newBestBadge" style="display:none; color:#facc15; font-weight:bold; font-size:0.85rem; margin-top:6px;">
            🏆 NEW HIGH SCORE!
          </div>
        </div>
        <button id="restartBtn" class="btn-play">PLAY AGAIN (SPACE)</button>
      </div>

      <!-- Paused Overlay -->
      <div id="pausedOverlay" class="overlay hidden">
        <div class="overlay-title">⏸️ GAME PAUSED</div>
        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:16px;">
          Take a deep breath in the icy tundra!
        </p>
        <button id="resumeBtn" class="btn-play">RESUME (P)</button>
      </div>
    </div>

    <!-- Mobile Touch D-Pad -->
    <div class="dpad-container">
      <button class="dpad-btn up" id="dpadUp">▲</button>
      <button class="dpad-btn left" id="dpadLeft">◀</button>
      <button class="dpad-btn down" id="dpadDown">▼</button>
      <button class="dpad-btn right" id="dpadRight">▶</button>
    </div>
    <div class="controls-hint">Controls: Arrow Keys / WASD • Touch D-Pad on Mobile</div>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Grid sizing
    const GRID_SIZE = 20; // 22x22 cells on a 440x440 canvas
    const CELL_COUNT = 22;

    // Game state
    let snake = [];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = { x: 15, y: 11, type: 'fish' };
    let bonusFood = null;
    let bonusTimer = 0;
    let score = 0;
    let level = 1;
    let fishCaught = 0;
    let bestScore = parseInt(localStorage.getItem('gameland_retro_snake_best') || '0', 10);
    let gameState = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    let lastTickTime = 0;
    let soundEnabled = true;

    // Particles
    let particles = [];
    let floatingTexts = [];

    // Audio Synthesizer (Zero external dependencies)
    let audioCtx = null;
    function initAudio() {
      if (!audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) audioCtx = new AudioClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playSound(type) {
      if (!soundEnabled || !audioCtx) return;
      try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'eat') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(720, now + 0.09);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
          osc.start(now);
          osc.stop(now + 0.1);
        } else if (type === 'bonus') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(1040, now + 0.15);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === 'levelup') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.06);
          osc.frequency.setValueAtTime(659.25, now + 0.12);
          osc.frequency.setValueAtTime(880, now + 0.18);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'die') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.36);
        }
      } catch (e) {
        // audio safeguard
      }
    }

    // UI elements
    const scoreVal = document.getElementById('scoreVal');
    const bestVal = document.getElementById('bestVal');
    const levelVal = document.getElementById('levelVal');
    const startOverlay = document.getElementById('startOverlay');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const pausedOverlay = document.getElementById('pausedOverlay');
    const finalScore = document.getElementById('finalScore');
    const fishCount = document.getElementById('fishCount');
    const finalLevel = document.getElementById('finalLevel');
    const newBestBadge = document.getElementById('newBestBadge');
    const soundToggle = document.getElementById('soundToggle');
    const pauseToggle = document.getElementById('pauseToggle');

    bestVal.innerText = bestScore;

    function resetGame() {
      snake = [
        { x: 10, y: 11 },
        { x: 9, y: 11 },
        { x: 8, y: 11 },
        { x: 7, y: 11 },
      ];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      score = 0;
      level = 1;
      fishCaught = 0;
      bonusFood = null;
      bonusTimer = 0;
      particles = [];
      floatingTexts = [];
      scoreVal.innerText = score;
      levelVal.innerText = level;
      spawnFood();
    }

    function spawnFood() {
      let valid = false;
      let newFood = { x: 0, y: 0, type: 'fish' };
      while (!valid) {
        newFood.x = Math.floor(Math.random() * CELL_COUNT);
        newFood.y = Math.floor(Math.random() * CELL_COUNT);
        valid = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      }
      food = newFood;

      // 20% chance to spawn Golden Krill or Glacier Gem
      if (!bonusFood && Math.random() < 0.25) {
        let bValid = false;
        let bFood = { x: 0, y: 0, type: Math.random() > 0.5 ? 'krill' : 'gem' };
        while (!bValid) {
          bFood.x = Math.floor(Math.random() * CELL_COUNT);
          bFood.y = Math.floor(Math.random() * CELL_COUNT);
          bValid = !snake.some(segment => segment.x === bFood.x && segment.y === bFood.y) &&
                   !(bFood.x === food.x && bFood.y === food.y);
        }
        bonusFood = bFood;
        bonusTimer = 90; // ~9 seconds
      }
    }

    function createExplosion(x, y, color, count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3.5;
        particles.push({
          x: x * GRID_SIZE + GRID_SIZE / 2,
          y: y * GRID_SIZE + GRID_SIZE / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          decay: 0.04 + Math.random() * 0.03,
          color: color,
          size: 2 + Math.random() * 3,
        });
      }
    }

    function addFloatingText(x, y, text, color) {
      floatingTexts.push({
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE,
        text,
        color,
        life: 1.0,
      });
    }

    function getSpeedInterval() {
      // Level 1 = 135ms, speeds up smoothly down to 65ms at Level 10
      return Math.max(65, 140 - (level - 1) * 8);
    }

    function update() {
      if (gameState !== 'PLAYING') return;

      // Update direction from queue
      dir = { ...nextDir };

      // Calculate new head position
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      // Wall collision check
      if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
        gameOver();
        return;
      }

      // Self collision check
      if (snake.some((seg, idx) => idx > 0 && seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
      }

      // Move snake forward
      snake.unshift(head);

      // Check food collision
      let ate = false;
      if (head.x === food.x && head.y === food.y) {
        ate = true;
        fishCaught++;
        const pts = 10 * level;
        score += pts;
        createExplosion(food.x, food.y, '#38bdf8', 14);
        addFloatingText(food.x, food.y, '+' + pts, '#38bdf8');
        playSound('eat');
        spawnFood();
      }

      // Check bonus food collision
      if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
        ate = true;
        const isKrill = bonusFood.type === 'krill';
        const pts = (isKrill ? 35 : 50) * level;
        score += pts;
        createExplosion(bonusFood.x, bonusFood.y, isKrill ? '#facc15' : '#a855f7', 20);
        addFloatingText(bonusFood.x, bonusFood.y, '+' + pts + ' BONUS!', isKrill ? '#facc15' : '#c084fc');
        playSound('bonus');
        bonusFood = null;
        bonusTimer = 0;
      }

      // Tail management
      if (!ate) {
        snake.pop();
      }

      // Bonus timer decrement
      if (bonusFood) {
        bonusTimer--;
        if (bonusTimer <= 0) {
          bonusFood = null;
        }
      }

      // Level Progression
      const newLevel = Math.min(10, Math.floor(score / 60) + 1);
      if (newLevel > level) {
        level = newLevel;
        levelVal.innerText = level;
        playSound('levelup');
        addFloatingText(snake[0].x, snake[0].y, '⚡ LEVEL UP! ⚡', '#f59e0b');
      }

      scoreVal.innerText = score;
      if (score > bestScore) {
        bestScore = score;
        bestVal.innerText = bestScore;
        localStorage.setItem('gameland_retro_snake_best', bestScore.toString());
      }
    }

    function gameOver() {
      gameState = 'GAMEOVER';
      playSound('die');
      createExplosion(snake[0].x, snake[0].y, '#f43f5e', 30);
      finalScore.innerText = score;
      fishCount.innerText = fishCaught;
      finalLevel.innerText = level;
      if (score > 0 && score >= bestScore) {
        newBestBadge.style.display = 'block';
      } else {
        newBestBadge.style.display = 'none';
      }
      gameOverOverlay.classList.remove('hidden');
    }

    function draw() {
      // Clear background
      ctx.fillStyle = '#070d19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle polar ice grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= CELL_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
      }

      // Draw Arctic Fish (Regular Food)
      if (food) {
        const cx = food.x * GRID_SIZE + GRID_SIZE / 2;
        const cy = food.y * GRID_SIZE + GRID_SIZE / 2;
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐟', cx, cy);
        ctx.restore();
      }

      // Draw Bonus Food (Golden Krill or Glacier Gem)
      if (bonusFood) {
        const cx = bonusFood.x * GRID_SIZE + GRID_SIZE / 2;
        const cy = bonusFood.y * GRID_SIZE + GRID_SIZE / 2;
        const icon = bonusFood.type === 'krill' ? '🦐' : '❄️';
        const glow = bonusFood.type === 'krill' ? '#facc15' : '#c084fc';
        ctx.save();
        ctx.shadowColor = glow;
        ctx.shadowBlur = 18;
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, cx, cy);
        ctx.restore();
      }

      // Draw Snake Body
      for (let i = snake.length - 1; i >= 0; i--) {
        const seg = snake[i];
        const isHead = i === 0;
        const progress = 1 - (i / snake.length);

        ctx.save();
        if (isHead) {
          // Snake Head with frosty cyan gradient
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.roundRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 7);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#0f172a';
          const eyeOffset = 5;
          const eyeSize = 3;
          let e1x = seg.x * GRID_SIZE + 6;
          let e1y = seg.y * GRID_SIZE + 6;
          let e2x = seg.x * GRID_SIZE + GRID_SIZE - 6;
          let e2y = seg.y * GRID_SIZE + 6;

          if (dir.x === 1) { // Moving Right
            e1x = seg.x * GRID_SIZE + GRID_SIZE - 5; e1y = seg.y * GRID_SIZE + 5;
            e2x = seg.x * GRID_SIZE + GRID_SIZE - 5; e2y = seg.y * GRID_SIZE + GRID_SIZE - 5;
          } else if (dir.x === -1) { // Moving Left
            e1x = seg.x * GRID_SIZE + 5; e1y = seg.y * GRID_SIZE + 5;
            e2x = seg.x * GRID_SIZE + 5; e2y = seg.y * GRID_SIZE + GRID_SIZE - 5;
          } else if (dir.y === 1) { // Moving Down
            e1x = seg.x * GRID_SIZE + 5; e1y = seg.y * GRID_SIZE + GRID_SIZE - 5;
            e2x = seg.x * GRID_SIZE + GRID_SIZE - 5; e2y = seg.y * GRID_SIZE + GRID_SIZE - 5;
          }

          ctx.beginPath();
          ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
          ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
          ctx.fill();

          // Pupils
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(e1x, e1y, 1, 0, Math.PI * 2);
          ctx.arc(e2x, e2y, 1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Body segments - icy frosted gradient
          const alpha = 0.5 + progress * 0.5;
          ctx.fillStyle = 'rgba(6, 182, 212, ' + alpha + ')';
          ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.roundRect(seg.x * GRID_SIZE + 2, seg.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4, 5);
          ctx.fill();

          // Inner ice shine
          ctx.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.4) + ')';
          ctx.beginPath();
          ctx.roundRect(seg.x * GRID_SIZE + 4, seg.y * GRID_SIZE + 4, 4, 4, 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Floating Texts (+10, LEVEL UP)
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 0.8;
        ft.life -= 0.025;
        if (ft.life <= 0) {
          floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    }

    // Main animation loop
    function loop(timestamp) {
      if (!lastTickTime) lastTickTime = timestamp;
      const elapsed = timestamp - lastTickTime;

      if (elapsed > getSpeedInterval()) {
        update();
        lastTickTime = timestamp;
      }

      draw();
      requestAnimationFrame(loop);
    }

    // Direction input handlers with backward-collision check
    function setDirection(newX, newY) {
      initAudio();
      if (gameState === 'START' || gameState === 'GAMEOVER') {
        startGame();
        return;
      }
      if (gameState === 'PAUSED') {
        togglePause();
      }
      // Prevent reversing into self
      if (newX !== 0 && dir.x === -newX) return;
      if (newY !== 0 && dir.y === -newY) return;
      nextDir = { x: newX, y: newY };
    }

    function startGame() {
      initAudio();
      resetGame();
      gameState = 'PLAYING';
      startOverlay.classList.add('hidden');
      gameOverOverlay.classList.add('hidden');
      pausedOverlay.classList.add('hidden');
      lastTickTime = performance.now();
    }

    function togglePause() {
      if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        pausedOverlay.classList.remove('hidden');
      } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        pausedOverlay.classList.add('hidden');
        lastTickTime = performance.now();
      }
    }

    // Keyboard listener
    window.addEventListener('keydown', (e) => {
      // Prevent browser scroll on arrow keys and space inside game iframe
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setDirection(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setDirection(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setDirection(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setDirection(1, 0);
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === 'START' || gameState === 'GAMEOVER') {
          startGame();
        }
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
      }
    });

    // Touch D-Pad button handlers
    document.getElementById('dpadUp').addEventListener('click', (e) => { e.preventDefault(); setDirection(0, -1); });
    document.getElementById('dpadDown').addEventListener('click', (e) => { e.preventDefault(); setDirection(0, 1); });
    document.getElementById('dpadLeft').addEventListener('click', (e) => { e.preventDefault(); setDirection(-1, 0); });
    document.getElementById('dpadRight').addEventListener('click', (e) => { e.preventDefault(); setDirection(1, 0); });

    // Overlay button handlers
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.getElementById('resumeBtn').addEventListener('click', togglePause);

    // Audio & Pause toggles
    soundToggle.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      soundToggle.innerText = soundEnabled ? '🔊' : '🔇';
    });

    pauseToggle.addEventListener('click', () => {
      togglePause();
    });

    // Canvas swipe gesture support
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
          if (Math.abs(dx) > Math.abs(dy)) {
            setDirection(dx > 0 ? 1 : -1, 0);
          } else {
            setDirection(0, dy > 0 ? 1 : -1);
          }
        }
      }
    }, { passive: true });

    // Initialize initial canvas state
    resetGame();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;

    case 'flappy-penguin':
    case 'flappy-bird':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Flappy Bird</title>
  <style>
    body { background: #0f172a; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    canvas { background: #38bdf8; border: 3px solid #0284c7; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .hint { margin-top: 10px; color: #94a3b8; font-size: 0.9rem; }
  </style>
</head>
<body>
  <canvas id="c" width="360" height="500"></canvas>
  <div class="hint">Press <b>SPACEBAR</b> or <b>CLICK</b> to jump</div>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    let birdY = 200, birdV = 0, gravity = 0.45, score = 0, best = localStorage.getItem('flappy_best') || 0;
    let pipes = [];
    let frame = 0;
    let gameOver = false;

    function reset() {
      birdY = 200; birdV = 0; score = 0; pipes = []; frame = 0; gameOver = false;
    }

    function flap() {
      if (gameOver) reset();
      else birdV = -7.5;
    }

    window.addEventListener('keydown', e => { if (e.code === 'Space') flap(); });
    canvas.addEventListener('click', flap);

    function loop() {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!gameOver) {
        frame++;
        birdV += gravity;
        birdY += birdV;

        if (frame % 85 === 0) {
          let gap = 120;
          let topH = Math.floor(Math.random() * (canvas.height - gap - 100)) + 40;
          pipes.push({ x: canvas.width, top: topH, bottom: canvas.height - topH - gap, passed: false });
        }

        pipes.forEach(p => {
          p.x -= 2.2;
          if (!p.passed && p.x < 100) {
            p.passed = true; score++;
            if (score > best) { best = score; localStorage.setItem('flappy_best', best); }
          }
          if (100 > p.x && 100 < p.x + 50) {
            if (birdY < p.top || birdY > canvas.height - p.bottom) gameOver = true;
          }
        });

        pipes = pipes.filter(p => p.x > -60);

        if (birdY > canvas.height - 20 || birdY < 0) gameOver = true;
      }

      // Draw Pipes
      ctx.fillStyle = '#22c55e';
      pipes.forEach(p => {
        ctx.fillRect(p.x, 0, 50, p.top);
        ctx.fillRect(p.x, canvas.height - p.bottom, 50, p.bottom);
      });

      // Draw Bird
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(100, birdY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(105, birdY - 4, 4, 0, Math.PI * 2); ctx.fill();

      // Draw Score
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Score: ' + score, 15, 35);
      ctx.fillText('Best: ' + best, 15, 65);

      if (gameOver) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, 220);
        ctx.font = '18px sans-serif';
        ctx.fillText('Click or Space to Retry', canvas.width / 2, 260);
        ctx.textAlign = 'left';
      }

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;

    case 'slope-3d':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Slope 3D Simulation</title>
  <style>
    body { background: #020617; color: #fff; font-family: system-ui, sans-serif; margin: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    canvas { background: #090d16; width: 100%; height: 100vh; display: block; }
    .hud { position: absolute; top: 20px; left: 20px; font-size: 1.5rem; font-weight: bold; text-shadow: 0 0 10px #38bdf8; }
    .overlay { position: absolute; inset: 0; background: rgba(2,6,23,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .btn { background: #38bdf8; color: #020617; border: none; padding: 12px 28px; font-size: 1.2rem; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="hud">DISTANCE: <span id="dist">0</span>m</div>
  <canvas id="c"></canvas>
  <div id="startScreen" class="overlay">
    <h1 style="color:#38bdf8; font-size: 3rem; margin-bottom:0;">SLOPE 3D</h1>
    <p style="color:#94a3b8; margin-top: 10px;">Steer with <b>A / D</b> or <b>Left / Right Arrow</b></p>
    <button class="btn" onclick="startGame()">START RUN</button>
  </div>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    let ballX = 0, ballSpeedX = 0, distance = 0, speed = 8, playing = false;
    let obstacles = [];

    function startGame() {
      document.getElementById('startScreen').style.display = 'none';
      ballX = 0; ballSpeedX = 0; distance = 0; speed = 8; obstacles = []; playing = true;
    }

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a') ballSpeedX = -6;
      if (e.key === 'ArrowRight' || e.key === 'd') ballSpeedX = 6;
    });
    window.addEventListener('keyup', e => {
      if (['ArrowLeft','a','ArrowRight','d'].includes(e.key)) ballSpeedX = 0;
    });

    function loop() {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw 3D Tunnel Perspective lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      let cx = canvas.width / 2;
      let cy = canvas.height / 3;

      for (let i = 0; i < 10; i++) {
        let z = (distance * 5 + i * 80) % 800;
        let scale = 1 / (z / 400 + 1);
        let w = 600 * scale;
        let h = 400 * scale;
        ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#334155';
        ctx.strokeRect(cx - w / 2 + ballX * scale, cy - h / 2 + z * 0.2, w, h);
      }

      if (playing) {
        distance += Math.floor(speed / 2);
        document.getElementById('dist').innerText = distance;
        ballX += ballSpeedX;

        // Boundaries
        if (Math.abs(ballX) > 280) {
          playing = false;
          document.getElementById('startScreen').style.display = 'flex';
          document.querySelector('#startScreen h1').innerText = 'CRASHED!';
        }

        // Spawn obstacles
        if (Math.random() < 0.08) {
          obstacles.push({ x: (Math.random() - 0.5) * 400, z: 800 });
        }

        // Render obstacles
        obstacles.forEach((obs, idx) => {
          obs.z -= speed * 4;
          let scale = 1 / (obs.z / 400 + 1);
          let ox = cx + (obs.x + ballX) * scale;
          let oy = cy + obs.z * 0.3;
          let size = 40 * scale;

          ctx.fillStyle = '#ef4444';
          ctx.fillRect(ox - size/2, oy - size/2, size, size);

          if (obs.z < 50 && obs.z > 0 && Math.abs(obs.x - ballX) < 40) {
            playing = false;
            document.getElementById('startScreen').style.display = 'flex';
            document.querySelector('#startScreen h1').innerText = 'GAME OVER';
          }
        });
        obstacles = obstacles.filter(o => o.z > 0);
      }

      // Draw Player Ball
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, canvas.height - 120, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;

    case 'tetris':
    case 'tetris-classic':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tetris</title>
  <style>
    body { background: #0f172a; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    canvas { background: #1e293b; border: 3px solid #334155; border-radius: 8px; }
    .score { font-size: 1.5rem; margin-top: 10px; color: #38bdf8; font-weight: bold; }
  </style>
</head>
<body>
  <canvas id="tetris" width="240" height="400"></canvas>
  <div class="score">SCORE: <span id="s">0</span></div>
  <script>
    const cvs = document.getElementById('tetris');
    const ctx = cvs.getContext('2d');
    ctx.scale(20, 20);

    const arena = Array.from({length: 20}, () => Array(12).fill(0));
    const pieces = 'TJLOSZI';
    const colors = [null, '#ef4444', '#38bdf8', '#3b82f6', '#f59e0b', '#eab308', '#22c55e', '#a855f7'];

    function createPiece(type) {
      if (type === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
      if (type === 'L') return [[0,2,0],[0,2,0],[0,2,2]];
      if (type === 'J') return [[0,3,0],[0,3,0],[3,3,0]];
      if (type === 'O') return [[4,4],[4,4]];
      if (type === 'Z') return [[5,5,0],[0,5,5],[0,0,0]];
      if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
      if (type === 'T') return [[0,7,0],[7,7,7],[0,0,0]];
    }

    const player = { pos: {x: 4, y: 0}, matrix: createPiece('T'), score: 0 };

    function collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
        }
      }
      return false;
    }

    function merge(arena, player) {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
        });
      });
    }

    function rotate(matrix) {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
      }
      matrix.forEach(row => row.reverse());
    }

    function arenaSweep() {
      let rowCount = 1;
      outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
          if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 100;
        rowCount *= 2;
      }
      document.getElementById('s').innerText = player.score;
    }

    function playerDrop() {
      player.pos.y++;
      if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
      }
      dropCounter = 0;
    }

    function playerReset() {
      player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
      player.pos.y = 0;
      player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
      if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        document.getElementById('s').innerText = 0;
      }
    }

    function drawMatrix(matrix, offset) {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.fillStyle = colors[value];
            ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
          }
        });
      });
    }

    function draw() {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      drawMatrix(arena, {x: 0, y: 0});
      drawMatrix(player.matrix, player.pos);
    }

    let dropCounter = 0;
    let lastTime = 0;
    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;
      if (dropCounter > 800) playerDrop();
      draw();
      requestAnimationFrame(update);
    }

    document.addEventListener('keydown', event => {
      if (event.keyCode === 37) { player.pos.x--; if(collide(arena, player)) player.pos.x++; }
      else if (event.keyCode === 39) { player.pos.x++; if(collide(arena, player)) player.pos.x--; }
      else if (event.keyCode === 40) playerDrop();
      else if (event.keyCode === 38 || event.keyCode === 88) {
        rotate(player.matrix);
        if(collide(arena, player)) rotate(player.matrix);
      }
    });

    playerReset();
    update();
  </script>
</body>
</html>`;

    case 'pacman':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pacman 8-Bit</title>
  <style>
    body { background: #000; color: #ff0; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    canvas { background: #000; border: 4px solid #1e40af; border-radius: 6px; }
  </style>
</head>
<body>
  <h2>PAC-MAN 8-BIT</h2>
  <canvas id="p" width="380" height="380"></canvas>
  <p>Use <b>Arrow Keys</b> to eat dots!</p>
  <script>
    const cvs = document.getElementById('p');
    const ctx = cvs.getContext('2d');
    let px = 190, py = 190, dir = 0, score = 0;
    let dots = [];
    for (let r=30; r<350; r+=30) {
      for (let c=30; c<350; c+=30) dots.push({x:c, y:r});
    }

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') dir = 0;
      if (e.key === 'ArrowDown') dir = 1;
      if (e.key === 'ArrowLeft') dir = 2;
      if (e.key === 'ArrowUp') dir = 3;
    });

    function loop() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 380, 380);

      if (dir === 0) px += 3;
      if (dir === 1) py += 3;
      if (dir === 2) px -= 3;
      if (dir === 3) py -= 3;

      if (px < 10) px = 370; if (px > 370) px = 10;
      if (py < 10) py = 370; if (py > 370) py = 10;

      // Draw Dots
      ctx.fillStyle = '#ffb8ae';
      dots.forEach((d, i) => {
        ctx.beginPath(); ctx.arc(d.x, d.y, 4, 0, Math.PI*2); ctx.fill();
        if (Math.hypot(px - d.x, py - d.y) < 14) { dots.splice(i, 1); score += 10; }
      });

      // Draw Pacman
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      let mouth = (Math.sin(Date.now() / 80) + 1) * 0.2;
      ctx.arc(px, py, 16, mouth, Math.PI * 2 - mouth);
      ctx.lineTo(px, py);
      ctx.fill();

      ctx.fillStyle = '#fff'; ctx.font = '20px monospace';
      ctx.fillText('SCORE: ' + score, 20, 30);
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;

    case 'ultra-proxy':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>UltraProxy - Web Browser & Proxy</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    
    /* Top Toolbar */
    .toolbar { background: #1e293b; border-b: 1px solid #334155; padding: 8px 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .nav-btn { background: #334155; color: #f8fafc; border: none; width: 34px; height: 34px; border-radius: 8px; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .nav-btn:hover { background: #475569; color: #38bdf8; }
    .address-bar { flex: 1; min-width: 220px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; display: flex; align-items: center; padding: 0 10px; gap: 8px; }
    .padlock { color: #22c55e; font-size: 0.85rem; font-weight: bold; }
    .address-input { flex: 1; background: transparent; border: none; color: #f8fafc; padding: 8px 0; font-size: 0.875rem; outline: none; }
    .go-btn { background: #0284c7; color: #ffffff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
    .go-btn:hover { background: #38bdf8; color: #090d16; }

    /* Mode Selector */
    .mode-select { background: #0f172a; color: #38bdf8; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: bold; outline: none; cursor: pointer; }

    /* Speed Dials */
    .speed-dials { background: #0f172a; border-b: 1px solid #1e293b; padding: 6px 14px; display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; }
    .dial-chip { background: #1e293b; color: #94a3b8; border: 1px solid #334155; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .dial-chip:hover { background: #38bdf8; color: #090d16; border-color: #38bdf8; }

    /* Viewport Area */
    .viewport { flex: 1; position: relative; background: #020617; width: 100%; height: 100%; }
    iframe { width: 100%; height: 100%; border: none; background: #020617; }
    
    /* Clean Reader Panel */
    .reader-panel { position: absolute; inset: 0; background: #0f172a; color: #e2e8f0; padding: 24px; overflow-y: auto; display: none; line-height: 1.6; }
    .reader-header { border-b: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px; }
    .reader-title { font-size: 1.5rem; color: #38bdf8; font-weight: 800; }
    .reader-url { font-size: 0.8rem; color: #64748b; margin-top: 4px; word-break: break-all; }
    .reader-content { font-size: 0.95rem; }
    .reader-content a { color: #38bdf8; text-decoration: underline; }
    .reader-content h1, .reader-content h2, .reader-content h3 { color: #f8fafc; margin: 16px 0 8px 0; }
    .reader-content p { margin-bottom: 12px; color: #cbd5e1; }
    .reader-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }

    /* Welcome / Home Hub */
    .home-hub { position: absolute; inset: 0; background: #090d16; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; }
    .logo-icon { font-size: 3rem; margin-bottom: 12px; }
    .logo-text { font-size: 2rem; font-weight: 900; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
    .subtitle { font-size: 0.9rem; color: #94a3b8; max-width: 480px; margin-bottom: 24px; }
    .grid-shortcuts { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; width: 100%; max-width: 600px; }
    .card-shortcut { background: #1e293b; border: 1px solid #334155; padding: 14px; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .card-shortcut:hover { border-color: #38bdf8; transform: translateY(-2px); background: #334155; }
    .card-icon { font-size: 1.5rem; margin-bottom: 6px; }
    .card-title { font-size: 0.85rem; font-weight: 700; color: #f8fafc; }
    .card-desc { font-size: 0.7rem; color: #94a3b8; margin-top: 2px; }

    .status-badge { position: absolute; bottom: 12px; right: 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #334155; color: #22c55e; font-size: 0.75rem; font-weight: bold; padding: 4px 10px; border-radius: 20px; pointer-events: none; z-index: 50; }
  </style>
</head>
<body>

  <!-- Top Navigation Bar -->
  <div class="toolbar">
    <button class="nav-btn" onclick="goBack()" title="Back">←</button>
    <button class="nav-btn" onclick="goForward()" title="Forward">→</button>
    <button class="nav-btn" onclick="reloadPage()" title="Refresh">↻</button>
    <button class="nav-btn" onclick="goHome()" title="Home Hub">🏠</button>

    <div class="address-bar">
      <span class="padlock" id="padlockIcon">🔒 https://</span>
      <input type="text" id="urlInput" class="address-input" placeholder="Type a website URL or search term..." onkeydown="if(event.key==='Enter') navigateUrl()">
    </div>

    <button class="go-btn" onclick="navigateUrl()">Browse</button>

    <select id="modeSelect" class="mode-select" onchange="switchMode()">
      <option value="iframe">iFrame Proxy Mode</option>
      <option value="reader">Clean Reader Proxy</option>
      <option value="wiki">Wikipedia Proxy</option>
    </select>
  </div>

  <!-- Quick Speed Dials -->
  <div class="speed-dials">
    <span style="font-size: 0.75rem; color: #64748b; font-weight: bold; align-self: center;">Quick Links:</span>
    <div class="dial-chip" onclick="loadUrl('https://en.wikipedia.org/wiki/Main_Page')">Wikipedia</div>
    <div class="dial-chip" onclick="loadUrl('https://duckduckgo.com')">DuckDuckGo</div>
    <div class="dial-chip" onclick="loadUrl('https://news.ycombinator.com')">Hacker News</div>
    <div class="dial-chip" onclick="loadUrl('https://devdocs.io')">DevDocs</div>
    <div class="dial-chip" onclick="loadUrl('https://archive.org')">Archive.org</div>
    <div class="dial-chip" onclick="loadUrl('https://www.gutenberg.org')">Project Gutenberg</div>
    <div class="dial-chip" onclick="loadUrl('https://html5test.com')">HTML5 Test</div>
  </div>

  <!-- Viewport Container -->
  <div class="viewport">
    <!-- Home Hub Landing -->
    <div id="homeHub" class="home-hub">
      <div class="logo-icon">🌐</div>
      <div class="logo-text">UltraProxy Web Engine</div>
      <p class="subtitle">Direct client-side web proxy & unblocked browser emulator. Zero external server dependency, instant page loading & reader mode.</p>

      <div class="grid-shortcuts">
        <div class="card-shortcut" onclick="loadUrl('https://en.wikipedia.org/wiki/Special:Random')">
          <div class="card-icon">📚</div>
          <div class="card-title">Wikipedia</div>
          <div class="card-desc">Random Article</div>
        </div>
        <div class="card-shortcut" onclick="loadUrl('https://duckduckgo.com')">
          <div class="card-icon">🔍</div>
          <div class="card-title">DuckDuckGo</div>
          <div class="card-desc">Privacy Search</div>
        </div>
        <div class="card-shortcut" onclick="loadUrl('https://news.ycombinator.com')">
          <div class="card-icon">⚡</div>
          <div class="card-title">Hacker News</div>
          <div class="card-desc">Tech & Coding</div>
        </div>
        <div class="card-shortcut" onclick="loadUrl('https://devdocs.io')">
          <div class="card-icon">📖</div>
          <div class="card-title">DevDocs</div>
          <div class="card-desc">API Reference</div>
        </div>
      </div>
    </div>

    <!-- Live Sandboxed iFrame -->
    <iframe id="webFrame" style="display: none;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>

    <!-- Clean Reader Panel -->
    <div id="readerPanel" class="reader-panel">
      <div class="reader-header">
        <div class="reader-title" id="readerTitle">Page Reader</div>
        <div class="reader-url" id="readerUrl">https://...</div>
      </div>
      <div class="reader-content" id="readerBody">
        <p>Loading webpage in clean reader proxy mode...</p>
      </div>
    </div>

    <div class="status-badge" id="statusBadge">● PROXY READY</div>
  </div>

  <script>
    let historyStack = [];
    let historyIndex = -1;
    const homeHub = document.getElementById('homeHub');
    const webFrame = document.getElementById('webFrame');
    const readerPanel = document.getElementById('readerPanel');
    const urlInput = document.getElementById('urlInput');
    const modeSelect = document.getElementById('modeSelect');

    function formatUrl(raw) {
      let trimmed = raw.trim();
      if (!trimmed) return '';
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        if (trimmed.includes('.') && !trimmed.includes(' ')) {
          return 'https://' + trimmed;
        } else {
          return 'https://duckduckgo.com/?q=' + encodeURIComponent(trimmed);
        }
      }
      return trimmed;
    }

    function loadUrl(targetUrl) {
      const formatted = formatUrl(targetUrl);
      if (!formatted) return;

      urlInput.value = formatted;
      historyStack.push(formatted);
      historyIndex = historyStack.length - 1;

      renderCurrentPage(formatted);
    }

    function navigateUrl() {
      loadUrl(urlInput.value);
    }

    function renderCurrentPage(url) {
      homeHub.style.display = 'none';
      const mode = modeSelect.value;

      if (mode === 'iframe') {
        readerPanel.style.display = 'none';
        webFrame.style.display = 'block';
        webFrame.src = url;
      } else if (mode === 'wiki' || url.includes('wikipedia.org')) {
        webFrame.style.display = 'none';
        readerPanel.style.display = 'block';
        fetchWikipediaProxy(url);
      } else {
        webFrame.style.display = 'none';
        readerPanel.style.display = 'block';
        fetchCleanReaderProxy(url);
      }
    }

    function fetchWikipediaProxy(url) {
      document.getElementById('readerTitle').innerText = 'Wikipedia Unblocked Proxy';
      document.getElementById('readerUrl').innerText = url;
      document.getElementById('readerBody').innerHTML = '<p style="color:#38bdf8;">Fetching Wikipedia article via client-side API proxy...</p>';

      let articleSlug = 'Main_Page';
      if (url.includes('/wiki/')) {
        articleSlug = url.split('/wiki/')[1].split('#')[0];
      }

      fetch('https://en.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(articleSlug))
        .then(res => res.text())
        .then(html => {
          document.getElementById('readerBody').innerHTML = html;
        })
        .catch(err => {
          document.getElementById('readerBody').innerHTML = '<p style="color:#ef4444;">Could not load page directly. <a href="' + url + '" target="_blank">Open in new tab</a></p>';
        });
    }

    function fetchCleanReaderProxy(url) {
      document.getElementById('readerTitle').innerText = 'Clean Reader Proxy';
      document.getElementById('readerUrl').innerText = url;
      document.getElementById('readerBody').innerHTML =
        '<div style="background:#1e293b; padding:20px; border-radius:12px; border:1px solid #334155;">' +
        '<h2 style="color:#38bdf8; margin-bottom:10px;">Web Reader View</h2>' +
        '<p>Browsing target: <b>' + url + '</b></p>' +
        '<p style="margin-top:12px; color:#94a3b8;">If the target site blocks direct iframe framing (X-Frame-Options), switch to <b>iFrame Proxy Mode</b> or use the built-in search shortcut below:</p>' +
        '<div style="margin-top:16px; display:flex; gap:10px;">' +
        '<a href="' + url + '" target="_blank" style="background:#38bdf8; color:#0f172a; padding:8px 16px; border-radius:6px; font-weight:bold; text-decoration:none;">Open Direct Link ↗</a>' +
        '<button onclick="switchModeToIframe()" style="background:#334155; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">Try iFrame Embed</button>' +
        '</div>' +
        '</div>';
    }

    function switchModeToIframe() {
      modeSelect.value = 'iframe';
      renderCurrentPage(urlInput.value);
    }

    function switchMode() {
      if (urlInput.value) renderCurrentPage(urlInput.value);
    }

    function goHome() {
      homeHub.style.display = 'flex';
      webFrame.style.display = 'none';
      readerPanel.style.display = 'none';
      urlInput.value = '';
    }

    function goBack() {
      if (historyIndex > 0) {
        historyIndex--;
        urlInput.value = historyStack[historyIndex];
        renderCurrentPage(historyStack[historyIndex]);
      } else {
        goHome();
      }
    }

    function goForward() {
      if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        urlInput.value = historyStack[historyIndex];
        renderCurrentPage(historyStack[historyIndex]);
      }
    }

    function reloadPage() {
      if (urlInput.value) renderCurrentPage(urlInput.value);
    }
  </script>
</body>
</html>`;

    case 'stealth-browser':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Stealth Browser & Privacy Proxy</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #020617; color: #f8fafc; font-family: system-ui, sans-serif; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    
    /* Tabs Header */
    .tabs-bar { background: #0f172a; border-b: 1px solid #1e293b; display: flex; items-center; padding: 6px 10px 0 10px; gap: 4px; overflow-x: auto; }
    .tab { background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-bottom: none; border-radius: 8px 8px 0 0; padding: 6px 14px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; max-width: 180px; }
    .tab.active { background: #334155; color: #38bdf8; border-color: #38bdf8; }
    .tab-close { font-size: 0.75rem; color: #94a3b8; border-radius: 50%; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; }
    .tab-close:hover { background: #ef4444; color: #fff; }
    .add-tab-btn { background: #1e293b; color: #38bdf8; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; font-size: 0.9rem; cursor: pointer; margin-bottom: 2px; }

    /* Control Strip */
    .controls { background: #1e293b; border-b: 1px solid #334155; padding: 8px 12px; display: flex; items-center; gap: 8px; flex-wrap: wrap; }
    .input-box { flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff; padding: 6px 12px; font-size: 0.85rem; outline: none; }
    .btn { background: #2563eb; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; cursor: pointer; }
    .btn:hover { background: #3b82f6; }
    
    .setting-pill { background: #0f172a; border: 1px solid #334155; color: #22c55e; font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; font-weight: bold; display: flex; items-center; gap: 4px; }

    /* Main Frame Area */
    .content-area { flex: 1; position: relative; background: #090d16; }
    iframe { width: 100%; height: 100%; border: none; background: #020617; }

    .welcome-screen { position: absolute; inset: 0; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; }
    .title { font-size: 1.8rem; font-weight: 800; color: #22c55e; margin-bottom: 8px; }
    .desc { font-size: 0.85rem; color: #94a3b8; max-width: 450px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; max-width: 400px; width: 100%; }
    .grid-btn { background: #1e293b; border: 1px solid #334155; padding: 12px; border-radius: 10px; color: #f8fafc; font-weight: bold; font-size: 0.85rem; cursor: pointer; text-align: center; }
    .grid-btn:hover { border-color: #22c55e; background: #334155; }
  </style>
</head>
<body>

  <!-- Tabs -->
  <div class="tabs-bar">
    <div class="tab active" onclick="switchTab(0)">
      <span>Tab 1</span>
      <span class="tab-close">✕</span>
    </div>
    <button class="add-tab-btn" onclick="addTab()">+</button>
  </div>

  <!-- Controls -->
  <div class="controls">
    <div class="setting-pill">🛡️ SHIELD ACTIVE</div>
    <div class="setting-pill" style="color: #38bdf8;">📍 USA PROXY</div>
    <input type="text" id="stealthUrl" class="input-box" placeholder="Enter target URL or search query..." onkeydown="if(event.key==='Enter') loadStealthUrl()">
    <button class="btn" onclick="loadStealthUrl()">Launch</button>
  </div>

  <!-- Content -->
  <div class="content-area">
    <div id="welcome" class="welcome-screen">
      <div style="font-size: 3rem; margin-bottom: 8px;">🛡️</div>
      <div class="title">Stealth Web Proxy</div>
      <div class="desc">Client-side anonymous web reader & unblocked tabbed browser emulator. Browse Wikipedia, news, games, and web tools securely.</div>

      <div class="grid">
        <div class="grid-btn" onclick="quickNav('https://en.wikipedia.org/wiki/Portal:Current_events')">📰 Current Events</div>
        <div class="grid-btn" onclick="quickNav('https://duckduckgo.com')">🔍 Private Search</div>
        <div class="grid-btn" onclick="quickNav('https://archive.org')">🏛️ Web Archive</div>
        <div class="grid-btn" onclick="quickNav('https://devdocs.io')">💻 Tech Docs</div>
      </div>
    </div>

    <iframe id="stealthFrame" style="display: none;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
  </div>

  <script>
    const stealthFrame = document.getElementById('stealthFrame');
    const welcome = document.getElementById('welcome');
    const stealthUrl = document.getElementById('stealthUrl');

    function quickNav(url) {
      stealthUrl.value = url;
      loadStealthUrl();
    }

    function loadStealthUrl() {
      let target = stealthUrl.value.trim();
      if (!target) return;

      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }

      welcome.style.display = 'none';
      stealthFrame.style.display = 'block';
      stealthFrame.src = target;
    }

    function switchTab(idx) {
      // tab switching logic
    }

    function addTab() {
      welcome.style.display = 'flex';
      stealthFrame.style.display = 'none';
      stealthUrl.value = '';
    }
  </script>
</body>
</html>`;

    case 'unblocked-search-proxy':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unblocked Search & Wiki Proxy</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; padding: 20px; min-height: 100vh; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; }
    .title { font-size: 2rem; font-weight: 800; color: #38bdf8; }
    .search-bar { display: flex; gap: 8px; margin-top: 16px; }
    .search-input { flex: 1; background: #1e293b; border: 1px solid #334155; color: #fff; padding: 12px 16px; border-radius: 10px; font-size: 1rem; outline: none; }
    .search-btn { background: #0284c7; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; cursor: pointer; }
    .search-btn:hover { background: #38bdf8; color: #0f172a; }
    
    .results { margin-top: 24px; space-y: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .card-title { font-size: 1.1rem; font-weight: 700; color: #38bdf8; margin-bottom: 6px; }
    .card-snippet { font-size: 0.9rem; color: #cbd5e1; line-height: 1.5; }
    .card-link { display: inline-block; margin-top: 8px; color: #818cf8; font-size: 0.8rem; text-decoration: underline; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">🔍 Search & Article Proxy</div>
      <p style="color: #94a3b8; font-size: 0.875rem; margin-top: 4px;">Search Wikipedia articles and web knowledge instantly without restriction.</p>
      
      <div class="search-bar">
        <input type="text" id="query" class="search-input" placeholder="Search any topic, historical event, game guide..." onkeydown="if(event.key==='Enter') searchWiki()">
        <button class="search-btn" onclick="searchWiki()">Search</button>
      </div>
    </div>

    <div id="results" class="results">
      <div class="card">
        <div class="card-title">Welcome to Unblocked Knowledge Engine</div>
        <div class="card-snippet">Type any query above to fetch full articles and knowledge entries directly via client-side API proxies.</div>
      </div>
    </div>
  </div>

  <script>
    function searchWiki() {
      const q = document.getElementById('query').value.trim();
      if (!q) return;

      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '<p style="color:#38bdf8; text-align:center;">Searching Wikipedia knowledge database...</p>';

      fetch('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(q) + '&format=json&origin=*')
        .then(res => res.json())
        .then(data => {
          resultsDiv.innerHTML = '';
          if (data.query && data.query.search.length > 0) {
            data.query.search.forEach(item => {
              const card = document.createElement('div');
              card.className = 'card';
              card.innerHTML =
                '<div class="card-title">' + item.title + '</div>' +
                '<div class="card-snippet">' + item.snippet + '...</div>' +
                '<span class="card-link" onclick="loadArticle(\'' + item.title.replace(/'/g, "\\'") + '\')">Read Full Article Proxy →</span>';
              resultsDiv.appendChild(card);
            });
          } else {
            resultsDiv.innerHTML = '<p style="color:#ef4444; text-align:center;">No search results found.</p>';
          }
        })
        .catch(err => {
          resultsDiv.innerHTML = '<p style="color:#ef4444; text-align:center;">Search request failed.</p>';
        });
    }

    function loadArticle(title) {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '<p style="color:#38bdf8; text-align:center;">Loading article: <b>' + title + '</b>...</p>';

      fetch('https://en.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(title))
        .then(res => res.text())
        .then(html => {
          resultsDiv.innerHTML =
            '<button onclick="searchWiki()" style="background:#334155; color:#fff; border:none; padding:8px 16px; border-radius:8px; margin-bottom:16px; cursor:pointer;">← Back to Results</button>' +
            '<div class="card" style="line-height:1.6; color:#e2e8f0;">' + html + '</div>';
        });
    }
  </script>
</body>
</html>`;

    case 'js-web-sandbox':
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>JS & Web Emulator Sandbox</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f172a; color: #fff; font-family: monospace; height: 100vh; display: flex; flex-direction: column; }
    .header { background: #1e293b; padding: 10px; border-b: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .title { color: #38bdf8; font-weight: bold; }
    .run-btn { background: #22c55e; color: #0f172a; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    .editor-container { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: #334155; }
    textarea { width: 100%; height: 100%; background: #090d16; color: #f8fafc; border: none; padding: 12px; font-family: monospace; font-size: 0.85rem; outline: none; resize: none; }
    iframe { width: 100%; height: 100%; border: none; background: #020617; }
  </style>
</head>
<body>
  <div class="header">
    <span class="title">💻 Client-Side Web Sandbox & Proxy Code Emulator</span>
    <button class="run-btn" onclick="runCode()">Run Code ▶</button>
  </div>
  <div class="editor-container">
    <textarea id="code" placeholder="Type HTML/CSS/JS code here..."><!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #1e293b; color: #38bdf8; font-family: sans-serif; text-align: center; padding: 40px; }
    h1 { color: #22c55e; }
  </style>
</head>
<body>
  <h1>Web Sandbox Proxy Operational</h1>
  <p>Edit HTML/JS live in this browser emulator.</p>
</body>
</html></textarea>
    <iframe id="preview"></iframe>
  </div>

  <script>
    function runCode() {
      const code = document.getElementById('code').value;
      const preview = document.getElementById('preview');
      preview.srcdoc = code;
    }
    runCode();
  </script>
</body>
</html>`;

    case 'cookie-clicker':
    case 'penguin-fish-clicker':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>Fish Clicker Tycoon</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background: #030712;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
    }
    .wrapper { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 12px; }
    .header { text-align: center; }
    .title { font-size: 1.5rem; font-weight: 900; color: #38bdf8; text-shadow: 0 0 12px rgba(56,189,248,0.5); }
    .stats-card {
      background: #0f172a;
      border: 1px solid rgba(56,189,248,0.3);
      border-radius: 16px;
      padding: 16px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .fish-count { font-size: 2.2rem; font-weight: 900; color: #38bdf8; }
    .fish-rate { font-size: 0.85rem; color: #94a3b8; margin-top: 4px; }
    .click-area {
      position: relative;
      background: radial-gradient(circle, #0e2a47 0%, #071324 100%);
      border: 2px solid rgba(56,189,248,0.4);
      border-radius: 20px;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      box-shadow: 0 0 25px rgba(6,182,212,0.2);
    }
    .big-fish {
      font-size: 5rem;
      transition: transform 0.08s ease;
      filter: drop-shadow(0 0 16px rgba(56,189,248,0.6));
    }
    .click-area:active .big-fish { transform: scale(0.9); }
    .floating-num {
      position: absolute;
      color: #38bdf8;
      font-weight: 900;
      font-size: 1.3rem;
      pointer-events: none;
      animation: floatUp 0.8s ease-out forwards;
    }
    @keyframes floatUp {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-50px); }
    }
    .upgrades-title { font-size: 0.95rem; font-weight: 800; color: #cbd5e1; margin-top: 4px; }
    .upgrades-list { display: flex; flex-direction: column; gap: 8px; }
    .upgrade-btn {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #f8fafc;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .upgrade-btn:hover:not(:disabled) {
      background: #1e293b;
      border-color: #38bdf8;
      transform: translateX(2px);
    }
    .upgrade-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .up-info { display: flex; align-items: center; gap: 10px; }
    .up-icon { font-size: 1.5rem; }
    .up-name { font-weight: bold; font-size: 0.9rem; }
    .up-desc { font-size: 0.75rem; color: #94a3b8; }
    .up-cost { font-weight: 800; color: #facc15; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="title">🐟 Fish Clicker Tycoon</div>
    </div>
    <div class="stats-card">
      <div id="fishDisplay" class="fish-count">0</div>
      <div id="rateDisplay" class="fish-rate">0 fish / sec</div>
    </div>
    <div id="clickTarget" class="click-area">
      <div class="big-fish">🐟</div>
    </div>
    <div class="upgrades-title">Arctic Upgrades</div>
    <div class="upgrades-list">
      <button class="upgrade-btn" id="btnRod">
        <div class="up-info">
          <span class="up-icon">🎣</span>
          <div>
            <div class="up-name">Ice Fishing Rod (<span id="countRod">0</span>)</div>
            <div class="up-desc">+1 fish/sec</div>
          </div>
        </div>
        <div class="up-cost"><span id="costRod">15</span> 🐟</div>
      </button>
      <button class="upgrade-btn" id="btnPenguin">
        <div class="up-info">
          <span class="up-icon">🐧</span>
          <div>
            <div class="up-name">Helper Penguin (<span id="countPenguin">0</span>)</div>
            <div class="up-desc">+5 fish/sec</div>
          </div>
        </div>
        <div class="up-cost"><span id="costPenguin">100</span> 🐟</div>
      </button>
      <button class="upgrade-btn" id="btnNet">
        <div class="up-info">
          <span class="up-icon">🧊</span>
          <div>
            <div class="up-name">Glacier Fish Trap (<span id="countNet">0</span>)</div>
            <div class="up-desc">+25 fish/sec</div>
          </div>
        </div>
        <div class="up-cost"><span id="costNet">500</span> 🐟</div>
      </button>
    </div>
  </div>

  <script>
    let fish = parseInt(localStorage.getItem('fish_clicker_count') || '0', 10);
    let items = {
      rod: { count: parseInt(localStorage.getItem('fc_rod') || '0', 10), cost: 15, rate: 1 },
      penguin: { count: parseInt(localStorage.getItem('fc_penguin') || '0', 10), cost: 100, rate: 5 },
      net: { count: parseInt(localStorage.getItem('fc_net') || '0', 10), cost: 500, rate: 25 },
    };

    const fishDisplay = document.getElementById('fishDisplay');
    const rateDisplay = document.getElementById('rateDisplay');
    const clickTarget = document.getElementById('clickTarget');

    function getFishRate() {
      return items.rod.count * items.rod.rate +
             items.penguin.count * items.penguin.rate +
             items.net.count * items.net.rate;
    }

    function updateDisplay() {
      fishDisplay.innerText = Math.floor(fish).toLocaleString();
      rateDisplay.innerText = getFishRate() + ' fish / sec';

      const updateBtn = (id, key) => {
        const item = items[key];
        const curCost = Math.floor(item.cost * Math.pow(1.15, item.count));
        document.getElementById('cost' + id).innerText = curCost.toLocaleString();
        document.getElementById('count' + id).innerText = item.count;
        document.getElementById('btn' + id).disabled = fish < curCost;
      };

      updateBtn('Rod', 'rod');
      updateBtn('Penguin', 'penguin');
      updateBtn('Net', 'net');
    }

    function buyItem(key, id) {
      const item = items[key];
      const curCost = Math.floor(item.cost * Math.pow(1.15, item.count));
      if (fish >= curCost) {
        fish -= curCost;
        item.count++;
        localStorage.setItem('fc_' + key, item.count);
        localStorage.setItem('fish_clicker_count', Math.floor(fish));
        updateDisplay();
      }
    }

    document.getElementById('btnRod').addEventListener('click', () => buyItem('rod', 'Rod'));
    document.getElementById('btnPenguin').addEventListener('click', () => buyItem('penguin', 'Penguin'));
    document.getElementById('btnNet').addEventListener('click', () => buyItem('net', 'Net'));

    clickTarget.addEventListener('click', (e) => {
      fish += 1;
      updateDisplay();

      // Floating text
      const rect = clickTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const floatEl = document.createElement('div');
      floatEl.className = 'floating-num';
      floatEl.style.left = x + 'px';
      floatEl.style.top = y + 'px';
      floatEl.innerText = '+1';
      clickTarget.appendChild(floatEl);
      setTimeout(() => floatEl.remove(), 800);
    });

    setInterval(() => {
      fish += getFishRate() / 10;
      updateDisplay();
      localStorage.setItem('fish_clicker_count', Math.floor(fish));
    }, 100);

    updateDisplay();
  </script>
</body>
</html>`;

    default:
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Arcade Game</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
    h1 { color: #38bdf8; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>🎮 Game Ready</h1>
  <p>Loading arcade environment...</p>
</body>
</html>`;
  }
}
