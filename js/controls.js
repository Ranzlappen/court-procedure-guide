/* ==========================================================================
   CONTROLS — case type, role, jurisdiction, theme
   Every one of these persists; a court-day companion that forgets your
   settings on each reload is worse than useless.
   ========================================================================== */

/* ===== CASE TYPE (Criminal / Civil) ===== */
const caseToggleGroup = document.getElementById('caseToggle');

function applyCaseType(value, persist) {
  document.body.classList.toggle('case-criminal', value !== 'civil');
  document.body.classList.toggle('case-civil', value === 'civil');

  if (caseToggleGroup) {
    caseToggleGroup.querySelectorAll('button').forEach(b => {
      const on = b.dataset.case === value;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  if (persist) updateData(d => { d.caseType = value; });

  // Sub-phase visibility changed, so any open accordion needs re-measuring
  // and the in-phase jump chips need rebuilding.
  document.dispatchEvent(new CustomEvent('filterchange'));
}

if (caseToggleGroup) {
  caseToggleGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-case]');
    if (btn) applyCaseType(btn.dataset.case, true);
  });
}

/* ===== ROLE / PERSPECTIVE ===== */
const roleSelect = document.getElementById('roleSelect');

/* Two roles have no blocks of their own; map them to the seat whose guidance
   actually applies so the selector never silently does nothing. */
const ROLE_ALIASES = { defendant: 'defense', witness: 'observer' };

function applyRole(value, persist) {
  const effective = ROLE_ALIASES[value] || value;

  document.body.className = document.body.className
    .split(/\s+/).filter(c => c && !c.startsWith('role-')).join(' ');
  document.body.classList.add('role-' + effective);

  document.querySelectorAll('.section-block.role-highlight')
    .forEach(el => el.classList.remove('role-highlight'));

  if (effective !== 'observer') {
    document.querySelectorAll(`.section-block[data-role="${effective}"]`)
      .forEach(el => el.classList.add('role-highlight'));
  }

  if (roleSelect && roleSelect.value !== value) roleSelect.value = value;
  if (persist) updateData(d => { d.role = value; });
}

if (roleSelect) {
  roleSelect.addEventListener('change', () => applyRole(roleSelect.value, true));
}

/* ===== JURISDICTION ===== */
const jurisdictionSelect = document.getElementById('jurisdictionSelect');

function applyJurisdiction(value, persist) {
  document.body.classList.remove('jurisdiction-federal', 'jurisdiction-state');
  if (value === 'federal' || value === 'state') {
    document.body.classList.add('jurisdiction-' + value);
  }
  if (jurisdictionSelect && jurisdictionSelect.value !== value) jurisdictionSelect.value = value;
  if (persist) updateData(d => { d.jurisdiction = value; });
}

if (jurisdictionSelect) {
  jurisdictionSelect.addEventListener('change', () => applyJurisdiction(jurisdictionSelect.value, true));
}

/* ===== THEME ===== */
const themeToggleGroup = document.getElementById('themeToggle');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function resolveTheme(pref) {
  // Dark is this guide's default; 'system' is only reached if a reader
  // explicitly opts into following the OS.
  if (pref === 'light' || pref === 'dark') return pref;
  return systemDark.matches ? 'dark' : 'light';
}

function applyTheme(pref, persist) {
  const resolved = resolveTheme(pref);

  if (resolved === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'light' ? '#ffffff' : '#0f172a');

  if (themeToggleGroup) {
    themeToggleGroup.querySelectorAll('button').forEach(b => {
      const on = b.dataset.theme === resolved;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  if (persist) updateData(d => { d.theme = pref; });
}

if (themeToggleGroup) {
  themeToggleGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-theme]');
    if (btn) applyTheme(btn.dataset.theme, true);
  });
}

/* Follow the OS while the user has not made an explicit choice. */
systemDark.addEventListener('change', () => {
  if (loadData().theme === 'system') applyTheme('system', false);
});

/* ===== RESTORE ON LOAD ===== */
(function restorePreferences() {
  const data = loadData();
  applyCaseType(data.caseType, false);
  applyRole(data.role, false);
  applyJurisdiction(data.jurisdiction, false);
  applyTheme(data.theme, false);
})();
