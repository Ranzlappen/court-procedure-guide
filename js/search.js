/* ===== SEARCH ===== */
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('clearSearch');

if (searchInput) {
  searchInput.addEventListener('input', debounce(doSearch, 300));
}
if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch();
  });
}

function debounce(fn, ms) {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}

function doSearch() {
  clearSearch();
  const q = searchInput.value.trim().toLowerCase();
  if (q.length < 2) return;

  // Escape regex special chars
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');

  // Temporarily show all tabs so we can search across them
  const allTabs = document.querySelectorAll('.phase-tab');
  allTabs.forEach(tab => tab.style.display = 'block');

  const main = document.querySelector('main');
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  let matchCount = 0;
  textNodes.forEach(node => {
    if (node.parentElement.closest('script, style, .phase-hdr')) return;
    const text = node.textContent;
    if (!re.test(text)) return;
    re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let lastIdx = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = match[1];
      frag.appendChild(mark);
      lastIdx = re.lastIndex;
      matchCount++;
    }
    if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
    node.parentNode.replaceChild(frag, node);
  });

  // Restore tab visibility
  allTabs.forEach(tab => tab.style.display = '');

  // Switch to the tab containing the first match and open its accordion
  const firstMark = main.querySelector('mark.search-highlight');
  if (firstMark) {
    const phaseTab = firstMark.closest('.phase-tab');
    if (phaseTab) switchTab(phaseTab.id);

    let el = firstMark;
    while (el) {
      if (el.classList && el.classList.contains('phase-card') && !el.classList.contains('open')) {
        const hdr = el.querySelector('.phase-hdr');
        if (hdr) togglePhase(hdr);
      }
      el = el.parentElement;
    }
    setTimeout(() => firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
  }
}

function clearSearch() {
  document.querySelectorAll('mark.search-highlight').forEach(mark => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}
