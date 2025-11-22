from flask import Blueprint, request, jsonify
from models import Notification
from app import db
from datetime import datetime

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@bp.route('', methods=['GET'])
def get_notifications():
    user_id = request.args.get('userId')
    is_read = request.args.get('isRead')
    
    query = Notification.query
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    if is_read is not None:
        query = query.filter_by(is_read=is_read.lower() == 'true')
    
    notifications = query.all()
    return jsonify([n.to_dict() for n in notifications]), 200

@bp.route('', methods=['POST'])
def create_notification():
    data = request.get_json()
    import uuid
    
    notification = Notification(
        id=data.get('id', str(uuid.uuid4())),
        user_id=data.get('userId'),
        type=data.get('type'),
        title=data.get('title'),
        message=data.get('message'),
        related_entity_id=data.get('relatedEntityId'),
        related_entity_type=data.get('relatedEntityType'),
        is_read=False
    )
    
    db.session.add(notification)
    db.session.commit()
    return jsonify(notification.to_dict()), 201

@bp.route('/<notification_id>/read', methods=['PUT'])
def mark_read(notification_id):
    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(notification.to_dict()), 200

