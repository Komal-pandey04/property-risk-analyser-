
# 🏠 PRISM — Property Risk and Intelligence Simulation Model

**AI-powered property analytics platform for Indian real estate**
**Backend: Node.js + Express | Database: SQLite (better-sqlite3) | ML: Python scikit-learn**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+

### 1. Install dependencies
```bash
npm install
pip install -r requirements.txt
```

### 2. Configure environment
Edit `.env`:
```
MAIL_USER=04komalpandey@gmail.com
MAIL_PASS=your_gmail_app_password
ANTHROPIC_API_KEY=sk-ant-...
```
> Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords

### 3. Train ML models (first time only)
```bash
python3 ml/train_models.py
```

### 4. Run the app
```bash
npm start          # production
npm run dev        # development (auto-reload)
```

### 5. Open browser
**http://localhost:3000**
Demo login: `demo@property.com` / `demo123`

---

## 🗄️ SQLite Database — Tables

The database is stored at `db/prism.db` (auto-created on first run).
All 29,451 properties and crime records are seeded from CSV automatically.

| Table | Description |
|-------|-------------|
| `users` | Registered users (hashed passwords) |
| `properties_cache` | 29,451 properties loaded from CSV |
| `crime_data` | NCRB crime records by state & year |
| `favourites` | Saved properties per user |
| `mails` | Inbox/sent mails per user |
| `predictions` | ML prediction history per user |
| `registry_checks` | RERA verification history |
| `contact_tickets` | Support tickets |

### View/query the database directly:
```bash
sqlite3 db/prism.db
```
```sql
SELECT city, COUNT(*) as count, ROUND(AVG(price),1) as avg_price
FROM properties_cache GROUP BY city ORDER BY count DESC LIMIT 10;

SELECT state, SUM(arrested) as total FROM crime_data
GROUP BY state ORDER BY total DESC;

SELECT u.name, COUNT(f.id) as favs FROM users u
LEFT JOIN favourites f ON f.user_id=u.id GROUP BY u.id;
=======
# 🏠 Property Risk and Intelligence Simulation System

## 📌 Overview

The Property Risk and Intelligence Simulation System is a web-based application that analyzes real estate properties using machine learning techniques. It predicts property prices, assesses environmental risks (such as flood risk), and provides intelligent insights based on location data.

---

## 🚀 Features

* 📍 Location-based property analysis using Map API
* 📊 Property price prediction using Machine Learning
* ⚠️ Risk assessment (Flood risk, environmental factors)
* 🗺️ Interactive map for selecting property location
* 📈 Dashboard for visualizing results
* 💾 Data storage using SQLite

---

## 🛠️ Tech Stack

### 🎨 Frontend

* HTML
* CSS
* JavaScript

### ⚙️ Backend

* Python (Flask)

### 🗄️ Database

* SQLite

### 🤖 Machine Learning

* Linear Regression
* Random Forest (optional)
* LSTM (future scope)

### 📊 Dataset

* Kaggle datasets (real estate + environmental data)

### 🗺️ Map Integration

* Google Maps API / Leaflet.js

---

## 🏗️ Project Architecture

```
Frontend (HTML/CSS/JS)
        ↓
API Calls (Fetch/AJAX)
        ↓
Python Flask Backend
        ↓
ML Models + SQLite Database
        ↓
Response (Prediction + Risk)
        ↓
Frontend Dashboard Display
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/property-risk-system.git
cd property-risk-system
```

### 2️⃣ Install Dependencies

```bash
pip install flask pandas scikit-learn
```

### 3️⃣ Run Backend Server

```bash
python app.py
```

### 4️⃣ Open Frontend

* Open `index.html` in browser
* OR use Live Server

---

## 📊 How It Works

1. User selects a location using the map
2. Coordinates and inputs are sent to backend
3. Machine learning model processes the data
4. System predicts:

   * Property price
   * Risk level
5. Results are displayed on the dashboard

---

## 📂 Project Structure

```
property-risk-system/
│── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── style.css
│   └── script.js
│
│── backend/
│   ├── app.py
│   ├── model.py
│   └── database.db
│
│── dataset/
│   └── data.csv
│
│── README.md
>>>>>>> 0694f520aaac7166724aa670b2163c9f440da872
```

---

<<<<<<< HEAD
## 📁 Project Structure

```
prism-project/
├── server.js               # Express entry point
├── package.json
├── requirements.txt
├── .env                    # ← EDIT THIS
├── data/
│   ├── properties.csv      # 29,451 records (seeded to SQLite)
│   └── crime_data.csv      # NCRB data (seeded to SQLite)
├── db/
│   └── prism.db            # SQLite database (auto-created)
├── ml/
│   ├── train_models.py     # Train 5 ML models → .pkl files
│   ├── app.py              # Flask ML API (port 5001)
│   └── trained_models/     # Saved model files
├── src/
│   ├── routes/
│   │   ├── auth.js         # Login/register (JWT)
│   │   ├── properties.js   # Search (SQL queries on SQLite)
│   │   ├── predict.js      # ML prediction + saves to DB
│   │   ├── risk.js         # Crime analysis from SQLite
│   │   ├── mail.js         # Mail CRUD in SQLite
│   │   ├── favourites.js   # Favourites CRUD
│   │   ├── registry.js     # RERA check + history
│   │   ├── contact.js      # Support tickets
│   │   └── chat.js         # Anthropic AI chatbot proxy
│   ├── middleware/auth.js   # JWT verification
│   ├── models/db.js        # SQLite helpers (insert/findOne/etc.)
│   └── utils/mailer.js     # 5 HTML email templates
└── public/
    ├── index.html
    ├── css/main.css
    └── js/ 
```

---

## 🤖 ML Models

Trained on 29,451 property records:

| Model | R² Score | Use |
|-------|----------|-----|
| Linear Regression | ~87% | Price baseline |
| Ridge Regression | ~86% | Regularized price |
| Random Forest | ~93% | Best individual |
| Gradient Boosting | ~95% | Highest accuracy |
| Logistic Regression | ~84% acc | Risk classification |

Ensemble = `RF×45% + GB×30% + LR×15% + RR×10%`

---

## 📧 Auto Email System

Emails sent automatically (from your Gmail) on:
- 🎉 New user registration
- ❤️ Property saved to favourites
- 🤖 Price prediction completed
- 📧 Property enquiry sent
- ✅ Contact form submitted

---

## 🔑 Full API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/properties?city=&minPrice=&maxPrice=&beds=&riskLevel=&purpose=&page=&limit=` | — | Search |
| GET | `/api/properties/stats` | — | Dashboard stats |
| GET | `/api/properties/:id` | — | Single property |
| POST | `/api/predict` | ✓ | ML prediction |
| GET | `/api/predict/history` | ✓ | Past predictions |
| GET | `/api/risk/states` | — | All state risks |
| GET | `/api/risk/state/:name` | — | State detail |
| GET | `/api/risk/property/:id` | — | Property risk |
| GET | `/api/mail` | ✓ | Inbox |
| POST | `/api/mail/send` | ✓ | Send mail |
| PATCH | `/api/mail/:id/read` | ✓ | Mark read |
| DELETE | `/api/mail/:id` | ✓ | Delete |
| GET | `/api/favourites` | ✓ | List |
| POST | `/api/favourites` | ✓ | Save |
| DELETE | `/api/favourites/:id` | ✓ | Remove |
| GET | `/api/registry/verify?reraId=&city=&owner=` | ✓ | Verify |
| GET | `/api/registry/history` | ✓ | Past checks |
| POST | `/api/contact` | ✓ | Submit ticket |
| GET | `/api/contact/tickets` | ✓ | My tickets |
| POST | `/api/chat` | ✓ | AI chatbot |
=======
## 🔮 Future Enhancements

* Real-time data integration
* Advanced ML models (XGBoost, LSTM)
* User authentication system
* Deployment on cloud (AWS/Heroku)

---

## 🎯 Use Cases

* Real estate analysis
* Investment decision support
* Risk assessment for properties
* Urban planning insights

---

## 👨‍💻 Author

* Komal Pandey

---

## ⭐ Acknowledgements

* Kaggle (for datasets)
* Open-source libraries and tools
>>>>>>> 0694f520aaac7166724aa670b2163c9f440da872
