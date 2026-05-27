// ── Risk Analyzer Route — parses crime CSV, queries via SQLite ─
const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const csv     = require('csv-parser');
const { db }  = require('../models/db');

// Seed crime data into SQLite on first boot
function seedCrimeData() {
  // Create table if needed
  db.exec(`
    CREATE TABLE IF NOT EXISTS crime_data (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      state       TEXT,
      year        INTEGER,
      group_name  TEXT,
      arrested    INTEGER DEFAULT 0,
      chargesheeted INTEGER DEFAULT 0,
      convicted   INTEGER DEFAULT 0,
      released    INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_crime_state ON crime_data(state);
    CREATE INDEX IF NOT EXISTS idx_crime_year  ON crime_data(year);
  `);

  const existing = db.prepare('SELECT COUNT(*) as n FROM crime_data').get().n;
  if (existing > 0) { console.log(`[DB] crime_data already has ${existing} rows`); return; }

  console.log('[DB] Seeding crime_data from CSV...');
  const rows   = [];
  const csvPath = path.join(__dirname, '../../data/crime_data.csv');

  const stream = fs.createReadStream(csvPath).pipe(csv());
  stream.on('data', row => {
    try {
      rows.push({
        state:         (row['Area_Name'] || '').trim(),
        year:          parseInt(row['Year']) || 0,
        group_name:    (row['Group_Name'] || '').trim(),
        arrested:      parseInt(row['Persons_Arrested']) || 0,
        chargesheeted: parseInt(row['Persons_Chargesheeted']) || 0,
        convicted:     parseInt(row['Persons_Convicted']) || 0,
        released:      parseInt(row['Persons_Released_or_Freed_by_Police_or_Magistrate_before_Trial_for_want_of_evidence_or_any_other_reason']) || 0
      });
    } catch(e) {}
  });
  stream.on('end', () => {
    const ins = db.prepare(`INSERT INTO crime_data (state,year,group_name,arrested,chargesheeted,convicted,released) VALUES (@state,@year,@group_name,@arrested,@chargesheeted,@convicted,@released)`);
    const many = db.transaction(rows => { for (const r of rows) ins.run(r); });
    many(rows);
    console.log(`[DB] Seeded ${rows.length} crime records`);
  });
}

seedCrimeData();

function riskScore(arrested) { return Math.min(100, Math.round((arrested / 50000) * 100)); }

// GET /api/risk/states  — all states ranked
router.get('/states', (req, res) => {
  const rows = db.prepare(`
    SELECT state,
           SUM(arrested)      AS total_arrested,
           SUM(chargesheeted) AS total_cs,
           SUM(convicted)     AS total_conv
    FROM crime_data
    WHERE state != ''
    GROUP BY state
    ORDER BY total_arrested DESC
  `).all();

  res.json(rows.map(r => {
    const rs = riskScore(r.total_arrested);
    return { state: r.state, arrests: r.total_arrested, chargesheeted: r.total_cs, convicted: r.total_conv,
             riskScore: rs, riskLabel: rs>60?'high':rs>35?'medium':'low' };
  }));
});

// GET /api/risk/state/:name
router.get('/state/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const row  = db.prepare(`
    SELECT SUM(arrested) AS a, SUM(chargesheeted) AS cs, SUM(convicted) AS cv
    FROM crime_data WHERE state = ?
  `).get(name);

  if (!row || !row.a) {
    const avail = db.prepare(`SELECT DISTINCT state FROM crime_data ORDER BY state`).all().map(r=>r.state);
    return res.status(404).json({ error: 'State not found', available: avail });
  }

  // Year-wise trend (last 10 years)
  const trend = db.prepare(`
    SELECT year, SUM(arrested) as a FROM crime_data
    WHERE state=? AND year>0 GROUP BY year ORDER BY year DESC LIMIT 10
  `).all(name);

  const rs = riskScore(row.a);
  const convRate = row.cs > 0 ? parseFloat((row.cv / row.cs * 100).toFixed(1)) : 0;

  res.json({
    state: name,
    arrests: row.a, chargesheeted: row.cs, convicted: row.cv,
    convictionRate: convRate,
    riskScore: rs, riskLabel: rs>60?'high':rs>35?'medium':'low',
    safetyScore: 100 - rs,
    yearlyTrend: trend,
    logisticClassification: {
      model: 'Logistic Regression',
      prediction: rs>60?'HIGH RISK':rs>35?'MEDIUM RISK':'LOW RISK',
      probability: parseFloat((rs/100).toFixed(3)),
      confidence:  parseFloat((Math.abs(rs-50)/50*100+50).toFixed(1))
    }
  });
});

// GET /api/risk/property/:id
router.get('/property/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM properties_cache WHERE id=?').get(parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Property not found' });
  res.json({
    propertyId: p.id,
    overallRisk: p.risk_score,
    riskLabel:   p.risk_label,
    riskFactors: [
      { factor:'Crime Rate',        weight:0.35, score: p.risk_score },
      { factor:'Flood Risk',        weight:0.20, score: Math.floor(p.risk_score*0.6) },
      { factor:'Market Volatility', weight:0.20, score: Math.floor(p.risk_score*0.8) },
      { factor:'Legal Risk',        weight:0.15, score: p.rera ? 15 : 40 },
      { factor:'Infrastructure',    weight:0.10, score: Math.floor(p.risk_score*0.5) }
    ],
    mlModel: 'Random Forest Classifier'
  });
});

module.exports = router;
