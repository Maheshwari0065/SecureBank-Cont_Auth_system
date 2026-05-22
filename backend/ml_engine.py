import os
import numpy as np
import joblib
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from config import Config

def extract_features(events):
    X = []
    for ev in events:
        hold = float(ev.get('hold_time', 0))
        flight = float(ev.get('flight_time', 0))
        speed = float(ev.get('mouse_speed', 0))
        clicks = float(ev.get('click_count', 0))
        X.append([hold, flight, speed, clicks])
    return np.array(X)

def train_model(user_id, events):
    X = extract_features(events)
    if len(X) < 80:
        return False, len(X), None, None
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = OneClassSVM(kernel='rbf', nu=0.05, gamma='auto')
    model.fit(X_scaled)
    
    os.makedirs(Config.MODELS_DIR, exist_ok=True)
    scaler_path = os.path.join(Config.MODELS_DIR, f'user_{user_id}_scaler.pkl')
    model_path = os.path.join(Config.MODELS_DIR, f'user_{user_id}_model.pkl')
    
    joblib.dump(scaler, scaler_path)
    joblib.dump(model, model_path)
    
    return True, len(X), model_path, scaler_path

def verify_session(user_id, events):
    scaler_path = os.path.join(Config.MODELS_DIR, f'user_{user_id}_scaler.pkl')
    model_path = os.path.join(Config.MODELS_DIR, f'user_{user_id}_model.pkl')
    
    if not os.path.exists(scaler_path) or not os.path.exists(model_path):
        return -1.0
        
    scaler = joblib.load(scaler_path)
    model = joblib.load(model_path)
    
    X = extract_features(events)
    if len(X) == 0:
        return 0.0
        
    X_scaled = scaler.transform(X)
    predictions = model.predict(X_scaled)
    
    # +1 indicates normal, -1 indicates anomaly
    anomalies = np.sum(predictions == -1)
    ratio = anomalies / len(predictions)
    
    return float(ratio)
