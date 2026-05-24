"""
PRISM - ML Model Training Script
Trains and saves: Linear Regression, Random Forest, Gradient Boosting,
Ridge Regression, Logistic Regression on property + crime data.
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score
import joblib
import os
import json
import warnings
warnings.filterwarnings('ignore')

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'trained_models')
os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("  PRISM - ML Model Training")
print("=" * 60)

# ─── Load & Preprocess Property Data ─────────────────────────
print("\n[1/6] Loading property data...")
df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../data/properties.csv'))
print(f"  Loaded {len(df)} rows")

df.columns = df.columns.str.strip()
df['SQUARE_FT'] = pd.to_numeric(df['SQUARE_FT'], errors='coerce')
df['TARGET(PRICE_IN_LACS)'] = pd.to_numeric(df['TARGET(PRICE_IN_LACS)'], errors='coerce')
df['BHK_NO.'] = pd.to_numeric(df['BHK_NO.'], errors='coerce')
df = df.dropna(subset=['SQUARE_FT', 'TARGET(PRICE_IN_LACS)', 'BHK_NO.'])

# Extract city
df['CITY'] = df['ADDRESS'].str.split(',').str[-1].str.strip().fillna('Unknown')
df['LOCALITY'] = df['ADDRESS'].str.split(',').str[0].str.strip().fillna('Unknown')

# Encode categoricals
le_city = LabelEncoder()
le_posted = LabelEncoder()
df['CITY_ENC'] = le_city.fit_transform(df['CITY'])
df['POSTED_ENC'] = le_posted.fit_transform(df['POSTED_BY'].fillna('Owner'))

features = ['SQUARE_FT', 'BHK_NO.', 'CITY_ENC', 'RERA', 'READY_TO_MOVE', 'RESALE',
            'UNDER_CONSTRUCTION', 'POSTED_ENC']

X = df[features].fillna(0)
y = df['TARGET(PRICE_IN_LACS)']

# Remove outliers
mask = (y > 5) & (y < 500)
X, y = X[mask], y[mask]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

results = {}

# ─── 1. Linear Regression ────────────────────────────────────
print("\n[2/6] Training Linear Regression...")
lr = LinearRegression()
lr.fit(X_train_sc, y_train)
y_pred_lr = lr.predict(X_test_sc)
r2_lr = r2_score(y_test, y_pred_lr)
rmse_lr = np.sqrt(mean_squared_error(y_test, y_pred_lr))
print(f"  R²={r2_lr:.4f}  RMSE={rmse_lr:.2f}")
results['linear_regression'] = {'r2': round(r2_lr, 4), 'rmse': round(rmse_lr, 2)}
joblib.dump(lr, os.path.join(MODEL_DIR, 'linear_regression.pkl'))

# ─── 2. Ridge Regression ─────────────────────────────────────
print("\n[3/6] Training Ridge Regression...")
rr = Ridge(alpha=1.0)
rr.fit(X_train_sc, y_train)
y_pred_rr = rr.predict(X_test_sc)
r2_rr = r2_score(y_test, y_pred_rr)
rmse_rr = np.sqrt(mean_squared_error(y_test, y_pred_rr))
print(f"  R²={r2_rr:.4f}  RMSE={rmse_rr:.2f}")
results['ridge_regression'] = {'r2': round(r2_rr, 4), 'rmse': round(rmse_rr, 2)}
joblib.dump(rr, os.path.join(MODEL_DIR, 'ridge_regression.pkl'))

# ─── 3. Random Forest ────────────────────────────────────────
print("\n[4/6] Training Random Forest (this may take a minute)...")
rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)
r2_rf = r2_score(y_test, y_pred_rf)
rmse_rf = np.sqrt(mean_squared_error(y_test, y_pred_rf))
print(f"  R²={r2_rf:.4f}  RMSE={rmse_rf:.2f}")
results['random_forest'] = {'r2': round(r2_rf, 4), 'rmse': round(rmse_rf, 2)}
# Feature importance
fi = dict(zip(features, rf.feature_importances_.tolist()))
results['feature_importance'] = {k: round(v*100, 1) for k, v in fi.items()}
joblib.dump(rf, os.path.join(MODEL_DIR, 'random_forest.pkl'))

# ─── 4. Gradient Boosting ────────────────────────────────────
print("\n[5/6] Training Gradient Boosting...")
gb = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, max_depth=4, random_state=42)
gb.fit(X_train, y_train)
y_pred_gb = gb.predict(X_test)
r2_gb = r2_score(y_test, y_pred_gb)
rmse_gb = np.sqrt(mean_squared_error(y_test, y_pred_gb))
print(f"  R²={r2_gb:.4f}  RMSE={rmse_gb:.2f}")
results['gradient_boosting'] = {'r2': round(r2_gb, 4), 'rmse': round(rmse_gb, 2)}
joblib.dump(gb, os.path.join(MODEL_DIR, 'gradient_boosting.pkl'))

# ─── 5. Logistic Regression (Risk Classifier) ────────────────
print("\n[6/6] Training Logistic Regression (Risk Classifier)...")
y_risk = (y > y.median()).astype(int)  # 1=high price/risk, 0=normal
y_train_risk = y_risk[y_train.index]
y_test_risk  = y_risk[y_test.index]
log_reg = LogisticRegression(max_iter=1000, random_state=42)
log_reg.fit(X_train_sc, y_train_risk)
y_pred_log = log_reg.predict(X_test_sc)
acc = accuracy_score(y_test_risk, y_pred_log)
print(f"  Accuracy={acc:.4f}")
results['logistic_regression'] = {'accuracy': round(acc, 4)}
joblib.dump(log_reg, os.path.join(MODEL_DIR, 'logistic_regression.pkl'))

# ─── Save scaler & encoders ──────────────────────────────────
joblib.dump(scaler,   os.path.join(MODEL_DIR, 'scaler.pkl'))
joblib.dump(le_city,  os.path.join(MODEL_DIR, 'le_city.pkl'))
joblib.dump(le_posted,os.path.join(MODEL_DIR, 'le_posted.pkl'))

# ─── Save metrics ────────────────────────────────────────────
with open(os.path.join(MODEL_DIR, 'metrics.json'), 'w') as f:
    json.dump(results, f, indent=2)

print("\n" + "=" * 60)
print("  Training Complete! Models saved to ml/trained_models/")
print("=" * 60)
print(f"\n  Model Summary:")
print(f"  Linear Regression  R²: {results['linear_regression']['r2']}")
print(f"  Ridge Regression   R²: {results['ridge_regression']['r2']}")
print(f"  Random Forest      R²: {results['random_forest']['r2']}")
print(f"  Gradient Boosting  R²: {results['gradient_boosting']['r2']}")
print(f"  Logistic Reg.  Acc: {results['logistic_regression']['accuracy']}")
