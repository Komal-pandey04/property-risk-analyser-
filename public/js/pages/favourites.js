/* ── Favourites Page ── */
function renderFavourites(el) {
  el.innerHTML = `
    <div class="flex-between mb-4">
      <div style="color:var(--text2)">${State.favourites.size} saved properties</div>
      <button class="btn ghost" onclick="State.favourites.clear();State.saveFavs();renderFavourites(document.querySelector('.page'))">Clear All</button>
    </div>
    <div class="prop-grid" id="fav-grid"></div>`;

  const favProps = (allProps.length ? allProps : generateFallbackProps(200)).filter(p => State.favourites.has(p.id));
  const grid = document.getElementById('fav-grid');
  if (!favProps.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text3)">No favourites yet.<br>Browse properties and click ♡ to save them.</div>';
    return;
  }
  grid.innerHTML = favProps.map(propCardHtml).join('');
}

/* ── Insights Page ── */
function renderInsights(el) {
  el.innerHTML = `
    <div class="tabs">
      <button class="tab active" onclick="insightTab(this,'top')">Top Picks</button>
      <button class="tab" onclick="insightTab(this,'trend')">Price Trends</button>
      <button class="tab" onclick="insightTab(this,'safe')">Safest Areas</button>
    </div>
    <div id="insight-content"></div>`;
  showInsightTop();
}

function insightTab(btn, id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  if (id === 'top') showInsightTop();
  else if (id === 'trend') showInsightTrend();
  else showInsightSafe();
}

function showInsightTop() {
  const props = generateFallbackProps(100).filter(p => p.riskScore < 40 && p.rera).slice(0, 6);
  document.getElementById('insight-content').innerHTML = `
    <div style="margin-bottom:12px;color:var(--text2);font-size:13px">AI-selected properties: low risk, RERA-approved, best value</div>
    <div class="prop-grid">${props.map(p => `
      <div class="prop-card" onclick="showPropertyDetail(${JSON.stringify(p).replace(/"/g, '&quot;')})">
        <div class="prop-thumb">${propEmojiByIndex(p.id)}<div class="prop-risk-badge">${riskBadgeHtml(p.riskLabel, p.riskScore)}</div></div>
        <div class="prop-body">
          <div class="prop-price">₹${p.price}L</div>
          <div class="prop-address">📍 ${p.locality}, ${p.city}</div>
          <div class="prop-meta"><span>🛏 ${p.bhk} BHK</span><span>📐 ${p.sqft} sqft</span></div>
          <span class="insight-rec-badge">AI Recommended ✓</span>
        </div>
      </div>`).join('')}</div>`;
}

function showInsightTrend() {
  const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const vals  = [52, 49, 58, 70, 80, 91];
  const max   = Math.max(...vals);
  document.getElementById('insight-content').innerHTML = `
    <div class="card">
      <div style="font-weight:600;font-size:15px;margin-bottom:20px">Avg. Property Price Trend (₹L) — Pan India</div>
      <div class="bar-chart" style="height:160px">${years.map((y, i) => `
        <div class="bar-item" style="background:linear-gradient(180deg,rgba(16,185,129,.8),rgba(16,185,129,.2));height:${(vals[i] / max) * 100}%">
          <div class="bar-val">₹${vals[i]}L</div><div class="bar-label">${y}</div>
        </div>`).join('')}
      </div>
      <div style="height:32px"></div>
      <div style="font-size:13px;color:var(--text2);margin-top:8px">📈 14.7% CAGR over 5 years. Post-2022 growth driven by IT sector expansion in Bangalore & Hyderabad.</div>
    </div>`;
}

function showInsightSafe() {
  const safeAreas = [
    { city: 'Kerala', desc: 'Kochi, Trivandrum', score: 82 },
    { city: 'Tamil Nadu', desc: 'Chennai, Coimbatore', score: 78 },
    { city: 'Karnataka', desc: 'Bangalore, Mysore', score: 72 },
    { city: 'Punjab', desc: 'Chandigarh, Ludhiana', score: 70 },
    { city: 'Gujarat', desc: 'Ahmedabad, Surat', score: 74 },
  ];
  document.getElementById('insight-content').innerHTML = `
    <div class="card">
      <div style="font-weight:600;font-size:15px;margin-bottom:16px">Safest States for Property Investment</div>
      ${safeAreas.map(s => `
        <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:28px;width:40px;text-align:center">🏛</div>
          <div style="flex:1">
            <div style="font-weight:600;color:#fff">${s.city}</div>
            <div style="font-size:12px;color:var(--text3)">${s.desc}</div>
            <div class="progress-wrap" style="margin-top:6px"><div class="progress-bar" style="width:${s.score}%;background:var(--green)"></div></div>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--mono);color:var(--green);font-size:20px;font-weight:700">${s.score}%</div>
            <div style="font-size:11px;color:var(--text3)">Safety</div>
          </div>
        </div>`).join('')}
    </div>`;
}

/* ── Price Predictor Page ── */
function renderPredictor(el) {
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 370px;gap:24px">
      <div class="card">
        <div style="font-weight:600;font-size:16px;margin-bottom:20px">Enter Property Details</div>
        <div class="form-row cols2">
          <div class="field-group"><label>AREA (sq ft)</label><input type="number" id="p-sqft" value="1200" placeholder="1200"></div>
          <div class="field-group"><label>BHK</label><select id="p-bhk"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option></select></div>
        </div>
        <div class="form-row cols2">
          <div class="field-group"><label>CITY</label><input type="text" id="p-city" value="Bangalore" placeholder="Bangalore"></div>
          <div class="field-group"><label>LOCALITY</label><input type="text" id="p-locality" placeholder="Koramangala"></div>
        </div>
        <div class="form-row cols3">
          <div class="field-group"><label>RERA APPROVED</label><select id="p-rera"><option value="1">Yes</option><option value="0">No</option></select></div>
          <div class="field-group"><label>READY TO MOVE</label><select id="p-rtm"><option value="1">Yes</option><option value="0">No</option></select></div>
          <div class="field-group"><label>RESALE</label><select id="p-resale"><option value="0">No</option><option value="1">Yes</option></select></div>
        </div>
        <div class="field-group"><label>PURPOSE</label><select id="p-purpose"><option>Buy</option><option>Rent</option></select></div>
        <div style="display:flex;gap:10px;margin-top:8px">
          <button class="btn primary" style="flex:1" onclick="runMLPrediction()">🤖 Run ML Prediction</button>
          <button class="btn ghost" onclick="resetPredictor()">Reset</button>
        </div>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
          <div style="font-size:11px;color:var(--text3);margin-bottom:10px;letter-spacing:.5px">MODELS USED</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${[['Linear Regression','blue'],['Random Forest','green'],['Gradient Boosting','amber'],['Ridge Regression','purple'],['Logistic Regression (Risk)','red']].map(([n, c]) => `<span class="badge ${c}">${n}</span>`).join('')}
          </div>
        </div>
      </div>
      <div>
        <div class="card mb-4">
          <div style="font-size:11px;color:var(--text3);letter-spacing:.5px;margin-bottom:10px">PREDICTED PRICE (ENSEMBLE)</div>
          <div style="font-size:40px;font-weight:700;color:#fff;font-family:var(--mono)" id="pred-price">—</div>
          <div style="font-size:12px;color:var(--text2);margin-top:4px" id="pred-range">Enter details and run prediction</div>
          <div style="margin-top:14px" id="model-bars"></div>
        </div>
        <div class="card mb-4">
          <div style="font-size:11px;color:var(--text3);letter-spacing:.5px;margin-bottom:12px">RISK ASSESSMENT</div>
          <div id="risk-result"><div style="color:var(--text3);font-size:13px">Run prediction to see risk analysis</div></div>
        </div>
        <div class="card">
          <div style="font-size:11px;color:var(--text3);letter-spacing:.5px;margin-bottom:12px">FEATURE IMPORTANCE</div>
          <div id="feat-imp"></div>
        </div>
      </div>
    </div>`;
}

async function runMLPrediction() {
  const sqft    = parseFloat(document.getElementById('p-sqft').value) || 1200;
  const bhk     = parseInt(document.getElementById('p-bhk').value) || 2;
  const city    = document.getElementById('p-city').value || 'Bangalore';
  const locality= document.getElementById('p-locality').value || '';
  const rera    = document.getElementById('p-rera').value === '1';
  const rtm     = document.getElementById('p-rtm').value  === '1';
  const resale  = document.getElementById('p-resale').value === '1';

  document.getElementById('pred-price').textContent = '⏳';
  document.getElementById('pred-range').textContent  = 'Computing...';

  const res = await API.post('/predict', { sqft, bhk, city, locality, rera, rtm, resale, userEmail: currentUser.email, userName: currentUser.name });

  const pred = res.predictions || {};
  const ens  = pred.ensemble || 0;
  const range = res.range || {};
  const risk  = res.riskAssessment || {};
  const fi    = res.featureImportance || [];

  document.getElementById('pred-price').textContent = `₹${ens}L`;
  document.getElementById('pred-range').textContent  = `Range: ₹${range.low}L – ₹${range.high}L`;

  document.getElementById('model-bars').innerHTML = [
    ['Linear Regression', pred.linearRegression, 'blue'],
    ['Random Forest',     pred.randomForest,     'green'],
    ['Gradient Boosting', pred.gradientBoosting,  'amber'],
    ['Ridge Regression',  pred.ridgeRegression,   'purple'],
    ['Ensemble',          ens,                    'blue'],
  ].map(([n, v, c]) => `
    <div style="margin-bottom:8px">
      <div class="flex-between" style="font-size:12px;margin-bottom:3px"><span style="color:var(--text2)">${n}</span><span style="font-family:var(--mono);color:var(--${c})">₹${v}L</span></div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${Math.min(100, (v / 200) * 100)}%;background:var(--${c})"></div></div>
    </div>`).join('');

  const rc = risk.riskClass === 'LOW' ? 'var(--green)' : risk.riskClass === 'MEDIUM' ? 'var(--amber)' : 'var(--red)';
  document.getElementById('risk-result').innerHTML = `
    <div style="text-align:center">
      <div style="font-size:36px;font-weight:700;font-family:var(--mono);color:${rc}">${risk.riskScore || '--'}</div>
      <span class="badge" style="background:${rc}22;color:${rc}">${risk.riskClass || '?'} RISK</span>
      <div style="font-size:12px;color:var(--text2);margin-top:8px">Logistic Regression confidence: ${risk.confidence || '--'}%</div>
    </div>`;

  const features = fi.length ? fi : [
    { feature: 'Square Footage', importance: 85 }, { feature: 'BHK', importance: 72 },
    { feature: 'City', importance: 68 }, { feature: 'RERA', importance: 55 },
    { feature: 'Ready to Move', importance: 48 }, { feature: 'Resale', importance: 32 }
  ];
  document.getElementById('feat-imp').innerHTML = features.map(f => `
    <div style="margin-bottom:8px">
      <div class="flex-between" style="font-size:12px;margin-bottom:3px"><span style="color:var(--text2)">${f.feature}</span><span style="color:var(--text3)">${f.importance}%</span></div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${f.importance}%;background:linear-gradient(90deg,var(--blue),var(--cyan))"></div></div>
    </div>`).join('');

  toast(`Prediction complete! ₹${ens}L — Email sent to ${currentUser.email}`, 'green');
}

function resetPredictor() {
  document.getElementById('p-sqft').value = '1200';
  document.getElementById('p-bhk').value = '2';
  document.getElementById('p-city').value = 'Bangalore';
  document.getElementById('p-locality').value = '';
  document.getElementById('pred-price').textContent = '—';
  document.getElementById('pred-range').textContent  = 'Enter details and run prediction';
  document.getElementById('model-bars').innerHTML = '';
  document.getElementById('risk-result').innerHTML = '<div style="color:var(--text3);font-size:13px">Run prediction to see risk analysis</div>';
  document.getElementById('feat-imp').innerHTML = '';
}
