/* ============================================================
   UI.JS — Shared UI utilities
   ============================================================ */

let toastTimer = null;

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#c9a84c', '#f0d080', '#ffffff', '#d64545', '#4caf7a', '#5b8dd9'];
  const style = document.createElement('style');
  style.textContent = `@keyframes cffall{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(700px) rotate(720deg)}}`;
  document.head.appendChild(style);
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div');
    const col = colors[Math.floor(Math.random() * colors.length)];
    const sz = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;left:${Math.random()*100}%;top:-10px;width:${sz}px;height:${sz}px;background:${col};border-radius:${Math.random()>.5?'50%':'2px'};animation:cffall ${1.2+Math.random()*1.8}s ${Math.random()*.6}s forwards`;
    container.appendChild(p);
  }
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

/* ── Screen navigation ──────────────────────────────────────*/
function openModule(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + id);
  if (screen) screen.classList.add('active');
  if (id === 'king') renderKing();
}

function goHome() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-home').classList.add('active');
}

/* ── Helpers ─────────────────────────────────────────────────*/
function fmt(v) {
  if (v === 0 || v === undefined) return '0';
  return v > 0 ? '+' + v : String(v);
}

function scoreClass(v, positiveIsGood = true) {
  if (v === 0) return 'c-zero';
  if (positiveIsGood) return v > 0 ? 'c-pos' : 'c-neg';
  return v < 0 ? 'c-pos' : 'c-neg';
}

function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}
