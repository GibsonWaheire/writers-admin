from flask import Blueprint, request, jsonify
from models import PODOrder
from app import db
import json as json_lib
from datetime import datetime

bp = Blueprint('pod_orders', __name__, url_prefix='/api/pod-orders')

@bp.route('', methods=['GET'])
def get_pod_orders():
    status = request.args.get('status')
    writer_id = request.args.get('writerId')
    
    query = PODOrder.query
    
    if status:
        query = query.filter_by(status=status)
    if writer_id:
        query = query.filter_by(writer_id=writer_id)
    
    orders = query.all()
    return jsonify([order.to_dict() for order in orders]), 200

@bp.route('/<order_id>', methods=['GET'])
def get_pod_order(order_id):
    order = PODOrder.query.get(order_id)
    if not order:
        return jsonify({'error': 'POD Order not found'}), 404
    return jsonify(order.to_dict()), 200

@bp.route('', methods=['POST'])
def create_pod_order():
    data = request.get_json()
    import uuid
    
    order = PODOrder(
        id=data.get('id', f"POD-{uuid.uuid4().hex[:6].upper()}"),
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
        deadline=datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')) if data.get('deadline') else None,
        deadline_hours=data.get('deadlineHours'),
        status=data.get('status', 'Available'),
        writer_id=data.get('writerId'),
        assigned_writer=data.get('assignedWriter'),
        pod_amount=data.get('podAmount'),
        client_messages=json_lib.dumps(data.get('clientMessages', [])),
        uploaded_files=json_lib.dumps(data.get('uploadedFiles', []))
    )
    
    db.session.add(order)
    db.session.commit()
    return jsonify(order.to_dict()), 201

@bp.route('/<order_id>', methods=['PUT'])
def update_pod_order(order_id):
    order = PODOrder.query.get(order_id)
    if not order:
        return jsonify({'error': 'POD Order not found'}), 404
    
    data = request.get_json()
    
    if 'status' in data:
        order.status = data['status']
    if 'writerId' in data:
        order.writer_id = data['writerId']
    if 'podAmount' in data:
        order.pod_amount = data['podAmount']
    if 'deliveryDate' in data and data['deliveryDate']:
        order.delivery_date = datetime.fromisoformat(data['deliveryDate'].replace('Z', '+00:00'))
    
    order.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(order.to_dict()), 200

