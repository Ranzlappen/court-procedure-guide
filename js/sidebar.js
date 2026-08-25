/* ==========================================================================
   NAVIGATION — drawer, phase tree, stepper, jump chips, pager, scroll-spy
   ========================================================================== */

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const DRAWER_QUERY = window.matchMedia('(max-width: 900px)');

/* ==========================================================================
   DRAWER
   ========================================================================== */
function isDrawerMode() { return DRAWER_QUERY.matches; }
function isDrawerOpen() { return sidebar && sidebar.classList.contains('open'); }

function openSidebar() {
  if (!sidebar) return;
  sidebar.classList.add('open');
  if (sidebarOverlay) { sidebarOverlay.hidden = false; sidebarOverlay.classList.add('show'); }
  if (sidebarToggle) {
    sidebarToggle.setAttribute('aria-expanded', 'true');
    sidebarToggle.setAttribute('aria-label', 'Close navigation menu');
  }
  document.body.classList.add('nav-open');
  const first = sidebar.querySelector('a, button, input, select');
  if (first) first.focus();
}

function closeSidebar(returnFocus) {
  if (!sidebar) return;
  sidebar.classList.remove('open');
  if (sidebarOverlay) {
    sidebarOverlay.classList.remove('show');
    sidebarOverlay.hidden = true;
  }
  if (sidebarToggle) {
    sidebarToggle.setAttribute('aria-expanded', 'false');
    sidebarToggle.setAttribute('aria-label', 'Open navigation menu');
    if (returnFocus) sidebarToggle.focus();
  }
  document.body.classList.remove('nav-open');
}

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    if (isDrawerOpen()) closeSidebar(true); else openSidebar();
  });
}
if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => closeSidebar(false));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isDrawerOpen()) closeSidebar(true);
});

/* Keep focus inside the drawer while it is acting as a modal overlay. */
document.addEventListener('focusin', (e) => {
  if (!isDrawerMode() || !isDrawerOpen()) return;
  if (sidebar.contains(e.target) || (sidebarToggle && sidebarToggle.contains(e.target))) return;
  const first = sidebar.querySelector('a, button, input, select');
  if (first) first.focus();
});

/* Leaving drawer mode with the drawer open would strand the scroll lock. */
DRAWER_QUERY.addEventListener('change', () => {
  if (!isDrawerMode()) closeSidebar(false);
  relocateSearch();
});

/* ==========================================================================
   SEARCH RELOCATION
   One search field, moved between the app bar and the drawer, so there is
   never a duplicate id or a second stale input.
   ========================================================================== */
const searchBar = document.getElementById('searchBarDesktop');
const searchSlotAppbar = document.querySelector('.appbar-search');
const searchSlotSidebar = document.getElementById('searchHome');

function relocateSearch() {
  if (!searchBar || !searchSlotAppbar || !searchSlotSidebar) return;
  const slot = isDrawerMode() ? searchSlotSidebar : searchSlotAppbar;
  if (searchBar.parentElement !== slot) slot.appendChild(searchBar);
}
relocateSearch();

/* ==========================================================================
   NAV LINKS
   ========================================================================== */
document.querySelectorAll('.sidebar a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;   // let the browser handle anything unexpected

    e.preventDefault();

    const tab = targetEl.classList.contains('phase-tab') ? targetEl : targetEl.closest('.phase-tab');
    const isSub = tab && targetEl !== tab;

    if (tab) switchTab(tab.id, { keepScroll: isSub });

    if (isSub) {
      revealElement(targetEl);
      requestAnimationFrame(() => targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

    if (history.replaceState) history.replaceState(null, '', '#' + targetId);
    if (isDrawerMode()) closeSidebar(false);
  });
});

/* ==========================================================================
   STEPPER
   ========================================================================== */
document.querySelectorAll('#phaseProgress .stepper-step').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.target));
});

/* ==========================================================================
   JUMP CHIPS — per-phase shortcuts, built from the phase's own content.
   Phases with sub-phases list those; the rest list their section blocks.
   ========================================================================== */
function slugify(text) {
  return text
    .replace(/[^\p{L}\p{N}\s-]/gu, '')   // drop emoji and punctuation
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, 48);
}

function chipLabel(text) {
  let label = text
    // Titles carry an explanatory tail after an em dash — a chip wants the head.
    .split(/\s+[—–-]\s+/)[0]
    // …and often a parenthetical gloss, which the section itself repeats.
    .replace(/\s*\([^)]*\)\s*$/, '')
    // Strip the leading emoji; the chip row reads better as plain text.
    .replace(/[^\p{L}\p{N}\s&'/,.-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (label.length > 30) label = label.slice(0, 29).trimEnd() + '…';
  return label;
}

function isHidden(el) {
  return el.offsetParent === null && getComputedStyle(el).display === 'none';
}

function buildJumpChips(tab) {
  const existing = tab.querySelector('.jump-chips');
  if (existing) existing.remove();

  const subs = Array.from(tab.querySelectorAll('.sub-phase[id]')).filter(el => !isHidden(el));
  const nav = document.createElement('nav');
  nav.className = 'jump-chips';
  nav.setAttribute('aria-label', 'Jump to a section of this phase');

  let entries;
  if (subs.length) {
    entries = subs.map(el => ({
      id: el.id,
      label: chipLabel(el.querySelector('.phase-hdr .label')?.textContent || el.id)
    }));
  } else {
    entries = Array.from(tab.querySelectorAll('.section-block[id]'))
      .filter(el => el.querySelector('.sec-title') && !isHidden(el))
      .map(el => ({
        id: el.id,
        label: chipLabel(el.querySelector('.sec-title').textContent)
      }));
  }

  if (!entries.length) return;

  entries.forEach(entry => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jump-chip';
    btn.textContent = entry.label;
    btn.addEventListener('click', () => {
      const el = document.getElementById(entry.id);
      if (!el) return;
      revealElement(el);
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    });
    nav.appendChild(btn);
  });

  // Expand/collapse-all, only where there is something to expand
  if (subs.length) {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'jump-chip chip-action';
    const setLabel = () => {
      const anyClosed = subs.some(s => !s.querySelector('.phase-card')?.classList.contains('open'));
      action.textContent = anyClosed ? 'Expand all' : 'Collapse all';
      action.dataset.action = anyClosed ? 'expand' : 'collapse';
    };
    setLabel();
    action.addEventListener('click', () => {
      const expand = action.dataset.action === 'expand';
      subs.forEach(sub => {
        const hdr = sub.querySelector('.phase-hdr');
        if (hdr) setPhaseOpen(hdr, expand);
      });
      setLabel();
    });
    nav.appendChild(action);
  }

  const header = tab.querySelector('.phase-tab-header');
  if (header && header.parentElement) header.parentElement.insertBefore(nav, header.nextSibling);
}

/* ==========================================================================
   PHASE PAGER
   ========================================================================== */
function buildPager(tab) {
  const existing = tab.querySelector('.phase-pager');
  if (existing) existing.remove();

  const idx = PHASES.findIndex(p => p.id === tab.id);
  if (idx < 0) return;
  const prev = PHASES[idx - 1];
  const next = PHASES[idx + 1];
  if (!prev && !next) return;

  const pager = document.createElement('nav');
  pager.className = 'phase-pager';
  pager.setAttribute('aria-label', 'Phase navigation');

  const make = (phase, dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pager-btn ' + dir;
    btn.innerHTML = `<span class="dir">${dir === 'prev' ? '← Previous' : 'Next →'}</span>` +
                    `<span class="title"></span>`;
    btn.querySelector('.title').textContent = phase.title;
    btn.addEventListener('click', () => switchTab(phase.id));
    return btn;
  };

  if (prev) pager.appendChild(make(prev, 'prev'));
  if (next) pager.appendChild(make(next, 'next'));

  const notes = tab.querySelector('.phase-notes');
  if (notes) tab.insertBefore(pager, notes);
  else tab.appendChild(pager);
}

/* ==========================================================================
   BUILD / REBUILD PER-PHASE CHROME
   ========================================================================== */
function decorateTab(phaseId) {
  const tab = document.getElementById(phaseId);
  if (!tab) return;
  buildJumpChips(tab);
  buildPager(tab);
}

document.addEventListener('phasechange', (e) => decorateTab(e.detail.phaseId));

/* Case-type switches change which sub-phases exist, so chips must rebuild. */
document.addEventListener('filterchange', () => {
  decorateTab(currentPhaseId());
  // A criminal/civil switch resizes open accordions; drop the fixed cap so
  // they resize to their new content instead of clipping it.
  document.querySelectorAll('.phase-card.open > .phase-body').forEach(body => {
    body.style.maxHeight = 'none';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  PHASES.forEach(p => decorateTab(p.id));
});

/* ==========================================================================
   SCROLL-SPY — highlight the sub-phase currently in view
   ========================================================================== */
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const link = document.querySelector(`.sidebar a[href="#${entry.target.id}"]`);
    if (!link) return;
    document.querySelectorAll('.sidebar a.sub.active').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  });
}, { rootMargin: '-25% 0px -65% 0px' });

document.querySelectorAll('.sub-phase[id]').forEach(el => spy.observe(el));

/* ==========================================================================
   KEYBOARD SHORTCUTS
   ========================================================================== */
document.addEventListener('keydown', (e) => {
  const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  // "/" focuses search from anywhere
  if (e.key === '/' && !inField) {
    const input = document.getElementById('searchInput');
    if (input) {
      e.preventDefault();
      if (isDrawerMode() && !isDrawerOpen()) openSidebar();
      input.focus();
      input.select();
    }
    return;
  }

  if (inField) return;

  // Left/right arrows page through phases
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const idx = PHASES.findIndex(p => p.id === currentPhaseId());
    const next = PHASES[idx + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) { e.preventDefault(); switchTab(next.id); }
    return;
  }

  // 1-5 jump straight to a phase
  if (/^[1-5]$/.test(e.key)) {
    e.preventDefault();
    switchTab('phase' + e.key);
  }
});
