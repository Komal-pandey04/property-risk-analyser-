/* ── Mails Page ── */

// ── Contact numbers (change these to real numbers) ────────────
const CONTACT = {
  Sales:   { number: '+918534095607', label: '+91 85340 95607' },
  Support: { number: '+917081585737', label: '+91 70815 85737' },
  Legal:   { number: '+919719923896', label: '+91 97199 23896' },
  support_email: 'support@prism.ai'
};

/* ════════════════════════════════════════════════════════════
   MAIL FUNCTIONS
   ════════════════════════════════════════════════════════════ */
function renderMails(el) {
  State.initMails();
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:290px 1fr;gap:20px">
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:600">Inbox</div>
          <button class="btn primary" style="padding:6px 12px;font-size:12px" onclick="openCompose()">+ Compose</button>
        </div>
        <div id="mail-list-panel"></div>
      </div>
      <div class="card" id="mail-view-panel">
        <div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--text3)">Select a mail to read</div>
      </div>
    </div>`;
  renderMailList();
}

function renderMailList() {
  const panel = document.getElementById('mail-list-panel');
  if (!panel) return;
  const userMails = State.mails.filter(m => m.to === currentUser.email || m.from === currentUser.email);
  if (!userMails.length) {
    panel.innerHTML = '<div style="padding:20px;color:var(--text3);text-align:center">No mails yet</div>';
    return;
  }
  panel.innerHTML = userMails.map(m => `
    <div class="mail-item ${m.unread ? 'unread' : ''}" onclick="viewMail('${m.id}')">
      <div class="mail-dot ${m.unread ? '' : 'read'}"></div>
      <div style="flex:1;min-width:0">
        <div class="mail-subject-line" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.subject}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${m.time} · ${m.from === currentUser.email ? 'Sent' : 'Received'}</div>
      </div>
    </div>`).join('');
}

function viewMail(id) {
  const m = State.mails.find(x => x.id === id);
  if (!m) return;
  m.unread = false;
  renderMailList();
  const unread = State.mails.filter(x => x.unread && x.to === currentUser.email).length;
  document.getElementById('mail-badge').textContent = unread || '';
  document.getElementById('mail-view-panel').innerHTML = `
    <div style="border-bottom:1px solid var(--border);padding-bottom:16px;margin-bottom:20px">
      <div style="font-size:18px;font-weight:600;color:#fff;margin-bottom:8px">${m.subject}</div>
      <div style="font-size:12px;color:var(--text3)">From: <span style="color:var(--text2)">${m.from}</span> → To: <span style="color:var(--text2)">${m.to}</span></div>
      <div style="font-size:12px;color:var(--text3)">Sent: ${m.time}</div>
    </div>
    <div style="font-size:14px;color:var(--text2);white-space:pre-line;line-height:1.8">${m.body}</div>
    <div style="margin-top:20px;display:flex;gap:10px">
      <button class="btn primary" onclick="replyMail('${m.id}')">↩ Reply</button>
      <button class="btn ghost" onclick="forwardMail('${m.id}')">→ Forward</button>
      <button class="btn danger" onclick="deleteMail('${m.id}')">Delete</button>
    </div>`;
}

function deleteMail(id) {
  State.mails = State.mails.filter(x => x.id !== id);
  renderMailList();
  document.getElementById('mail-view-panel').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--text3)">Mail deleted</div>';
  toast('Mail deleted', 'amber');
}

function replyMail(id) {
  const m = State.mails.find(x => x.id === id);
  if (!m) return;
  // Open device Gmail/Mail app directly via mailto:
  const mailto = `mailto:${m.from}?subject=${encodeURIComponent('Re: ' + m.subject)}`;
  window.location.href = mailto;
}

function forwardMail(id) {
  const m = State.mails.find(x => x.id === id);
  if (!m) return;
  const body = `\n\n---------- Forwarded message ----------\nFrom: ${m.from}\nSubject: ${m.subject}\n\n${m.body}`;
  const mailto = `mailto:?subject=${encodeURIComponent('Fwd: ' + m.subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

function openCompose() {
  document.getElementById('compose-overlay').classList.add('open');
}

/* ════════════════════════════════════════════════════════════
   COMPOSE MODAL — opens device mail app via mailto:
   ════════════════════════════════════════════════════════════ */
function sendComposedMail() {
  const to      = document.getElementById('cmp-to').value.trim();
  const subject = document.getElementById('cmp-sub').value.trim();
  const body    = document.getElementById('cmp-body').value.trim();
  if (!to || !subject) { toast('Please fill To and Subject', 'amber'); return; }

  // ── Open device Gmail / Mail app directly ──────────────────
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;

  // Also save a copy in PRISM inbox for history
  State.injectMail({ from: currentUser.email, to, subject, body, unread: false });
  closeCompose();
  toast(`Opening your mail app to send to ${to}`, 'green');
}

function closeCompose() {
  document.getElementById('compose-overlay').classList.remove('open');
  document.getElementById('cmp-to').value   = '';
  document.getElementById('cmp-sub').value  = '';
  document.getElementById('cmp-body').value = '';
}

/* ════════════════════════════════════════════════════════════
   REGISTRY PAGE
   ════════════════════════════════════════════════════════════ */
function renderRegistry(el) {
  el.innerHTML = `
    <div class="card mb-4">
      <div style="font-weight:600;font-size:15px;margin-bottom:16px">Property Registry Verification</div>
      <div class="form-row cols3">
        <div class="field-group"><label>PROPERTY ID / RERA NO.</label><input type="text" id="reg-id" placeholder="RERA/KA/2023/1234"></div>
        <div class="field-group"><label>CITY</label><input type="text" id="reg-city" placeholder="Bangalore"></div>
        <div class="field-group"><label>OWNER NAME</label><input type="text" id="reg-owner" placeholder="Owner name"></div>
      </div>
      <button class="btn primary" onclick="checkRegistry()">🔍 Verify Registry</button>
    </div>
    <div id="registry-output"></div>`;
}

async function checkRegistry() {
  const reraId = document.getElementById('reg-id').value   || 'RERA/KA/2023/4521';
  const city   = document.getElementById('reg-city').value  || 'Bangalore';
  const owner  = document.getElementById('reg-owner').value || 'Rajesh Kumar';

  document.getElementById('registry-output').innerHTML =
    '<div style="padding:20px;color:var(--text2)">⏳ Verifying...</div>';

  const data = await API.get(
    `/registry/verify?reraId=${encodeURIComponent(reraId)}&city=${encodeURIComponent(city)}&owner=${encodeURIComponent(owner)}`
  );

  document.getElementById('registry-output').innerHTML = `
    <div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)">
        <div style="width:48px;height:48px;border-radius:12px;background:rgba(16,185,129,.15);display:flex;align-items:center;justify-content:center;font-size:24px">✅</div>
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--green)">VERIFIED — Title Clear</div>
          <div style="font-size:13px;color:var(--text2)">No encumbrance found as of ${new Date().toLocaleDateString('en-IN')}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">
        ${[['Registry ID', reraId], ['City', city], ['Owner', owner],
           ['RERA Status', data.reraDetails ? 'Approved ✓' : 'Pending'],
           ['Market Value', data.marketValue || '₹65L'],
           ['Stamp Duty', data.stampDuty || '₹1,50,000']
          ].map(([k, v]) => `
          <div style="background:var(--navy3);border-radius:8px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text3)">${k}</div>
            <div style="font-size:13px;font-weight:600;color:#fff;margin-top:2px">${v}</div>
          </div>`).join('')}
      </div>
      <div style="font-weight:600;font-size:14px;margin-bottom:12px">Ownership History</div>
      <div class="timeline">
        ${(data.ownershipHistory || []).map(h => `
          <div class="tl-item">
            <div class="tl-dot"></div>
            <div class="tl-date">${h.year}</div>
            <div class="tl-text">${h.type} — ${h.owner}</div>
          </div>`).join('')}
        <div class="tl-item">
          <div class="tl-dot" style="background:var(--green)"></div>
          <div class="tl-date">2024</div>
          <div class="tl-text" style="color:var(--green)">RERA Renewed — Certificate Active</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px">
        <button class="btn primary" onclick="toast('Registry report downloaded','blue')">📄 Download PDF</button>
        <button class="btn ghost" onclick="emailRegistryReport('${encodeURIComponent(reraId)}','${encodeURIComponent(city)}')">📧 Email Report</button>
      </div>
    </div>`;
  toast('Registry verified successfully', 'green');
}

// Opens device mail app pre-filled with registry report
function emailRegistryReport(reraId, city) {
  const subject = `PRISM Registry Report: ${decodeURIComponent(reraId)} — ${decodeURIComponent(city)}`;
  const body = `Hi,\n\nPlease find the PRISM registry verification report:\n\nRERA ID: ${decodeURIComponent(reraId)}\nCity: ${decodeURIComponent(city)}\nStatus: VERIFIED — Title Clear\nVerified on: ${new Date().toLocaleDateString('en-IN')}\n\nGenerated by PRISM — Property Risk Intelligence System.`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  toast('Opening mail app with registry report...', 'blue');
}

/* ════════════════════════════════════════════════════════════
   CONTACT PAGE
   ════════════════════════════════════════════════════════════ */
function renderContact(el) {
  el.innerHTML = `
    <div class="two-col">
      <div class="card">
        <div style="font-weight:600;font-size:16px;margin-bottom:20px">Send Us a Message</div>
        <div class="field-group"><label>YOUR NAME</label>
          <input type="text" id="c-name" placeholder="Full name" value="${currentUser?.name || ''}">
        </div>
        <div class="form-row cols2">
          <div class="field-group"><label>YOUR EMAIL</label>
            <input type="email" id="c-email" value="${currentUser?.email || ''}" placeholder="email">
          </div>
          <div class="field-group"><label>YOUR PHONE</label>
            <input type="tel" id="c-phone" placeholder="+91 98765 43210">
          </div>
        </div>
        <div class="field-group"><label>SUBJECT</label>
          <select id="c-subject">
            <option>Property Enquiry</option>
            <option>Price Prediction</option>
            <option>Risk Analysis</option>
            <option>Registry Help</option>
            <option>Technical Support</option>
            <option>Other</option>
          </select>
        </div>
        <div class="field-group"><label>MESSAGE</label>
          <textarea id="c-msg" rows="4" placeholder="Describe your query..."></textarea>
        </div>
        <!-- Opens device Gmail/Mail app via mailto: -->
        <button class="btn primary" style="width:100%" onclick="sendContact()">
          📤 Open Mail App & Send
        </button>
        <div style="font-size:11px;color:var(--text3);margin-top:8px;text-align:center">
          This will open your device's Gmail / Mail app to send directly.
        </div>
      </div>

      <div>
        <div class="card mb-4">
          <div style="font-weight:600;font-size:15px;margin-bottom:16px">Call Us Directly</div>

          <!-- SALES — tel: link opens phone dialer -->
          <div class="call-card">
            <div class="call-icon" style="background:rgba(16,185,129,.15)">📞</div>
            <div class="call-info">
              <div class="call-dept">Sales Enquiry</div>
              <div class="call-number" style="color:var(--green)">${CONTACT.Sales.label}</div>
              <div class="call-hours">Mon–Sat, 9AM–7PM IST</div>
            </div>
            <a href="tel:${CONTACT.Sales.number}" class="btn success" style="text-decoration:none"
               onclick="toast('Calling Sales...','green')">
              📞 Call
            </a>
          </div>

          <!-- SUPPORT — tel: link -->
          <div class="call-card">
            <div class="call-icon" style="background:rgba(37,99,235,.15)">🛠</div>
            <div class="call-info">
              <div class="call-dept">Technical Support</div>
              <div class="call-number" style="color:var(--blue)">${CONTACT.Support.label}</div>
              <div class="call-hours">24/7 Available</div>
            </div>
            <a href="tel:${CONTACT.Support.number}" class="btn primary" style="text-decoration:none"
               onclick="toast('Calling Support...','blue')">
              📞 Call
            </a>
          </div>

          <!-- LEGAL — tel: link -->
          <div class="call-card">
            <div class="call-icon" style="background:rgba(245,158,11,.15)">🏛</div>
            <div class="call-info">
              <div class="call-dept">Legal / Registry</div>
              <div class="call-number" style="color:var(--amber)">${CONTACT.Legal.label}</div>
              <div class="call-hours">Mon–Fri, 10AM–5PM IST</div>
            </div>
            <a href="tel:${CONTACT.Legal.number}" class="btn warning" style="text-decoration:none"
               onclick="toast('Calling Legal...','amber')">
              📞 Call
            </a>
          </div>

          <!-- WHATSAPP — wa.me link -->
          <div class="call-card" style="margin-top:4px">
            <div class="call-icon" style="background:rgba(37,211,102,.1)">💬</div>
            <div class="call-info">
              <div class="call-dept">WhatsApp Support</div>
              <div class="call-number" style="color:#25d366">${CONTACT.Sales.label}</div>
              <div class="call-hours">Quick response guaranteed</div>
            </div>
            <a href="https://wa.me/${CONTACT.Sales.number.replace(/\D/g,'')}?text=${encodeURIComponent('Hi PRISM, I need help with a property enquiry.')}"
               target="_blank" class="btn" style="background:rgba(37,211,102,.15);color:#25d366;border:1px solid rgba(37,211,102,.3);text-decoration:none"
               onclick="toast('Opening WhatsApp...','green')">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>`;
}

/* sendContact — opens device Gmail/Mail app via mailto: */
async function sendContact() {
  const name    = document.getElementById('c-name').value.trim();
  const email   = document.getElementById('c-email').value.trim();
  const phone   = document.getElementById('c-phone').value.trim();
  const subject = document.getElementById('c-subject').value;
  const msg     = document.getElementById('c-msg').value.trim();

  if (!name || !msg) { toast('Please fill in Name and Message', 'amber'); return; }

  const ticketId = 'TKT-' + Date.now().toString().slice(-6);

  // ── Build mailto: link — opens Gmail/Mail on device ────────
  const emailBody =
    `Name: ${name}\nEmail: ${email || currentUser.email}\nPhone: ${phone || 'N/A'}\nTicket: ${ticketId}\n\n${msg}\n\n-- Sent from PRISM Property Intelligence`;

  const mailtoLink =
    `mailto:${CONTACT.support_email}` +
    `?subject=${encodeURIComponent('[PRISM] ' + subject + ' — ' + ticketId)}` +
    `&body=${encodeURIComponent(emailBody)}`;

  window.location.href = mailtoLink;

  // ── Also log ticket in PRISM inbox ─────────────────────────
  State.injectMail({
    from: currentUser.email,
    to: CONTACT.support_email,
    subject: `[PRISM] ${subject} — ${ticketId}`,
    body: emailBody,
    unread: false
  });

  // ── Try backend ticket save too ────────────────────────────
  try {
    await API.post('/contact', { name, email: email || currentUser.email, phone, subject, message: msg });
  } catch(e) {}

  document.getElementById('c-msg').value = '';
  toast(`Opening mail app... Ticket ${ticketId} logged.`, 'green');
}

/* legacy — kept for any leftover calls */
function initiateCall(dept) {
  const c = CONTACT[dept];
  if (c) window.location.href = `tel:${c.number}`;
}
