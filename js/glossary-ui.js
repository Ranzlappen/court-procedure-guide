/* ===== GLOSSARY MODAL ===== */
const modalOverlay = document.getElementById('glossaryModal');
const modalTerm = document.getElementById('modalTerm');
const modalDef = document.getElementById('modalDef');
const closeModal = document.getElementById('closeModal');

document.addEventListener('click', (e) => {
  const term = e.target.closest('.term[data-term]');
  if (term) {
    e.preventDefault();
    const key = term.dataset.term;
    const entry = GLOSSARY[key];
    if (entry) {
      modalTerm.textContent = entry.term;
      modalDef.textContent = entry.def;
      modalOverlay.classList.add('show');
    }
  }
});

closeModal.addEventListener('click', () => modalOverlay.classList.remove('show'));
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('show');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') modalOverlay.classList.remove('show');
});

/* ===== POPULATE GLOSSARY LIST ===== */
(function() {
  const list = document.getElementById('glossaryList');
  if (!list) return;
  const sorted = Object.entries(GLOSSARY).sort((a, b) => a[1].term.localeCompare(b[1].term));
  sorted.forEach(([key, val]) => {
    const item = document.createElement('div');
    item.style.cssText = 'margin-bottom:12px;padding:8px 12px;background:var(--bg-surface);border-radius:var(--radius);border:1px solid var(--border);';
    item.innerHTML = `<strong class="term" data-term="${key}" style="color:var(--accent);cursor:pointer;">${val.term}</strong><br><span style="font-size:0.88rem;color:var(--text-muted);">${val.def}</span>`;
    list.appendChild(item);
  });
})();
