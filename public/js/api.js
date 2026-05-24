/* ── PRISM API Helper ── */
const API = {
  base: '/api',

  getToken() { return localStorage.getItem('prism_token'); },

  headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.getToken() ? { 'Authorization': `Bearer ${this.getToken()}` } : {})
    };
  },

  async get(path) {
    const r = await fetch(this.base + path, { headers: this.headers() });
    return r.json();
  },

  async post(path, body) {
    const r = await fetch(this.base + path, {
      method: 'POST', headers: this.headers(), body: JSON.stringify(body)
    });
    return r.json();
  },

  async delete(path) {
    const r = await fetch(this.base + path, { method: 'DELETE', headers: this.headers() });
    return r.json();
  },

  async patch(path, body = {}) {
    const r = await fetch(this.base + path, {
      method: 'PATCH', headers: this.headers(), body: JSON.stringify(body)
    });
    return r.json();
  }
};
