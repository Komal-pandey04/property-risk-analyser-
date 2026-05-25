// PRISM — Property Risk Intelligence System
// Express Server  |  SQLite Database
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth',       require('./src/routes/auth'));
app.use('/api/properties', require('./src/routes/properties'));
app.use('/api/predict',    require('./src/routes/predict'));
app.use('/api/risk',       require('./src/routes/risk'));
app.use('/api/mail',       require('./src/routes/mail'));
app.use('/api/favourites', require('./src/routes/favourites'));
app.use('/api/registry',   require('./src/routes/registry'));
app.use('/api/contact',    require('./src/routes/contact'));
app.use('/api/chat',       require('./src/routes/chat'));

app.use('/api/call', require('./src/routes/call'));


// SPA fallback
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   PRISM — Property Risk Intelligence System  ║
  ║   SQLite DB  |  http://localhost:${PORT}        ║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
