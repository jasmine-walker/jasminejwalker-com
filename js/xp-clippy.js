// ===== CLIPPY =====

import { loadResume } from '/js/shared.js';

const clippy    = document.getElementById('clippy');
const clippyTxt = document.getElementById('clippy-text');
const yesBtn    = document.getElementById('clippy-yes');
const noBtn     = document.getElementById('clippy-no');
const dismissBtn= document.getElementById('clippy-dismiss');

// Use sessionStorage so "Don't show again" resets on each new visit
const DISMISSED_KEY = 'jw-clippy-dismissed';

let tips = [];
let tipIdx = 0;
let tipsLoaded = false;

// Always load tips upfront so buttons always have content
async function loadTips() {
  if (tipsLoaded) return;
  const r = await loadResume();
  if (!r) return;
  tips = r.easterEggs?.clippyTips ?? [];
  tipsLoaded = true;
}

function safeTrack(name) {
  try { if (typeof trackEvent === 'function') trackEvent(name); } catch (_) {}
}

function showClippy() {
  if (!clippy) return;
  if (sessionStorage.getItem(DISMISSED_KEY) === '1') return;
  if (!tips.length) return;
  clippyTxt.textContent = tips[tipIdx % tips.length];
  tipIdx++;
  clippy.classList.remove('hidden');
  safeTrack('clippy-shown');
}

function hideClippy() {
  clippy?.classList.add('hidden');
}

function nextTip() {
  if (!tips.length) return;
  clippyTxt.textContent = tips[tipIdx % tips.length];
  tipIdx++;
}

// ---- Button handlers ----
yesBtn?.addEventListener('click', () => {
  nextTip();
  safeTrack('clippy-yes');
});

noBtn?.addEventListener('click', () => {
  hideClippy();
  // Peek back in after 45 seconds
  setTimeout(() => showClippy(), 45000);
  safeTrack('clippy-no');
});

dismissBtn?.addEventListener('click', () => {
  sessionStorage.setItem(DISMISSED_KEY, '1');
  hideClippy();
  safeTrack('clippy-dismiss');
});

// ---- Show when desktop is ready ----
window.addEventListener('xp-desktop-ready', async () => {
  await loadTips();
  // Small pause so the desktop icons settle first
  setTimeout(() => showClippy(), 800);
});

// ---- Click body image for another tip ----
clippy?.querySelector('.clippy-body')?.addEventListener('click', () => {
  nextTip();
  clippy.classList.remove('hidden');
  safeTrack('clippy-click');
});

// ---- Drag (top/right based to match default position) ----
if (clippy) {
  let dragging = false;
  let startMouseX, startMouseY, startRight, startTop;

  clippy.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    dragging = true;

    const rect = clippy.getBoundingClientRect();
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startRight  = window.innerWidth  - rect.right;
    startTop    = rect.top;

    clippy.style.cursor = 'grabbing';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  function onMove(e) {
    if (!dragging) return;
    const dx = startMouseX - e.clientX;
    const dy = e.clientY - startMouseY;
    const newRight = Math.max(0, Math.min(startRight + dx, window.innerWidth  - clippy.offsetWidth));
    const newTop   = Math.max(0, Math.min(startTop   + dy, window.innerHeight - clippy.offsetHeight - 40));
    clippy.style.right  = newRight + 'px';
    clippy.style.top    = newTop   + 'px';
    clippy.style.left   = 'auto';
    clippy.style.bottom = 'auto';
  }

  function onUp() {
    dragging = false;
    clippy.style.cursor = 'grab';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
}
