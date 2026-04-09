const PALETTE = ['#c9a84c','#d64545','#4caf7a','#5b8dd9','#a066d3','#e07b3a','#4db3b3','#d45b8a'];
const NUM_ROUNDS = 8;

const PENALTY_ROWS = [
  { key: 'no_vazar', label: '🚫 Sem vazar', pts: 20  },
  { key: 'copas',    label: '♥ Copas',      pts: 20  },
  { key: 'damas',    label: '👸 Damas',      pts: 50  },
  { key: 'homens',   label: '🕺 Homens',     pts: 30  },
  { key: 'porco',    label: '🐷 Porco',      pts: 160 },
  { key: 'dobro',    label: '2✖ Dobro',      pts: 90  },
];

const DEFAULT_STATE = {
  players: [
    { id:1, name:'Jogador 1', color:'#c9a84c' },
    { id:2, name:'Jogador 2', color:'#d64545' },
    { id:3, name:'Jogador 3', color:'#4caf7a' },
    { id:4, name:'Jogador 4', color:'#5b8dd9' },
  ],
  currentRound: 1,
  nextId: 5,
  rounds: {},
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

function saveState() {
  try { localStorage.setItem('gamenight-king', JSON.stringify(state)); } catch(e) {}
}

function loadState() {
  try {
    const s = localStorage.getItem('gamenight-king');
    if (s) state = JSON.parse(s);
  } catch(e) { state = JSON.parse(JSON.stringify(DEFAULT_STATE)); }
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
      const f = { label: 'Festa ' + (i+1), values: {} };
      state.players.forEach(p => { f.values[p.id] = 0; });
      festas.push(f);
    }
    state.rounds[r] = { penalties, festas };
  } else {
    const rd = state.rounds[r];
    state.players.forEach(p => {
      PENALTY_ROWS.forEach(pr => {
        if (rd.penalties[pr.key] === undefined) rd.penalties[pr.key] = {};
        if (rd.penalties[pr.key][p.id] === undefined) rd.penalties[pr.key][p.id] = 0;
      });
      rd.festas.forEach(f => {
        if (!f.values) f.values = {};
        if (f.values[p.id] === undefined) f.values[p.id] = 0;
      });
    });
  }
}

function addPlayer(name, color) {
  const id = state.nextId++;
  state.players.push({ id, name, color });
  Object.keys(state.rounds).forEach(r => {
    const rd = state.rounds[r];
    PENALTY_ROWS.forEach(pr => { if(rd.penalties[pr.key]) rd.penalties[pr.key][id] = 0; });
    rd.festas.forEach(f => { f.values[id] = 0; });
  });
  saveState();
}

function renamePlayer(id, name) {
  const p = state.players.find(p => p.id === id);
  if (p) { p.name = name; saveState(); }
}

function setFestaLabel(round, fi, label) {
  if (state.rounds[round]) {
    state.rounds[round].festas[fi].label = label;
    saveState();
  }
}

function addFesta(round) {
  initRound(round);
  const n = state.rounds[round].festas.length + 1;
  const f = { label: 'Festa ' + n, values: {} };
  state.players.forEach(p => { f.values[p.id] = 0; });
  state.rounds[round].festas.push(f);
  saveState();
}

function removeFesta(round) {
  const festas = state.rounds[round] && state.rounds[round].festas;
  if (festas && festas.length > 1) { festas.pop(); saveState(); }
}

function resetGame() {
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveState();
}

function calcTotal1(r) {
  const rd = state.rounds[r]; if (!rd) return {};
  const t = {};
  state.players.forEach(p => { t[p.id] = 0; });
  PENALTY_ROWS.forEach(pr => {
    state.players.forEach(p => { t[p.id] -= (rd.penalties[pr.key] && rd.penalties[pr.key][p.id]) || 0; });
  });
  return t;
}

function calcTotal2(r) {
  const rd = state.rounds[r]; if (!rd) return {};
  const t = {};
  state.players.forEach(p => { t[p.id] = 0; });
  rd.festas.forEach(f => { state.players.forEach(p => { t[p.id] += (f.values[p.id] || 0); }); });
  return t;
}

function calcGrandTotal(r) {
  const t1 = calcTotal1(r), t2 = calcTotal2(r), gt = {};
  state.players.forEach(p => { gt[p.id] = (t1[p.id]||0) + (t2[p.id]||0); });
  return gt;
}

function calcAllRoundsTotal() {
  const t = {};
  state.players.forEach(p => { t[p.id] = 0; });
  for (let r = 1; r <= NUM_ROUNDS; r++) {
    if (state.rounds[r]) { const gt = calcGrandTotal(r); state.players.forEach(p => { t[p.id] += gt[p.id]||0; }); }
  }
  return t;
}

function getRankings() {
  const all = calcAllRoundsTotal();
  return [...state.players].sort((a,b) => all[b.id]-all[a.id]).map((p,i) => ({...p, total:all[p.id], rank:i+1}));
}
