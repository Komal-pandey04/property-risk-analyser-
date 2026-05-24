"""
PRISM - Flask ML API Server
Run: python3 ml/app.py
Serves predictions using trained models on port 5001
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import json

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'trained_models')

# Load models at startup
models = {}
try:
    models['lr']       = joblib.load(os.path.join(MODEL_DIR, 'linear_regression.pkl'))
    models['rr']       = joblib.load(os.path.join(MODEL_DIR, 'ridge_regression.pkl'))
    models['rf']       = joblib.load(os.path.join(MODEL_DIR, 'random_forest.pkl'))
    models['gb']       = joblib.load(os.path.join(MODEL_DIR, 'gradient_boosting.pkl'))
    models['log_reg']  = joblib.load(os.path.join(MODEL_DIR, 'logistic_regression.pkl'))
    models['scaler']   = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
    models['le_city']  = joblib.load(os.path.join(MODEL_DIR, 'le_city.pkl'))
    models['le_posted']= joblib.load(os.path.join(MODEL_DIR, 'le_posted.pkl'))
    print("[OK] All models loaded successfully")
    with open(os.path.join(MODEL_DIR, 'metrics.json')) as f:
        metrics = json.load(f)
except Exception as e:
    print(f"[WARN] Could not load models: {e}")
    print("[WARN] Run 'python3 ml/train_models.py' first to train models")
    metrics = {}

def encode_city(city):
    try:
        return int(models['le_city'].transform([city])[0])
    except:
        return 0

def encode_posted(posted):
    try:
        return int(models['le_posted'].transform([posted])[0])
    except:
        return 0

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'models_loaded': list(models.keys()), 'metrics': metrics})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    sqft        = float(data.get('sqft', 1000))
    bhk         = float(data.get('bhk', 2))
    city        = data.get('city', 'Unknown')
    posted      = data.get('posted', 'Owner')
    rera        = float(data.get('rera', 0))
    rtm         = float(data.get('rtm', 0))
    resale      = float(data.get('resale', 0))
    under_const = float(data.get('underConstruction', 0))

    city_enc   = encode_city(city)
    posted_enc = encode_posted(posted)

    features = np.array([[sqft, bhk, city_enc, rera, rtm, resale, under_const, posted_enc]])

    if not models:
        return jsonify({'error': 'Models not trained. Run python3 ml/train_models.py'}), 503

    features_scaled = models['scaler'].transform(features)

    lr_pred  = float(models['lr'].predict(features_scaled)[0])
    rr_pred  = float(models['rr'].predict(features_scaled)[0])
    rf_pred  = float(models['rf'].predict(features)[0])
    gb_pred  = float(models['gb'].predict(features)[0])
    ensemble = round(lr_pred * 0.15 + rf_pred * 0.45 + gb_pred * 0.30 + rr_pred * 0.10, 2)

    risk_prob  = float(models['log_reg'].predict_proba(features_scaled)[0][1])
    risk_class = 'HIGH' if risk_prob > 0.6 else 'MEDIUM' if risk_prob > 0.35 else 'LOW'

    return jsonify({
        'predictions': {
            'linearRegression':   round(lr_pred, 2),
            'ridgeRegression':    round(rr_pred, 2),
            'randomForest':       round(rf_pred, 2),
            'gradientBoosting':   round(gb_pred, 2),
            'ensemble':           ensemble
        },
        'range': {
            'low':  round(ensemble * 0.89, 2),
            'high': round(ensemble * 1.13, 2)
        },
        'riskAssessment': {
            'riskClass':   risk_class,
            'probability': round(risk_prob, 3),
            'confidence':  round(max(risk_prob, 1 - risk_prob) * 100, 1)
        },
        'modelAccuracies': metrics
    })

@app.route('/feature-importance', methods=['GET'])
def feature_importance():
    if 'rf' not in models:
        return jsonify({'error': 'Model not loaded'}), 503
    features = ['SQUARE_FT', 'BHK_NO.', 'CITY_ENC', 'RERA', 'READY_TO_MOVE', 'RESALE', 'UNDER_CONSTRUCTION', 'POSTED_ENC']
    importance = models['rf'].feature_importances_.tolist()
    return jsonify({'features': features, 'importance': [round(v * 100, 2) for v in importance]})

if __name__ == '__main__':
    print("\n PRISM ML API running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
