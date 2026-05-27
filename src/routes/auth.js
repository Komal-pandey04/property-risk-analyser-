// ── Auth Routes — SQLite backend ──────────────────────────────
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { insert, findOne } = require('../models/db');
const { sendWelcomeMail } = require('../utils/mailer');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (findOne('users', { email }))
      return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = insert('users', { name, email, password: hashed, phone: phone || '', role: 'user' });
    const token  = jwt.sign({ id: user.id, email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Seed welcome mail into DB
    insert('mails', {
      user_id: user.id, from_addr: 'system@prism.ai', to_addr: email,
      subject: '🏠 Welcome to PRISM — Property Risk Intelligence System',
      body: `Hi ${name},\n\nWelcome to PRISM! Your account is active.\n\nExplore AI price predictions, crime risk analysis, and smart property matching.\n\nPRISM Team`,
      unread: 1, direction: 'received'
    });

    await sendWelcomeMail(email, name).catch(() => {});
    res.json({ token, user: { id: user.id, name, email, phone: user.phone } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Demo shortcut
    if (email === 'demo@property.com' && password === 'demo123') {
      const token = jwt.sign({ id: 'demo', email, name: 'Demo User' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: 'demo', name: 'Demo User', email, phone: '' } });
    }
    const user = findOne('users', { email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email, phone: user.phone } });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), (req, res) => {
  const user = findOne('users', { id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safe } = user;
  res.json(safe);
});

module.exports = router;
