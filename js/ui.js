/* ============================================================
   UI.JS — Shared UI utilities (toast, modal, confetti)
   ============================================================ */

// ── Toast ────────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ── Confetti ─────────────────────────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';

  const colors = ['#c9a84c', '#f0d080', '#ffffff', '#d64545', '#4caf7a', '#5b8dd9'];

  const style = document.createElement('style');
  style.id = 'confetti-anim';
  style.textContent = `
    @keyframes confetti-fall {
      0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
      100% { opacity: 0; transform: translateY(700px) rotate(720deg); }
    }
  `;
  if (!document.getElementById('confetti-anim')) {
    document.head.appendChild(style);
  }

  for (let i = 0; i < 70; i++) {
    const piece = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isCircle = Math.random() > 0.5;
    const size = 6 + Math.random() * 6;
    const duration = 1.2 + Math.random() * 1.8;
    const delay = Math.random() * 0.6;

    piece.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: -10px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${isCircle ? '50%' : '2px'};
      animation: confetti-fall ${duration}s ${delay}s forwards;
    `;
    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// ── Modal ────────────────────────────────────────────────────
function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ── Tab navigation ───────────────────────────────────────────
function initTabs() {
  document.getElementById('tab-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    const moduleId = btn.dataset.module;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));

    btn.classList.add('active');
    const mod = document.getElementById('mod-' + moduleId);
    if (mod) mod.classList.add('active');
  });
}

// ── Format helpers ───────────────────────────────────────────
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
