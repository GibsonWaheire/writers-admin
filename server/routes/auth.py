from flask import Blueprint, request, jsonify
from models import User
from app import db
import hashlib

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    # Hash password for comparison (simple hash for now)
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Compare hashed passwords
    if user.password != password_hash and user.password != password:  # Support both hashed and plain
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return jsonify({
        'user': user.to_dict(),
        'token': 'mock-token'  # In production, use JWT
    }), 200

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'writer')
    
    if not email or not password or not name:
        return jsonify({'error': 'Email, password, and name required'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 400
    
    # Hash password
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    # Create user
    import uuid
    user = User(
        id=str(uuid.uuid4()),
        email=email,
        password=password_hash,
        name=name,
        role=role
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'user': user.to_dict(),
        'token': 'mock-token'
    }), 201

