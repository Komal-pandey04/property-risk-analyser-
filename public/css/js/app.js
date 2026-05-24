/* ── PRISM App Router ── */
const PAGE_TITLES = {
  dashboard: 'DASHBOARD', properties: 'FIND PROPERTIES', favourites: 'MY FAVOURITES',
  insights: 'INVESTMENT INSIGHTS', predictor: 'PRICE PREDICTOR', risk: 'RISK ANALYZER',
  mails: 'MAILBOX', registry: 'REGISTRY CHECK', contact: 'CONTACT US'
};

function navTo(page) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.getElementById('page-title').textContent = PAGE_TITLES[page] || page.toUpperCase();

  // Render page
  const container = document.getElementById('page-container');
  container.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'page';
  container.appendChild(div);

  switch (page) {
    case 'dashboard':   renderDashboard(div);   break;
    case 'properties':  renderProperties(div);  break;
    case 'favourites':  renderFavourites(div);  break;
    case 'insights':    renderInsights(div);     break;
    case 'predictor':   renderPredictor(div);   break;
    case 'risk':        renderRisk(div);         break;
    case 'mails':       renderMails(div);        break;
    case 'registry':    renderRegistry(div);     break;
    case 'contact':     renderContact(div);      break;
  }
}

// Wire up nav items
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => navTo(el.dataset.page));
  });

  // Set date
  document.getElementById('topbar-date').textContent =
    new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Update fav badge
  document.getElementById('fav-badge').textContent = State.favourites.size;
});
