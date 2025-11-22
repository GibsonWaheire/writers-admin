from flask import Blueprint, request, jsonify
from models import Invoice, Fine, Payment, ClientPayment, PlatformFunds, WithdrawalRequest, TransactionLog
from db import db
import json as json_lib
from datetime import datetime

bp = Blueprint('financial', __name__, url_prefix='/api/financial')

# Invoices
@bp.route('/invoices', methods=['GET'])
def get_invoices():
    writer_id = request.args.get('writerId')
    status = request.args.get('status')
    
    query = Invoice.query
    if writer_id:
        query = query.filter_by(writer_id=writer_id)
    if status:
        query = query.filter_by(status=status)
    
    invoices = query.all()
    return jsonify([invoice.to_dict() for invoice in invoices]), 200

@bp.route('/invoices', methods=['POST'])
def create_invoice():
    data = request.get_json()
    import uuid
    
    invoice = Invoice(
        id=data.get('id', str(uuid.uuid4())),
        order_id=data.get('orderId'),
        order_title=data.get('orderTitle'),
        writer_id=data.get('writerId'),
        writer_name=data.get('writerName'),
        amount=data.get('amount'),
        currency=data.get('currency', 'KES'),
        status=data.get('status', 'pending'),
        type=data.get('type'),
        order_pages=data.get('orderPages'),
        payment_method=data.get('paymentMethod')
    )
    
    db.session.add(invoice)
    db.session.commit()
    return jsonify(invoice.to_dict()), 201

# Fines
@bp.route('/fines', methods=['GET'])
def get_fines():
    writer_id = request.args.get('writerId')
    query = Fine.query
    if writer_id:
        query = query.filter_by(writer_id=writer_id)
    fines = query.all()
    return jsonify([fine.to_dict() for fine in fines]), 200

@bp.route('/fines', methods=['POST'])
def create_fine():
    data = request.get_json()
    import uuid
    
    fine = Fine(
        id=data.get('id', str(uuid.uuid4())),
        order_id=data.get('orderId'),
        writer_id=data.get('writerId'),
        writer_name=data.get('writerName'),
        amount=data.get('amount'),
        currency=data.get('currency', 'KES'),
        reason=data.get('reason'),
        type=data.get('type'),
        status=data.get('status', 'pending'),
        applied_by=data.get('appliedBy')
    )
    
    db.session.add(fine)
    db.session.commit()
    return jsonify(fine.to_dict()), 201

# Payments
@bp.route('/payments', methods=['GET'])
def get_payments():
    writer_id = request.args.get('writerId')
    query = Payment.query
    if writer_id:
        query = query.filter_by(writer_id=writer_id)
    payments = query.all()
    return jsonify([payment.to_dict() for payment in payments]), 200

@bp.route('/payments', methods=['POST'])
def create_payment():
    data = request.get_json()
    import uuid
    
    payment = Payment(
        id=data.get('id', str(uuid.uuid4())),
        writer_id=data.get('writerId'),
        writer_name=data.get('writerName'),
        amount=data.get('amount'),
        currency=data.get('currency', 'KES'),
        type=data.get('type'),
        status=data.get('status', 'pending'),
        method=data.get('method'),
        related_order_id=data.get('relatedOrderId')
    )
    
    db.session.add(payment)
    db.session.commit()
    return jsonify(payment.to_dict()), 201

# Withdrawal Requests
@bp.route('/withdrawals', methods=['GET'])
def get_withdrawals():
    writer_id = request.args.get('writerId')
    status = request.args.get('status')
    
    query = WithdrawalRequest.query
    if writer_id:
        query = query.filter_by(writer_id=writer_id)
    if status:
        query = query.filter_by(status=status)
    
    withdrawals = query.all()
    return jsonify([w.to_dict() for w in withdrawals]), 200

@bp.route('/withdrawals', methods=['POST'])
def create_withdrawal():
    data = request.get_json()
    import uuid
    
    withdrawal = WithdrawalRequest(
        id=data.get('id', str(uuid.uuid4())),
        writer_id=data.get('writerId'),
        writer_name=data.get('writerName'),
        amount=data.get('amount'),
        currency=data.get('currency', 'KES'),
        status=data.get('status', 'pending'),
        method=data.get('method'),
        account_details=json_lib.dumps(data.get('accountDetails', {}))
    )
    
    db.session.add(withdrawal)
    db.session.commit()
    return jsonify(withdrawal.to_dict()), 201

