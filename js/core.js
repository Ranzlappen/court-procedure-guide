/* ===== LOCAL STORAGE — Shared Utilities ===== */
const STORAGE_KEY = 'court_guide_data';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, notes: {}, bookmarks: [], progress: {}, jurisdiction: 'both' };
    const data = JSON.parse(raw);
    if (!data.version) data.version = 1;
    if (!data.notes) data.notes = {};
    if (!data.bookmarks) data.bookmarks = [];
    if (!data.progress) data.progress = {};
    if (!data.jurisdiction) data.jurisdiction = 'both';
    return data;
  } catch (e) {
    return { version: 1, notes: {}, bookmarks: [], progress: {}, jurisdiction: 'both' };
  }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* quota exceeded */ }
}

/* ===== TAB SWITCHING ===== */
function switchTab(phaseId) {
  document.querySelectorAll('.phase-tab').forEach(tab => tab.classList.remove('active'));
  const target = document.getElementById(phaseId);
  if (target) target.classList.add('active');

  // Update progress bar buttons
  const progressBtns = document.querySelectorAll('#phaseProgress button[data-target]');
  progressBtns.forEach(b => b.classList.remove('active'));
  const progBtn = document.querySelector(`#phaseProgress button[data-target="${phaseId}"]`);
  if (progBtn) progBtn.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
  const sideLink = document.querySelector(`.sidebar a[href="#${phaseId}"]`);
  if (sideLink) sideLink.classList.add('active');

  // Update URL hash without scrolling
  history.replaceState(null, '', '#' + phaseId);

  // Scroll to top of main content
  const main = document.querySelector('main');
  if (main) main.scrollTop = 0;
  window.scrollTo({ top: document.querySelector('.top-bar')?.offsetTop || 0 });
}

// Handle URL hash on load and back/forward
function initTabFromHash() {
  const hash = location.hash.slice(1);
  if (hash && document.getElementById(hash)?.classList.contains('phase-tab')) {
    switchTab(hash);
  }
}
window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (hash && document.getElementById(hash)?.classList.contains('phase-tab')) {
    switchTab(hash);
  }
});
initTabFromHash();

/* ===== PHASE ACCORDION TOGGLE ===== */
function togglePhase(hdr) {
  const card = hdr.closest('.phase-card');
  const body = card.querySelector('.phase-body');
  if (!body) return;

  if (card.classList.contains('open')) {
    body.style.maxHeight = body.scrollHeight + 'px';
    requestAnimationFrame(() => { body.style.maxHeight = '0px'; });
    card.classList.remove('open');
  } else {
    card.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
    body.addEventListener('transitionend', function handler() {
      if (card.classList.contains('open')) body.style.maxHeight = 'none';
      body.removeEventListener('transitionend', handler);
    });
  }
}
