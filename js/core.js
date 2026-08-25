/* ==========================================================================
   CORE — storage, phase registry, tab switching, accordions
   ========================================================================== */

const STORAGE_KEY = 'court_guide_data';

const DEFAULT_DATA = {
  version: 2,
  notes: {},
  bookmarks: [],
  progress: {},
  jurisdiction: 'both',
  caseType: 'criminal',
  role: 'observer',
  theme: 'dark',
  flowmapOpen: null
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Object.assign({}, DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    const data = Object.assign({}, DEFAULT_DATA, parsed);
    // Guard against a hand-edited or partially-written record
    if (typeof data.notes !== 'object' || data.notes === null) data.notes = {};
    if (!Array.isArray(data.bookmarks)) data.bookmarks = [];
    if (typeof data.progress !== 'object' || data.progress === null) data.progress = {};
    return data;
  } catch (e) {
    return Object.assign({}, DEFAULT_DATA);
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* quota exceeded or storage blocked — the session still works */ }
}

/* Read-modify-write helper so callers never clobber neighbouring keys. */
function updateData(mutator) {
  const data = loadData();
  mutator(data);
  saveData(data);
  return data;
}

/* ==========================================================================
   PHASE REGISTRY
   Single source of truth for phase order, used by the stepper, the app bar,
   the pager and the flow map.
   ========================================================================== */
const PHASES = [
  { id: 'phase1', num: 1, short: 'Initiation', title: 'Case Initiation' },
  { id: 'phase2', num: 2, short: 'Pre-Trial', title: 'Pre-Trial' },
  { id: 'phase3', num: 3, short: 'Trial', title: 'Trial' },
  { id: 'phase4', num: 4, short: 'Resolution', title: 'Resolution & Sentencing' },
  { id: 'phase5', num: 5, short: 'Appeals', title: 'Appeals' },
  { id: 'glossary', num: null, short: 'Glossary', title: 'Legal Glossary' }
];

function phaseById(id) {
  return PHASES.find(p => p.id === id) || null;
}

/* Currently visible tab id. */
function currentPhaseId() {
  const active = document.querySelector('.phase-tab.active');
  return active ? active.id : 'phase1';
}

/* ==========================================================================
   TAB SWITCHING
   ========================================================================== */
function switchTab(phaseId, opts) {
  const options = opts || {};
  const target = document.getElementById(phaseId);
  if (!target || !target.classList.contains('phase-tab')) return;

  document.querySelectorAll('.phase-tab').forEach(tab => tab.classList.remove('active'));
  target.classList.add('active');

  syncStepper(phaseId);
  syncAppbar(phaseId);
  syncSidebar(phaseId);

  if (history.replaceState) history.replaceState(null, '', '#' + phaseId);

  if (!options.keepScroll) {
    window.scrollTo({ top: 0, behavior: options.smooth === false ? 'auto' : 'smooth' });
  }

  document.dispatchEvent(new CustomEvent('phasechange', { detail: { phaseId } }));
}

/* --- Stepper --- */
function syncStepper(phaseId) {
  document.querySelectorAll('#phaseProgress .stepper-step').forEach(btn => {
    if (btn.dataset.target === phaseId) btn.setAttribute('aria-current', 'step');
    else btn.removeAttribute('aria-current');
  });
}

/* --- App bar "you are here" readout --- */
function syncAppbar(phaseId) {
  const kicker = document.getElementById('appbarKicker');
  const name = document.getElementById('appbarPhase');
  const phase = phaseById(phaseId);
  if (!kicker || !name || !phase) return;
  kicker.textContent = phase.num ? `Phase ${phase.num} of 5` : 'Reference';
  name.textContent = phase.title;
  document.title = `${phase.title} — Court Procedure Algorithm Guide`;
}

/* --- Sidebar: mark the phase current and reveal only its sub-list --- */
function syncSidebar(phaseId) {
  document.querySelectorAll('.sidebar a').forEach(a => {
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });
  const link = document.querySelector(`.sidebar a[data-phase="${phaseId}"]`);
  if (link) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
  document.querySelectorAll('.nav-sublist').forEach(list => {
    list.classList.toggle('expanded', list.dataset.subFor === phaseId);
  });
}

/* ==========================================================================
   ACCORDIONS (sub-phases)
   ========================================================================== */
function setPhaseOpen(hdr, open) {
  const card = hdr.closest('.phase-card');
  if (!card) return;
  const body = card.querySelector('.phase-body');
  if (!body || body.classList.contains('phase-body--static')) return;

  if (open) {
    card.classList.add('open');
    hdr.setAttribute('aria-expanded', 'true');
    body.style.maxHeight = body.scrollHeight + 'px';
    // Once the transition lands, drop the cap so nested content can grow.
    body.addEventListener('transitionend', function done(e) {
      if (e.target !== body) return;
      if (card.classList.contains('open')) body.style.maxHeight = 'none';
      body.removeEventListener('transitionend', done);
    });
  } else {
    body.style.maxHeight = body.scrollHeight + 'px';
    requestAnimationFrame(() => { body.style.maxHeight = '0px'; });
    card.classList.remove('open');
    hdr.setAttribute('aria-expanded', 'false');
  }
}

function togglePhase(hdr) {
  const card = hdr.closest('.phase-card');
  if (!card) return;
  setPhaseOpen(hdr, !card.classList.contains('open'));
}

/* Opens every accordion in an element's way so a deep link actually lands. */
function revealElement(el) {
  if (!el) return;

  // A .sub-phase wraps its own card, so its accordion is a child, not an
  // ancestor — the walk below would never reach it.
  if (el.classList && el.classList.contains('sub-phase')) {
    const own = el.querySelector(':scope > .phase-card');
    const ownHdr = own && own.querySelector(':scope > .phase-hdr');
    if (own && ownHdr && !own.classList.contains('open')) setPhaseOpen(ownHdr, true);
  }

  let node = el;
  while (node && node !== document.body) {
    if (node.classList && node.classList.contains('phase-card') && !node.classList.contains('open')) {
      const hdr = node.querySelector(':scope > .phase-hdr');
      if (hdr) setPhaseOpen(hdr, true);
    }
    node = node.parentElement;
  }
}

/* Delegated so it also covers headers inserted later. */
document.addEventListener('click', (e) => {
  const hdr = e.target.closest('.phase-hdr');
  if (hdr && !hdr.classList.contains('phase-tab-header')) togglePhase(hdr);
});

/* ==========================================================================
   INITIAL TAB FROM URL HASH
   ========================================================================== */
function resolveHash(hash) {
  const el = document.getElementById(hash);
  if (!el) return null;
  if (el.classList.contains('phase-tab')) return { phaseId: hash, target: null };
  const tab = el.closest('.phase-tab');
  return tab ? { phaseId: tab.id, target: el } : null;
}

function applyHash(smooth) {
  const hash = location.hash.slice(1);
  if (!hash) return false;
  const resolved = resolveHash(hash);
  if (!resolved) return false;

  switchTab(resolved.phaseId, { keepScroll: !!resolved.target, smooth });
  if (resolved.target) {
    revealElement(resolved.target);
    requestAnimationFrame(() => {
      resolved.target.scrollIntoView({ behavior: smooth === false ? 'auto' : 'smooth', block: 'start' });
    });
  }
  return true;
}

window.addEventListener('hashchange', () => applyHash(true));

document.addEventListener('DOMContentLoaded', () => {
  if (!applyHash(false)) {
    // No usable hash — sync the chrome to whichever tab is marked active.
    const id = currentPhaseId();
    syncStepper(id);
    syncAppbar(id);
    syncSidebar(id);
  }
});
