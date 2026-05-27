// ── Mail Route — SQLite ───────────────────────────────────────
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { insert, remove } = require('../models/db');
const { sendMail } = require('../utils/mailer');

// ============================================================
// GET /api/mail  — user's inbox + sent
// ============================================================
router.get('/', auth, (req, res) => {
  const { db } = require('../models/db');

  const mails = db.prepare(`
    SELECT * FROM mails
    WHERE user_id = ? OR to_addr = ?
    ORDER BY created_at DESC
  `).all(req.user.id, req.user.email);

  res.json(mails.map(m => ({
    id: m.id,
    from: m.from_addr,
    to: m.to_addr,
    subject: m.subject,
    body: m.body,
    unread: !!m.unread,
    direction: m.direction,
    time: new Date(m.created_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdAt: m.created_at
  })));
});

// ============================================================
// GET /api/mail/unread-count
// ============================================================
router.get('/unread-count', auth, (req, res) => {
  const { db } = require('../models/db');

  const n = db.prepare(`
    SELECT COUNT(*) as n
    FROM mails
    WHERE (user_id=? OR to_addr=?) AND unread=1
  `).get(req.user.id, req.user.email).n;

  res.json({ count: n });
});

// ============================================================
// POST /api/mail/send (manual mail)
// ============================================================
router.post('/send', auth, async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject, body required' });
  }

  try {
    const mail = insert('mails', {
      user_id: req.user.id,
      from_addr: req.user.email,
      to_addr: to,
      subject,
      body,
      unread: 0,
      direction: 'sent'
    });

    const htmlBody = `
      <pre style="font-family:sans-serif;white-space:pre-wrap;
      color:#e2e8f0;background:#0f1a2e;padding:20px;border-radius:8px">
      ${body}
      </pre>
    `;

    await sendMail(to, subject, htmlBody);

    console.log("✅ MANUAL MAIL SENT TO:", to);

    res.json({ success: true, mail });

  } catch (err) {
    console.error("❌ SEND MAIL ERROR:", err);
    res.status(500).json({ error: 'Failed to send mail' });
  }
});

// ============================================================
// POST /api/mail/enquiry  🚀 FINAL VERSION
// ============================================================
router.post('/enquiry', auth, async (req, res) => {
  try {
    console.log("➡️ Enquiry route hit");

    const userEmail = req.user.email;

    // 👇 NOW RECEIVING FULL DATA
    const { propertyId, location, price, bhk } = req.body;

    console.log("User email:", userEmail);

    const subject = "🏠 PRISM Property Enquiry";

    const body = `
Hello ${req.user.name},

Thank you for your interest in a property.

Property Details:
- Location: ${location}
- Price: ₹${price}L
- BHK: ${bhk}
- Property ID: ${propertyId}

Our team will contact you soon.

- PRISM Team
`;

    // 💾 Save in DB
    insert('mails', {
      user_id: req.user.id,
      from_addr: process.env.MAIL_USER,
      to_addr: userEmail,
      subject,
      body,
      unread: 1,
      direction: 'received'
    });

    // ✨ PROFESSIONAL EMAIL UI
    const htmlBody = `
      <div style="font-family:Arial, sans-serif; padding:20px; background:#0f172a; color:white; border-radius:10px">

        <h2 style="color:#38bdf8;">🏠 PRISM Property Enquiry</h2>

        <p>Hello <b>${req.user.name}</b>,</p>

        <p>Thank you for showing interest in a property. Here are your selected details:</p>

        <div style="background:#1e293b; padding:15px; border-radius:8px;">
          <p><b>📍 Location:</b> ${location}</p>
          <p><b>💰 Price:</b> ₹${price}L</p>
          <p><b>🛏 BHK:</b> ${bhk}</p>
          <p><b>🆔 Property ID:</b> ${propertyId}</p>
        </div>

        <p style="margin-top:15px;">
          Our team will contact you soon with further details.
        </p>

        <hr style="margin:20px 0; border-color:#334155">

        <p style="font-size:12px; color:#94a3b8;">
          PRISM — Property Risk Intelligence System
        </p>
      </div>
    `;

    // 📤 SEND EMAIL
    await sendMail(userEmail, subject, htmlBody);

    console.log("✅ MAIL SENT TO:", userEmail);

    res.json({ message: "Enquiry sent successfully!" });

  } catch (err) {
    console.error("❌ ENQUIRY MAIL ERROR:", err);
    res.status(500).json({ error: "Failed to send enquiry" });
  }
});

// ============================================================
// PATCH /api/mail/:id/read
// ============================================================
router.patch('/:id/read', auth, (req, res) => {
  const { db } = require('../models/db');

  db.prepare(`UPDATE mails SET unread=0 WHERE id=?`)
    .run(req.params.id);

  res.json({ success: true });
});

// ============================================================
// DELETE /api/mail/:id
// ============================================================
router.delete('/:id', auth, (req, res) => {
  const ok = remove('mails', { id: req.params.id });
  res.json({ success: ok });
});

// ============================================================
// EXPORT
// ============================================================
module.exports = router;