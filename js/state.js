/* ============================================================
   STATE.JS — Application state & persistence
   ============================================================ */

const PALETTE = [
  '#c9a84c', '#d64545', '#4caf7a',
  '#5b8dd9', '#a066d3', '#e07b3a',
  '#4db3b3', '#d45b8a',
];

const NUM_ROUNDS = 8;

// ── Initial state ────────────────────────────────────────────
const DEFAULT_STATE = {
  players: [
    { id: 1, name: 'Jogador 1', color: '#c9a84c' },
    { id: 2, name: 'Jogador 2', color: '#d64545' },
    { id: 3, name: 'Jogador 3', color: '#4caf7a' },
    { id: 4, name: 'Jogador 4', color: '#5b8dd9' },
  ],
  currentRound: 1,
  nextId: 5,
  rounds: {},
};

let state = deepClone(DEFAULT_STATE);

// ── Helpers ──────────────────────────────────────────────────
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── Persistence ──────────────────────────────────────────────
function saveState() {
  try {
    localStorage.setItem('gamenight-king', JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('gamenight-king');
    if (saved) {
      state = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not load state:', e);
    state = deepClone(DEFAULT_STATE);
  }
}

// ── State mutations ──────────────────────────────────────────
function addPlayer(name, color) {
  const id = state.nextId++;
  state.players.push({ id, name, color });

  // Ensure new player has entries in existing rounds
  Object.values(state.rounds).forEach(rd => {
    PENALTY_ROWS.forEach(pr => {
      if (rd.penalties[pr.key][id] === undefined) {
        rd.penalties[pr.key][id] = 0;
      }
    });
    rd.festas.forEach(f => {
      if (f[id] === undefined) f[id] = 0;
    });
  });

  saveState();
  return id;
}

function removePlayer(id) {
  state.players = state.players.filter(p => p.id !== id);
  saveState();
}

function initRound(r) {
  if (!state.rounds[r]) {
    const penalties = {};
    PENALTY_ROWS.forEach(pr => {
      penalties[pr.key] = {};
      state.players.forEach(p => { penalties[pr.key][p.id] = 0; });
    });
    const festas = [];
    for (let i = 0; i < 4; i++) {
      const f = {};
      state.players.forEach(p => { f[p.id] = 0; });
      festas.push(f);
    }
    state.rounds[r] = { penalties, festas };
  } else {
    // Ensure new players have entries
    const rd = state.rounds[r];
    state.players.forEach(p => {
      PENALTY_ROWS.forEach(pr => {
        if (rd.penalties[pr.key][p.id] === undefined) {
          rd.penalties[pr.key][p.id] = 0;
        }
      });
      rd.festas.forEach(f => {
        if (f[p.id] === undefined) f[p.id] = 0;
      });
    });
  }
}

function setPenalty(round, key, pid, value) {
  initRound(round);
  const max = PENALTY_ROWS.find(r => r.key === key).pts;
  state.rounds[round].penalties[key][pid] = Math.min(Math.max(0, value), max);
  saveState();
}

function setFesta(round, festaIndex, pid, value) {
  initRound(round);
  state.rounds[round].festas[festaIndex][pid] = value;
  saveState();
}

function addFesta(round) {
  initRound(round);
  const f = {};
  state.players.forEach(p => { f[p.id] = 0; });
  state.rounds[round].festas.push(f);
  saveState();
}

function removeFesta(round) {
  initRound(round);
  const festas = state.rounds[round].festas;
  if (festas.length > 1) {
    festas.pop();
    saveState();
  }
}

function resetGame() {
  state = deepClone(DEFAULT_STATE);
  saveState();
}

// ── Score calculations ───────────────────────────────────────
function calcTotal1(r) {
  const rd = state.rounds[r];
  if (!rd) return {};
  const totals = {};
  state.players.forEach(p => { totals[p.id] = 0; });
  PENALTY_ROWS.forEach(pr => {
    state.players.forEach(p => {
      totals[p.id] -= (rd.penalties[pr.key][p.id] || 0);
    });
  });
  return totals;
}

function calcTotal2(r) {
  const rd = state.rounds[r];
  if (!rd) return {};
  const totals = {};
  state.players.forEach(p => { totals[p.id] = 0; });
  rd.festas.forEach(f => {
    state.players.forEach(p => {
      totals[p.id] += (f[p.id] || 0);
    });
  });
  return totals;
}

function calcGrandTotal(r) {
  const t1 = calcTotal1(r);
  const t2 = calcTotal2(r);
  const gt = {};
  state.players.forEach(p => {
    gt[p.id] = (t1[p.id] || 0) + (t2[p.id] || 0);
  });
  return gt;
}

function calcAllRoundsTotal() {
  const totals = {};
  state.players.forEach(p => { totals[p.id] = 0; });
  for (let r = 1; r <= NUM_ROUNDS; r++) {
    if (state.rounds[r]) {
      const gt = calcGrandTotal(r);
      state.players.forEach(p => { totals[p.id] += (gt[p.id] || 0); });
    }
  }
  return totals;
}

function getRankings() {
  const allTotals = calcAllRoundsTotal();
  return [...state.players]
    .sort((a, b) => allTotals[b.id] - allTotals[a.id])
    .map((p, i) => ({ ...p, total: allTotals[p.id], rank: i + 1 }));
}
