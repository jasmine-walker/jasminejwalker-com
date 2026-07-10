// ===== MATRIX RAIN — MOVIE ACCURATE =====

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let FONT_SIZE = 16;
let baseSpeed = 0.3;
let density = 1.0;
let cols, drops, trailLengths, colSpeeds;

// Half-width katakana (the real Matrix characters) + a few digits
const KATAKANA = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
const CHARS = KATAKANA + '012345789';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) baseSpeed = 0.1;

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / FONT_SIZE);
  drops       = Array.from({ length: cols }, () => Math.random() * -(canvas.height / FONT_SIZE) * 2);
  trailLengths = Array.from({ length: cols }, () => 8 + Math.floor(Math.random() * 28));
  colSpeeds    = Array.from({ length: cols }, () => baseSpeed * (0.4 + Math.random() * 1.2));
}

resize();
window.addEventListener('resize', resize);

// Target ~20fps for the cinematic slow feel
let lastFrame = 0;
const FRAME_MS = 1000 / 20;

function drawRain(ts) {
  if (ts - lastFrame < FRAME_MS) return;
  lastFrame = ts;

  // Very slow fade — lets long trails linger
  ctx.fillStyle = prefersReduced ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.045)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${FONT_SIZE}px "Courier New", monospace`;

  for (let i = 0; i < cols; i++) {
    if (density < 1.0 && (i % Math.round(1 / density)) !== 0) continue;

    const headPx = Math.floor(drops[i]) * FONT_SIZE;
    const x = i * FONT_SIZE;

    if (headPx > -FONT_SIZE && headPx < canvas.height + FONT_SIZE) {
      const tl = trailLengths[i];

      // Draw trail from tail to just-behind-head
      for (let t = tl; t >= 2; t--) {
        const ty = headPx - t * FONT_SIZE;
        if (ty < -FONT_SIZE || ty > canvas.height) continue;
        const ratio = 1 - t / tl;          // 0 at tail → 1 near head
        const alpha = ratio * 0.85;
        const green = Math.floor(80 + 175 * ratio);
        ctx.fillStyle = `rgba(0,${green},15,${alpha})`;
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, ty);
      }

      // Bright green just behind head
      const nearY = headPx - FONT_SIZE;
      if (nearY >= 0 && nearY <= canvas.height) {
        ctx.fillStyle = 'rgba(0,255,65,0.92)';
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, nearY);
      }

      // White glowing head character
      if (headPx >= 0 && headPx <= canvas.height) {
        if (!prefersReduced) {
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur  = 14;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, headPx);
        ctx.shadowBlur = 0;
      }
    }

    drops[i] += colSpeeds[i];

    if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
      drops[i]       = Math.random() * -(canvas.height / FONT_SIZE) * 0.8;
      trailLengths[i] = 8 + Math.floor(Math.random() * 28);
      colSpeeds[i]    = baseSpeed * (0.4 + Math.random() * 1.2);
    }
  }
}

function loop(ts) {
  drawRain(ts);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Speed controls
document.getElementById('rain-faster')?.addEventListener('click', () => {
  baseSpeed = Math.min(baseSpeed + 0.1, 1.5);
  colSpeeds = colSpeeds.map(s => Math.min(s + 0.1, 2.0));
});
document.getElementById('rain-slower')?.addEventListener('click', () => {
  baseSpeed = Math.max(baseSpeed - 0.1, 0.05);
  colSpeeds = colSpeeds.map(s => Math.max(s - 0.1, 0.05));
});

// Density toggle
let densityIdx = 0;
const densityLevels = [1.0, 0.6, 0.35];
const densityLabels = ['Dense', 'Medium', 'Sparse'];
const densityBtn = document.getElementById('rain-density');
densityBtn?.addEventListener('click', () => {
  densityIdx = (densityIdx + 1) % densityLevels.length;
  density = densityLevels[densityIdx];
  densityBtn.title = densityLabels[densityIdx];
  densityBtn.setAttribute('aria-label', `Rain density: ${densityLabels[densityIdx]}`);
});

export { baseSpeed as speed, density };
