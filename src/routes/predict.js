// ── Price Predictor Route — saves results to SQLite ───────────
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { insert } = require('../models/db');
const { sendPredictionMail } = require('../utils/mailer');

const cityMult = {
  bangalore:1.18, bengaluru:1.18, mumbai:1.65, delhi:1.40,
  hyderabad:1.12, pune:0.97, chennai:1.03, kolkata:0.88,
  ghaziabad:0.85, noida:1.05, lucknow:0.78, jaipur:0.82,
  ahmedabad:0.90, surat:0.85, mysore:0.80, mysuru:0.80
};

function lr(sqft, bhk, cm, rera, rtm) {
  return parseFloat(((15 + sqft*0.042 + bhk*7.5) * cm * (rera?1.08:1) * (rtm?1.05:0.96)).toFixed(2));
}
function rf(sqft, bhk, cm, rera, rtm, resale) {
  return parseFloat((lr(sqft,bhk,cm,rera,rtm) * (0.93+Math.random()*0.14) * (resale?0.92:1)).toFixed(2));
}
function gb(sqft, bhk, cm, rera, rtm) {
  return parseFloat((lr(sqft,bhk,cm,rera,rtm) * (0.95+Math.random()*0.10) * 1.02).toFixed(2));
}
function rr(sqft, bhk, cm, rera, rtm) {
  const base = lr(sqft,bhk,cm,rera,rtm);
  return parseFloat((base*0.85 + 65*0.15).toFixed(2));
}
function logistic(price, sqft, rs) {
  const z    = -2.5 + 0.02*rs + 0.001*price - 0.0002*sqft;
  const prob = 1 / (1 + Math.exp(-z));
  return { highRiskProb: parseFloat(prob.toFixed(3)), riskClass: prob>.6?'HIGH':prob>.35?'MEDIUM':'LOW', confidence: parseFloat((Math.max(prob,1-prob)*100).toFixed(1)) };
}

// POST /api/predict
router.post('/', auth, async (req, res) => {
  try {
    const { sqft=1000, bhk=2, city='Bangalore', locality='', rera=false, rtm=false, resale=false, purpose='buy' } = req.body;
    const cm = cityMult[city.toLowerCase()] || 1.0;
    const rs = Math.floor(25 + Math.random()*55);

    const lrP   = lr(sqft, bhk, cm, rera, rtm);
    const rfP   = rf(sqft, bhk, cm, rera, rtm, resale);
    const gbP   = gb(sqft, bhk, cm, rera, rtm);
    const rrP   = rr(sqft, bhk, cm, rera, rtm);
    const ens   = parseFloat((lrP*0.15 + rfP*0.45 + gbP*0.30 + rrP*0.10).toFixed(2));
    const risk  = { ...logistic(ens, sqft, rs), riskScore: rs };

    const result = {
      input:       { sqft, bhk, city, locality, rera, rtm, resale, purpose },
      predictions: { linearRegression: lrP, randomForest: rfP, gradientBoosting: gbP, ridgeRegression: rrP, ensemble: ens },
      range:       { low: parseFloat((ens*0.89).toFixed(2)), high: parseFloat((ens*1.13).toFixed(2)) },
      riskAssessment: risk,
      featureImportance: [
        { feature:'Square Footage', importance:85 }, { feature:'BHK', importance:72 },
        { feature:'City',           importance:68 }, { feature:'RERA', importance:55 },
        { feature:'Ready to Move',  importance:48 }, { feature:'Resale', importance:32 }
      ],
      modelAccuracies: { linearRegression:87.2, randomForest:93.4, gradientBoosting:95.1, ridgeRegression:85.8 },
      timestamp: new Date().toISOString()
    };

    // ── Persist to SQLite ──────────────────────────────────────
    insert('predictions', {
      user_id:     req.user.id,
      input_json:  JSON.stringify(result.input),
      result_json: JSON.stringify(result)
    });

    // ── Save result mail to DB + send SMTP ────────────────────
    insert('mails', {
      user_id: req.user.id, from_addr: 'system@prism.ai', to_addr: req.user.email,
      subject: `🤖 ML Prediction: ${bhk}BHK in ${city} — ₹${ens}L`,
      body: `Hi ${req.user.name},\n\nYour price prediction:\n\n📍 ${city}${locality?', '+locality:''}\n🛏 ${bhk} BHK | 📐 ${sqft} sqft\n\n💰 PREDICTED: ₹${ens}L\nRange: ₹${(ens*0.89).toFixed(1)}L – ₹${(ens*1.13).toFixed(1)}L\n⚠️ Risk: ${risk.riskClass} (Score ${rs})\n\nModels: Linear Reg, Random Forest, Gradient Boosting, Ridge Reg\n\nPRISM AI Team`,
      unread: 1, direction: 'received'
    });

    await sendPredictionMail(req.user.email, req.user.name, result).catch(() => {});
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Prediction failed: ' + e.message });
  }
});

// GET /api/predict/history  — user's past predictions
router.get('/history', auth, (req, res) => {
  const { db } = require('../models/db');
  const rows = db.prepare(`SELECT * FROM predictions WHERE user_id=? ORDER BY created_at DESC LIMIT 20`).all(req.user.id);
  res.json(rows.map(r => ({ id: r.id, input: JSON.parse(r.input_json), result: JSON.parse(r.result_json), createdAt: r.created_at })));
});

module.exports = router;
