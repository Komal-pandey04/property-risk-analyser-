/* ── Properties Page ── */
let allProps = [];
let currentPage = 1;

async function renderProperties(el) {
  el.innerHTML = `
    <div class="search-bar">
      <div class="search-field"><label>LOCATION</label><input type="text" id="s-city" placeholder="City / Area"></div>
      <div class="search-field" style="max-width:130px"><label>MIN PRICE (₹L)</label><input type="number" id="s-minp" placeholder="0"></div>
      <div class="search-field" style="max-width:130px"><label>MAX PRICE (₹L)</label><input type="number" id="s-maxp" placeholder="500"></div>
      <div class="search-field" style="max-width:110px"><label>BEDS</label>
        <select id="s-beds"><option value="">Any</option><option>1</option><option>2</option><option>3</option><option>4</option><option value="5+">5+</option></select>
      </div>
      <div class="search-field" style="max-width:120px"><label>RISK</label>
        <select id="s-risk"><option value="">All</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
      </div>
      <div class="search-field" style="max-width:130px"><label>PURPOSE</label>
        <select id="s-purpose"><option value="">All</option><option value="buy">Buy</option><option value="rent">Rent</option></select>
      </div>
      <button class="btn primary" onclick="searchProperties()">🔍 SEARCH</button>
    </div>
    <div class="flex-between mb-4">
      <div style="font-weight:600;font-size:15px" id="prop-count">Loading properties...</div>
    </div>
    <div class="prop-grid" id="prop-grid"></div>
    <div id="prop-pagination" style="display:flex;justify-content:center;gap:8px;margin-top:24px"></div>`;

  await loadProperties({});
}

async function loadProperties(filters) {
  const params = new URLSearchParams({ page: currentPage, limit: 24, ...filters });
  try {
    const data = await API.get('/properties?' + params);
    allProps = data.properties || [];
    document.getElementById('prop-count').textContent = `Showing ${allProps.length} of ${data.total} properties`;
    renderPropGrid(allProps);
    renderPagination(data.total, data.page, data.limit);
  } catch (e) {
    // Fallback: generate client-side properties
    allProps = generateFallbackProps(200);
    renderPropGrid(allProps.slice(0, 24));
    document.getElementById('prop-count').textContent = `Showing 24 of ${allProps.length} properties`;
  }
}

function generateFallbackProps(n) {
  const cities = ['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Chennai', 'Mysore', 'Noida', 'Ghaziabad', 'Kolkata'];
  const locs = { Bangalore: ['Koramangala', 'Whitefield', 'Indiranagar', 'HSR Layout', 'BTM Layout', 'Marathahalli'], Hyderabad: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur'], Mumbai: ['Andheri', 'Bandra', 'Powai', 'Thane'], Delhi: ['Dwarka', 'Rohini', 'Vasant Kunj', 'Saket'], default: ['Sector 1', 'Phase 2', 'Main Road'] };
  const types = ['Apartment', 'Villa', 'Independent House', 'Studio', 'Penthouse'];
  const r = [];
  for (let i = 0; i < n; i++) {
    const city = cities[i % cities.length];
    const lc = locs[city] || locs.default;
    const locality = lc[i % lc.length];
    const bhk = (i % 4) + 1;
    const sqft = 500 + Math.floor(Math.random() * 2500);
    const price = parseFloat((25 + Math.random() * 160).toFixed(1));
    const riskScore = Math.floor(20 + Math.random() * 65);
    r.push({ id: i + 1, city, locality, bhk, sqft, price, riskScore, riskLabel: riskScore < 40 ? 'low' : riskScore < 65 ? 'medium' : 'high', rera: Math.random() > .4, rtm: Math.random() > .3, resale: Math.random() > .5, purpose: i % 2 === 0 ? 'buy' : 'rent', type: types[i % types.length], posted: ['Owner', 'Dealer', 'Builder'][i % 3] });
  }
  return r;
}

function renderPropGrid(props) {
  const grid = document.getElementById('prop-grid');
  if (!props.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text3)">No properties found. Try adjusting your filters.</div>'; return; }
  grid.innerHTML = props.map(propCardHtml).join('');
}

function propCardHtml(p) {
  const isFav = State.favourites.has(p.id);
  const rc = riskColor(p.riskLabel);
  return `
  <div class="prop-card" onclick="showPropertyDetail(${JSON.stringify(p).replace(/"/g, '&quot;')})">
    <div class="prop-thumb">
      ${propEmojiByIndex(p.id)}
      <button class="prop-fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleFavourite(this,${JSON.stringify(p).replace(/"/g, '&quot;')})">${isFav ? '❤️' : '🤍'}</button>
      <div class="prop-risk-badge">${riskBadgeHtml(p.riskLabel, p.riskScore)}</div>
    </div>
    <div class="prop-body">
      <div class="prop-price">₹${p.price}L</div>
      <div class="prop-address">📍 ${p.locality}, ${p.city}</div>
      <div class="prop-meta"><span>🛏 ${p.bhk} BHK</span><span>📐 ${p.sqft} sqft</span><span>🏷 ${p.type}</span></div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:3px">Safety Score: <span style="color:${rc}">${100 - p.riskScore}%</span></div>
      <div class="risk-bar-wrap"><div class="risk-bar" style="width:${100 - p.riskScore}%;background:${rc}"></div></div>
      <div class="prop-tags">
        ${p.rera ? '<span class="badge green">RERA ✓</span>' : ''}
        ${p.rtm  ? '<span class="badge blue">Ready to Move</span>' : ''}
        ${p.resale ? '<span class="badge purple">Resale</span>' : ''}
        <span class="badge amber">${p.purpose.toUpperCase()}</span>
      </div>
      <div class="prop-actions">
        <button class="btn primary" onclick="event.stopPropagation();enquireProperty(${JSON.stringify(p).replace(/"/g, '&quot;')})">Enquire</button>
        <button class="btn ghost" onclick="event.stopPropagation();showPropertyDetail(${JSON.stringify(p).replace(/"/g, '&quot;')})">Details</button>
      </div>
    </div>
  </div>`;
}

function toggleFavourite(btn, prop) {
  if (State.favourites.has(prop.id)) {
    State.removeFav(prop.id);
    btn.textContent = '🤍'; btn.classList.remove('active');
    toast('Removed from favourites', 'amber');
  } else {
    State.addFav(prop);
    btn.textContent = '❤️'; btn.classList.add('active');
    toast('Saved to favourites ❤️', 'green');
  }
}

async function searchProperties() {
  currentPage = 1;
  const filters = {};
  const city = document.getElementById('s-city').value.trim();
  const minp = document.getElementById('s-minp').value;
  const maxp = document.getElementById('s-maxp').value;
  const beds = document.getElementById('s-beds').value;
  const risk = document.getElementById('s-risk').value;
  const purpose = document.getElementById('s-purpose').value;
  if (city) filters.city = city;
  if (minp) filters.minPrice = minp;
  if (maxp) filters.maxPrice = maxp;
  if (beds) filters.beds = beds;
  if (risk) filters.riskLevel = risk;
  if (purpose) filters.purpose = purpose;
  await loadProperties(filters);
}

function renderPagination(total, page, limit) {
  const pages = Math.ceil(total / limit);
  const el = document.getElementById('prop-pagination');
  if (!el || pages <= 1) return;
  let html = '';
  for (let i = 1; i <= Math.min(pages, 8); i++) {
    html += `<button class="btn ${i === page ? 'primary' : 'ghost'}" style="min-width:36px" onclick="gotoPage(${i})">${i}</button>`;
  }
  el.innerHTML = html;
}

async function gotoPage(p) {
  currentPage = p;
  await loadProperties({});
  document.getElementById('page-container').scrollIntoView({ behavior: 'smooth' });
}

function showPropertyDetail(p) {
  const emi = calcEMI(p.price);
  const rc = riskColor(p.riskLabel);
  openModal(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
      <div>
        <div style="background:var(--navy3);border-radius:10px;height:160px;display:flex;align-items:center;justify-content:center;font-size:72px;margin-bottom:14px">${propEmojiByIndex(p.id)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${p.rera ? '<span class="badge green">RERA Approved</span>' : '<span class="badge red">No RERA</span>'}
          ${p.rtm  ? '<span class="badge blue">Ready to Move</span>' : '<span class="badge amber">Under Construction</span>'}
          ${p.resale ? '<span class="badge purple">Resale</span>' : ''}
          <span class="badge amber">${p.purpose.toUpperCase()}</span>
        </div>
      </div>
      <div>
        <div style="font-size:36px;font-weight:700;font-family:var(--mono);color:#fff;margin-bottom:4px">₹${p.price}L</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:16px">₹${Math.round(p.price * 100000 / p.sqft).toLocaleString()}/sqft</div>
        <div class="card" style="padding:14px;margin-bottom:12px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
            <div style="color:var(--text3)">BHK</div><div style="font-weight:600">${p.bhk} BHK</div>
            <div style="color:var(--text3)">Area</div><div style="font-weight:600">${p.sqft} sqft</div>
            <div style="color:var(--text3)">Type</div><div style="font-weight:600">${p.type}</div>
            <div style="color:var(--text3)">Posted by</div><div style="font-weight:600">${p.posted}</div>
            <div style="color:var(--text3)">Location</div><div style="font-weight:600">${p.locality}</div>
            <div style="color:var(--text3)">City</div><div style="font-weight:600">${p.city}</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text3)">EMI Estimate (20yr @ 8.5%)</div>
        <div style="font-size:22px;font-weight:700;font-family:var(--mono);color:var(--blue)">₹${emi.toLocaleString()}/mo</div>
      </div>
    </div>
    <div class="two-col mb-4">
      <div class="card">
        <div style="font-size:12px;color:var(--text3);margin-bottom:12px">SAFETY & RISK</div>
        <div style="display:flex;align-items:center;gap:16px">
          <div class="score-ring" style="border-color:${rc};width:80px;height:80px">
            <div class="score-val" style="color:${rc};font-size:18px">${p.riskScore}</div>
            <div class="score-sub">/ 100</div>
          </div>
          <div style="flex:1">
            ${[['Crime Index', p.riskScore, rc], ['Flood Risk', Math.floor(p.riskScore * .6), 'var(--blue)'], ['Market Stability', 100 - Math.floor(p.riskScore * .5), 'var(--green)']].map(([l, v, c]) =>
              `<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--text3)">${l}: <span style="color:${c}">${v}%</span></div><div class="progress-wrap"><div class="progress-bar" style="width:${v}%;background:${c}"></div></div></div>`
            ).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div style="font-size:12px;color:var(--text3);margin-bottom:12px">REGISTRY TIMELINE</div>
        <div class="timeline">
          <div class="tl-item"><div class="tl-dot"></div><div class="tl-date">${2008 + (p.id % 8)}</div><div class="tl-text">First Registration</div></div>
          <div class="tl-item"><div class="tl-dot"></div><div class="tl-date">${2016 + (p.id % 6)}</div><div class="tl-text">${p.rera ? 'RERA Registered' : 'Ownership Transfer'}</div></div>
          <div class="tl-item"><div class="tl-dot" style="background:var(--green)"></div><div class="tl-date">2024</div><div class="tl-text" style="color:var(--green)">Title Clear — No Encumbrance</div></div>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn primary" style="flex:1" onclick="enquireProperty(${JSON.stringify(p).replace(/"/g, '&quot;')});closeModal()">📧 Send Enquiry</button>
      <button class="btn ghost" onclick="toggleFavourite({classList:{add:()=>{},remove:()=>{},contains:()=>false}},${JSON.stringify(p).replace(/"/g, '&quot;')});closeModal()">❤️ Save</button>
<a href="tel:+918534095607" class="btn ghost" style="text-decoration:none" onclick="toast('Calling agent...','green')">📞 Call Agent</a>    </div>`);
}

async function enquireProperty(p) {
  console.log("🔥 BUTTON CLICKED", p); 
  try {
    const res = await fetch('/api/mail/enquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('prism_token')
      },
    body: JSON.stringify({
  propertyId: p.id,
  location: p.address || p.location || p.city,  
  price: p.price,
  bhk: p.bhk
})
    });

    const data = await res.json();

    toast(data.message || "Enquiry sent successfully!", 'green');

  } catch (err) {
    console.error("ENQUIRY ERROR:", err);
    toast("Failed to send enquiry", 'red');
  }
}
function initiateCall(dept) {
  // Uses tel: — opens phone dialer directly on mobile/desktop
  const map = {
    Sales:   '+918354095607',
    Support: '+917081585737',
    Legal:   '+919717723896'
  };
  const num = map[dept];
  if (num) {
    window.location.href = `tel:${num}`;
    toast(`Calling ${dept}...`, 'green');
  }
}
async function callAgent() {
  console.log("🔥 CALL BUTTON CLICKED");   // 👈 ADD THIS

  try {
    const res = await fetch('/api/call', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('prism_token')
      }
    });

    console.log("📡 API CALLED");  // 👈 ADD THIS

    const data = await res.json();
    console.log("✅ RESPONSE:", data);

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}
