// ===== CONTACT CTA (data-driven from resume.json) =====

import { loadResume } from '/js/shared.js';

async function initContactCta() {
  const trigger = document.getElementById('cta-trigger');
  const panel   = document.getElementById('contact-panel');
  if (!trigger || !panel) return;

  // Populate links from resume.json
  const r = await loadResume();
  if (r) {
    const links = [
      { href: `mailto:${r.contact.email}`,  label: r.contact.email,   external: false },
      { href: r.contact.linkedin,             label: 'LinkedIn',          external: true  },
      { href: `tel:${r.contact.phone.replace(/\D/g,'')}`, label: r.contact.phone, external: false },
    ];

    // Determine which CSS class to use based on page
    const isMatrix = document.body.classList.contains('matrix-page');
    const isXP     = document.body.classList.contains('xp-page');
    const linkClass = isMatrix ? 'contact-link-matrix' : isXP ? 'xp-contact-link' : 'contact-link';

    panel.innerHTML = links.map(l =>
      `<a href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ''}
          class="${linkClass}"
          onclick="trackEvent('contact-click')">${l.label}</a>`
    ).join('');
  }

  // Toggle open/close
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('hidden');
    if (!expanded) trackEvent('cta-open');
  });

  // Close on outside click
  document.addEventListener('click', e => {
    const cta = document.getElementById('contact-cta');
    if (cta && !cta.contains(e.target)) {
      panel.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });
}

initContactCta();
