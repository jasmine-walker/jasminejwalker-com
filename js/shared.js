// ===== SHARED JS =====

let resumeCache = null;

export async function loadResume() {
  if (resumeCache) return resumeCache;
  try {
    const res = await fetch('/resume.json');
    if (!res.ok) throw new Error('Failed to load resume.json');
    resumeCache = await res.json();
    return resumeCache;
  } catch (e) {
    console.error('Could not load resume.json:', e);
    return null;
  }
}

export function formatDate(dateStr) {
  if (!dateStr || dateStr === 'present') return 'Present';
  const [year, month] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month,10) - 1]} ${year}`;
}

// Plausible custom event helper
window.trackEvent = function(name, props = {}) {
  if (window.plausible) {
    window.plausible(name, { props });
  }
};

// Favicon swap
export function setFavicon(href) {
  const link = document.getElementById('favicon');
  if (link) link.href = href;
}

// Generate favicons as inline SVG data URIs
export function generateFavicons() {
  // Plain: clean "J" on white
  const plainSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="white"/><text x="16" y="23" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#1a3a5c" font-weight="bold">J</text></svg>`;

  // Matrix: green "J" on black
  const matrixSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="black"/><text x="16" y="23" text-anchor="middle" font-family="Courier New,monospace" font-size="20" fill="#00ff41" font-weight="bold">J</text></svg>`;

  // XP: folder style
  const xpSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ece9d8"/><rect x="4" y="10" width="24" height="18" rx="2" fill="#ffd700" stroke="#cc9900" stroke-width="1"/><rect x="4" y="8" width="10" height="5" rx="2" fill="#ffd700" stroke="#cc9900" stroke-width="1"/></svg>`;

  function svgToDataUri(svg) {
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  return {
    plain:  svgToDataUri(plainSvg),
    matrix: svgToDataUri(matrixSvg),
    xp:     svgToDataUri(xpSvg)
  };
}

// Set up correct favicon per page
(function() {
  const favicons = generateFavicons();
  const body = document.body;
  if (body.classList.contains('matrix-page')) {
    setFavicon(favicons.matrix);
  } else if (body.classList.contains('xp-page')) {
    setFavicon(favicons.xp);
  } else {
    setFavicon(favicons.plain);
  }
})();
