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

