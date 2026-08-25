/* ==========================================================================
   GLOSSARY — inline term popups + the reference list
   ========================================================================== */

const modalOverlay = document.getElementById('glossaryModal');
const modalTerm = document.getElementById('modalTerm');
const modalDef = document.getElementById('modalDef');
const closeModalBtn = document.getElementById('closeModal');

let modalReturnFocus = null;

function openGlossaryModal(key, invoker) {
  const entry = (typeof GLOSSARY !== 'undefined') ? GLOSSARY[key] : null;
  if (!entry || !modalOverlay) return;

  modalTerm.textContent = entry.term;
  modalDef.textContent = entry.def;
  modalOverlay.classList.add('show');

  modalReturnFocus = invoker || null;
  if (closeModalBtn) closeModalBtn.focus();
}

function closeGlossaryModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('show');
  // Send focus back where it came from, not to the top of the document.
  if (modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus();
  modalReturnFocus = null;
}

document.addEventListener('click', (e) => {
  const term = e.target.closest('.term[data-term]');
  if (term) {
    e.preventDefault();
    openGlossaryModal(term.dataset.term, term);
  }
});

if (closeModalBtn) closeModalBtn.addEventListener('click', closeGlossaryModal);

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeGlossaryModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (!modalOverlay || !modalOverlay.classList.contains('show')) return;
  if (e.key === 'Escape') {
    e.stopPropagation();      // don't also close the drawer
    closeGlossaryModal();
  }
  // The dialog holds a single control, so Tab simply stays on it.
  if (e.key === 'Tab') {
    e.preventDefault();
    if (closeModalBtn) closeModalBtn.focus();
  }
});

/* ==========================================================================
   INLINE TERMS
   Authored as <span>. Promote them to buttons so keyboard and screen-reader
   users get the same definitions everyone else does.
   ========================================================================== */
(function upgradeTerms() {
  document.querySelectorAll('span.term[data-term]').forEach(span => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'term';
    btn.dataset.term = span.dataset.term;
    btn.textContent = span.textContent;
    btn.setAttribute('aria-label', span.textContent + ' — show definition');
    span.replaceWith(btn);
  });
})();

/* ==========================================================================
   GLOSSARY LIST + FILTER
   ========================================================================== */
(function buildGlossaryList() {
  const list = document.getElementById('glossaryList');
  if (!list || typeof GLOSSARY === 'undefined') return;

  const sorted = Object.entries(GLOSSARY)
    .sort((a, b) => a[1].term.localeCompare(b[1].term));

  sorted.forEach(([key, val]) => {
    const wrap = document.createElement('div');
    wrap.className = 'glossary-item';
    wrap.dataset.search = (val.term + ' ' + val.def).toLowerCase();

    const dt = document.createElement('dt');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'term';
    btn.dataset.term = key;
    btn.textContent = val.term;
    dt.appendChild(btn);

    const dd = document.createElement('dd');
    dd.textContent = val.def;

    wrap.append(dt, dd);
    list.appendChild(wrap);
  });

  const filter = document.getElementById('glossaryFilter');
  const clear = document.getElementById('glossaryFilterClear');
  const emptyMsg = document.getElementById('glossaryEmpty');
  if (!filter) return;

  const bar = filter.closest('.search-bar');

  function applyFilter() {
    const q = filter.value.trim().toLowerCase();
    if (bar) bar.classList.toggle('has-query', q.length > 0);

    let shown = 0;
    list.querySelectorAll('.glossary-item').forEach(item => {
      const hit = !q || item.dataset.search.includes(q);
      item.hidden = !hit;
      if (hit) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown > 0;
  }

  filter.addEventListener('input', applyFilter);
  filter.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { filter.value = ''; applyFilter(); }
  });
  if (clear) {
    clear.addEventListener('click', () => { filter.value = ''; applyFilter(); filter.focus(); });
  }
})();
