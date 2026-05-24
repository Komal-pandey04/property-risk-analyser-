/* ── Dashboard Page ── */
async function renderDashboard(el) {
  el.innerHTML = `
    <div class="card-grid">
      <div class="stat-card stat-blue"><div class="stat-icon">🏠</div><div class="stat-val" id="s-total">29,451</div><div class="stat-label">Total Properties</div></div>
      <div class="stat-card stat-green"><div class="stat-icon">💰</div><div class="stat-val" id="s-price">₹68.4L</div><div class="stat-label">Avg. Price</div></div>
      <div class="stat-card stat-amber"><div class="stat-icon">⚡</div><div class="stat-val" id="s-risk">42</div><div class="stat-label">Avg. Risk Score</div></div>
      <div class="stat-card stat-purple"><div class="stat-icon">🌆</div><div class="stat-val" id="s-cities">48</div><div class="stat-label">Cities Covered</div></div>
    </div>
    <div class="two-col mb-6">
      <div class="card">
        <div class="flex-between mb-4"><span style="font-weight:600;font-size:15px">Avg. Price by City</span><span class="badge blue">Live</span></div>
        <div class="bar-chart" id="city-chart"></div><div style="height:28px"></div>
      </div>
      <div class="card">
        <div style="font-weight:600;font-size:15px;margin-bottom:16px">Crime Index by State</div>
        <div id="crime-mini-chart"></div>
      </div>
    </div>
    <div class="two-col">
      <div class="card">
        <div style="font-weight:600;font-size:15px;margin-bottom:16px">Recent Activity</div>
        <div id="activity-list"></div>
      </div>
      <div class="card">
        <div style="font-weight:600;font-size:15px;margin-bottom:16px">ML Model Performance</div>
        <div id="ml-perf"></div>
      </div>
    </div>`;

  // Load stats from API
  try {
    const stats = await API.get('/properties/stats');
    if (stats.total) document.getElementById('s-total').textContent = stats.total.toLocaleString();
    if (stats.avgPrice) document.getElementById('s-price').textContent = `₹${stats.avgPrice}L`;
    if (stats.avgRisk)  document.getElementById('s-risk').textContent  = stats.avgRisk;
    if (stats.cities)   document.getElementById('s-cities').textContent = stats.cities;

    // City chart
    if (stats.cityStats) {
      const top = stats.cityStats.slice(0, 6);
      const maxP = Math.max(...top.map(c => c.avgPrice));
      document.getElementById('city-chart').innerHTML = top.map(c => `
        <div class="bar-item" style="background:linear-gradient(180deg,rgba(37,99,235,.8),rgba(37,99,235,.3));height:${Math.max(10, (c.avgPrice / maxP) * 100)}%">
          <div class="bar-val">₹${c.avgPrice}L</div>
          <div class="bar-label">${c.city.slice(0, 8)}</div>
        </div>`).join('');
    }
  } catch(e) {}

  // Crime mini chart
  const crimeStates = [['UP', 74], ['Bihar', 71], ['Delhi', 68], ['Rajasthan', 65], ['Assam', 62]];
  document.getElementById('crime-mini-chart').innerHTML = crimeStates.map(([s, v]) => `
    <div style="margin-bottom:12px">
      <div class="flex-between" style="margin-bottom:4px;font-size:12px"><span>${s}</span><span style="font-family:var(--mono);color:${v > 65 ? 'var(--red)' : v > 50 ? 'var(--amber)' : 'var(--green)'}">${v}</span></div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${v}%;background:${v > 65 ? 'var(--red)' : v > 50 ? 'var(--amber)' : 'var(--green)'}"></div></div>
    </div>`).join('');

  // Activity feed
  const acts = [
    { icon: '🏠', text: 'New listing: 3BHK Koramangala, Bangalore — ₹72L', time: '2m ago' },
    { icon: '🤖', text: 'ML Prediction: ₹78L for 3BHK in Whitefield', time: '15m ago' },
    { icon: '⚠️', text: 'High-risk alert: Bihar properties — Score 71', time: '1h ago' },
    { icon: '📧', text: 'Auto-mail sent: Registry verification complete', time: '2h ago' },
    { icon: '❤️', text: 'Property saved: Villa in Banjara Hills, Hyd', time: '3h ago' },
  ];
  document.getElementById('activity-list').innerHTML = acts.map(a => `
    <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);align-items:flex-start">
      <div style="width:32px;height:32px;border-radius:8px;background:rgba(37,99,235,.1);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${a.icon}</div>
      <div><div style="font-size:13px">${a.text}</div><div style="font-size:11px;color:var(--text3);margin-top:2px">${a.time}</div></div>
    </div>`).join('');

  // ML metrics
  const models = [
    { name: 'Gradient Boosting', r2: '95.1%', color: 'amber' },
    { name: 'Random Forest',     r2: '93.4%', color: 'green' },
    { name: 'Linear Regression', r2: '87.2%', color: 'blue' },
    { name: 'Logistic Reg.',     r2: '83.6%', color: 'purple' },
  ];
  document.getElementById('ml-perf').innerHTML = models.map(m => `
    <div class="flex-between" style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div><div style="font-size:13px">${m.name}</div><div style="font-size:11px;color:var(--text3)">Accuracy Score</div></div>
      <span class="badge ${m.color}">${m.r2}</span>
    </div>`).join('');
}
