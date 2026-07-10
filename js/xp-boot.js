// ===== XP BOOT SEQUENCE =====

import { loadResume } from '/js/shared.js';

trackEvent('view-xp');

const splash    = document.getElementById('xp-splash');
const bootEl    = document.getElementById('xp-boot');
const bootBar   = document.getElementById('boot-bar');
const desktopEl = document.getElementById('xp-desktop');
const ctaEl     = document.getElementById('contact-cta');

function playSound(name) {
  try {
    const audio = new Audio(`/assets/sounds/${name}`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch (_) {}
}

function startBoot() {
  splash.classList.add('hidden');
  bootEl.classList.remove('hidden');

  playSound('startup.wav');

  // Animate progress bar
  let pct = 0;
  const steps = [
    { target: 20, delay: 300 },
    { target: 45, delay: 500 },
    { target: 70, delay: 700 },
    { target: 90, delay: 400 },
    { target: 100, delay: 300 },
  ];

  async function runSteps() {
    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay));
      pct = step.target;
      bootBar.style.width = `${pct}%`;
    }
    // Done — show desktop
    await new Promise(r => setTimeout(r, 500));
    showDesktop();
  }

  runSteps();
}

function showDesktop() {
  bootEl.classList.add('hidden');
  desktopEl.classList.remove('hidden');
  ctaEl?.classList.remove('hidden');

  // Signal that the desktop is ready (xp-clippy.js listens for this)
  window.dispatchEvent(new CustomEvent('xp-desktop-ready'));
}

// ---- Splash click ----
splash?.addEventListener('click', startBoot);
splash?.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') startBoot();
});

// Preload resume in background
loadResume();
