from flask import Blueprint, request, jsonify
from models import OrderActivity, Order
from db import db
import json as json_lib
from datetime import datetime
import uuid

bp = Blueprint('order_activities', __name__, url_prefix='/api/order-activities')

@bp.route('', methods=['GET'])
def get_activities():
    """Get order activities, optionally filtered by order_id or writer_id"""
    order_id = request.args.get('orderId')
    writer_id = request.args.get('writerId')
    action_type = request.args.get('actionType')
    
    query = OrderActivity.query
    
    if order_id:
        query = query.filter_by(order_id=order_id)
    if writer_id:
        # Get activities for orders assigned to this writer
        order_ids = [o.id for o in Order.query.filter_by(writer_id=writer_id).all()]
        query = query.filter(OrderActivity.order_id.in_(order_ids))
    if action_type:
        query = query.filter_by(action_type=action_type)
    
    activities = query.order_by(OrderActivity.created_at.desc()).all()
    return jsonify([activity.to_dict() for activity in activities]), 200

@bp.route('', methods=['POST'])
def create_activity():
    """Create a new order activity record"""
    data = request.get_json()
    
    activity = OrderActivity(
        id=data.get('id', f"ACT-{uuid.uuid4().hex[:8].upper()}"),
        order_id=data.get('orderId'),
        order_number=data.get('orderNumber'),
        action_type=data.get('actionType'),
        action_by=data.get('actionBy'),
        action_by_name=data.get('actionByName'),
        action_by_role=data.get('actionByRole'),
        old_status=data.get('oldStatus'),
        new_status=data.get('newStatus'),
        description=data.get('description'),
        metadata=json_lib.dumps(data.get('metadata', {}))
    )
    
    db.session.add(activity)
    db.session.commit()
    return jsonify(activity.to_dict()), 201

@bp.route('/<order_id>', methods=['GET'])
def get_order_activities(order_id):
    """Get all activities for a specific order"""
    activities = OrderActivity.query.filter_by(order_id=order_id).order_by(OrderActivity.created_at.desc()).all()
    return jsonify([activity.to_dict() for activity in activities]), 200

