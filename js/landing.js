// ===== LANDING PAGE JS =====

import { generateFavicons, setFavicon, loadResume } from '/js/shared.js';

// Set plain favicon for landing
const favicons = generateFavicons();
setFavicon(favicons.plain);

// ---- Contact bar ----
async function renderContactBar() {
  const r = await loadResume();
  if (!r) return;
  const el = document.getElementById('landing-contact');
  if (!el) return;
  el.innerHTML = `
    <div class="lc-featured">
      <a href="${r.contact.linkedin}" target="_blank" rel="noopener" class="lc-pill lc-linkedin" onclick="trackEvent('landing-linkedin')">
        <svg class="lc-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>
      <a href="${r.contact.github}" target="_blank" rel="noopener" class="lc-pill lc-github" onclick="trackEvent('landing-github')">
        <svg class="lc-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
        GitHub
      </a>
    </div>
    <div class="lc-secondary">
      <a href="mailto:${r.contact.email}" class="lc-link" onclick="trackEvent('landing-email')">${r.contact.email}</a>
      <span class="lc-sep">·</span>
      <a href="tel:${r.contact.phone.replace(/\D/g,'')}" class="lc-link" onclick="trackEvent('landing-phone')">${r.contact.phone}</a>
      <span class="lc-sep">·</span>
      <a href="https://${r.meta.website}" target="_blank" rel="noopener" class="lc-link" onclick="trackEvent('landing-website')">${r.meta.website}</a>
      <span class="lc-sep">·</span>
      <a href="${r.meta.resumePdfUrl}" download="Jasmine_Walker_Resume.pdf" target="_blank" rel="noopener" class="lc-link lc-link-download" onclick="trackEvent('landing-resume-download')">↓ Resume</a>
    </div>
  `;
}

renderContactBar();

// ---- Typing intro ----
const FULL_NAME = 'Jasmine Walker';
const INTRO_OVERLAY = document.getElementById('intro-overlay');
const INTRO_TEXT = document.getElementById('intro-text');
const PICKER = document.getElementById('picker');

function showPicker() {
  PICKER.classList.remove('hidden');
  if (INTRO_OVERLAY) {
    INTRO_OVERLAY.classList.add('fade-out');
    setTimeout(() => {
      INTRO_OVERLAY.style.display = 'none';
    }, 500);
  }
  startMiniRain();
}

const alreadySeen = sessionStorage.getItem('jw-intro-done');

if (alreadySeen) {
  // Skip intro
  if (INTRO_OVERLAY) INTRO_OVERLAY.style.display = 'none';
  PICKER.classList.remove('hidden');
  startMiniRain();
} else {
  // Type out name
  let idx = 0;
  const CHAR_DELAY = 1500 / FULL_NAME.length;

  function typeNext() {
    if (idx <= FULL_NAME.length) {
      INTRO_TEXT.textContent = FULL_NAME.slice(0, idx);
      idx++;
      setTimeout(typeNext, CHAR_DELAY);
    } else {
      // Hold 0.5s then show picker
      setTimeout(() => {
        sessionStorage.setItem('jw-intro-done', '1');
        showPicker();
      }, 500);
    }
  }

  typeNext();
}

// ---- Card keyboard navigation ----
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = card.getAttribute('href');
    }
  });
});

// ---- Mini matrix rain on the card ----
function startMiniRain() {
  const canvas = document.getElementById('mini-rain');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const FONT_SIZE = 10;
  const COLS = Math.floor(W / FONT_SIZE);
  const drops = Array.from({ length: COLS }, () => Math.random() * -H / FONT_SIZE);

  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01アｱｲｳｴｵｶｷｸｹｺABCDEFGHIJ';

  let speed = 0.3;
  let animId;
  let lastFrame = 0;
  const FRAME_MS = 1000 / 20; // ~20fps — matches the Matrix page

  // Check reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.font = `${FONT_SIZE}px Courier`;
    ctx.fillStyle = 'rgba(0,255,65,0.4)';
    ctx.fillText('MATRIX', W/2 - 25, H/2);
    return;
  }

  function draw(ts) {
    if (ts - lastFrame < FRAME_MS) { animId = requestAnimationFrame(draw); return; }
    lastFrame = ts;

    ctx.fillStyle = 'rgba(0,0,0,0.045)'; // slow fade — matches Matrix page
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${FONT_SIZE}px Courier`;

    drops.forEach((y, i) => {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * FONT_SIZE;

      // Leading char brighter
      ctx.fillStyle = '#88ffaa';
      ctx.fillText(char, x, y * FONT_SIZE);

      ctx.fillStyle = 'rgba(0,200,50,0.7)';
      ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, (y - 1) * FONT_SIZE);

      if (y * FONT_SIZE > H && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += speed * (0.4 + Math.random() * 0.4);
    });

    animId = requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  // Stop when card is not visible (intersection)
  const card = document.querySelector('.card-matrix');
  if ('IntersectionObserver' in window && card) {
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) {
        cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(draw);
      }
    });
    obs.observe(card);
  }
}
