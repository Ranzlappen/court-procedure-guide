/* ===== CASE TYPE TOGGLE (Criminal / Civil) ===== */
const caseToggleGroup = document.getElementById('caseToggle');
let currentCase = 'criminal';
if (caseToggleGroup) {
  caseToggleGroup.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      caseToggleGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCase = btn.dataset.case;
      applyCaseFilter();
    });
  });
  applyCaseFilter();
}
function applyCaseFilter() {
  document.querySelectorAll('.criminal-only').forEach(el => {
    el.style.display = currentCase === 'civil' ? 'none' : '';
  });
  document.querySelectorAll('.civil-only').forEach(el => {
    el.style.display = currentCase === 'criminal' ? 'none' : '';
  });
}

/* ===== ROLE / PERSPECTIVE SELECTOR ===== */
const roleSelect = document.getElementById('roleSelect');
if (roleSelect) {
  roleSelect.addEventListener('change', applyRoleFilter);
  applyRoleFilter();
}
function applyRoleFilter() {
  const val = roleSelect ? roleSelect.value : 'observer';
  // Remove previous highlights
  document.querySelectorAll('.section-block[data-role]').forEach(el => {
    el.classList.remove('role-highlight');
  });
  // Highlight matching role blocks
  if (val !== 'observer' && val !== 'all') {
    document.querySelectorAll(`.section-block[data-role="${val}"]`).forEach(el => {
      el.classList.add('role-highlight');
    });
  }
}

/* ===== JURISDICTION SELECTOR ===== */
const jurisdictionSelect = document.getElementById('jurisdictionSelect');
if (jurisdictionSelect) {
  // Restore saved preference
  const savedData = loadData();
  if (savedData.jurisdiction && savedData.jurisdiction !== 'both') {
    jurisdictionSelect.value = savedData.jurisdiction;
    document.body.classList.add('jurisdiction-' + savedData.jurisdiction);
  }

  jurisdictionSelect.addEventListener('change', () => {
    const val = jurisdictionSelect.value;
    document.body.classList.remove('jurisdiction-federal', 'jurisdiction-state');
    if (val !== 'both') {
      document.body.classList.add('jurisdiction-' + val);
    }
    const d = loadData();
    d.jurisdiction = val;
    saveData(d);
  });
}

/* ===== THEME TOGGLE (Dark/Light) ===== */
const themeToggleGroup = document.getElementById('themeToggle');
if (themeToggleGroup) {
  themeToggleGroup.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      themeToggleGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });
  });
}
