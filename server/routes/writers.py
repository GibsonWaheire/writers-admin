from flask import Blueprint, request, jsonify
from models import Writer
from db import db
import json as json_lib

bp = Blueprint('writers', __name__, url_prefix='/api/writers')

@bp.route('', methods=['GET'])
def get_writers():
    writers = Writer.query.all()
    return jsonify([writer.to_dict() for writer in writers]), 200

@bp.route('/<writer_id>', methods=['GET'])
def get_writer(writer_id):
    writer = Writer.query.get(writer_id)
    if not writer:
        return jsonify({'error': 'Writer not found'}), 404
    return jsonify(writer.to_dict()), 200

@bp.route('', methods=['POST'])
def create_writer():
    data = request.get_json()
    import uuid
    from datetime import datetime
    
    # New writers should start with 'application_submitted' status, not 'active'
    # Only admins can approve them to 'active' status
    default_status = 'application_submitted' if not data.get('status') else data.get('status')
    # If explicitly setting to 'active', allow it (for admin-created writers or approved applications)
    if data.get('status') == 'active':
        default_status = 'active'
    
    writer = Writer(
        id=data.get('id', str(uuid.uuid4())),
        email=data.get('email'),
        name=data.get('name'),
        phone=data.get('phone'),
        status=default_status,
        role=data.get('role', 'writer'),
        national_id=data.get('nationalId'),
        date_of_birth=data.get('dateOfBirth'),
        gender=data.get('gender'),
        address=json_lib.dumps(data.get('address')) if data.get('address') else None,
        education=json_lib.dumps(data.get('education')) if data.get('education') else None,
        experience=json_lib.dumps(data.get('experience')) if data.get('experience') else None,
        specializations=json_lib.dumps(data.get('specializations', [])),
        languages=json_lib.dumps(data.get('languages', [])),
        timezone=data.get('timezone'),
        country=data.get('country'),
        rating=data.get('rating', 0.0),
        total_reviews=data.get('totalReviews', 0),
        completed_orders=data.get('completedOrders', 0),
        total_earnings=data.get('totalEarnings', 0.0),
        success_rate=data.get('successRate', 0.0),
        max_concurrent_orders=data.get('maxConcurrentOrders', 3),
        preferred_payment_method=data.get('preferredPaymentMethod'),
        payment_details=json_lib.dumps(data.get('paymentDetails')) if data.get('paymentDetails') else None,
        bio=data.get('bio'),
        documents=json_lib.dumps(data.get('documents', [])),
        email_notifications=data.get('emailNotifications', True),
        sms_notifications=data.get('smsNotifications', True),
        whatsapp_notifications=data.get('whatsappNotifications', True),
        is_email_verified=data.get('isEmailVerified', False),
        is_phone_verified=data.get('isPhoneVerified', False),
        is_document_verified=data.get('isDocumentVerified', False)
    )
    
    db.session.add(writer)
    db.session.commit()
    return jsonify(writer.to_dict()), 201

@bp.route('/<writer_id>', methods=['PUT'])
def update_writer(writer_id):
    writer = Writer.query.get(writer_id)
    if not writer:
        return jsonify({'error': 'Writer not found'}), 404
    
    data = request.get_json()
    
    # Update simple fields
    if 'name' in data:
        writer.name = data['name']
    if 'phone' in data:
        writer.phone = data['phone']
    if 'status' in data:
        writer.status = data['status']
    if 'rating' in data:
        writer.rating = data['rating']
    if 'totalEarnings' in data:
        writer.total_earnings = data['totalEarnings']
    if 'completedOrders' in data:
        writer.completed_orders = data['completedOrders']
    if 'address' in data:
        writer.address = json_lib.dumps(data['address'])
    if 'education' in data:
        writer.education = json_lib.dumps(data['education'])
    if 'experience' in data:
        writer.experience = json_lib.dumps(data['experience'])
    if 'specializations' in data:
        writer.specializations = json_lib.dumps(data['specializations'])
    if 'paymentDetails' in data:
        writer.payment_details = json_lib.dumps(data['paymentDetails'])
    
    db.session.commit()
    return jsonify(writer.to_dict()), 200

@bp.route('/<writer_id>', methods=['DELETE'])
def delete_writer(writer_id):
    writer = Writer.query.get(writer_id)
    if not writer:
        return jsonify({'error': 'Writer not found'}), 404
    
    db.session.delete(writer)
    db.session.commit()
    return jsonify({'message': 'Writer deleted'}), 200

