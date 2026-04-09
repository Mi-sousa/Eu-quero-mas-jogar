/* ============================================================
   KING.JS — King module rendering & interaction
   ============================================================ */

function renderRoundPills() {
  const container = document.getElementById('round-pills');
  container.innerHTML = '';
  for (let r = 1; r <= NUM_ROUNDS; r++) {
    const btn = document.createElement('button');
    btn.className = 'round-pill' + (r === state.currentRound ? ' active' : state.rounds[r] ? ' done' : '');
    btn.textContent = 'Ronda ' + r;
    btn.addEventListener('click', () => { state.currentRound = r; renderKing(); });
    container.appendChild(btn);
  }
}

function renderTotalsBar() {
  const container = document.getElementById('totals-bar');
  container.innerHTML = '';
  const rankings = getRankings();
  const medals = ['♛', '♜', '♝'];

  rankings.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'total-card' + (i === 0 ? ' rank-1' : '');
    const rankLabel = (i < 3 ? medals[i] + ' ' : '') + (i + 1) + 'º lugar';

    card.innerHTML = `
      <div class="avatar" style="background:${p.color}22;color:${p.color}" title="Clica para mudar cor">
        ${getInitials(p.name)}
      </div>
      <div class="tc-info">
        <input
          class="player-name-edit"
          type="text"
          value="${p.name}"
          maxlength="14"
          data-pid="${p.id}"
          title="Clica para editar o nome"
        />
        <div class="tc-rank">${rankLabel}</div>
      </div>
      <div class="tc-score">${p.total}</div>
    `;

    // Rename on blur/enter
    const input = card.querySelector('.player-name-edit');
    input.addEventListener('blur', () => {
      const newName = input.value.trim();
      if (newName && newName !== p.name) {
        renamePlayer(p.id, newName);
        renderKing();
        showToast('Nome atualizado!');
      }
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') input.blur();
    });

    container.appendChild(card);
  });
}

function renderScorecard() {
  const tbl = document.getElementById('scorecard');
  initRound(state.currentRound);
  const rd = state.rounds[state.currentRound];
  const t1 = calcTotal1(state.currentRound);
  const t2 = calcTotal2(state.currentRound);
  const gt = calcGrandTotal(state.currentRound);
  const numP = state.players.length;

  // ── Header
  let html = '<thead><tr><th>Categoria</th>';
  state.players.forEach(p => {
    html += `<th><span class="player-color-dot" style="background:${p.color}"></span>${p.name}</th>`;
  });
  html += '</tr></thead><tbody>';

  // ── Penalties
  html += `<tr class="row-section-header"><td colspan="${1 + numP}">Penalizações (pontos negativos)</td></tr>`;
  PENALTY_ROWS.forEach(pr => {
    const labelVal = rd.penalties[pr.key] ? rd.penalties[pr.key].label : pr.defaultLabel;
    html += `<tr class="row-penalty"><td>
      <input class="row-label-edit" type="text" value="${labelVal}" data-type="pen-label" data-key="${pr.key}" />
    </td>`;
    state.players.forEach(p => {
      const v = rd.penalties[pr.key] ? (rd.penalties[pr.key].values[p.id] || 0) : 0;
      html += `<td><input class="score-cell" type="number" value="${v}" data-type="pen" data-key="${pr.key}" data-pid="${p.id}" /></td>`;
    });
    html += '</tr>';
  });

  // Total 1
  html += `<tr class="row-total"><td>Total 1 (pontos negativos)</td>`;
  state.players.forEach(p => {
    html += `<td class="computed ${scoreClass(t1[p.id], false)}" data-total1="${p.id}">${fmt(t1[p.id])}</td>`;
  });
  html += '</tr>';

  // ── Festas
  html += `<tr class="row-section-header"><td colspan="${1 + numP}">Festas (pontos positivos)</td></tr>`;
  rd.festas.forEach((f, i) => {
    html += `<tr class="row-festa"><td>
      <input class="row-label-edit" type="text" value="${f.label}" data-type="festa-label" data-fi="${i}" />
    </td>`;
    state.players.forEach(p => {
      const v = f.values[p.id] || 0;
      html += `<td><input class="score-cell" type="number" value="${v}" data-type="festa" data-fi="${i}" data-pid="${p.id}" /></td>`;
    });
    html += '</tr>';
  });

  // Total 2
  html += `<tr class="row-total2"><td>Total 2 (pontos positivos)</td>`;
  state.players.forEach(p => {
    html += `<td class="computed ${scoreClass(t2[p.id], true)}" data-total2="${p.id}">${fmt(t2[p.id])}</td>`;
  });
  html += '</tr>';

  // Grand total
  html += `<tr class="row-grandtotal"><td>♛ Soma Total</td>`;
  state.players.forEach(p => {
    html += `<td class="computed c-gold" data-grandtotal="${p.id}">${fmt(gt[p.id])}</td>`;
  });
  html += '</tr></tbody>';

  tbl.innerHTML = html;

  // Attach score input listeners
  tbl.querySelectorAll('.score-cell').forEach(input => {
    input.addEventListener('input', onCellInput);
  });

  // Attach label edit listeners
  tbl.querySelectorAll('.row-label-edit').forEach(input => {
    input.addEventListener('blur', onLabelEdit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  });

  document.getElementById('btn-remove-festa').style.display =
    rd.festas.length > 1 ? '' : 'none';
}

function onCellInput(e) {
  const el = e.target;
  const pid = parseInt(el.dataset.pid);
  const v = parseInt(el.value) || 0;
  const r = state.currentRound;
  if (el.dataset.type === 'pen') {
    setPenaltyValue(r, el.dataset.key, pid, v);
  } else {
    setFestaValue(r, parseInt(el.dataset.fi), pid, v);
  }
  updateComputedTotals();
}

function onLabelEdit(e) {
  const el = e.target;
  const r = state.currentRound;
  const label = el.value.trim() || el.value;
  if (!label) return;
  if (el.dataset.type === 'pen-label') {
    setPenaltyLabel(r, el.dataset.key, label);
  } else if (el.dataset.type === 'festa-label') {
    setFestaLabel(r, parseInt(el.dataset.fi), label);
  }
}

function updateComputedTotals() {
  const r = state.currentRound;
  const t1 = calcTotal1(r), t2 = calcTotal2(r), gt = calcGrandTotal(r);
  state.players.forEach(p => {
    const c1 = document.querySelector(`[data-total1="${p.id}"]`);
    const c2 = document.querySelector(`[data-total2="${p.id}"]`);
    const cg = document.querySelector(`[data-grandtotal="${p.id}"]`);
    if (c1) { c1.textContent = fmt(t1[p.id]); c1.className = `computed ${scoreClass(t1[p.id], false)}`; }
    if (c2) { c2.textContent = fmt(t2[p.id]); c2.className = `computed ${scoreClass(t2[p.id], true)}`; }
    if (cg) { cg.textContent = fmt(gt[p.id]); cg.className = 'computed c-gold'; }
  });
  renderTotalsBar();
}

function renderKing() {
  renderRoundPills();
  renderTotalsBar();
  renderScorecard();
}

/* ── Add player modal ────────────────────────────────────────*/
let selectedColor = PALETTE[0];

function openAddPlayerModal() {
  selectedColor = PALETTE[state.players.length % PALETTE.length];
  renderColorPicker();
  document.getElementById('pname-inp').value = '';
  openModal();
  setTimeout(() => document.getElementById('pname-inp').focus(), 80);
}

function renderColorPicker() {
  const container = document.getElementById('cpicker');
  container.innerHTML = '';
  PALETTE.forEach(color => {
    const dot = document.createElement('div');
    dot.className = 'cdot' + (color === selectedColor ? ' sel' : '');
    dot.style.background = color;
    dot.addEventListener('click', () => { selectedColor = color; renderColorPicker(); });
    container.appendChild(dot);
  });
}

function confirmAddPlayer() {
  const name = document.getElementById('pname-inp').value.trim();
  if (!name) { showToast('Insere um nome'); return; }
  if (state.players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
    showToast('Nome já existe'); return;
  }
  addPlayer(name, selectedColor);
  closeModal();
  renderKing();
  showToast(name + ' adicionado!');
}
