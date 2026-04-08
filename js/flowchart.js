/* ===== FLOWCHART INTERACTIVITY ===== */
document.querySelectorAll('.fc-node[data-phase]').forEach(node => {
  node.addEventListener('click', () => {
    switchTab(node.dataset.phase);
    updateFlowchartActive(node.dataset.phase);
  });
});

function updateFlowchartActive(phaseId) {
  document.querySelectorAll('.fc-node').forEach(n => n.classList.remove('fc-active'));
  document.querySelectorAll(`.fc-node[data-phase="${phaseId}"]`).forEach(n => n.classList.add('fc-active'));
}

// Patch switchTab to also update flowchart
const _origSwitchTab = switchTab;
switchTab = function(phaseId) {
  _origSwitchTab(phaseId);
  updateFlowchartActive(phaseId);
};

/* ===== INIT ===== */
console.log('%c\u2696\uFE0F Court Procedure Algorithm Guide loaded!', 'color:#5eead4; font-size:16px; font-weight:bold');
