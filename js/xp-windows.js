// ===== XP WINDOWS SYSTEM =====

import { loadResume, formatDate } from '/js/shared.js';

function playUiSound(name) {
  try {
    const a = new Audio(`/assets/sounds/${name}`);
    a.volume = 0.3;
    a.play().catch(() => {});
  } catch (_) {}
}

export const windowManager = (() => {
  let zCounter = 100;
  const openWindows = new Map();

  const container  = document.getElementById('windows-container');
  const taskbarWin = document.getElementById('taskbar-windows');

  function bringToFront(win) {
    win.style.zIndex = ++zCounter;
    document.querySelectorAll('.xp-window').forEach(w => {
      w.classList.toggle('active', w === win);
      w.classList.toggle('inactive', w !== win);
    });
    document.querySelectorAll('.taskbar-btn').forEach(b => b.classList.remove('active-window'));
    const entry = [...openWindows.values()].find(e => e.el === win);
    if (entry?.taskbarBtn) entry.taskbarBtn.classList.add('active-window');
  }

  function makeDraggable(win, handle) {
    let startX, startY, initLeft, initTop;

    handle.addEventListener('mousedown', onMouseDown);
    handle.addEventListener('touchstart', onTouchStart, { passive: false });

    function onMouseDown(e) {
      if (e.target.closest('.xp-tbtn')) return;
      e.preventDefault();
      startX = e.clientX; startY = e.clientY;
      initLeft = win.offsetLeft; initTop = win.offsetTop;
      bringToFront(win);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function onTouchStart(e) {
      if (e.target.closest('.xp-tbtn')) return;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      initLeft = win.offsetLeft; initTop = win.offsetTop;
      bringToFront(win);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    }

    function move(dx, dy) {
      const maxLeft = window.innerWidth - 80;
      const maxTop  = window.innerHeight - 80;
      win.style.left = Math.max(0, Math.min(maxLeft, initLeft + dx)) + 'px';
      win.style.top  = Math.max(0, Math.min(maxTop,  initTop  + dy)) + 'px';
    }

    const onMouseMove = e => move(e.clientX - startX, e.clientY - startY);
    const onTouchMove = e => { e.preventDefault(); const t = e.touches[0]; move(t.clientX - startX, t.clientY - startY); };
    const onMouseUp  = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    const onTouchEnd = () => { document.removeEventListener('touchmove', onTouchMove); document.removeEventListener('touchend', onTouchEnd); };
  }

  function makeResizable(win) {
    const handle = win.querySelector('.xp-resize-handle');
    if (!handle) return;
    let startX, startY, startW, startH;
    handle.addEventListener('mousedown', e => {
      e.preventDefault();
      startX = e.clientX; startY = e.clientY;
      startW = win.offsetWidth; startH = win.offsetHeight;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    const onMove = e => {
      win.style.width  = Math.max(250, startW + e.clientX - startX) + 'px';
      win.style.height = Math.max(150, startH + e.clientY - startY) + 'px';
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }

  function addTaskbarBtn(id, icon, title) {
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn';
    btn.dataset.windowId = id;
    btn.innerHTML = `<span>${icon}</span> ${title}`;
    btn.addEventListener('click', () => {
      const entry = openWindows.get(id);
      if (!entry) return;
      const win = entry.el;
      if (win.style.display === 'none') {
        win.style.display = 'flex';
      }
      bringToFront(win);
    });
    taskbarWin?.appendChild(btn);
    return btn;
  }

  function createWindow({ id, title, icon = '📄', width = 480, height = 360, content, left, top, menubar, toolbar }) {
    if (openWindows.has(id)) {
      const entry = openWindows.get(id);
      if (entry.el.style.display === 'none') entry.el.style.display = 'flex';
      bringToFront(entry.el);
      return entry.el;
    }

    playUiSound('ding.wav');

    const win = document.createElement('div');
    win.className = 'xp-window active';
    win.dataset.windowId = id;
    win.style.cssText = `
      width:${width}px; height:${height}px;
      left:${left ?? Math.max(20, (window.innerWidth - width) / 2 + (Math.random() * 60 - 30))}px;
      top:${top ?? Math.max(20, (window.innerHeight - height) / 2 + (Math.random() * 60 - 30) - 40)}px;
      z-index:${++zCounter};
    `;

    const menubarHtml = menubar ? `
      <div class="xp-window-menubar" role="menubar">
        ${menubar.map(m => `<div class="xp-menu-item" role="menuitem" tabindex="-1">${m}</div>`).join('')}
      </div>` : '';

    const toolbarHtml = toolbar ? `
      <div class="xp-window-toolbar" role="toolbar">
        ${toolbar.map(t => `<button class="xp-toolbar-btn">${t}</button>`).join('')}
      </div>` : '';

    win.innerHTML = `
      <div class="xp-titlebar">
        <span class="xp-titlebar-icon">${icon}</span>
        <span class="xp-titlebar-title">${title}</span>
        <div class="xp-titlebar-buttons">
          <button class="xp-tbtn xp-tbtn-min" aria-label="Minimize" title="Minimize">─</button>
          <button class="xp-tbtn xp-tbtn-max" aria-label="Maximize" title="Maximize">□</button>
          <button class="xp-tbtn xp-tbtn-close" aria-label="Close window" title="Close">✕</button>
        </div>
      </div>
      ${menubarHtml}${toolbarHtml}
      ${content}
      <div class="xp-resize-handle" aria-hidden="true"></div>
    `;

    container.appendChild(win);

    const titlebar = win.querySelector('.xp-titlebar');
    makeDraggable(win, titlebar);
    makeResizable(win);
    win.addEventListener('mousedown', () => bringToFront(win), true);

    win.querySelector('.xp-tbtn-close').addEventListener('click', () => closeWindow(id));

    let minimized = false, maximized = false, savedStyle = {};
    win.querySelector('.xp-tbtn-min').addEventListener('click', () => {
      minimized = !minimized;
      win.style.display = minimized ? 'none' : 'flex';
      if (!minimized) bringToFront(win);
    });
    win.querySelector('.xp-tbtn-max').addEventListener('click', () => {
      if (!maximized) {
        savedStyle = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
        win.style.cssText += 'left:0;top:0;width:100%;height:calc(100vh - 44px);';
        maximized = true;
      } else {
        Object.assign(win.style, savedStyle);
        maximized = false;
      }
    });

    const taskbarBtn = addTaskbarBtn(id, icon, title);
    document.querySelectorAll('.xp-window').forEach(w => {
      w.classList.toggle('active', w === win);
      w.classList.toggle('inactive', w !== win);
    });
    document.querySelectorAll('.taskbar-btn').forEach(b => b.classList.remove('active-window'));
    taskbarBtn.classList.add('active-window');

    openWindows.set(id, { el: win, taskbarBtn });
    return win;
  }

  function closeWindow(id) {
    const entry = openWindows.get(id);
    if (!entry) return;
    playUiSound('close.wav');
    entry.el.remove();
    entry.taskbarBtn?.remove();
    openWindows.delete(id);
  }

  function isOpen(id) { return openWindows.has(id); }

  return { createWindow, closeWindow, bringToFront, isOpen };
})();

// ---- Window content builders ----

export async function openResumeWindow() {
  const r = await loadResume();
  if (!r) return;

  const lines = [
    `JASMINE WALKER`,
    `${r.meta.tagline}`,
    `${r.meta.location} | ${r.contact.email} | ${r.contact.phone}`,
    ``,
    `SUMMARY`,
    `-------`,
    r.summary,
    ``,
    `EXPERIENCE`,
    `----------`,
    ...r.experience.flatMap(job => [
      `${job.title} @ ${job.company} (${formatDate(job.startDate)} – ${!job.endDate ? 'Present' : formatDate(job.endDate)})`,
      ...job.bullets.map(b => `  • ${b}`),
      ``
    ]),
    `EDUCATION`,
    `---------`,
    ...r.education.map(e => `${e.degree} — ${e.school} (${e.year})`),
    ``,
    `SKILLS`,
    `------`,
    `Languages: ${r.skills.languages.join(', ')}`,
    `Frameworks & Tools: ${r.skills.frameworks.join(', ')}`,
    `Databases: ${r.skills.databases.join(', ')}`,
    `Cloud & Deployment: ${r.skills.cloud.join(', ')}`,
    `AI & Automation: ${r.skills.aiAndAutomation.join(', ')}`,
    `Spoken Languages: ${r.skills.spokenLanguages.join(', ')}`,
    ``,
    `INTERESTS`,
    `---------`,
    r.interests.join(', '),
  ].join('\n');

  windowManager.createWindow({
    id: 'resume',
    title: 'My_Resume.txt — Notepad',
    icon: '📄',
    width: 560,
    height: 420,
    menubar: ['File', 'Edit', 'Format', 'View', 'Help'],
    content: `<div class="notepad-body" tabindex="0" role="document" aria-label="Resume document">${escHtml(lines)}</div>`
  });
}

export async function openRoleMatchWindow() {
  const r = await loadResume();
  if (!r) return;

  const matchRows = r.roleMatch.matches.map(m => `
    <div class="ie6-match-row">
      <span class="ie6-check">&#10003;</span>
      <span><span class="ie6-need">${m.need}</span> — ${m.evidence}</span>
    </div>
  `).join('');

  windowManager.createWindow({
    id: 'rolematch',
    title: 'Why_Im_The_Fit.html — Internet Explorer',
    icon: '🌐',
    width: 520,
    height: 480,
    menubar: ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'],
    toolbar: ['⬅ Back', '➡ Forward', '⟳ Refresh', '🏠 Home'],
    content: `<div class="ie6-body">
      <div class="ie6-title">Why Jasmine Walker is the Right Fit</div>
      <div class="ie6-section">
        <h3>Role Requirements → Evidence</h3>
        ${matchRows}
      </div>
      <div class="ie6-counter">
        ${r.roleMatch.matchScore != null ? `Match Score: ${r.roleMatch.matchScore}% &nbsp;|&nbsp; ` : ''}${r.roleMatch.matches.length} requirements matched
      </div>
    </div>`
  });
}

export async function openRecommendationsWindow() {
  const r = await loadResume();
  if (!r) return;

  const recs = r.recommendations.map((rec, i) => `
RECOMMENDATION ${i + 1}
${'-'.repeat(20)}
"${rec.quote}"

— ${rec.from}

`).join('\n');

  const ctaLine = `\n${'='.repeat(50)}\nLIKE WHAT YOU SEE? LET'S CONNECT.\njasminewalkerj@outlook.com | linkedin.com/in/jasminejwalker\n${'='.repeat(50)}`;

  windowManager.createWindow({
    id: 'recommendations',
    title: 'Recommendations.txt — Notepad',
    icon: '💬',
    width: 500,
    height: 360,
    menubar: ['File', 'Edit', 'Format', 'View', 'Help'],
    content: `<div class="notepad-body" tabindex="0" role="document" aria-label="Recommendations">${escHtml(recs + ctaLine)}</div>`
  });
}

export async function openAboutWindow() {
  const r = await loadResume();
  if (!r) return;

  const lines = r.easterEggs.aboutPanel.lines;

  windowManager.createWindow({
    id: 'about',
    title: `About ${r.meta.name}`,
    icon: 'ℹ️',
    width: 360,
    height: 300,
    content: `<div class="xp-window-body no-mono" style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1.5rem;text-align:center">
      <img src="/assets/img/jasmine.png" style="width:80px;height:80px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #ccc;" alt="Jasmine Walker" />
      <div style="font-size:13px;font-weight:bold;font-family:Tahoma,sans-serif">${r.meta.name}</div>
      <div style="border:1px solid #ccc;width:100%;height:1px;margin:0.25rem 0"></div>
      <div style="font-family:Tahoma,sans-serif;font-size:11px;line-height:1.8;color:#333">
        ${lines.map(l => `<div>${escHtml(l)}</div>`).join('')}
      </div>
      <button class="xp-btn" onclick="this.closest('.xp-window').querySelector('.xp-tbtn-close').click()" style="margin-top:0.5rem">OK</button>
    </div>`
  });
}

export function openMyComputerWindow() {
  const folders = [
    { icon: '📁', label: 'Experience',  action: 'open-folder-exp' },
    { icon: '📁', label: 'Skills',       action: 'open-folder-skills' },
    { icon: '📁', label: 'Education',   action: 'open-folder-edu' },
    { icon: '📁', label: 'Projects',    action: 'open-folder-proj' },
    { icon: '💿', label: 'Resume.iso',  action: 'open-resume' },
    { icon: '📄', label: 'Resume.txt',  action: 'open-resume' },
  ];

  const win = windowManager.createWindow({
    id: 'mycomputer',
    title: 'My Computer',
    icon: '💻',
    width: 460,
    height: 320,
    menubar: ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'],
    toolbar: ['⬅ Back', '➡ Forward', '⬆ Up'],
    content: `<div style="display:flex;flex:1;overflow:hidden">
      <div class="xp-explorer-sidebar">
        <div class="xp-explorer-sidebar-title">System Tasks</div>
        <div class="sidebar-link" data-action="open-resume">📄 View resume</div>
        <div class="sidebar-link" data-action="open-contact">📧 Contact Jasmine</div>
        <div class="xp-explorer-sidebar-title" style="margin-top:12px;">Other Places</div>
        <div class="sidebar-link" data-action="open-rolematch">🌐 Why I'm the Fit</div>
      </div>
      <div class="xp-explorer-main" id="mycomp-main">
        ${folders.map(f => `<div class="xp-folder-item" data-action="${f.action}"><span class="xp-folder-icon">${f.icon}</span><span class="xp-folder-label">${f.label}</span></div>`).join('')}
      </div>
    </div>`
  });

  // Wire folder clicks
  win.querySelectorAll('[data-action]').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('dblclick', () => handleFolderAction(el.dataset.action));
    el.addEventListener('click', e => {
      win.querySelectorAll('.xp-folder-item').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleFolderAction(el.dataset.action);
    });
  });

  win.querySelectorAll('.sidebar-link').forEach(el => {
    el.addEventListener('click', () => handleFolderAction(el.dataset.action));
  });
}

async function handleFolderAction(action) {
  const r = await loadResume();
  switch (action) {
    case 'open-resume':     openResumeWindow(); break;
    case 'open-rolematch':  openRoleMatchWindow(); break;
    case 'open-contact':    openContactWindow(); break;
    case 'open-folder-exp':
      if (!r) return;
      windowManager.createWindow({
        id: 'folder-exp',
        title: 'Experience — File Folder',
        icon: '📁',
        width: 460,
        height: 320,
        menubar: ['File', 'Edit', 'View', 'Help'],
        content: `<div class="xp-window-body no-mono" style="padding:0.75rem;overflow:auto">
          ${r.experience.map(job => `
            <div style="margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid #eee;">
              <div style="font-weight:bold;font-size:11px">${job.title} @ ${job.company}</div>
              <div style="font-size:10px;color:#555;margin-bottom:4px">${formatDate(job.startDate)} – ${!job.endDate ? 'Present' : formatDate(job.endDate)} · ${job.location}</div>
              <ul style="margin:0;padding-left:1rem;font-size:10px;color:#333;line-height:1.6">
                ${job.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>`
      });
      break;
    case 'open-folder-skills':
      if (!r) return;
      windowManager.createWindow({
        id: 'folder-skills',
        title: 'Skills — File Folder',
        icon: '📁',
        width: 400,
        height: 280,
        menubar: ['File', 'Edit', 'View', 'Help'],
        content: `<div class="xp-window-body no-mono" style="padding:0.75rem;overflow:auto">
          ${Object.entries(r.skills).map(([cat, vals]) => `
            <div style="margin-bottom:8px;font-size:11px;">
              <span style="font-weight:bold;color:#316ac5;text-transform:capitalize">${cat.replace(/([A-Z])/g,' $1')}: </span>
              <span style="color:#333">${vals.join(', ')}</span>
            </div>
          `).join('')}
        </div>`
      });
      break;
    case 'open-folder-edu':
      if (!r) return;
      windowManager.createWindow({
        id: 'folder-edu',
        title: 'Education — File Folder',
        icon: '📁',
        width: 380,
        height: 240,
        menubar: ['File', 'Edit', 'View', 'Help'],
        content: `<div class="xp-window-body no-mono" style="padding:0.75rem">
          ${r.education.map(e => `
            <div style="margin-bottom:12px;font-size:11px">
              <div style="font-weight:bold">${e.degree}</div>
              <div style="color:#555">${e.school} · ${e.year} · ${e.location}</div>
            </div>
          `).join('')}
        </div>`
      });
      break;
    case 'open-folder-proj':
      if (!r) return;
      windowManager.createWindow({
        id: 'folder-proj',
        title: 'Projects — File Folder',
        icon: '📁',
        width: 480,
        height: 360,
        menubar: ['File', 'Edit', 'View', 'Help'],
        content: `<div class="xp-window-body no-mono" style="padding:0.75rem;overflow:auto">
          ${r.projects.map(w => `
            <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #eee;font-size:11px">
              <div style="font-weight:bold;font-size:12px">${w.title}${w.context ? ` <span style="font-weight:normal;color:#666">— ${w.context}</span>` : ''}</div>
              <div style="color:#333;margin-top:4px;line-height:1.5">${w.description}</div>
              <div style="margin-top:6px;display:flex;gap:6px">
                ${w.liveUrl ? `<a href="${w.liveUrl}" target="_blank" rel="noopener" style="color:#316ac5;font-size:10px;text-decoration:underline" onclick="trackEvent('xp-project-live')">🌐 Live Site</a>` : ''}
                ${w.codeUrl ? `<a href="${w.codeUrl}" target="_blank" rel="noopener" style="color:#316ac5;font-size:10px;text-decoration:underline" onclick="trackEvent('xp-project-code')">💻 View Code</a>` : ''}
              </div>
            </div>
          `).join('')}
        </div>`
      });
      break;
  }
}

export async function openContactWindow() {
  const r = await loadResume();
  const links = r ? [
    { icon: '📧', label: r.contact.email,     href: `mailto:${r.contact.email}` },
    { icon: '🔗', label: 'LinkedIn',            href: r.contact.linkedin },
    { icon: '💻', label: 'GitHub',              href: r.contact.github },
    { icon: '📞', label: r.contact.phone,      href: `tel:${r.contact.phone.replace(/\D/g,'')}` },
    { icon: '🌐', label: r.meta.website,       href: `https://${r.meta.website}` },
  ] : [];

  const rows = links.map(l => `
    <div class="outlook-contact-row">
      <span class="outlook-contact-icon">${l.icon}</span>
      <a href="${l.href}" target="_blank" rel="noopener" class="outlook-contact-link" onclick="trackEvent('contact-click')">${l.label}</a>
    </div>
  `).join('');

  windowManager.createWindow({
    id: 'contact',
    title: 'New Message — Outlook Express',
    icon: '📧',
    width: 380,
    height: 300,
    menubar: ['File', 'Edit', 'View', 'Message', 'Help'],
    content: `
      <div class="outlook-header">
        <div><span class="outlook-label">To:</span> Jasmine Walker &lt;jasminewalkerj@outlook.com&gt;</div>
        <div><span class="outlook-label">Subject:</span> I'd like to connect!</div>
      </div>
      <div class="outlook-body">
        <p style="margin-bottom:12px;font-size:11px;">Reach out through any of the following:</p>
        ${rows}
      </div>
    `
  });
}

export function openRecDocsWindow() {
  const docs = [
    { icon: '📄', name: 'My_Resume.txt' },
    { icon: '🌐', name: 'Why_Im_The_Fit.html' },
    { icon: '💬', name: 'Recommendations.txt' },
    { icon: '📁', name: 'Digital_Forensics_Thesis' },
    { icon: '📄', name: 'Tech_Sassy_Girlz_Curriculum.doc' },
  ];

  const win = windowManager.createWindow({
    id: 'recdocs',
    title: 'Recent Documents',
    icon: '📁',
    width: 380,
    height: 280,
    menubar: ['File', 'Edit', 'View', 'Help'],
    content: `<div class="xp-explorer-main">
      ${docs.map(d => `<div class="xp-folder-item" data-doc="${d.name}"><span class="xp-folder-icon">${d.icon}</span><span class="xp-folder-label">${d.name}</span></div>`).join('')}
    </div>`
  });

  win.querySelectorAll('[data-doc]').forEach(el => {
    el.addEventListener('dblclick', () => {
      const doc = el.dataset.doc;
      if (doc.includes('Resume')) openResumeWindow();
      else if (doc.includes('Fit'))   openRoleMatchWindow();
      else if (doc.includes('Recommendations')) openRecommendationsWindow();
    });
  });
}

export function openControlPanelWindow() {
  const items = [
    { icon: '🖥️', label: 'Display' },
    { icon: '🔊', label: 'Sound' },
    { icon: '🌐', label: 'Network' },
    { icon: '🔐', label: 'Security' },
    { icon: '👤', label: 'User Accounts' },
    { icon: '⏰', label: 'Date & Time' },
    { icon: '⌨️', label: 'Keyboard' },
    { icon: '🖱️', label: 'Mouse' },
    { icon: '🖨️', label: 'Printers' },
    { icon: '🔋', label: 'Power Options' },
  ];

  windowManager.createWindow({
    id: 'controlpanel',
    title: 'Control Panel',
    icon: '⚙️',
    width: 420,
    height: 320,
    menubar: ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'],
    content: `<div class="cp-body">
      ${items.map(i => `<div class="cp-item"><span class="cp-icon">${i.icon}</span><span class="cp-label">${i.label}</span></div>`).join('')}
    </div>`
  });
}

export function openSearchWindow() {
  windowManager.createWindow({
    id: 'search',
    title: 'Search Results',
    icon: '🔍',
    width: 360,
    height: 280,
    menubar: ['File', 'Edit', 'View', 'Help'],
    content: `<div class="xp-window-body no-mono" style="padding:1rem">
      <p style="font-size:12px;margin-bottom:12px;">🔍 Search Results for "ideal candidate"</p>
      <div style="background:#e8f0fc;border:1px solid #7a9fcf;border-radius:2px;padding:8px;font-size:11px;margin-bottom:8px;">
        <strong>1 result found</strong>
      </div>
      <div style="font-size:11px;color:#316ac5;cursor:pointer;margin-bottom:6px;">📄 <u>Jasmine Walker — Resume.txt</u></div>
      <div style="font-size:10px;color:#555;margin-left:16px;">Application developer &amp; systems engineer · 10+ years · High Springs, FL · Match: <strong>94.7%</strong></div>
    </div>`
  });
}

export function openDialUpWindow() {
  const win = windowManager.createWindow({
    id: 'dialup',
    title: 'Connecting to Jasmine Walker… — Network Connections',
    icon: '🌐',
    width: 320,
    height: 240,
    content: `<div class="xp-window-body no-mono" style="padding:1rem;display:flex;flex-direction:column;align-items:center;gap:0.75rem;text-align:center">
      <div style="font-size:1.5rem">📡</div>
      <div style="font-size:12px;font-weight:bold;font-family:Tahoma,sans-serif">Connecting to jasminejwalker.com…</div>
      <div id="dialup-status" style="font-size:10px;color:#555;font-family:Tahoma,sans-serif">Dialing…</div>
      <div class="boot-bar-wrap" style="width:100%;height:8px;background:#ddd;border-radius:4px;overflow:hidden;border:1px solid #bbb">
        <div id="dialup-bar" class="boot-bar" style="width:0%;background:linear-gradient(90deg,#316ac5,#6fa0e0,#316ac5);background-size:200%;animation:boot-shimmer 0.8s linear infinite;height:100%;transition:width 0.4s"></div>
      </div>
      <div style="font-size:10px;color:#888;font-family:Tahoma,sans-serif" id="dialup-speed">0 bps</div>
      <button class="xp-btn" id="dialup-cancel" style="margin-top:0.25rem">Cancel</button>
    </div>`
  });

  const status = win.querySelector('#dialup-status');
  const bar    = win.querySelector('#dialup-bar');
  const speed  = win.querySelector('#dialup-speed');
  const steps = [
    { pct: 15, label: 'Dialing…', bps: '1,200 bps', delay: 400 },
    { pct: 30, label: 'Connecting…', bps: '14,400 bps', delay: 700 },
    { pct: 55, label: 'Verifying credentials…', bps: '28,800 bps', delay: 600 },
    { pct: 75, label: 'Negotiating protocols…', bps: '33,600 bps', delay: 500 },
    { pct: 90, label: 'Authenticating…', bps: '56,000 bps', delay: 400 },
    { pct: 100, label: 'Connected! ✓ jasminejwalker.com', bps: '56,000 bps', delay: 400 },
  ];

  let i = 0;
  function runStep() {
    if (i >= steps.length) return;
    const step = steps[i++];
    setTimeout(() => {
      if (!document.getElementById('dialup-status')) return;
      status.textContent = step.label;
      bar.style.width = step.pct + '%';
      speed.textContent = step.bps;
      if (i < steps.length) runStep();
      else {
        setTimeout(() => {
          if (document.getElementById('dialup-status')) {
            openContactWindow();
          }
        }, 1200);
      }
    }, step.delay);
  }

  runStep();
  win.querySelector('#dialup-cancel')?.addEventListener('click', () => windowManager.closeWindow('dialup'));
}

// CSS for sidebar links
const style = document.createElement('style');
style.textContent = `.sidebar-link{font-size:10px;color:#316ac5;cursor:pointer;margin-bottom:4px;padding:2px 4px;border-radius:2px}.sidebar-link:hover{background:rgba(49,106,197,0.1);text-decoration:underline}`;
document.head.appendChild(style);

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
