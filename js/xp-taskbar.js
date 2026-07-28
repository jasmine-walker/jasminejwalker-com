// ===== XP TASKBAR =====

import {
  openResumeWindow,
  openRoleMatchWindow,
  openRecommendationsWindow,
  openAboutWindow,
  openMyComputerWindow,
  openContactWindow,
  openRecDocsWindow,
  openControlPanelWindow,
  openSearchWindow,
  openDialUpWindow,
} from '/js/xp-windows.js';

// ---- Clock ----
function updateClock() {
  const el = document.getElementById('xp-clock');
  if (!el) return;
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  el.textContent = `${h}:${m}`;
  el.title = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
updateClock();
setInterval(updateClock, 10000);

// ---- Start menu ----
const startBtn  = document.getElementById('start-btn');
const startMenu = document.getElementById('start-menu');

startBtn?.addEventListener('click', e => {
  e.stopPropagation();
  const expanded = startBtn.getAttribute('aria-expanded') === 'true';
  startBtn.setAttribute('aria-expanded', String(!expanded));
  startMenu.classList.toggle('hidden');
});

document.addEventListener('click', e => {
  if (!startMenu?.classList.contains('hidden') && !startMenu.contains(e.target) && e.target !== startBtn) {
    startMenu.classList.add('hidden');
    startBtn?.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    startMenu?.classList.add('hidden');
    startBtn?.setAttribute('aria-expanded', 'false');
  }
});

function closeStartMenu() {
  startMenu?.classList.add('hidden');
  startBtn?.setAttribute('aria-expanded', 'false');
}

// ---- Start menu actions ----
startMenu?.addEventListener('click', e => {
  const item = e.target.closest('[data-action]');
  if (!item) return;
  closeStartMenu();
  handleStartAction(item.dataset.action);
});

startMenu?.addEventListener('keydown', e => {
  const item = e.target.closest('[data-action]');
  if (!item) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    closeStartMenu();
    handleStartAction(item.dataset.action);
  }
});

function handleStartAction(action) {
  trackEvent('xp-action', { action });
  switch (action) {
    case 'open-resume':          openResumeWindow(); break;
    case 'open-rolematch':       openRoleMatchWindow(); break;
    case 'open-recommendations': openRecommendationsWindow(); break;
    case 'open-about':           openAboutWindow(); break;
    case 'open-mycomputer':      openMyComputerWindow(); break;
    case 'open-recdocs':         openRecDocsWindow(); break;
    case 'open-contact':         openContactWindow(); break;
    case 'open-controlpanel':    openControlPanelWindow(); break;
    case 'open-search':          openSearchWindow(); break;
    case 'open-bonzi':           openBonziBuddy(); break;
  }
}

// ---- Desktop icon handler (used by easter eggs) ----
export function handleDesktopAction(action) {
  handleStartAction(action);
}

// ---- Log off / Shutdown ----
document.getElementById('logoff-btn')?.addEventListener('click', () => {
  closeStartMenu();
  window.location.href = '/';
});

document.getElementById('shutdown-btn')?.addEventListener('click', () => {
  closeStartMenu();
  const overlay = document.getElementById('shutdown-overlay');
  overlay?.classList.remove('hidden');
  setTimeout(() => { window.location.href = '/'; }, 2500);
});

// ---- Context menu ----
const contextMenu = document.getElementById('desktop-context-menu');
const desktop     = document.getElementById('xp-desktop');

desktop?.addEventListener('contextmenu', e => {
  if (e.target.closest('.xp-window, .xp-taskbar, .start-menu, .clippy')) return;
  e.preventDefault();
  contextMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 160)}px`;
  contextMenu.style.top  = `${Math.min(e.clientY, window.innerHeight - 100)}px`;
  contextMenu?.classList.remove('hidden');
});

document.addEventListener('click', () => contextMenu?.classList.add('hidden'));

contextMenu?.addEventListener('click', e => {
  const item = e.target.closest('[data-action]');
  if (!item) return;
  contextMenu.classList.add('hidden');
  if (item.dataset.action === 'refresh') {
    const d = document.getElementById('xp-desktop');
    d?.classList.add('desktop-shake');
    setTimeout(() => d?.classList.remove('desktop-shake'), 600);
  }
});

// ---- System tray buttons ----
const muteBtn = document.getElementById('mute-btn');
let muted = false;
muteBtn?.addEventListener('click', () => {
  muted = !muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
  muteBtn.title = muted ? 'Unmute' : 'Volume';
});

document.getElementById('network-btn')?.addEventListener('click', () => {
  trackEvent('xp-dialup');
  openDialUpWindow();
});

// ---- Bonzi Buddy ----
function openBonziBuddy() {
  import('/js/xp-windows.js').then(({ windowManager }) => {
    windowManager.createWindow({
      id: 'bonzi',
      title: 'BonziBuddy',
      icon: '🦊',
      width: 280,
      height: 240,
      content: `<div class="xp-window-body no-mono" style="background:#c000c0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:1.5rem;text-align:center">
        <div style="font-size:3rem">🦊</div>
        <div style="font-size:12px;color:#fff;font-family:Tahoma,sans-serif">
          Hi! I'm BonziBuddy!<br/><br/>
          Did you know Jasmine Walker has <strong>11+ years</strong> of enterprise experience?<br/><br/>
          <em style="font-size:10px;opacity:0.8">(just kidding — pure nostalgia)</em>
        </div>
      </div>`
    });
  });
}
