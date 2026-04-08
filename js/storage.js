/* ===== LOCAL STORAGE — Personal Data ===== */
/* Note: loadData() and saveData() are defined in core.js */

/* --- Notes --- */
const noteDebounceTimers = {};
document.querySelectorAll('.phase-notes textarea[data-phase]').forEach(textarea => {
  const phase = textarea.dataset.phase;
  const data = loadData();
  if (data.notes[phase]) textarea.value = data.notes[phase];

  textarea.addEventListener('input', () => {
    clearTimeout(noteDebounceTimers[phase]);
    noteDebounceTimers[phase] = setTimeout(() => {
      const d = loadData();
      d.notes[phase] = textarea.value;
      saveData(d);
    }, 500);
  });
});

/* --- Progress Checkboxes --- */
function updateProgressBar() {
  const checks = document.querySelectorAll('.progress-list input[type="checkbox"]');
  const checked = document.querySelectorAll('.progress-list input[type="checkbox"]:checked').length;
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = (checked / checks.length * 100) + '%';
}

document.querySelectorAll('.progress-list input[type="checkbox"]').forEach(cb => {
  const phase = cb.dataset.phase;
  const data = loadData();
  if (data.progress[phase]) cb.checked = true;

  cb.addEventListener('change', () => {
    const d = loadData();
    d.progress[phase] = cb.checked;
    saveData(d);
    updateProgressBar();
  });
});
updateProgressBar();

/* --- Bookmarks --- */
function renderBookmarks() {
  const list = document.getElementById('bookmarksList');
  const empty = document.getElementById('bookmarksEmpty');
  if (!list) return;
  const data = loadData();
  list.innerHTML = '';
  if (data.bookmarks.length === 0) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  data.bookmarks.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const title = el.querySelector('h3, h4, .section-title')?.textContent || id;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = title;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const phaseTab = el.closest('.phase-tab');
      if (phaseTab) switchTab(phaseTab.id);
      const card = el.closest('.phase-card');
      if (card && !card.classList.contains('open')) {
        const hdr = card.querySelector('.phase-hdr');
        if (hdr) togglePhase(hdr);
      }
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    });
    li.appendChild(a);
    list.appendChild(li);
  });
}

function toggleBookmark(sectionId) {
  const data = loadData();
  const idx = data.bookmarks.indexOf(sectionId);
  if (idx >= 0) {
    data.bookmarks.splice(idx, 1);
  } else {
    data.bookmarks.push(sectionId);
  }
  saveData(data);
  renderBookmarks();
  // Update button state
  const btn = document.querySelector(`.bookmark-btn[data-section="${sectionId}"]`);
  if (btn) btn.classList.toggle('bookmarked', idx < 0);
}

// Generate bookmark buttons on sections
document.querySelectorAll('.section-block[id]').forEach(block => {
  const btn = document.createElement('button');
  btn.className = 'bookmark-btn';
  btn.dataset.section = block.id;
  btn.textContent = '\uD83D\uDD16';
  btn.title = 'Bookmark this section';
  const data = loadData();
  if (data.bookmarks.includes(block.id)) btn.classList.add('bookmarked');
  btn.addEventListener('click', () => toggleBookmark(block.id));
  block.style.position = 'relative';
  block.appendChild(btn);
});
renderBookmarks();
