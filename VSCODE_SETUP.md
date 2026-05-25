# 🛠 PRISM — VS Code Setup & Run Guide

Complete step-by-step guide to run this full-stack project in VS Code.

---

## 📦 Prerequisites — Install These First

| Tool | Download | Check if installed |
|------|----------|--------------------|
| **Node.js 18+** | https://nodejs.org | `node -v` |
| **Python 3.9+** | https://python.org | `python3 --version` |
| **VS Code** | https://code.visualstudio.com | — |
| **Git** (optional) | https://git-scm.com | `git --version` |

---

## 🚀 Step-by-Step Setup in VS Code

### Step 1 — Open the Project
```
1. Extract prism-project.zip to a folder (e.g. Desktop/prism-project)
2. Open VS Code
3. File → Open Folder → select the prism-project folder
```

### Step 2 — Install Recommended VS Code Extensions
Open Extensions panel (Ctrl+Shift+X) and install:
- **ESLint** — JavaScript linting
- **Prettier** — Code formatting
- **SQLite Viewer** — View prism.db visually inside VS Code
- **Thunder Client** — Test API routes (like Postman, built-in)
- **Python** — For ML scripts

### Step 3 — Open Two Terminals in VS Code
```
Terminal → New Terminal  (or Ctrl + `)
```
You need **two terminal tabs** — one for Node.js, one for Python ML.

To split: click the + icon in the terminal panel, or use the split terminal button.

---

## 🔧 Step 4 — Configure Environment Variables

Open `.env` in VS Code and fill in:

```env
PORT=3000
JWT_SECRET=prism_super_secret_jwt_key_2024

# Your Gmail + App Password (NOT your Google account password)
# How to get App Password:
#   1. Go to myaccount.google.com
#   2. Security → 2-Step Verification → App Passwords
#   3. Select App: Mail, Device: Other → type "PRISM" → Generate
#   4. Copy the 16-character password shown
MAIL_USER=04komalpandey@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx

# Anthropic API key (for AI chatbot)
# Get from: https://console.anthropic.com → API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 📦 Step 5 — Install Node.js Dependencies

In **Terminal 1** (Node terminal):
```bash
npm install
```

This installs: express, better-sqlite3, bcryptjs, jsonwebtoken, nodemailer, csv-parser, cors, dotenv

---

## 🐍 Step 6 — Install Python Dependencies

In **Terminal 2** (Python terminal):
```bash
pip install -r requirements.txt
# or on Mac/Linux:
pip3 install -r requirements.txt
```

This installs: pandas, numpy, scikit-learn, flask, joblib

---

## 🤖 Step 7 — Train ML Models (First Time Only)

In **Terminal 2**:
```bash
python3 ml/train_models.py
```

This reads `data/properties.csv` and trains 5 models:
- Linear Regression
- Ridge Regression
- Random Forest
- Gradient Boosting
- Logistic Regression

Saved to `ml/trained_models/` as `.pkl` files. Takes ~1-2 minutes.

---

## ▶️ Step 8 — Start the App

### Option A — Just Node.js (Recommended)
In **Terminal 1**:
```bash
npm start
```

The Node.js server handles everything:
- Serves the frontend at http://localhost:3000
- All API routes (/api/*)
- SQLite database (auto-created at db/prism.db)
- Properties CSV seeded into SQLite on first boot
- Crime data CSV seeded into SQLite on first boot

### Option B — Node.js + Python Flask ML API (Advanced)
Run both simultaneously:

**Terminal 1** (Node.js):
```bash
npm start
```

**Terminal 2** (Python Flask ML API):
```bash
python3 ml/app.py
```

The Flask server runs on http://localhost:5001 and handles real ML predictions using trained .pkl models. Node.js will call it at ML_API_URL from .env.

---

## 🌐 Step 9 — Open in Browser

Visit: **http://localhost:3000**

**Demo login:** `demo@property.com` / `demo123`

Or register a new account — a welcome email will be sent via Gmail.

---

## 🗄️ Step 10 — View SQLite Database in VS Code

1. Install **SQLite Viewer** extension in VS Code
2. Open `db/prism.db` in VS Code
3. You can browse all tables:
   - users, properties_cache, crime_data
   - favourites, mails, predictions, registry_checks, contact_tickets

Or use the terminal:
```bash
# Mac/Linux
sqlite3 db/prism.db ".tables"
sqlite3 db/prism.db "SELECT city, COUNT(*) FROM properties_cache GROUP BY city ORDER BY COUNT(*) DESC LIMIT 10;"

# Windows (if sqlite3 is installed)
sqlite3.exe db\prism.db ".tables"
```

---

## 🔄 Development Mode (Auto-Reload)

Instead of `npm start`, use:
```bash
npm run dev
```

This uses `nodemon` — the server auto-restarts whenever you save a `.js` file. Perfect for development.

---

## 📱 How mailto: and tel: Work

### Email (mailto:)
When user clicks **"Send Enquiry"** or **"Open Mail App & Send"**:
```
window.location.href = "mailto:agents@prism.ai?subject=...&body=..."
```
→ Opens **Gmail app** (mobile) or **default mail client** (desktop) with the message pre-filled.
→ User hits Send in their own app. No backend needed.

### Calling (tel:)
When user clicks any **"📞 Call"** button:
```html
<a href="tel:+919876543210">Call</a>
```
→ On **mobile**: opens phone dialer immediately and dials the number.
→ On **desktop**: prompts to open Skype, FaceTime, or default calling app.

### WhatsApp
```html
<a href="https://wa.me/919876543210?text=...">WhatsApp</a>
```
→ Opens WhatsApp with the message pre-filled.

---

## 🔢 Change Phone Numbers

Open `public/js/pages/mails.js` and edit the `CONTACT` object at the top:

```javascript
const CONTACT = {
  Sales:   { number: '+919876543210', label: '+91 98765 43210' },
  Support: { number: '+918765432100', label: '+91 87654 32100' },
  Legal:   { number: '+917654321000', label: '+91 76543 21000' },
  support_email: 'support@prism.ai'
};
```

Replace with your real numbers. Save. Done — no restart needed.

---

## 🐛 Common Issues & Fixes

### "better-sqlite3 build error" on npm install
```bash
npm install --build-from-source
# or
npm install windows-build-tools -g  # Windows only
```

### "Python not found"
```bash
# Windows: use py instead of python3
py ml/train_models.py

# Mac: ensure Python 3 is default
python3 --version
```

### Port 3000 already in use
Edit `.env`:
```
PORT=3001
```
Then visit http://localhost:3001

### Gmail not sending emails
- Make sure 2-Step Verification is ON in your Google Account
- Use an **App Password** (16 chars), not your Gmail password
- Check spam folder for first emails

### SQLite db/prism.db not created
The file is auto-created on first `npm start`. Make sure the `db/` folder exists (it should already be in the ZIP).

---

## 📂 Frontend ↔ Backend Connection Explained

```
Browser (http://localhost:3000)
        │
        │  Static files served by Express
        ▼
  public/index.html  ←──  public/css/main.css
  public/js/*.js          public/js/pages/*.js
        │
        │  API calls:  fetch('/api/properties')
        │              fetch('/api/predict')
        │              etc.
        ▼
  server.js (Express, port 3000)
        │
        ├── /api/auth        → src/routes/auth.js
        ├── /api/properties  → src/routes/properties.js  ──► db/prism.db (SQLite)
        ├── /api/predict     → src/routes/predict.js      ──► ml/trained_models/*.pkl
        ├── /api/risk        → src/routes/risk.js         ──► db/prism.db (crime_data table)
        ├── /api/mail        → src/routes/mail.js         ──► nodemailer (Gmail SMTP)
        ├── /api/favourites  → src/routes/favourites.js   ──► db/prism.db
        ├── /api/registry    → src/routes/registry.js     ──► db/prism.db
        ├── /api/contact     → src/routes/contact.js      ──► db/prism.db
        └── /api/chat        → src/routes/chat.js         ──► Anthropic API
```

**Key point:** The frontend (HTML/CSS/JS in `public/`) and backend (Node.js in `src/`) run on the **same port (3000)**. Express serves the frontend files AND handles API routes. No CORS issues, no separate ports needed.

---

## 🚀 Production Deployment

### Deploy to Railway (Free)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Deploy to Vercel
Add `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```
```bash
npx vercel
```

### Environment Variables on Production
Set the same variables from `.env` in your hosting platform's dashboard (never commit `.env` to Git).

---

*PRISM — Property Risk Intelligence System*
*Built with Node.js, SQLite, Python scikit-learn, and Anthropic Claude AI*
