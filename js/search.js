/* ==========================================================================
   SEARCH — highlights matches across every phase, reports a count, and
   steps through hits with Enter / Shift+Enter.
   ========================================================================== */

const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('clearSearch');
const searchCountEl = document.getElementById('searchCount');

let searchMatches = [];
let searchCursor = -1;

function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

function searchBarEl() {
  return searchInput ? searchInput.closest('.search-bar') : null;
}

/* --------------------------------------------------------------------------
   Highlighting
   -------------------------------------------------------------------------- */
function clearSearch() {
  document.querySelectorAll('mark.search-highlight').forEach(mark => {
    const parent = mark.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
  searchMatches = [];
  searchCursor = -1;
  if (searchCountEl) searchCountEl.textContent = '';
  const bar = searchBarEl();
  if (bar) bar.classList.remove('has-query');
}

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      // Never rewrite inside controls or generated chrome — replacing those
      // text nodes would detach live event targets.
      if (node.parentElement.closest(
        'script, style, textarea, .jump-chips, .phase-pager, .stepper, .bookmark-btn'
      )) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function doSearch() {
  clearSearch();

  const query = searchInput.value.trim();
  const bar = searchBarEl();
  if (bar) bar.classList.toggle('has-query', query.length > 0);

  if (query.length < 2) return;

  const escaped = query.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');

  const main = document.getElementById('mainContent');
  if (!main) return;

  collectTextNodes(main).forEach(node => {
    const text = node.nodeValue;
    re.lastIndex = 0;
    if (!re.test(text)) return;
    re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let lastIdx = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIdx) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
      }
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = match[1];
      frag.appendChild(mark);
      lastIdx = re.lastIndex;
    }
    if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
    node.parentNode.replaceChild(frag, node);
  });

  searchMatches = Array.from(document.querySelectorAll('mark.search-highlight'));

  if (searchCountEl) {
    searchCountEl.textContent = searchMatches.length
      ? `${searchMatches.length} hit${searchMatches.length === 1 ? '' : 's'}`
      : 'none';
  }

  if (searchMatches.length) gotoMatch(0);
}

/* --------------------------------------------------------------------------
   Stepping through results
   -------------------------------------------------------------------------- */
function gotoMatch(index) {
  if (!searchMatches.length) return;

  const total = searchMatches.length;
  searchCursor = ((index % total) + total) % total;

  searchMatches.forEach(m => m.classList.remove('search-current'));
  const mark = searchMatches[searchCursor];
  mark.classList.add('search-current');

  // Matches live in collapsed accordions and inactive tabs — open the way in.
  const tab = mark.closest('.phase-tab');
  if (tab && !tab.classList.contains('active')) switchTab(tab.id, { keepScroll: true });
  revealElement(mark);

  requestAnimationFrame(() => mark.scrollIntoView({ behavior: 'smooth', block: 'center' }));

  if (searchCountEl) searchCountEl.textContent = `${searchCursor + 1}/${total}`;
}

/* --------------------------------------------------------------------------
   Wiring
   -------------------------------------------------------------------------- */
if (searchInput) {
  searchInput.addEventListener('input', debounce(doSearch, 250));

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!searchMatches.length) return;
      gotoMatch(searchCursor + (e.shiftKey ? -1 : 1));
    } else if (e.key === 'Escape') {
      searchInput.value = '';
      clearSearch();
      searchInput.blur();
    }
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch();
    searchInput.focus();
  });
}

/* A phase switch made by other means invalidates the current highlight run. */
document.addEventListener('phasechange', () => {
  if (searchInput && !searchInput.value.trim()) clearSearch();
});
