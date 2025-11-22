from flask import Blueprint, request, jsonify
from models import Order
from app import db
import json as json_lib
from datetime import datetime

bp = Blueprint('orders', __name__, url_prefix='/api/orders')

@bp.route('', methods=['GET'])
def get_orders():
    status = request.args.get('status')
    writer_id = request.args.get('writerId')
    
    query = Order.query
    
    if status:
        query = query.filter_by(status=status)
    if writer_id:
        query = query.filter_by(writer_id=writer_id)
    
    orders = query.all()
    return jsonify([order.to_dict() for order in orders]), 200

@bp.route('/<order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify(order.to_dict()), 200

@bp.route('', methods=['POST'])
def create_order():
    data = request.get_json()
    import uuid
    
    order = Order(
        id=data.get('id', f"ORD-{uuid.uuid4().hex[:6].upper()}"),
        title=data.get('title'),
        description=data.get('description'),
        subject=data.get('subject'),
        discipline=data.get('discipline'),
        paper_type=data.get('paperType'),
        pages=data.get('pages'),
        words=data.get('words'),
        format=data.get('format'),
        price=data.get('price'),
        price_kes=data.get('priceKES'),
        cpp=data.get('cpp'),
        total_price_kes=data.get('totalPriceKES'),
        deadline=datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')) if data.get('deadline') else None,
        status=data.get('status', 'Available'),
        client_id=data.get('clientId'),
        client_name=data.get('clientName'),
        client_email=data.get('clientEmail'),
        client_phone=data.get('clientPhone'),
        requirements=data.get('requirements'),
        writer_id=data.get('writerId'),
        assigned_writer=data.get('assignedWriter'),
        attachments=json_lib.dumps(data.get('attachments', [])),
        revision_requests=json_lib.dumps(data.get('revisionRequests', [])),
        reviews=json_lib.dumps(data.get('reviews', [])),
        client_messages=json_lib.dumps(data.get('clientMessages', [])),
        admin_messages=json_lib.dumps(data.get('adminMessages', [])),
        last_admin_edit=json_lib.dumps(data.get('lastAdminEdit')) if data.get('lastAdminEdit') else None
    )
    
    db.session.add(order)
    db.session.commit()
    return jsonify(order.to_dict()), 201

@bp.route('/<order_id>', methods=['PUT'])
def update_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'title' in data:
        order.title = data['title']
    if 'description' in data:
        order.description = data['description']
    if 'status' in data:
        order.status = data['status']
    if 'writerId' in data:
        order.writer_id = data['writerId']
    if 'assignedWriter' in data:
        order.assigned_writer = data['assignedWriter']
    if 'deadline' in data and data['deadline']:
        order.deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))
    if 'attachments' in data:
        order.attachments = json_lib.dumps(data['attachments'])
    if 'revisionRequests' in data:
        order.revision_requests = json_lib.dumps(data['revisionRequests'])
    if 'clientMessages' in data:
        order.client_messages = json_lib.dumps(data['clientMessages'])
    if 'adminMessages' in data:
        order.admin_messages = json_lib.dumps(data['adminMessages'])
    
    order.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(order.to_dict()), 200

@bp.route('/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    db.session.delete(order)
    db.session.commit()
    return jsonify({'message': 'Order deleted'}), 200

