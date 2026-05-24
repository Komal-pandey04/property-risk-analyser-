/* ── PRISM Global State ── */
const State = {
  favourites: new Set(JSON.parse(localStorage.getItem('prism_favs') || '[]')),
  mails: [],
  mailCounter: 100,

  saveFavs() {
    localStorage.setItem('prism_favs', JSON.stringify([...this.favourites]));
    document.getElementById('fav-badge').textContent = this.favourites.size;
  },

  addFav(prop) {
    this.favourites.add(prop.id);
    this.saveFavs();
    this.injectMail({
      from: 'system@prism.ai', to: currentUser.email,
      subject: `❤️ Saved: ${prop.bhk}BHK in ${prop.locality}, ${prop.city} — ₹${prop.price}L`,
      body: `Hi ${currentUser.name},\n\nYou saved a property to your favourites:\n\n📍 ${prop.locality}, ${prop.city}\n💰 ₹${prop.price}L\n🛏 ${prop.bhk} BHK | 📐 ${prop.sqft} sqft\n⚠️ Risk Score: ${prop.riskScore} (${prop.riskLabel.toUpperCase()})\n${prop.rera ? '✅ RERA Approved' : ''}\n\nLog in to view full details.\n\nPRISM Team`,
      unread: true
    });
  },

  removeFav(id) {
    this.favourites.delete(id);
    this.saveFavs();
  },

  injectMail(mail) {
    this.mailCounter++;
    const m = { id: String(this.mailCounter), ...mail, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), createdAt: new Date().toISOString() };
    this.mails.unshift(m);
    const unread = this.mails.filter(x => x.unread && x.to === currentUser?.email).length;
    document.getElementById('mail-badge').textContent = unread || '';
    return m;
  },

  initMails() {
    this.mails = [
      { id: '1', from: 'system@prism.ai', to: '', subject: '🏠 Welcome to PRISM — Property Risk Intelligence System', body: `Hi there,\n\nWelcome to PRISM — India's most advanced Property Risk & Intelligence platform.\n\nYour account is active. Use AI-powered price predictions, crime risk analysis, and smart property matching.\n\nBest regards,\nPRISM Team`, time: '10:00 AM', unread: true, createdAt: new Date().toISOString() },
      { id: '2', from: 'system@prism.ai', to: '', subject: '🔍 Saved Search Alert: 24 New Properties Match Your Criteria', body: `Hi,\n\nWe found 24 new properties matching your search for 3 BHK in Bangalore under ₹80L.\n\nTop Match: Koramangala, 3BHK — ₹72L, Risk Score: 38 (LOW)\n\nLogin to view all.\n\nPRISM Team`, time: '9:30 AM', unread: true, createdAt: new Date().toISOString() },
      { id: '3', from: 'system@prism.ai', to: '', subject: '📊 ML Report: Whitefield, Bangalore — High Investment Potential', body: `Hi,\n\nYour requested ML price prediction report is ready.\n\nArea: Whitefield, Bangalore\nAvg Price: ₹85L (3BHK)\nRisk Level: LOW (Score: 34)\nModel Confidence: 93.2%\n\nRecommendation: HIGH INVESTMENT POTENTIAL\n\nPRISM AI Team`, time: 'Yesterday', unread: false, createdAt: new Date().toISOString() }
    ];
    // Fix to addresses
    this.mails.forEach(m => { if (!m.to) m.to = currentUser?.email || ''; });
  }
};
