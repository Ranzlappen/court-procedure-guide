/* ===== SIDEBAR NAVIGATION ===== */
document.querySelectorAll('.sidebar a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // If it's a phase tab, switch to it
    const phaseTab = targetEl.closest('.phase-tab') || (targetEl.classList.contains('phase-tab') ? targetEl : null);
    if (phaseTab) switchTab(phaseTab.id);

    // Open parent accordion if closed
    let el = targetEl;
    while (el) {
      if (el.classList && el.classList.contains('phase-card') && !el.classList.contains('open')) {
        const hdr = el.querySelector('.phase-hdr');
        if (hdr) togglePhase(hdr);
      }
      el = el.parentElement;
    }

    // Update active link
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    // Scroll to element
    setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  });
});

/* ===== PHASE PROGRESS BAR ===== */
const progressBtns = document.querySelectorAll('#phaseProgress button[data-target]');
progressBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.target);
  });
});

/* ===== SIDEBAR TOGGLE (Mobile) ===== */
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
}
function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('show');
}

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
  // Close sidebar when clicking a link on mobile
  sidebar.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
}
// Tap overlay to close sidebar
if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

/* ===== SCROLL SPY — Track active sub-section within visible tab ===== */
const subPhases = document.querySelectorAll('.phase-tab.active .sub-phase[id]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      document.querySelectorAll('.sidebar a').forEach(a => {
        if (a.getAttribute('href') === '#' + id) a.classList.add('active');
        else if (!a.closest('.sidebar-nav-sub')) a.classList.remove('active');
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });

// Observe sub-phases in all tabs
document.querySelectorAll('.sub-phase[id]').forEach(el => observer.observe(el));
