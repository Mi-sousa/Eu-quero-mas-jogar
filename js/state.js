/* ============================================================
   STATE.JS — Application state, calculations & persistence
   ============================================================ */

const PALETTE = [
  '#c9a84c', '#d64545', '#4caf7a',
  '#5b8dd9', '#a066d3', '#e07b3a',
  '#4db3b3', '#d45b8a',
];

const NUM_ROUNDS = 8;

const PENALTY_ROWS = [
  { key: 'no_vazar', defaultLabel: '🚫 Sem vazar' },
  { key: 'copas',    defaultLabel: '♥ Copas'      },
  { key: 'damas',    defaultLabel: '👸 Damas'      },
  { key: 'homens',   defaultLabel: '🕺 Homens'     },
  { key: 'porco',    defaultLabel: '🐷 Porco'      },
  { key: 'dobro',    defaultLabel: '2✖ Dobro'      },
];

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

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* ── Persistence ─────────────────────────────────────────────*/
function saveState() {
  try { localStorage.setItem('gamenight-king', JSON.stringify(state)); }
  catch (e) { console.warn('Could not save state:', e); }
}

function loadState() {
  try {
    const saved = localStorage.getItem('gamenight-king');
    if (saved) state = JSON.parse(saved);
  } catch (e) {
    console.warn('Could not load state:', e);
    state = deepClone(DEFAULT_STATE);
  }
}

/* ── Round init ──────────────────────────────────────────────*/
function initRound(r) {
  if (!state.rounds[r]) {
    const penalties = {};
    PENALTY_ROWS.forEach(pr => {
      penalties[pr.key] = { label: pr.defaultLabel, values: {} };
      state.players.forEach(p => { penalties[pr.key].values[p.id] = 0; });
    });
    const festas = [];
    for (let i = 0; i < 4; i++) {
      const vals = {};
      state.players.forEach(p => { vals[p.id] = 0; });
      festas.push({ label: 'Festa ' + (i + 1), values: vals });
    }
    state.rounds[r] = { penalties, festas };
  } else {
    // Ensure new players have entries
    const rd = state.rounds[r];
    state.players.forEach(p => {
      PENALTY_ROWS.forEach(pr => {
        if (!rd.penalties[pr.key]) {
          rd.penalties[pr.key] = { label: pr.defaultLabel, values: {} };
        }
        if (rd.penalties[pr.key].values[p.id] === undefined) {
          rd.penalties[pr.key].values[p.id] = 0;
        }
      });
      rd.festas.forEach(f => {
        if (f.values[p.id] === undefined) f.values[p.id] = 0;
      });
    });
  }
}

/* ── Mutations ───────────────────────────────────────────────*/
function addPlayer(name, color) {
  const id = state.nextId++;
  state.players.push({ id, name, color });
  Object.keys(state.rounds).forEach(r => {
    const rd = state.rounds[r];
    PENALTY_ROWS.forEach(pr => {
      if (rd.penalties[pr.key]) rd.penalties[pr.key].values[id] = 0;
    });
    rd.festas.forEach(f => { f.values[id] = 0; });
  });
  saveState();
  return id;
}

function renamePlayer(id, name) {
  const p = state.players.find(p => p.id === id);
  if (p) { p.name = name; saveState(); }
}

function setPenaltyValue(round, key, pid, value) {
  initRound(round);
  state.rounds[round].penalties[key].values[pid] = parseInt(value) || 0;
  saveState();
}

function setPenaltyLabel(round, key, label) {
  initRound(round);
  state.rounds[round].penalties[key].label = label;
  saveState();
}

function setFestaValue(round, fi, pid, value) {
  initRound(round);
  state.rounds[round].festas[fi].values[pid] = parseInt(value) || 0;
  saveState();
}

function setFestaLabel(round, fi, label) {
  initRound(round);
  state.rounds[round].festas[fi].label = label;
  saveState();
}

function addFesta(round) {
  initRound(round);
  const vals = {};
  state.players.forEach(p => { vals[p.id] = 0; });
  const n = state.rounds[round].festas.length + 1;
  state.rounds[round].festas.push({ label: 'Festa ' + n, values: vals });
  saveState();
}

function removeFesta(round) {
  initRound(round);
  const festas = state.rounds[round].festas;
  if (festas.length > 1) { festas.pop(); saveState(); }
}

function resetGame() {
  state = deepClone(DEFAULT_STATE);
  saveState();
}

/* ── Calculations ────────────────────────────────────────────*/
function calcTotal1(r) {
  const rd = state.rounds[r]; if (!rd) return {};
  const totals = {};
  state.players.forEach(p => { totals[p.id] = 0; });
  PENALTY_ROWS.forEach(pr => {
    if (rd.penalties[pr.key]) {
      state.players.forEach(p => {
        totals[p.id] -= (rd.penalties[pr.key].values[p.id] || 0);
      });
    }
  });
  return totals;
}

function calcTotal2(r) {
  const rd = state.rounds[r]; if (!rd) return {};
  const totals = {};
  state.players.forEach(p => { totals[p.id] = 0; });
  rd.festas.forEach(f => {
    state.players.forEach(p => { totals[p.id] += (f.values[p.id] || 0); });
  });
  return totals;
}

function calcGrandTotal(r) {
  const t1 = calcTotal1(r), t2 = calcTotal2(r), gt = {};
  state.players.forEach(p => { gt[p.id] = (t1[p.id] || 0) + (t2[p.id] || 0); });
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
