/* ============================================================
   APP.JS — Entry point & event listeners
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  loadState();

  // ── Modal overlay close on backdrop click
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // ── King: save round
  document.getElementById('btn-save-round').addEventListener('click', () => {
    initRound(state.currentRound);
    saveState();
    renderKing();
    showToast('Ronda ' + state.currentRound + ' guardada!');
    const allDone = Object.keys(state.rounds).length >= NUM_ROUNDS;
    if (allDone) {
      const winner = getRankings()[0];
      setTimeout(() => {
        showToast('♛ ' + winner.name + ' lidera com ' + winner.total + ' pontos!');
        launchConfetti();
      }, 400);
    }
  });

  // ── King: festas
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

  // ── King: add player
  document.getElementById('btn-add-player').addEventListener('click', openAddPlayerModal);
  document.getElementById('btn-confirm-player').addEventListener('click', confirmAddPlayer);
  document.getElementById('btn-cancel-player').addEventListener('click', closeModal);
  document.getElementById('pname-inp').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmAddPlayer();
  });

  // ── King: reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Reiniciar toda a partida? Todos os pontos serão apagados.')) {
      resetGame();
      renderKing();
      showToast('Partida reiniciada');
    }
  });

});
