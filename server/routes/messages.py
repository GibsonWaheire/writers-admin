from flask import Blueprint, request, jsonify
from models import Message
from app import db

bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@bp.route('', methods=['GET'])
def get_messages():
    user_id = request.args.get('userId')
    related_order_id = request.args.get('relatedOrderId')
    
    query = Message.query
    
    if user_id:
        query = query.filter((Message.sender_id == user_id) | (Message.recipient_id == user_id))
    if related_order_id:
        query = query.filter_by(related_order_id=related_order_id)
    
    messages = query.all()
    return jsonify([m.to_dict() for m in messages]), 200

@bp.route('', methods=['POST'])
def create_message():
    data = request.get_json()
    import uuid
    
    message = Message(
        id=data.get('id', str(uuid.uuid4())),
        sender_id=data.get('senderId'),
        sender_name=data.get('senderName'),
        sender_role=data.get('senderRole'),
        recipient_id=data.get('recipientId'),
        recipient_name=data.get('recipientName'),
        recipient_role=data.get('recipientRole'),
        subject=data.get('subject'),
        content=data.get('content'),
        related_order_id=data.get('relatedOrderId'),
        is_read=False
    )
    
    db.session.add(message)
    db.session.commit()
    return jsonify(message.to_dict()), 201

@bp.route('/<message_id>/read', methods=['PUT'])
def mark_message_read(message_id):
    message = Message.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    
    message.is_read = True
    from datetime import datetime
    message.read_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(message.to_dict()), 200

