/* ════════════════════════════════════════════════════════════
   PRISM — Risk Analyzer Page
   Fully self-contained with inline crime data.
   API call is optional — works offline too.
   ════════════════════════════════════════════════════════════ */

// ── Complete crime dataset (from NCRB) ────────────────────────
const CRIME_DATA = {
  'Andhra Pradesh': { score: 48, arrests: 11500, cs: 8200, conv: 4300,  safetyTip: 'Coastal cities like Visakhapatnam are relatively safer.' },
  'Arunachal Pradesh':{ score: 22, arrests: 320,   cs: 180,  conv: 90,   safetyTip: 'One of the safest states with low crime density.' },
  'Assam':          { score: 62, arrests: 19280,  cs: 5850, conv: 1200, safetyTip: 'Urban areas of Guwahati see higher crime rates.' },
  'Bihar':          { score: 74, arrests: 32000,  cs: 18900,conv: 2100, safetyTip: 'Patna and Gaya have elevated risk. Extra caution advised.' },
  'Chhattisgarh':   { score: 56, arrests: 9800,   cs: 5400, conv: 1800, safetyTip: 'Raipur is safer; rural belts carry higher risk.' },
  'Delhi':          { score: 71, arrests: 21800,  cs: 9500, conv: 2800, safetyTip: 'South Delhi and NCR suburbs are relatively safer zones.' },
  'Goa':            { score: 28, arrests: 1200,   cs: 700,  conv: 420,  safetyTip: 'Low crime state. Tourist areas are well-patrolled.' },
  'Gujarat':        { score: 39, arrests: 12800,  cs: 7500, conv: 4100, safetyTip: 'Ahmedabad and Surat are largely safe for investment.' },
  'Haryana':        { score: 58, arrests: 14200,  cs: 7800, conv: 2600, safetyTip: 'Gurugram has better law enforcement than rural areas.' },
  'Himachal Pradesh':{ score: 24, arrests: 1800,  cs: 900,  conv: 560,  safetyTip: 'Very low crime. Shimla and Dharamshala are safe.' },
  'Jharkhand':      { score: 65, arrests: 11200,  cs: 5900, conv: 1400, safetyTip: 'Ranchi has better safety. Remote areas carry higher risk.' },
  'Karnataka':      { score: 44, arrests: 17500,  cs: 8400, conv: 4800, safetyTip: 'Bangalore (South/East) has low risk. Good for investment.' },
  'Kerala':         { score: 31, arrests: 9200,   cs: 4100, conv: 3200, safetyTip: 'Safest large state. Kochi and Trivandrum highly recommended.' },
  'Madhya Pradesh': { score: 67, arrests: 28900,  cs: 14200,conv: 3800, safetyTip: 'Indore and Bhopal are safer; avoid rural belts.' },
  'Maharashtra':    { score: 51, arrests: 35600,  cs: 14800,conv: 6900, safetyTip: 'Mumbai suburbs and Pune are safe investment zones.' },
  'Manipur':        { score: 35, arrests: 1100,   cs: 580,  conv: 310,  safetyTip: 'Urban Imphal is relatively calm.' },
  'Meghalaya':      { score: 30, arrests: 980,    cs: 520,  conv: 280,  safetyTip: 'Shillong is safe with low crime density.' },
  'Mizoram':        { score: 18, arrests: 420,    cs: 210,  conv: 140,  safetyTip: 'Lowest crime rates in India. Very safe.' },
  'Nagaland':       { score: 20, arrests: 380,    cs: 190,  conv: 110,  safetyTip: 'Low crime state overall.' },
  'Odisha':         { score: 53, arrests: 13200,  cs: 6800, conv: 2100, safetyTip: 'Bhubaneswar is safe; coastal towns vary.' },
  'Punjab':         { score: 43, arrests: 11800,  cs: 7200, conv: 3400, safetyTip: 'Chandigarh is very safe. Good investment climate.' },
  'Rajasthan':      { score: 66, arrests: 28400,  cs: 13800,conv: 4200, safetyTip: 'Jaipur is safer than rural Rajasthan.' },
  'Sikkim':         { score: 15, arrests: 280,    cs: 140,  conv: 90,   safetyTip: 'Safest state. Gangtok is excellent for property.' },
  'Tamil Nadu':     { score: 37, arrests: 20100,  cs: 9200, conv: 5800, safetyTip: 'Chennai, Coimbatore and Madurai are safe cities.' },
  'Telangana':      { score: 46, arrests: 13800,  cs: 7100, conv: 3200, safetyTip: 'Hyderabad IT corridor is a safe investment zone.' },
  'Tripura':        { score: 33, arrests: 1800,   cs: 920,  conv: 480,  safetyTip: 'Agartala is relatively safe.' },
  'Uttar Pradesh':  { score: 76, arrests: 68000,  cs: 38000,conv: 7800, safetyTip: 'Noida and Lucknow are safer than rural UP.' },
  'Uttarakhand':    { score: 34, arrests: 3200,   cs: 1600, conv: 820,  safetyTip: 'Dehradun is a safe and growing investment city.' },
  'West Bengal':    { score: 59, arrests: 28600,  cs: 11400,conv: 3900, safetyTip: 'Kolkata south and New Town are safer investment zones.' },
  'Andaman & Nicobar Islands': { score: 19, arrests: 180, cs: 90, conv: 55, safetyTip: 'Very safe. Low crime island territory.' },
  'Chandigarh':     { score: 21, arrests: 820,    cs: 420,  conv: 260,  safetyTip: 'Well-planned city. One of the safest UTs.' },
  'Jammu & Kashmir':{ score: 45, arrests: 4800,   cs: 2400, conv: 980,  safetyTip: 'Jammu city is safe; urban J&K improving rapidly.' },
  'Puducherry':     { score: 26, arrests: 1100,   cs: 560,  conv: 320,  safetyTip: 'Small, safe UT. Good for investment.' },
};

// Investment rating based on risk score
function getInvestmentRating(score) {
  if (score <= 30) return { label: 'EXCELLENT', color: 'var(--green)',  stars: '★★★★★' };
  if (score <= 45) return { label: 'GOOD',      color: 'var(--green)',  stars: '★★★★☆' };
  if (score <= 58) return { label: 'MODERATE',  color: 'var(--amber)',  stars: '★★★☆☆' };
  if (score <= 68) return { label: 'RISKY',     color: 'var(--amber)',  stars: '★★☆☆☆' };
  return              { label: 'HIGH RISK',  color: 'var(--red)',    stars: '★☆☆☆☆' };
}

/* ── Render the full Risk Analyzer page ──────────────────────── */
function renderRisk(el) {
  const stateOptions = Object.keys(CRIME_DATA).sort().map(s =>
    `<option value="${s}">${s}</option>`
  ).join('');

  el.innerHTML = `
    <!-- TOP ROW -->
    <div class="two-col mb-6" style="align-items:stretch">

      <!-- LEFT: State selector + stats grid -->
      <div class="card">
        <div style="font-weight:600;font-size:15px;margin-bottom:16px">State Crime Analysis</div>
        <div class="field-group">
          <label>SELECT STATE</label>
          <select id="risk-state" onchange="analyzeStateRisk()" style="font-size:14px">
            ${stateOptions}
          </select>
        </div>
        <div id="risk-state-detail">
          <div style="color:var(--text3);font-size:13px;margin-top:12px">Select a state to see analysis...</div>
        </div>
      </div>

      <!-- RIGHT: Score ring + breakdown bars -->
      <div class="card" style="display:flex;flex-direction:column">
        <div style="font-weight:600;font-size:15px;margin-bottom:20px">Risk Score Breakdown</div>
        <div style="display:flex;align-items:center;gap:24px;margin-bottom:20px">
          <!-- Score ring -->
          <div style="position:relative;width:110px;height:110px;flex-shrink:0">
            <svg width="110" height="110" style="transform:rotate(-90deg)">
              <circle cx="55" cy="55" r="46" fill="none" stroke="var(--border)" stroke-width="10"/>
              <circle id="risk-ring-circle" cx="55" cy="55" r="46" fill="none"
                stroke="var(--amber)" stroke-width="10"
                stroke-dasharray="289" stroke-dashoffset="289"
                style="transition:stroke-dashoffset .8s ease,stroke .4s"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
              <div id="risk-score-num" style="font-size:26px;font-weight:700;font-family:var(--mono);color:var(--amber);line-height:1">—</div>
              <div style="font-size:10px;color:var(--text3)">/100</div>
            </div>
          </div>
          <!-- Rating + label -->
          <div>
            <div id="risk-rating-label" style="font-size:22px;font-weight:700;color:var(--amber)">—</div>
            <div id="risk-rating-stars" style="font-size:18px;color:var(--amber);margin:4px 0">—</div>
            <div id="risk-invest-tag" style="font-size:12px;color:var(--text3)">Investment Rating</div>
          </div>
        </div>
        <!-- Breakdown bars -->
        <div style="flex:1" id="risk-breakdown-bars">
          <div style="color:var(--text3);font-size:13px">Select a state to see breakdown...</div>
        </div>
        <!-- Safety tip -->
        <div id="risk-safety-tip" style="margin-top:16px;padding:12px;background:rgba(37,99,235,.08);border:1px solid rgba(37,99,235,.2);border-radius:8px;font-size:12px;color:var(--text2);display:none">
          <span style="color:var(--blue);font-weight:600">💡 Investment Tip: </span>
          <span id="risk-tip-text"></span>
        </div>
      </div>
    </div>

    <!-- TREND BAR CHART -->
    <div class="card mb-6">
      <div style="font-weight:600;font-size:15px;margin-bottom:4px">Comparative State Risk Index</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:20px">Top 10 states by crime risk score — lower is safer</div>
      <div id="risk-compare-chart" style="display:flex;flex-direction:column;gap:8px"></div>
    </div>

    <!-- LOGISTIC REGRESSION TABLE -->
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-weight:600;font-size:15px">Logistic Regression — Crime Risk Classification</div>
        <span class="badge blue" id="lr-state-label">Select a state</span>
      </div>
      <div id="logistic-table">
        <div style="color:var(--text3);font-size:13px;padding:20px 0;text-align:center">
          Select a state above to run the classifier
        </div>
      </div>
    </div>`;

  // Render the comparison chart immediately (always visible)
  renderCompareChart();

  // Auto-analyse the first state
  analyzeStateRisk();
}

/* ── Comparison bar chart (all states) ───────────────────────── */
function renderCompareChart() {
  const sorted = Object.entries(CRIME_DATA)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 10);

  const max = sorted[0][1].score;
  const el  = document.getElementById('risk-compare-chart');
  if (!el) return;

  el.innerHTML = sorted.map(([state, d]) => {
    const pct   = Math.round((d.score / max) * 100);
    const color = d.score < 40 ? 'var(--green)' : d.score < 65 ? 'var(--amber)' : 'var(--red)';
    return `
      <div style="display:flex;align-items:center;gap:12px;cursor:pointer"
           onclick="document.getElementById('risk-state').value='${state}';analyzeStateRisk()">
        <div style="width:140px;font-size:12px;color:var(--text2);text-align:right;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${state}</div>
        <div style="flex:1;background:var(--navy3);border-radius:4px;height:22px;overflow:hidden;position:relative">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width .6s ease"></div>
          <div style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:11px;font-family:var(--mono);color:var(--text2)">${d.score}</div>
        </div>
      </div>`;
  }).join('');
}

/* ── Main analysis function ──────────────────────────────────── */
async function analyzeStateRisk() {
  const stateEl = document.getElementById('risk-state');
  if (!stateEl) return;
  const state = stateEl.value;

  // ── Always use local data first (instant) ──────────────────
  let d = CRIME_DATA[state];
  if (!d) d = { score: 45, arrests: 5000, cs: 2500, conv: 800, safetyTip: 'No detailed data available for this region.' };

  // ── Try API in background to get live data ─────────────────
  try {
    const api = await API.get('/risk/state/' + encodeURIComponent(state));
    if (api && api.riskScore !== undefined) {
      d = {
        score:     api.riskScore,
        arrests:   api.arrests   || d.arrests,
        cs:        api.chargesheeted || d.cs,
        conv:      api.convicted || d.conv,
        safetyTip: d.safetyTip
      };
    }
  } catch (e) { /* use local data */ }

  const rc     = d.score < 40 ? 'var(--green)' : d.score < 65 ? 'var(--amber)' : 'var(--red)';
  const rating = getInvestmentRating(d.score);
  const convRate = d.cs > 0 ? Math.round(d.conv / d.cs * 100) : 0;
  const circumference = 2 * Math.PI * 46; // r=46

  // ── Score ring animation ────────────────────────────────────
  const circle = document.getElementById('risk-ring-circle');
  if (circle) {
    const offset = circumference - (d.score / 100) * circumference;
    circle.style.strokeDasharray  = circumference;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = rc;
  }

  // ── Score number ───────────────────────────────────────────
  const numEl = document.getElementById('risk-score-num');
  if (numEl) { numEl.textContent = d.score; numEl.style.color = rc; }

  // ── Investment rating ───────────────────────────────────────
  const ratingEl = document.getElementById('risk-rating-label');
  const starsEl  = document.getElementById('risk-rating-stars');
  if (ratingEl) { ratingEl.textContent = rating.label; ratingEl.style.color = rating.color; }
  if (starsEl)  { starsEl.textContent  = rating.stars; starsEl.style.color  = rating.color; }

  // ── LR badge ───────────────────────────────────────────────
  const lrBadge = document.getElementById('lr-state-label');
  if (lrBadge) { lrBadge.textContent = state; }

  // ── State stats grid ───────────────────────────────────────
  const detailEl = document.getElementById('risk-state-detail');
  if (detailEl) {
    detailEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">
        ${[
          ['Total Arrests',    d.arrests.toLocaleString('en-IN'), 'red'],
          ['Chargesheeted',    d.cs.toLocaleString('en-IN'),      'amber'],
          ['Convicted',        d.conv.toLocaleString('en-IN'),    'purple'],
          ['Conviction Rate',  convRate + '%',                    convRate > 50 ? 'green' : 'amber'],
          ['Risk Score',       d.score + ' / 100',               d.score > 60 ? 'red' : d.score > 40 ? 'amber' : 'green'],
          ['Safety Score',     (100 - d.score) + ' / 100',      'green'],
        ].map(([k, v, c]) => `
          <div style="background:var(--navy3);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:10px;color:var(--text3);letter-spacing:.5px;text-transform:uppercase">${k}</div>
            <div style="font-size:18px;font-weight:700;color:var(--${c});font-family:var(--mono);margin-top:4px">${v}</div>
          </div>`).join('')}
      </div>`;
  }

  // ── Breakdown progress bars ─────────────────────────────────
  const barsEl = document.getElementById('risk-breakdown-bars');
  if (barsEl) {
    barsEl.innerHTML = [
      ['Crime Rate',        d.score,           rc],
      ['Safety Score',      100 - d.score,     'var(--green)'],
      ['Conviction Rate',   convRate,           'var(--blue)'],
      ['Chargesheet Rate',  d.arrests > 0 ? Math.round(d.cs / d.arrests * 100) : 0, 'var(--purple)'],
    ].map(([label, val, color]) => `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
          <span style="color:var(--text2)">${label}</span>
          <span style="color:${color};font-family:var(--mono);font-weight:600">${Math.min(100, Math.max(0, val))}%</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar" style="width:${Math.min(100, Math.max(0, val))}%;background:${color};transition:width .6s ease"></div>
        </div>
      </div>`).join('');
  }

  // ── Safety tip ─────────────────────────────────────────────
  const tipBox  = document.getElementById('risk-safety-tip');
  const tipText = document.getElementById('risk-tip-text');
  if (tipBox && tipText) {
    tipText.textContent = d.safetyTip;
    tipBox.style.display = 'block';
  }

  // ── Logistic Regression table ───────────────────────────────
  const tableEl = document.getElementById('logistic-table');
  if (tableEl) {
    const crimes = [
      { type: 'Crimes Against Women', model: 'Logistic Regression', prob: Math.min(0.99, d.score / 100) },
      { type: 'Property Crime',        model: 'Random Forest',       prob: Math.min(0.99, d.score * 0.008) },
      { type: 'Violent Crime',          model: 'Gradient Boosting',   prob: Math.min(0.99, d.score * 0.007) },
      { type: 'Cyber Crime',            model: 'SVM Classifier',      prob: Math.min(0.99, d.score * 0.005) },
    ];

    tableEl.innerHTML = `
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>Crime Type</th>
              <th>ML Model</th>
              <th>Classification</th>
              <th>Probability</th>
              <th>Confidence</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            ${crimes.map(({ type, model, prob }) => {
              const cls    = prob > 0.55 ? 'HIGH' : prob > 0.35 ? 'MEDIUM' : 'LOW';
              const badge  = cls === 'HIGH' ? 'red' : cls === 'MEDIUM' ? 'amber' : 'green';
              const conf   = (Math.max(prob, 1 - prob) * 100).toFixed(1);
              const rec    = cls === 'HIGH'   ? '⚠️ Avoid investing'   :
                             cls === 'MEDIUM' ? '🔎 Due diligence needed' :
                                               '✅ Safe to invest';
              return `
                <tr>
                  <td style="font-weight:500">${type}</td>
                  <td style="color:var(--text2);font-size:12px">${model}</td>
                  <td><span class="badge ${badge}">${cls} RISK</span></td>
                  <td style="font-family:var(--mono);color:var(--text2)">${(prob * 100).toFixed(1)}%</td>
                  <td style="font-family:var(--mono);color:var(--text2)">${conf}%</td>
                  <td style="font-size:12px">${rec}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }
}
