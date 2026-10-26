import hashlib
from flask import Blueprint, request, jsonify, session
from backend.database import query_db, execute_db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def hash_password(password: str) -> str:
    """Hash password using SHA-256."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required.'}), 400

    hashed = hash_password(password)
    user = query_db(
        "SELECT id, username, full_name, email, role FROM users WHERE username = ? AND password_hash = ?",
        (username, hashed),
        one=True
    )

    if not user:
        return jsonify({'success': False, 'message': 'Invalid username or password.'}), 401

    session['user_id'] = user['id']
    session['username'] = user['username']
    session['role'] = user['role']
    session['full_name'] = user['full_name']

    return jsonify({
        'success': True,
        'message': f"Welcome back, {user['full_name']}!",
        'user': user,
        'token': f"mock-token-{user['id']}-{user['username']}"
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully.'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        # Default fallback to admin for testing convenience
        admin = query_db("SELECT id, username, full_name, email, role FROM users WHERE id = 1", one=True)
        if admin:
            return jsonify({'authenticated': True, 'user': admin})
        return jsonify({'authenticated': False, 'user': None}), 401
    
    user = query_db("SELECT id, username, full_name, email, role FROM users WHERE id = ?", (user_id,), one=True)
    if not user:
        return jsonify({'authenticated': False, 'user': None}), 404
        
    return jsonify({'authenticated': True, 'user': user}), 200

@auth_bp.route('/users', methods=['GET'])
def list_users():
    users = query_db("SELECT id, username, full_name, email, role, created_at FROM users ORDER BY id ASC")
    return jsonify({'success': True, 'data': users}), 200
