/* ── PRISM AI Chatbot ── */
let chatOpen = false;
let chatHistory = [];

function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById('chat-window');
  const fab = document.getElementById('chat-fab');
  if (chatOpen) {
    win.classList.add('open');
    fab.style.display = 'none';
    document.getElementById('chat-dot').style.display = 'none';
    if (chatHistory.length === 0) {
      addBotMsg("Hi " + (currentUser?.name?.split(' ')[0] || '') + "! 👋 I'm PRISM AI. Ask me anything about Indian property prices, crime risk, investment tips, RERA, EMI calculations, or how to use this platform!");
    }
  } else {
    win.classList.remove('open');
    fab.style.display = 'flex';
  }
}

function clearChat() {
  chatHistory = [];
  document.getElementById('chat-msgs').innerHTML = '';
  addBotMsg("Chat cleared. How can I help you?");
}

function addBotMsg(text) {
  const msgs = document.getElementById('chat-msgs');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMsg(text) {
  const msgs = document.getElementById('chat-msgs');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chat-msgs');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typing-div';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('typing-div');
  if (el) el.remove();
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  addUserMsg(text);
  chatHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const res = await API.post('/chat', { messages: chatHistory });
    hideTyping();
    const reply = res.reply || "I'm having trouble. Please try again.";
    addBotMsg(reply);
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  } catch (e) {
    hideTyping();
    addBotMsg(getFallbackReply(text));
  }
}

function getFallbackReply(q) {
  q = q.toLowerCase();
  if (q.includes('price') || q.includes('cost') || q.includes('lakh'))
    return 'Property prices in India: Bangalore avg ₹65-90L (3BHK), Mumbai ₹95-180L, Delhi ₹80-140L, Hyderabad ₹55-85L, Pune ₹55-80L. Use our Price Predictor for a precise ML estimate!';
  if (q.includes('risk') || q.includes('safe') || q.includes('crime'))
    return 'Our Risk Analyzer uses NCRB crime data. Kerala, Tamil Nadu, and Karnataka are safest. UP, Bihar, Delhi have higher indices. Always check the state risk score before investing!';
  if (q.includes('rera'))
    return 'RERA-registered properties are legally protected under the Real Estate Regulation Act 2016. Always verify RERA via our Registry Check. RERA properties cost 5-10% more but carry far lower legal risk.';
  if (q.includes('emi') || q.includes('loan'))
    return 'For a ₹70L property (20% down, 20yr at 8.5%), EMI ≈ ₹49,000/month. Check Property Details for instant EMI calculation on any listing!';
  if (q.includes('invest') || q.includes('return'))
    return 'Top 2024-25 picks: Bangalore (Sarjapur, Whitefield), Hyderabad (Gachibowli), Pune (Wakad). Low-risk, RERA-approved, ready-to-move 2-3 BHK properties offer best ROI of 8-12% CAGR.';
  if (q.includes('stamp') || q.includes('duty') || q.includes('registration'))
    return 'Stamp duty varies: Karnataka 5%, Maharashtra 5%, Delhi 4-6%, UP 7%. Registration charges are typically 1% of property value. Budget ~6-8% on top of property cost for these.';
  if (q.includes('favourite') || q.includes('save'))
    return 'Click the ♡ heart icon on any property card to save it to your Favourites. You\'ll also get an auto-confirmation email. Access your saved properties from the Favourites menu!';
  return 'I can help you with property prices, investment analysis, crime risk, RERA compliance, EMI calculations, and using PRISM\'s features. What specifically would you like to know?';
}
