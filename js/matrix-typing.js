// ===== MATRIX TYPING ANIMATION + MORPHEUS GATE =====

import { loadResume, formatDate } from '/js/shared.js';

trackEvent('view-matrix');

const morpheusEl  = document.getElementById('morpheus-screen');
const morphLines  = document.getElementById('morpheus-lines');
const pillChoiceEl = document.getElementById('pill-choice');
const redPillBtn  = document.getElementById('btn-red-pill');
const bluePillBtn = document.getElementById('btn-blue-pill');

const introEl     = document.getElementById('matrix-intro');
const introLines  = document.getElementById('intro-lines');
const resumeEl    = document.getElementById('matrix-resume');
const resumeInner = document.getElementById('matrix-resume-inner');
const rmpPanel    = document.getElementById('role-match-panel');
const rmpItems    = document.getElementById('rmp-items');
const skipBtn     = document.getElementById('skip-intro');

const MORPHEUS_LINES = [
  '> Hey — I\'m Jasmine.',
  '',
  '> Whatever brought you here — curiosity, an open role,',
  '> a deep LinkedIn rabbit hole — I\'m glad you came.',
  '',
  '> You remember how this part goes. ↓',
];

const INTRO_SEQUENCE = [
  '> NEURAL_HANDSHAKE... ACCEPTED',
  '> DECRYPTING CANDIDATE PROFILE...',
  '> IDENTITY: JASMINE_WALKER',
  '> CLEARANCE: TECHNICAL ENGINEER, APPLICATIONS & SYSTEMS',
  '> YEARS_OF_EXPERIENCE: 11+',
  '> GITHUB: JASMINE-WALKER',
  '> LOADING DOSSIER...',
];

let skipped = false;

// ---- Utilities ----

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function typeInto(el, text, charDelay = 28) {
  return new Promise(resolve => {
    if (skipped) { el.textContent = text; resolve(); return; }
    let i = 0;
    function step() {
      if (skipped) { el.textContent = text; resolve(); return; }
      el.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(step, charDelay);
      else resolve();
    }
    step();
  });
}

function addLine(container, text, cls = 'intro-line') {
  const div = document.createElement('div');
  div.className = cls;
  if (!text) { div.innerHTML = '&nbsp;'; container.appendChild(div); return Promise.resolve(); }
  container.appendChild(div);
  return typeInto(div, text);
}

// ---- Phase 1: Morpheus dialogue ----

async function startMorpheusSequence() {
  for (const line of MORPHEUS_LINES) {
    if (skipped) return;
    await addLine(morphLines, line, 'morpheus-line');
    await delay(line ? 110 : 320);
  }
  if (skipped) return;
  await delay(700);
  showPillChoice();
}

function showPillChoice() {
  if (skipped) return;
  pillChoiceEl?.classList.remove('hidden');
  pillChoiceEl?.classList.add('pill-reveal');
}

// ---- Phase 2: Red pill → terminal sequence ----

async function chooseRedPill() {
  trackEvent('matrix-red-pill');
  morpheusEl?.classList.add('fade-out');
  await delay(500);
  morpheusEl?.classList.add('hidden');
  morpheusEl?.classList.remove('fade-out');
  startTerminalSequence();
}

async function startTerminalSequence() {
  introEl?.classList.remove('hidden');
  introEl?.classList.add('fade-in');
  for (const line of INTRO_SEQUENCE) {
    if (skipped) return;
    await addLine(introLines, line, 'intro-line');
    await delay(160);
  }
  if (skipped) return;
  await delay(600);
  showResume();
}

// ---- Skip: bypass everything ----

function skipAll() {
  skipped = true;
  morpheusEl?.classList.add('hidden');
  introEl?.classList.add('hidden');
  showResume();
}

// ---- Final reveal ----

function showResume() {
  morpheusEl?.classList.add('hidden');
  introEl?.classList.add('hidden');
  resumeEl?.classList.remove('hidden');
  rmpPanel?.classList.remove('hidden');
  revealRoleMatch();
  const dlLink = document.getElementById('matrix-download');
  if (dlLink && window.__resumeData?.meta?.resumePdfUrl) {
    dlLink.href = window.__resumeData.meta.resumePdfUrl;
    dlLink.classList.remove('hidden');
  }
}

// ---- Resume content ----

function renderResumeContent(r) {
  const skillsHtml = `
    <div class="m-skill-row"><span class="m-skill-cat">[LANGUAGES]</span> <span class="m-skill-val">${r.skills.languages.join(' · ')}</span></div>
    <div class="m-skill-row"><span class="m-skill-cat">[FRAMEWORKS]</span> <span class="m-skill-val">${r.skills.frameworks.join(' · ')}</span></div>
    <div class="m-skill-row"><span class="m-skill-cat">[DATABASES]</span> <span class="m-skill-val">${r.skills.databases.join(' · ')}</span></div>
    <div class="m-skill-row"><span class="m-skill-cat">[CLOUD]</span> <span class="m-skill-val">${r.skills.cloud.join(' · ')}</span></div>
    <div class="m-skill-row"><span class="m-skill-cat">[AI & AUTOMATION]</span> <span class="m-skill-val">${r.skills.aiAndAutomation.join(' · ')}</span></div>
    <div class="m-skill-row"><span class="m-skill-cat">[SPOKEN LANGUAGES]</span> <span class="m-skill-val">${r.skills.spokenLanguages.join(' · ')}</span></div>
  `;

  const expHtml = r.experience.map(job => `
    <div class="m-exp-item">
      <div class="m-exp-title">&gt; ${job.title.toUpperCase()}</div>
      <div class="m-exp-meta">${job.company} // ${formatDate(job.startDate)} – ${!job.endDate ? 'Present' : formatDate(job.endDate)} // ${job.location}</div>
      <ul class="m-bullets">
        ${job.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const eduHtml = r.education.map(e => `
    <div class="m-edu-item"><span class="m-strong">&gt; ${e.degree}</span> — ${e.school} (${e.year})</div>
  `).join('');

  const workHtml = r.projects.map(w => `
    <div class="m-work-item"><span class="m-strong">&gt; ${w.title}</span>${w.context ? ` [${w.context}]` : ''} — ${w.description}${w.liveUrl ? ` <a href="${w.liveUrl}" target="_blank" rel="noopener" class="m-link">[LIVE]</a>` : ''}${w.codeUrl ? ` <a href="${w.codeUrl}" target="_blank" rel="noopener" class="m-link">[CODE]</a>` : ''}</div>
  `).join('');

  resumeInner.innerHTML = `
    <div class="m-header">
      <div class="m-header-top">
        <div>
          <div class="m-name">&gt;&gt; ${r.meta.name.toUpperCase()} &lt;&lt;</div>
          <div class="m-tagline">&gt; ${r.meta.tagline}</div>
        </div>
        <img src="/assets/img/jasmine.png" class="m-photo" alt="Jasmine Walker" />
      </div>
      <div class="m-contact">
        <a href="mailto:${r.contact.email}">${r.contact.email}</a>
        <span class="m-sep"> // </span>
        <a href="tel:${r.contact.phone.replace(/\D/g,'')}">${r.contact.phone}</a>
        <span class="m-sep"> // </span>
        <a href="${r.contact.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
        <span class="m-sep"> // </span>
        <a href="${r.contact.github}" target="_blank" rel="noopener">GitHub</a>
        <span class="m-sep"> // </span>
        <span>${r.meta.location}</span>
      </div>
    </div>

    <div class="m-section">
      <div class="m-section-heading">[ SUMMARY ]</div>
      <div class="m-text">${r.summary}</div>
    </div>

    <div class="m-section">
      <div class="m-section-heading">[ SKILLS ]</div>
      ${skillsHtml}
    </div>

    <div class="m-section">
      <div class="m-section-heading">[ EXPERIENCE ]</div>
      ${expHtml}
    </div>

    <div class="m-section">
      <div class="m-section-heading">[ EDUCATION ]</div>
      ${eduHtml}
    </div>

    <div class="m-section">
      <div class="m-section-heading">[ PROJECTS ]</div>
      ${workHtml}
    </div>

    <div class="m-section">
      <div class="m-section-heading">[ INTERESTS ]</div>
      <div class="m-text">${r.interests.join(' / ')}</div>
    </div>

    <div class="m-section">
      <div class="m-section-heading">[ RECOMMENDATIONS ]</div>
      ${r.recommendations.map(rec => `
        <div class="m-rec-item">
          <div class="m-rec-quote">&gt; "${rec.quote}"</div>
          <div class="m-rec-from">  — ${rec.from}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRoleMatch(r) {
  if (!rmpItems) return;
  const matches = r.roleMatch.matches.slice(0, 6);
  rmpItems.innerHTML = matches.map(m => `
    <div class="rmp-item" data-tag="${m.tag}">
      <span class="rmp-check" aria-label="matched">✓</span>
      <span class="rmp-tag">MATCH: ${m.tag}</span>
    </div>
  `).join('');
}

function revealRoleMatch() {
  const checks = document.querySelectorAll('.rmp-check');
  checks.forEach((check, i) => {
    setTimeout(() => check.classList.add('revealed'), 300 + i * 350);
  });
}

// ---- Boot ----

async function init() {
  const r = await loadResume();
  if (!r) return;
  window.__resumeData = r;

  renderResumeContent(r);
  renderRoleMatch(r);

  // On mobile, move the role-match panel inside the scroll container
  // so it flows as content rather than overlapping as a fixed overlay
  if (window.innerWidth <= 480) {
    const inner = document.getElementById('matrix-resume-inner');
    if (inner && rmpPanel) inner.appendChild(rmpPanel);
  }

  skipBtn?.addEventListener('click', skipAll);
  redPillBtn?.addEventListener('click', chooseRedPill);
  bluePillBtn?.addEventListener('click', () => { window.location.href = '/'; });

  startMorpheusSequence();
}

init();
