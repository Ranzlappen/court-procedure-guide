/* ==========================================================================
   PERSONAL DATA — section ids, bookmarks, notes, progress
   loadData() / saveData() / updateData() live in core.js
   ========================================================================== */

/* ==========================================================================
   SECTION IDS
   The bookmark feature targets .section-block[id], but the content ships
   without ids — so derive stable ones from each block's own title.
   ========================================================================== */
function sectionSlug(text) {
  return text
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    .replace(/-$/, '');
}

(function assignSectionIds() {
  const used = new Set(Array.from(document.querySelectorAll('[id]')).map(el => el.id));

  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.querySelectorAll('.section-block').forEach(block => {
      if (block.id) return;
      const title = block.querySelector('.sec-title') || block.querySelector('h3');
      if (!title) return;                       // untitled wrapper — nothing to bookmark

      const base = `${tab.id}--${sectionSlug(title.textContent) || 'section'}`;
      let id = base;
      let n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      block.id = id;
    });
  });
})();

/* ==========================================================================
   WIDE TABLES
   Wrap each table so it scrolls inside its own box instead of stretching
   the page — the root cause of sideways panning on phones.
   ========================================================================== */
(function wrapTables() {
  document.querySelectorAll('.phase-tab table').forEach(table => {
    if (table.parentElement.classList.contains('table-scroll')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Scrollable table');
    wrap.tabIndex = 0;
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
})();

/* ==========================================================================
   NOTES
   ========================================================================== */
(function initNotes() {
  const timers = {};

  document.querySelectorAll('.phase-notes textarea[data-phase]').forEach(textarea => {
    const phase = textarea.dataset.phase;
    const data = loadData();
    if (data.notes[phase]) textarea.value = data.notes[phase];

    const status = document.createElement('p');
    status.className = 'notes-saved';
    status.setAttribute('aria-live', 'polite');
    textarea.insertAdjacentElement('afterend', status);

    textarea.addEventListener('input', () => {
      clearTimeout(timers[phase]);
      timers[phase] = setTimeout(() => {
        updateData(d => {
          if (textarea.value) d.notes[phase] = textarea.value;
          else delete d.notes[phase];
        });
        status.textContent = 'Saved';
        setTimeout(() => { status.textContent = ''; }, 1600);
      }, 500);
    });
  });

  // Open the notes panel automatically when it already holds something
  document.querySelectorAll('.phase-notes').forEach(details => {
    const ta = details.querySelector('textarea');
    if (ta && ta.value) details.open = true;
  });
})();

/* ==========================================================================
   PROGRESS
   ========================================================================== */
function updateProgressBar() {
  const boxes = document.querySelectorAll('.progress-list input[type="checkbox"]');
  const done = document.querySelectorAll('.progress-list input[type="checkbox"]:checked');
  const total = boxes.length || 1;

  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = (done.length / total * 100) + '%';

  const count = document.getElementById('progressCount');
  if (count) count.textContent = `${done.length} / ${boxes.length}`;

  // Mirror onto the stepper and the flow map
  boxes.forEach(cb => {
    const phase = cb.dataset.phase;
    const step = document.querySelector(`.stepper-step[data-target="${phase}"]`);
    if (step) step.classList.toggle('done', cb.checked);
    const node = document.querySelector(`.fc-node[data-phase="${phase}"]`);
    if (node) node.classList.toggle('fc-done', cb.checked);
  });
}

(function initProgress() {
  const data = loadData();
  document.querySelectorAll('.progress-list input[type="checkbox"]').forEach(cb => {
    const phase = cb.dataset.phase;
    if (data.progress[phase]) cb.checked = true;

    cb.addEventListener('change', () => {
      updateData(d => { d.progress[phase] = cb.checked; });
      updateProgressBar();
    });
  });
  updateProgressBar();
})();

/* ==========================================================================
   BOOKMARKS
   ========================================================================== */
function bookmarkTitle(el) {
  const title = el.querySelector('.sec-title') || el.querySelector('h3');
  const raw = title ? title.textContent : el.id;
  return raw.replace(/[^\p{L}\p{N}\s&'()/,.:-]/gu, '').trim().split(/\s+[—–]\s+/)[0].trim();
}

function renderBookmarks() {
  const list = document.getElementById('bookmarksList');
  const empty = document.getElementById('bookmarksEmpty');
  if (!list) return;

  const data = loadData();
  list.innerHTML = '';

  // Drop ids that no longer resolve (content edited since they were saved)
  const live = data.bookmarks.filter(id => document.getElementById(id));
  if (live.length !== data.bookmarks.length) {
    updateData(d => { d.bookmarks = live; });
  }

  if (empty) empty.hidden = live.length > 0;

  live.forEach(id => {
    const el = document.getElementById(id);
    const tab = el.closest('.phase-tab');
    const phase = tab ? phaseById(tab.id) : null;

    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = '#' + id;
    if (phase) {
      const kicker = document.createElement('span');
      kicker.className = 'bm-phase';
      kicker.textContent = phase.num ? `Phase ${phase.num}` : phase.title;
      a.appendChild(kicker);
    }
    a.appendChild(document.createTextNode(bookmarkTitle(el)));
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (tab) switchTab(tab.id, { keepScroll: true });
      revealElement(el);
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      if (window.matchMedia('(max-width: 900px)').matches) closeSidebar(false);
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'bm-remove';
    remove.innerHTML = '&times;';
    remove.setAttribute('aria-label', 'Remove bookmark: ' + bookmarkTitle(el));
    remove.addEventListener('click', () => toggleBookmark(id));

    li.append(a, remove);
    list.appendChild(li);
  });
}

function toggleBookmark(sectionId) {
  let added = false;
  updateData(d => {
    const idx = d.bookmarks.indexOf(sectionId);
    if (idx >= 0) d.bookmarks.splice(idx, 1);
    else { d.bookmarks.push(sectionId); added = true; }
  });

  const btn = document.querySelector(`.bookmark-btn[data-section="${CSS.escape(sectionId)}"]`);
  if (btn) syncBookmarkButton(btn, added);
  renderBookmarks();
}

function syncBookmarkButton(btn, on) {
  btn.classList.toggle('bookmarked', on);
  btn.setAttribute('aria-pressed', String(on));
  btn.textContent = on ? '🔖' : '🔖';
  btn.title = on ? 'Remove bookmark' : 'Bookmark this section';
}

(function initBookmarkButtons() {
  const data = loadData();

  document.querySelectorAll('.phase-tab .section-block[id]').forEach(block => {
    if (!block.querySelector('.sec-title')) return;   // plain prose wrapper
    if (block.querySelector(':scope > .bookmark-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bookmark-btn';
    btn.dataset.section = block.id;
    syncBookmarkButton(btn, data.bookmarks.includes(block.id));
    btn.addEventListener('click', () => toggleBookmark(block.id));

    block.appendChild(btn);
  });

  renderBookmarks();
})();

/* ==========================================================================
   RESET
   ========================================================================== */
(function initReset() {
  const btn = document.getElementById('resetData');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!confirm('Clear all saved notes, bookmarks and progress? Your view settings are kept.')) return;
    updateData(d => { d.notes = {}; d.bookmarks = []; d.progress = {}; });
    document.querySelectorAll('.phase-notes textarea').forEach(t => { t.value = ''; });
    document.querySelectorAll('.progress-list input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.bookmark-btn').forEach(b => syncBookmarkButton(b, false));
    updateProgressBar();
    renderBookmarks();
  });
})();
