from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import jwt
from config import Config
from models import (init_db, create_user, authenticate_user, update_user_training, 
                    log_verification, get_transactions, create_transfer_transaction, 
                    get_account_balances)
from ml_engine import train_model, verify_session
from auth_middleware import token_required

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

try:
    init_db()
    print("Database initialized successfully.")
except Exception as e:
    print(f"Failed to initialize database: {e}")

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    required_fields = ['full_name', 'username', 'email', 'password']
    if not all(k in data for k in required_fields):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
        
    success, msg, acc_num = create_user(
        data['full_name'], data['username'], data['email'], data['password']
    )
    
    if success:
        return jsonify({"success": True, "message": msg, "account_number": acc_num}), 201
    else:
        return jsonify({"success": False, "message": msg}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"success": False, "message": "Missing credentials"}), 400
        
    user = authenticate_user(data['username'], data['password'])
    if not user:
        return jsonify({"success": False, "message": "Invalid username or password"}), 401
        
    token = jwt.encode({
        'user_id': user['user_id'],
        'username': user['username'],
        'account_number': user['account_number'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }, app.config['JWT_SECRET'], algorithm="HS256")
    
    return jsonify({
        "success": True,
        "token": token,
        "user_id": user['user_id'],
        "username": user['username'],
        "full_name": user['full_name'],
        "account_number": user['account_number'],
        "is_trained": user['is_trained']
    }), 200

@app.route('/api/train', methods=['POST'])
@token_required
def train(current_user):
    data = request.json
    events = data.get('events', [])
    
    success, vectors_used, model_path, scaler_path = train_model(current_user['user_id'], events)
    
    if success:
        update_user_training(current_user['user_id'], True, model_path, scaler_path)
        return jsonify({"success": True, "vectors_used": vectors_used, "message": "Model trained successfully"}), 200
    else:
        return jsonify({"success": False, "vectors_used": vectors_used, "message": f"Need at least 80 vectors, got {vectors_used}"}), 400

@app.route('/api/verify', methods=['POST'])
@token_required
def verify(current_user):
    data = request.json
    events = data.get('events', [])
    
    ratio = verify_session(current_user['user_id'], events)
    
    if ratio == -1.0:
        return jsonify({"status": "error", "message": "User model not found or untrained", "anomaly_ratio": 0.0}), 400
        
    status = "normal"
    if ratio >= 0.6:
        status = "anomaly"
    elif ratio >= 0.3:
        status = "unusual"
        
    log_verification(current_user['user_id'], ratio, status, len(events))
    
    if status == "anomaly":
        return jsonify({"status": status, "anomaly_ratio": ratio, "message": "Session locked due to unusual behavior"}), 403
        
    return jsonify({"status": status, "anomaly_ratio": ratio}), 200

@app.route('/api/transactions/<int:user_id>', methods=['GET'])
@token_required
def transactions(current_user, user_id):
    if current_user['user_id'] != user_id:
        return jsonify({"message": "Unauthorized access to transactions"}), 403
        
    txns = get_transactions(user_id)
    return jsonify({"success": True, "transactions": txns}), 200

@app.route('/api/transfer', methods=['POST'])
@token_required
def transfer(current_user):
    data = request.json
    required_fields = ['from_account', 'to_account', 'amount']
    if not all(k in data for k in required_fields):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
        
    success, result = create_transfer_transaction(
        current_user['user_id'], data['to_account'], data['amount'], data.get('note', '')
    )
    
    if success:
        bals = get_account_balances(current_user['user_id'])
        return jsonify({
            "success": True, 
            "message": "Transfer successful", 
            "transaction_id": result,
            "new_balance": bals['current_balance']
        }), 200
    else:
        return jsonify({"success": False, "message": f"Transfer failed: {result}"}), 400

@app.route('/api/account_summary/<int:user_id>', methods=['GET'])
@token_required
def account_summary(current_user, user_id):
    if current_user['user_id'] != user_id:
        return jsonify({"message": "Unauthorized access"}), 403
        
    summary = get_account_balances(user_id)
    return jsonify({"success": True, "summary": summary}), 200

if __name__ == '__main__':
    # Suppress the development server banner warnings for a cleaner console
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    
    app.run(debug=True, port=5000)
