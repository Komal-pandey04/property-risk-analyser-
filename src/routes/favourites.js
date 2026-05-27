// ── Favourites Route — SQLite ─────────────────────────────────
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { insert, findOne, findAll, remove } = require('../models/db');
const { sendFavouriteMail } = require('../utils/mailer');

// GET /api/favourites
router.get('/', auth, (req, res) => {
  const rows = findAll('favourites', { user_id: req.user.id });
  res.json(rows.map(r => ({ ...r, property: JSON.parse(r.property_json) })));
});

// POST /api/favourites
router.post('/', auth, async (req, res) => {
  const { property } = req.body;
  if (!property) return res.status(400).json({ error: 'property required' });

  if (findOne('favourites', { user_id: req.user.id, property_id: String(property.id) }))
    return res.status(400).json({ error: 'Already in favourites' });

  const fav = insert('favourites', {
    user_id: req.user.id, property_id: String(property.id),
    property_json: JSON.stringify(property)
  });

  // Save notification mail to DB
  insert('mails', {
    user_id: req.user.id, from_addr: 'system@prism.ai', to_addr: req.user.email,
    subject: `❤️ Saved: ${property.bhk}BHK in ${property.locality}, ${property.city} — ₹${property.price}L`,
    body: `Hi ${req.user.name},\n\nYou saved:\n📍 ${property.locality}, ${property.city}\n💰 ₹${property.price}L\n🛏 ${property.bhk} BHK | 📐 ${property.sqft} sqft\n⚠️ Risk: ${property.riskScore} (${property.riskLabel?.toUpperCase()})\n${property.rera ? '✅ RERA Approved' : ''}\n\nPRISM Team`,
    unread: 1, direction: 'received'
  });

  await sendFavouriteMail(req.user.email, req.user.name, property).catch(() => {});
  res.json(fav);
});

// DELETE /api/favourites/:propertyId
router.delete('/:propertyId', auth, (req, res) => {
  const ok = remove('favourites', { user_id: req.user.id, property_id: req.params.propertyId });
  res.json({ success: ok });
});

module.exports = router;
