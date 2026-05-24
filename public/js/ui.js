/* ── PRISM UI Helpers ── */
function toast(msg, type = 'blue') {
  const icons = { green: '✅', blue: 'ℹ️', amber: '⚠️', red: '❌' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function riskColor(label) {
  return label === 'low' ? 'var(--green)' : label === 'medium' ? 'var(--amber)' : 'var(--red)';
}

function riskBadgeHtml(label, score) {
  const cls = label === 'low' ? 'green' : label === 'medium' ? 'amber' : 'red';
  return `<span class="badge ${cls}">Risk ${score}</span>`;
}

function propEmojiByIndex(id) {
  const emojis = ['🏠', '🏡', '🏢', '🏗', '🏰', '🏘', '🏛', '🏣', '🏤', '🏥'];
  return emojis[id % emojis.length];
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeCompose() {
  document.getElementById('compose-overlay').classList.remove('open');
  document.getElementById('cmp-to').value = '';
  document.getElementById('cmp-sub').value = '';
  document.getElementById('cmp-body').value = '';
}

async function sendComposedMail() {
  const to   = document.getElementById('cmp-to').value.trim();
  const sub  = document.getElementById('cmp-sub').value.trim();
  const body = document.getElementById('cmp-body').value.trim();
  if (!to || !sub) { toast('Please fill all fields', 'amber'); return; }

  State.injectMail({ from: currentUser.email, to, subject: sub, body, unread: false });
  // Also POST to backend for real SMTP
  await API.post('/mail/send', { to, subject: sub, body });
  closeCompose();
  toast(`Email sent from ${currentUser.email}`, 'green');
}

// Pagination helper
function paginate(arr, page, perPage = 24) {
  const start = (page - 1) * perPage;
  return { items: arr.slice(start, start + perPage), total: arr.length, pages: Math.ceil(arr.length / perPage) };
}

// Format currency
function fmtPrice(p) { return `₹${parseFloat(p).toFixed(1)}L`; }

// EMI calculator
function calcEMI(principal, years = 20, rate = 8.5) {
  const p = principal * 100000 * 0.8; // 20% down
  const r = rate / 12 / 100;
  const n = years * 12;
  return Math.round(p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
}
