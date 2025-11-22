from flask import Blueprint, request, jsonify
from models import User
from app import db

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@bp.route('', methods=['POST'])
def create_user():
    data = request.get_json()
    import uuid
    import hashlib
    
    user = User(
        id=data.get('id', str(uuid.uuid4())),
        email=data.get('email'),
        password=hashlib.sha256(data.get('password', '').encode()).hexdigest(),
        name=data.get('name'),
        role=data.get('role', 'writer')
    )
    
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@bp.route('/<user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
    if 'role' in data:
        user.role = data['role']
    
    db.session.commit()
    return jsonify(user.to_dict()), 200

@bp.route('/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200

