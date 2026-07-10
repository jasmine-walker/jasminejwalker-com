// ===== XP EASTER EGGS =====

import { loadResume } from '/js/shared.js';
import {
  windowManager,
  openResumeWindow,
  openRoleMatchWindow,
  openRecommendationsWindow,
  openAboutWindow,
  openMyComputerWindow,
  openContactWindow,
} from '/js/xp-windows.js';

async function initEasterEggs() {
  const r = await loadResume();
  if (!r) return;
  setupDesktopIcons(r);
}

const PROJECT_ICON_MAP = [
  { key: 'build journal', icon: '🧱' },
  { key: 'what to watch', icon: '💥' },
  { key: 'wnba',          icon: '🏀' },
];

function getProjectIcon(title) {
  const t = title.toLowerCase();
  for (const { key, icon } of PROJECT_ICON_MAP) {
    if (t.includes(key)) return icon;
  }
  return '🌐';
}

function setupDesktopIcons(r) {
  const iconsContainer = document.getElementById('desktop-icons');
  const rightContainer = document.getElementById('desktop-icons-right');
  if (!iconsContainer) return;

  const icons = [
    { id: 'icon-resume',    icon: '📄', label: 'My Resume',       action: () => openResumeWindow() },
    { id: 'icon-rolematch', icon: '🌐', label: "Why I'm the Fit", action: () => openRoleMatchWindow() },
    { id: 'icon-recs',      icon: '💬', label: 'Recommendations', action: () => openRecommendationsWindow() },
    { id: 'icon-mycomp',   icon: '💻', label: 'My Computer',      action: () => openMyComputerWindow() },
    { id: 'icon-contact',  icon: '📧', label: 'Contact',           action: () => openContactWindow() },
    { id: 'icon-about',    icon: 'ℹ️', label: 'About Jasmine',    action: () => openAboutWindow() },
    { id: 'icon-minesweeper', icon: '💣', label: 'Minesweeper',   action: () => openMinesweeper(r) },
    { id: 'icon-solitaire',   icon: '🃏', label: 'Solitaire',      action: () => openSolitaire() },
    { id: 'icon-recycle',     icon: '🗑️', label: 'Recycle Bin',    action: () => openRecycleBin(r) },
    { id: 'icon-aim',         icon: '🟡', label: 'AOL IM',         action: () => openAIM(r) },
  ];

  const projectShortcuts = (r.projects || [])
    .filter(p => p.liveUrl)
    .map(p => ({
      id: `icon-proj-${p.title.replace(/\s+/g,'-').toLowerCase().slice(0,20)}`,
      icon: getProjectIcon(p.title),
      label: p.title,
      action: () => { window.open(p.liveUrl, '_blank', 'noopener'); trackEvent('xp-project-shortcut'); }
    }));

  iconsContainer.innerHTML = '';

  icons.forEach(def => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.id = def.id;
    el.setAttribute('role', 'listitem');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', def.label);
    el.innerHTML = `<span class="icon-img">${def.icon}</span><span class="icon-label">${def.label}</span>`;

    let clickCount = 0, clickTimer;
    el.addEventListener('click', e => {
      e.stopPropagation();
      el.classList.add('selected');
      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => { clickCount = 0; }, 400);
      } else {
        clearTimeout(clickTimer);
        clickCount = 0;
        def.action();
        trackEvent('xp-icon-open', { icon: def.id });
      }
    });

    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); def.action(); }
    });

    iconsContainer.appendChild(el);
  });

  if (rightContainer && projectShortcuts.length) {
    const label = rightContainer.querySelector('.projects-label');
    rightContainer.innerHTML = '';
    if (label) rightContainer.appendChild(label);

    projectShortcuts.forEach(def => {
      const el = document.createElement('div');
      el.className = 'desktop-icon desktop-icon-project';
      el.id = def.id;
      el.setAttribute('role', 'listitem');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', def.label);
      el.innerHTML = `<span class="icon-img">${def.icon}</span><span class="icon-label">${def.label}</span>`;

      let clickCount = 0, clickTimer;
      el.addEventListener('click', e => {
        e.stopPropagation();
        el.classList.add('selected');
        clickCount++;
        if (clickCount === 1) {
          clickTimer = setTimeout(() => { clickCount = 0; }, 400);
        } else {
          clearTimeout(clickTimer);
          clickCount = 0;
          def.action();
          trackEvent('xp-icon-open', { icon: def.id });
        }
      });

      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); def.action(); }
      });

      rightContainer.appendChild(el);
    });
  }

  const dlBtn = document.getElementById('xp-dl-resume-btn');
  if (dlBtn && r.meta?.resumePdfUrl) {
    dlBtn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = r.meta.resumePdfUrl;
      a.download = 'Jasmine_Walker_Resume.pdf';
      a.target = '_blank';
      a.rel = 'noopener';
      a.click();
      trackEvent('xp-resume-download');
    });
  }

  document.getElementById('xp-desktop')?.addEventListener('click', e => {
    if (!e.target.closest('.desktop-icon')) {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
  });
}

// ---- Minesweeper (hidden facts) ----
function openMinesweeper(r) {
  const facts = r.easterEggs.minesweeper;
  const shuffled = [...facts].sort(() => Math.random() - 0.5);
  const TOTAL = 25, MINES = 10;
  const cells = Array.from({ length: TOTAL }, (_, i) => ({
    isMine: i < MINES,
    fact: shuffled[i % shuffled.length]
  })).sort(() => Math.random() - 0.5);

  let revealed = 0;
  const gridHtml = cells.map((c, i) =>
    `<div class="ms-cell" data-idx="${i}" aria-label="Click to reveal">${c.isMine ? '❓' : '·'}</div>`
  ).join('');

  const win = windowManager.createWindow({
    id: 'minesweeper',
    title: 'Minesweeper — Fun facts about Jasmine',
    icon: '💣',
    width: 300,
    height: 340,
    content: `<div class="minesweeper-body">
      <div class="minesweeper-display">
        <span id="ms-mines">${MINES}</span>
        <span>😊</span>
        <span id="ms-timer">000</span>
      </div>
      <div class="ms-grid" id="ms-grid">${gridHtml}</div>
      <p style="font-size:9px;text-align:center;margin-top:8px;color:#555">Click any cell to reveal a fact about Jasmine!</p>
    </div>`
  });

  let secs = 0;
  const timer = setInterval(() => {
    secs++;
    const el = win.querySelector('#ms-timer');
    if (el) el.textContent = secs.toString().padStart(3, '0');
    else clearInterval(timer);
  }, 1000);

  win.querySelector('#ms-grid')?.addEventListener('click', e => {
    const cell = e.target.closest('.ms-cell');
    if (!cell || cell.classList.contains('revealed')) return;
    const idx = parseInt(cell.dataset.idx);
    cell.classList.add('revealed');
    cell.textContent = cells[idx].fact;
    cell.title = cells[idx].fact;
    revealed++;
    const minesEl = win.querySelector('#ms-mines');
    if (minesEl) minesEl.textContent = Math.max(0, MINES - revealed);
    trackEvent('minesweeper-reveal');
  });

  win.querySelector('.xp-tbtn-close')?.addEventListener('click', () => clearInterval(timer), { once: true });
}

// ---- Solitaire ----
async function openSolitaire() {
  const r = await loadResume();
  const text = r?.easterEggs?.solitaire ?? 'Not now — I\'m reviewing resumes.';
  windowManager.createWindow({
    id: 'solitaire',
    title: 'Solitaire',
    icon: '🃏',
    width: 320,
    height: 260,
    menubar: ['Game', 'Help'],
    content: `<div class="solitaire-body">
      <div class="solitaire-card">${text}</div>
    </div>`
  });
}

// ---- Recycle Bin ----
function openRecycleBin(r) {
  windowManager.createWindow({
    id: 'recycle',
    title: 'Recycle Bin',
    icon: '🗑️',
    width: 340,
    height: 220,
    menubar: ['File', 'Edit', 'View', 'Help'],
    content: `<div class="xp-window-body no-mono" style="background:#fff">
      <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #eee">
        <span style="font-size:2rem">🗑️</span>
        <div>
          <div style="font-size:12px;font-weight:bold">Recycle Bin</div>
          <div style="font-size:10px;color:#555">${r.easterEggs.recycleBin}</div>
        </div>
      </div>
      <div style="padding:16px;font-size:11px;color:#555;font-style:italic;text-align:center">
        This folder is empty.<br/>
        <span style="font-size:10px;color:#999">(So is imposter syndrome around here.)</span>
      </div>
    </div>`
  });
}

// ---- AIM ----
function openAIM(r) {
  const aim = r.easterEggs.aimMessage;
  const messages = aim.messages;

  const win = windowManager.createWindow({
    id: 'aim',
    title: `${aim.screenName} — AOL Instant Messenger`,
    icon: '🟡',
    width: 300,
    height: 320,
    content: `<div style="display:flex;flex-direction:column;flex:1;overflow:hidden">
      <div class="aim-header">
        <img class="aim-avatar" src="/assets/img/jasmine.png" alt="Jasmine Walker" />
        <div>
          <div class="aim-screenname">${aim.screenName}</div>
          <div class="aim-status">● ${aim.status}</div>
        </div>
      </div>
      <div class="aim-messages" id="aim-messages"></div>
      <div class="aim-typing" id="aim-typing">${aim.screenName} is typing…</div>
    </div>`
  });

  const messagesEl = win.querySelector('#aim-messages');
  const typingEl   = win.querySelector('#aim-typing');
  let i = 0;

  function addMsg() {
    if (!messagesEl || i >= messages.length) {
      if (typingEl) typingEl.style.display = 'none';
      return;
    }
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'aim-msg';
      div.innerHTML = `<span class="aim-msg-user">${aim.screenName}:</span> ${messages[i++]}`;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      if (typingEl) typingEl.style.display = i < messages.length ? 'block' : 'none';
      addMsg();
    }, 1200 + Math.random() * 600);
  }

  setTimeout(addMsg, 800);
}

initEasterEggs();
