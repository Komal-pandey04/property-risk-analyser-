// ── Properties Route — loads CSV into SQLite on first boot ────
const express    = require('express');
const router     = express.Router();
const fs         = require('fs');
const path       = require('path');
const csv        = require('csv-parser');
const { db, query, run, count } = require('../models/db');

const TYPES   = ['Apartment','Villa','Independent House','Studio','Penthouse'];
const PURPOSES = ['buy','rent'];

// Seed properties from CSV into SQLite (once)
function seedProperties() {
  const existing = db.prepare('SELECT COUNT(*) as n FROM properties_cache').get().n;
  if (existing > 0) { console.log(`[DB] properties_cache already has ${existing} rows — skipping seed`); return; }

  console.log('[DB] Seeding properties_cache from CSV...');
  const csvPath = path.join(__dirname, '../../data/properties.csv');
  const rows    = [];

  const stream = fs.createReadStream(csvPath).pipe(csv());
  stream.on('data', (row) => {
    try {
      const sqft  = parseFloat(row['SQUARE_FT']) || 1000;
      const price = parseFloat(row['TARGET(PRICE_IN_LACS)']) || 50;
      const bhk   = parseInt(row['BHK_NO.']) || 2;
      const addr  = row['ADDRESS'] || 'Unknown, City';
      const parts = addr.split(',');
      const locality = parts[0]?.trim() || 'Area';
      const city     = parts[1]?.trim() || 'City';
      const rs = Math.floor(20 + Math.random() * 65);
      rows.push({
        city, locality, bhk, sqft: Math.round(sqft), price,
        risk_score: rs,
        risk_label: rs < 40 ? 'low' : rs < 65 ? 'medium' : 'high',
        rera:       parseInt(row['RERA'])            || 0,
        rtm:        parseInt(row['READY_TO_MOVE'])   || 0,
        resale:     parseInt(row['RESALE'])           || 0,
        under_const:parseInt(row['UNDER_CONSTRUCTION'])|| 0,
        type:       TYPES[rows.length % TYPES.length],
        posted_by:  row['POSTED_BY'] || 'Owner',
        purpose:    PURPOSES[rows.length % 2],
        lat: parseFloat(row['LATITUDE'])  || 0,
        lng: parseFloat(row['LONGITUDE']) || 0
      });
    } catch(e) {}
  });

  stream.on('end', () => {
    const insert = db.prepare(`
      INSERT INTO properties_cache
        (city,locality,bhk,sqft,price,risk_score,risk_label,rera,rtm,resale,under_const,type,posted_by,purpose,lat,lng)
      VALUES
        (@city,@locality,@bhk,@sqft,@price,@risk_score,@risk_label,@rera,@rtm,@resale,@under_const,@type,@posted_by,@purpose,@lat,@lng)
    `);
    const insertMany = db.transaction((rows) => { for (const r of rows) insert.run(r); });
    insertMany(rows);
    console.log(`[DB] Seeded ${rows.length} properties into SQLite`);
  });
}

seedProperties();

// GET /api/properties
router.get('/', (req, res) => {
  const { city, minPrice, maxPrice, beds, riskLevel, purpose, type, page = 1, limit = 24 } = req.query;

  let where  = 'WHERE 1=1';
  const vals = [];

  if (city)      { where += ` AND (city LIKE ? OR locality LIKE ?)`; vals.push(`%${city}%`, `%${city}%`); }
  if (minPrice)  { where += ` AND price >= ?`;    vals.push(parseFloat(minPrice)); }
  if (maxPrice)  { where += ` AND price <= ?`;    vals.push(parseFloat(maxPrice)); }
  if (beds && beds !== 'any') {
    if (beds === '5+') { where += ` AND bhk >= 5`; }
    else               { where += ` AND bhk = ?`;  vals.push(parseInt(beds)); }
  }
  if (riskLevel && riskLevel !== 'all') { where += ` AND risk_label = ?`; vals.push(riskLevel); }
  if (purpose   && purpose   !== 'all') { where += ` AND purpose = ?`;    vals.push(purpose); }
  if (type      && type      !== 'all') { where += ` AND type = ?`;       vals.push(type); }

  const total      = db.prepare(`SELECT COUNT(*) as n FROM properties_cache ${where}`).get(...vals).n;
  const offset     = (parseInt(page) - 1) * parseInt(limit);
  const properties = db.prepare(`SELECT * FROM properties_cache ${where} ORDER BY id LIMIT ? OFFSET ?`)
                       .all(...vals, parseInt(limit), offset);

  // Map snake_case → camelCase for frontend
  const mapped = properties.map(p => ({
    id: p.id, city: p.city, locality: p.locality, bhk: p.bhk,
    sqft: p.sqft, price: p.price, riskScore: p.risk_score, riskLabel: p.risk_label,
    rera: !!p.rera, rtm: !!p.rtm, resale: !!p.resale, underConstruction: !!p.under_const,
    type: p.type, posted: p.posted_by, purpose: p.purpose, lat: p.lat, lng: p.lng
  }));

  res.json({ total, page: parseInt(page), limit: parseInt(limit), properties: mapped });
});

// GET /api/properties/stats
router.get('/stats', (req, res) => {
  const total    = db.prepare('SELECT COUNT(*) as n FROM properties_cache').get().n;
  const avgPrice = db.prepare('SELECT ROUND(AVG(price),1) as v FROM properties_cache').get().v;
  const avgRisk  = db.prepare('SELECT ROUND(AVG(risk_score)) as v FROM properties_cache').get().v;
  const cities   = db.prepare('SELECT COUNT(DISTINCT city) as n FROM properties_cache').get().n;
  const cityStats= db.prepare(`
    SELECT city, ROUND(AVG(price),1) as avgPrice, COUNT(*) as cnt
    FROM properties_cache GROUP BY city ORDER BY cnt DESC LIMIT 10
  `).all();
  res.json({ total, avgPrice, avgRisk, cities, cityStats: cityStats.map(c => ({ city: c.city, avgPrice: c.avgPrice, count: c.cnt })) });
});

// GET /api/properties/:id
router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM properties_cache WHERE id = ?').get(parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Property not found' });
  res.json({ id: p.id, city: p.city, locality: p.locality, bhk: p.bhk, sqft: p.sqft, price: p.price,
    riskScore: p.risk_score, riskLabel: p.risk_label, rera: !!p.rera, rtm: !!p.rtm, resale: !!p.resale,
    type: p.type, posted: p.posted_by, purpose: p.purpose, lat: p.lat, lng: p.lng });
});

module.exports = router;
