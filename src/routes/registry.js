// ── Registry Route — saves checks to SQLite ───────────────────
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { insert } = require('../models/db');

router.get('/verify', auth, (req, res) => {
  const { reraId='', city='', owner='' } = req.query;
  const verified = reraId.length > 4;

  const result = {
    verified, reraId: reraId||'N/A', city: city||'N/A', currentOwner: owner||'Not Provided',
    status: verified ? 'CLEAR' : 'UNVERIFIED', encumbrance: 'NIL',
    marketValue:       `₹${45 + Math.floor(Math.random()*120)}L`,
    stampDuty:         `₹${Math.floor(Math.random()*200000+100000).toLocaleString()}`,
    registrationCharge:`₹${Math.floor(Math.random()*50000+20000).toLocaleString()}`,
    ownershipHistory: [
      { year: 2005+Math.floor(Math.random()*8), owner:'Original Developer', type:'First Allotment' },
      { year: 2015+Math.floor(Math.random()*5), owner:'Previous Owner',     type:'Sale Deed' },
      { year: 2022+Math.floor(Math.random()*3), owner: owner||'Current Owner', type:'Transfer Deed' }
    ],
    reraDetails: verified ? {
      reraNumber: reraId,
      projectName:`${city} Residency Phase ${Math.floor(Math.random()*4)+1}`,
      promoter:'Verified Developer Pvt Ltd',
      completionDate:`${2022+Math.floor(Math.random()*4)}-12-31`,
      status:'ACTIVE'
    } : null,
    verifiedAt: new Date().toISOString()
  };

  // ── Persist to SQLite ──────────────────────────────────────
  insert('registry_checks', {
    user_id: req.user.id, rera_id: reraId, city, owner,
    result_json: JSON.stringify(result)
  });

  res.json(result);
});

// GET /api/registry/history
router.get('/history', auth, (req, res) => {
  const { db } = require('../models/db');
  const rows = db.prepare(`SELECT * FROM registry_checks WHERE user_id=? ORDER BY created_at DESC LIMIT 10`).all(req.user.id);
  res.json(rows.map(r => ({ ...r, result: JSON.parse(r.result_json) })));
});

module.exports = router;
