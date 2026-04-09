/* ============================================================
   APP.JS — Entry point, event listeners, initialisation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Load persisted state
  loadState();

  // Init tab navigation
  initTabs();

  // Initial render
  renderKing();

  // ── King: Save round ───────────────────────────────────────
  document.getElementById('btn-save-round').addEventListener('click', () => {
    initRound(state.currentRound);
    saveState();
    renderKing();
    showToast('Ronda ' + state.currentRound + ' guardada!');

    // Check if all rounds complete → celebrate winner
    const allDone = Object.keys(state.rounds).length >= NUM_ROUNDS;
    if (allDone) {
      const rankings = getRankings();
      const winner = rankings[0];
      setTimeout(() => {
        showToast('♛ ' + winner.name + ' lidera com ' + winner.total + ' pontos!');
        launchConfetti();
      }, 400);
    }
  });

  // ── King: Add/remove festas ────────────────────────────────
  document.getElementById('btn-add-festa').addEventListener('click', () => {
    addFesta(state.currentRound);
    renderScorecard();
    showToast('Festa adicionada');
  });

  document.getElementById('btn-remove-festa').addEventListener('click', () => {
    removeFesta(state.currentRound);
    renderScorecard();
    showToast('Festa removida');
  });

  // ── King: Add player button ────────────────────────────────
  document.getElementById('btn-add-player').addEventListener('click', () => {
    openAddPlayerModal();
  });

  document.getElementById('btn-confirm-player').addEventListener('click', () => {
    confirmAddPlayer();
  });

  document.getElementById('btn-cancel-player').addEventListener('click', () => {
    closeModal();
  });

  document.getElementById('pname-inp').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmAddPlayer();
  });

  // ── King: Reset ────────────────────────────────────────────
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Reiniciar toda a partida? Todos os pontos serão apagados.')) {
      resetGame();
      renderKing();
      showToast('Partida reiniciada');
    }
  });

});
