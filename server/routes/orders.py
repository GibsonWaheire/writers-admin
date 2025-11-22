from flask import Blueprint, request, jsonify
from models import Order, OrderActivity
from db import db
import json as json_lib
from datetime import datetime
from utils import generate_order_number

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
    
    # Generate 4-character order number
    order_number = data.get('orderNumber') or generate_order_number()
    
    order = Order(
        id=data.get('id', f"ORD-{uuid.uuid4().hex[:6].upper()}"),
        order_number=order_number,
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
        assigned_at=datetime.fromisoformat(data['assignedAt'].replace('Z', '+00:00')) if data.get('assignedAt') else None,
        assigned_by=data.get('assignedBy'),
        picked_by=data.get('pickedBy'),
        requires_confirmation=bool(data.get('requiresConfirmation', False)),
        confirmed_at=datetime.fromisoformat(data['confirmedAt'].replace('Z', '+00:00')) if data.get('confirmedAt') else None,
        confirmed_by=data.get('confirmedBy'),
        assignment_notes=data.get('assignmentNotes'),
        assignment_priority=data.get('assignmentPriority'),
        assignment_deadline=datetime.fromisoformat(data['assignmentDeadline'].replace('Z', '+00:00')) if data.get('assignmentDeadline') else None,
        started_at=datetime.fromisoformat(data['startedAt'].replace('Z', '+00:00')) if data.get('startedAt') else None,
        submitted_at=datetime.fromisoformat(data['submittedAt'].replace('Z', '+00:00')) if data.get('submittedAt') else None,
        submitted_to_admin_at=datetime.fromisoformat(data['submittedToAdminAt'].replace('Z', '+00:00')) if data.get('submittedToAdminAt') else None,
        submission_notes=data.get('submissionNotes'),
        files_uploaded_at=datetime.fromisoformat(data['filesUploadedAt'].replace('Z', '+00:00')) if data.get('filesUploadedAt') else None,
        completed_at=datetime.fromisoformat(data['completedAt'].replace('Z', '+00:00')) if data.get('completedAt') else None,
        revision_explanation=data.get('revisionExplanation'),
        revision_score=int(data.get('revisionScore', 10)),
        revision_count=int(data.get('revisionCount', 0)),
        revision_submitted_at=datetime.fromisoformat(data['revisionSubmittedAt'].replace('Z', '+00:00')) if data.get('revisionSubmittedAt') else None,
        revision_response_notes=data.get('revisionResponseNotes'),
        admin_review_notes=data.get('adminReviewNotes'),
        admin_reviewed_at=datetime.fromisoformat(data['adminReviewedAt'].replace('Z', '+00:00')) if data.get('adminReviewedAt') else None,
        admin_reviewed_by=data.get('adminReviewedBy'),
        reassignment_reason=data.get('reassignmentReason'),
        reassigned_at=datetime.fromisoformat(data['reassignedAt'].replace('Z', '+00:00')) if data.get('reassignedAt') else None,
        reassigned_by=data.get('reassignedBy'),
        original_writer_id=data.get('originalWriterId'),
        made_available_at=datetime.fromisoformat(data['madeAvailableAt'].replace('Z', '+00:00')) if data.get('madeAvailableAt') else None,
        made_available_by=data.get('madeAvailableBy'),
        fine_amount=float(data.get('fineAmount', 0)),
        fine_reason=data.get('fineReason'),
        fine_history=json_lib.dumps(data.get('fineHistory', [])),
        attachments=json_lib.dumps(data.get('attachments', [])),
        revision_requests=json_lib.dumps(data.get('revisionRequests', [])),
        reviews=json_lib.dumps(data.get('reviews', [])),
        client_messages=json_lib.dumps(data.get('clientMessages', [])),
        admin_messages=json_lib.dumps(data.get('adminMessages', [])),
        last_admin_edit=json_lib.dumps(data.get('lastAdminEdit')) if data.get('lastAdminEdit') else None
    )
    
    db.session.add(order)
    db.session.commit()
    
    # Log order creation activity
    activity = OrderActivity(
        id=f"ACT-{uuid.uuid4().hex[:8].upper()}",
        order_id=order.id,
        order_number=order.order_number,
        action_type='created',
        action_by=data.get('createdBy', 'admin'),
        action_by_name=data.get('createdByName', 'Admin'),
        action_by_role='admin',
        old_status=None,
        new_status='Available',
        description=f"Order {order.order_number} created: {order.title}",
        metadata=json_lib.dumps({'pages': order.pages, 'deadline': order.deadline.isoformat() if order.deadline else None})
    )
    db.session.add(activity)
    db.session.commit()
    
    return jsonify(order.to_dict()), 201

@bp.route('/<order_id>', methods=['PUT'])
def update_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    
    # Helper function to parse datetime
    def parse_datetime(value):
        if not value:
            return None
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        return value
    
    # Update all possible fields
    if 'title' in data:
        order.title = data['title']
    if 'description' in data:
        order.description = data['description']
    if 'status' in data:
        order.status = data['status']
    if 'writerId' in data:
        order.writer_id = data['writerId'] if data['writerId'] else None
    if 'assignedWriter' in data:
        order.assigned_writer = data['assignedWriter'] if data['assignedWriter'] else None
    if 'assignedAt' in data:
        order.assigned_at = parse_datetime(data['assignedAt'])
    if 'assignedBy' in data:
        order.assigned_by = data['assignedBy'] if data['assignedBy'] else None
    if 'pickedBy' in data:
        order.picked_by = data['pickedBy'] if data['pickedBy'] else None
    if 'requiresConfirmation' in data:
        order.requires_confirmation = bool(data['requiresConfirmation'])
    if 'confirmedAt' in data:
        order.confirmed_at = parse_datetime(data['confirmedAt'])
    if 'confirmedBy' in data:
        order.confirmed_by = data['confirmedBy'] if data['confirmedBy'] else None
    if 'assignmentNotes' in data:
        order.assignment_notes = data['assignmentNotes'] if data['assignmentNotes'] else None
    if 'assignmentPriority' in data:
        order.assignment_priority = data['assignmentPriority'] if data['assignmentPriority'] else None
    if 'assignmentDeadline' in data:
        order.assignment_deadline = parse_datetime(data['assignmentDeadline'])
    if 'startedAt' in data:
        order.started_at = parse_datetime(data['startedAt'])
    if 'submittedAt' in data:
        order.submitted_at = parse_datetime(data['submittedAt'])
    if 'submittedToAdminAt' in data:
        order.submitted_to_admin_at = parse_datetime(data['submittedToAdminAt'])
    if 'submissionNotes' in data:
        order.submission_notes = data['submissionNotes'] if data['submissionNotes'] else None
    if 'filesUploadedAt' in data:
        order.files_uploaded_at = parse_datetime(data['filesUploadedAt'])
    if 'completedAt' in data:
        order.completed_at = parse_datetime(data['completedAt'])
    if 'deadline' in data and data['deadline']:
        order.deadline = parse_datetime(data['deadline'])
    if 'attachments' in data:
        order.attachments = json_lib.dumps(data['attachments']) if data['attachments'] else None
    if 'uploadedFiles' in data:
        # Store uploadedFiles in attachments field
        order.attachments = json_lib.dumps(data['uploadedFiles']) if data['uploadedFiles'] else None
    if 'revisionRequests' in data:
        order.revision_requests = json_lib.dumps(data['revisionRequests']) if data['revisionRequests'] else None
    if 'revisionExplanation' in data:
        order.revision_explanation = data['revisionExplanation'] if data['revisionExplanation'] else None
    if 'revisionScore' in data:
        order.revision_score = int(data['revisionScore']) if data['revisionScore'] is not None else 10
    if 'revisionCount' in data:
        order.revision_count = int(data['revisionCount']) if data['revisionCount'] is not None else 0
    if 'revisionSubmittedAt' in data:
        order.revision_submitted_at = parse_datetime(data['revisionSubmittedAt'])
    if 'revisionResponseNotes' in data:
        order.revision_response_notes = data['revisionResponseNotes'] if data['revisionResponseNotes'] else None
    if 'clientMessages' in data:
        order.client_messages = json_lib.dumps(data['clientMessages']) if data['clientMessages'] else None
    if 'adminMessages' in data:
        order.admin_messages = json_lib.dumps(data['adminMessages']) if data['adminMessages'] else None
    if 'adminReviewNotes' in data:
        order.admin_review_notes = data['adminReviewNotes'] if data['adminReviewNotes'] else None
    if 'adminReviewedAt' in data:
        order.admin_reviewed_at = parse_datetime(data['adminReviewedAt'])
    if 'adminReviewedBy' in data:
        order.admin_reviewed_by = data['adminReviewedBy'] if data['adminReviewedBy'] else None
    if 'reassignmentReason' in data:
        order.reassignment_reason = data['reassignmentReason'] if data['reassignmentReason'] else None
    if 'reassignedAt' in data:
        order.reassigned_at = parse_datetime(data['reassignedAt'])
    if 'reassignedBy' in data:
        order.reassigned_by = data['reassignedBy'] if data['reassignedBy'] else None
    if 'originalWriterId' in data:
        order.original_writer_id = data['originalWriterId'] if data['originalWriterId'] else None
    if 'madeAvailableAt' in data:
        order.made_available_at = parse_datetime(data['madeAvailableAt'])
    if 'madeAvailableBy' in data:
        order.made_available_by = data['madeAvailableBy'] if data['madeAvailableBy'] else None
    if 'fineAmount' in data:
        order.fine_amount = float(data['fineAmount']) if data['fineAmount'] is not None else 0
    if 'fineReason' in data:
        order.fine_reason = data['fineReason'] if data['fineReason'] else None
    if 'fineHistory' in data:
        order.fine_history = json_lib.dumps(data['fineHistory']) if data['fineHistory'] else None
    
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

