/* ── PRISM Auth ── */
let currentUser = null;

function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
}

function togglePw(id, btn) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
  btn.textContent = el.type === 'password' ? '👁' : '🙈';
}

async function doLogin() {
  const email    = document.getElementById('l-email').value.trim();
  const password = document.getElementById('l-pass').value;
  if (!email || !password) { toast('Please enter email and password', 'amber'); return; }

  // Demo login bypass
  if (email === 'demo@property.com' && password === 'demo123') {
    currentUser = { id: 'demo', name: 'Demo User', email, phone: '' };
    localStorage.setItem('prism_token', 'demo_token');
    localStorage.setItem('prism_user', JSON.stringify(currentUser));
    enterApp();
    return;
  }

  const res = await API.post('/auth/login', { email, password });
  if (res.error) { toast(res.error, 'red'); return; }
  currentUser = res.user;
  localStorage.setItem('prism_token', res.token);
  localStorage.setItem('prism_user', JSON.stringify(res.user));
  enterApp();
}

async function doRegister() {
  const name  = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const pass  = document.getElementById('r-pass').value;
  if (!name || !email || !pass) { toast('Please fill all required fields', 'amber'); return; }
  if (pass.length < 6) { toast('Password must be at least 6 characters', 'amber'); return; }

  const res = await API.post('/auth/register', { name, email, password: pass, phone });
  if (res.error) { toast(res.error, 'red'); return; }
  currentUser = res.user;
  localStorage.setItem('prism_token', res.token);
  localStorage.setItem('prism_user', JSON.stringify(res.user));
  toast('Account created! Welcome to PRISM 🎉', 'green');
  enterApp();
}

function doLogout() {
  localStorage.removeItem('prism_token');
  localStorage.removeItem('prism_user');
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

function enterApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  // Update user panel
  const initials = currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('user-avatar-initials').textContent = initials;
  document.getElementById('user-display-name').textContent  = currentUser.name;
  document.getElementById('user-display-email').textContent = currentUser.email;
  navTo('dashboard');
}

// Auto-login from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('prism_user');
  const token = localStorage.getItem('prism_token');
  if (saved && token) {
    currentUser = JSON.parse(saved);
    enterApp();
  }
});
