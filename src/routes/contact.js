// ── Contact Tickets Route — SQLite ───────────────────────────
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { insert } = require('../models/db');
const { sendContactAckMail } = require('../utils/mailer');

// ============================================================
// POST /api/contact  → Create Ticket + Send Mail
// ============================================================
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone = '', subject = 'Enquiry', message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const userEmail = email || req.user.email;

    // Generate Ticket ID
    const ticketId = 'TKT-' + Date.now().toString().slice(-6);

    console.log("➡️ CONTACT FORM HIT");
    console.log("User:", userEmail);

    // =========================
    // SAVE TICKET
    // =========================
    const ticket = insert('contact_tickets', {
      user_id: req.user.id,
      name,
      email: userEmail,
      phone,
      subject,
      message,
      status: 'open'
    });

    // =========================
    // SAVE MAIL (Inbox)
    // =========================
    insert('mails', {
      user_id: req.user.id,
      from_addr: 'support@prism.ai',
      to_addr: userEmail,
      subject: `✅ Ticket ${ticketId} Received`,
      body: `
Hello ${name},

Thank you for contacting PRISM Support.

📌 Ticket ID: ${ticketId}
📄 Subject: ${subject}

📝 Your Message:
${message}

⏳ Our team will respond within 24 hours.

— PRISM Support Team
      `,
      unread: 1,
      direction: 'received'
    });

    // =========================
    // SEND EMAIL (REAL EMAIL)
    // =========================
    try {
      await sendContactAckMail(userEmail, name, subject, ticketId);
      console.log("✅ CONTACT MAIL SENT:", userEmail);
    } catch (err) {
      console.error("❌ MAIL FAILED:", err.message);
    }

    // =========================
    // RESPONSE
    // =========================
    res.json({
      success: true,
      message: "Ticket created successfully",
      ticketId,
      ticket
    });

  } catch (err) {
    console.error("❌ CONTACT ERROR:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// GET /api/contact/tickets
// ============================================================
router.get('/tickets', auth, (req, res) => {
  const { db } = require('../models/db');

  const tickets = db.prepare(`
    SELECT * FROM contact_tickets
    WHERE user_id=?
    ORDER BY created_at DESC
  `).all(req.user.id);

  res.json(tickets);
});

// ============================================================
module.exports = router;