/* ==========================================================================
   CASE FLOW MAP
   ========================================================================== */

const flowmap = document.getElementById('flowmap');

document.querySelectorAll('.fc-node[data-phase]').forEach(node => {
  node.addEventListener('click', () => switchTab(node.dataset.phase));
});

function updateFlowchartActive(phaseId) {
  document.querySelectorAll('.fc-node').forEach(node => {
    const on = node.dataset.phase === phaseId;
    node.classList.toggle('fc-active', on);
    if (on) node.setAttribute('aria-current', 'step');
    else node.removeAttribute('aria-current');
  });
}

document.addEventListener('phasechange', (e) => updateFlowchartActive(e.detail.phaseId));

/* --------------------------------------------------------------------------
   Open state
   Collapsed by default on phones, where five stacked stages would push the
   actual guidance below the fold; remembered once the reader chooses.
   -------------------------------------------------------------------------- */
if (flowmap) {
  const saved = loadData().flowmapOpen;
  flowmap.open = (saved === null || saved === undefined)
    ? window.matchMedia('(min-width: 641px)').matches
    : saved;

  flowmap.addEventListener('toggle', () => {
    updateData(d => { d.flowmapOpen = flowmap.open; });
  });
}

document.addEventListener('DOMContentLoaded', () => updateFlowchartActive(currentPhaseId()));
