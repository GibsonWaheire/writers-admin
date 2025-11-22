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

# Client Payments
@bp.route('/clientPayments', methods=['GET'])
def get_client_payments():
    query = ClientPayment.query
    payments = query.all()
    return jsonify([p.to_dict() for p in payments]), 200

@bp.route('/clientPayments', methods=['POST'])
def create_client_payment():
    data = request.get_json()
    import uuid
    
    payment = ClientPayment(
        id=data.get('id', str(uuid.uuid4())),
        order_id=data.get('orderId'),
        order_title=data.get('orderTitle'),
        client_id=data.get('clientId'),
        client_name=data.get('clientName'),
        amount=data.get('amount'),
        currency=data.get('currency', 'KES'),
        status=data.get('status', 'pending'),
        method=data.get('method'),
        reference=data.get('reference')
    )
    
    db.session.add(payment)
    db.session.commit()
    return jsonify(payment.to_dict()), 201

# Platform Funds
@bp.route('/platformFunds', methods=['GET'])
def get_platform_funds():
    query = PlatformFunds.query
    funds = query.all()
    return jsonify([f.to_dict() for f in funds]), 200

@bp.route('/platformFunds', methods=['POST'])
def create_platform_fund():
    data = request.get_json()
    import uuid
    
    fund = PlatformFunds(
        id=data.get('id', str(uuid.uuid4())),
        amount=data.get('amount'),
        currency=data.get('currency', 'KES'),
        source=data.get('source'),
        added_by=data.get('addedBy'),
        reference=data.get('reference'),
        notes=data.get('notes'),
        status=data.get('status', 'pending')
    )
    
    db.session.add(fund)
    db.session.commit()
    return jsonify(fund.to_dict()), 201

# Transaction Logs
@bp.route('/transactionLogs', methods=['GET'])
def get_transaction_logs():
    query = TransactionLog.query
    logs = query.all()
    return jsonify([log.to_dict() for log in logs]), 200

@bp.route('/transactionLogs', methods=['POST'])
def create_transaction_log():
    data = request.get_json()
    import uuid
    
    log = TransactionLog(
        id=data.get('id', str(uuid.uuid4())),
        type=data.get('type'),
        amount=data.get('amount'),
        currency=data.get('currency', 'KES'),
        description=data.get('description'),
        performed_by=data.get('performedBy'),
        related_entity_id=data.get('relatedEntityId'),
        balance_before=data.get('balanceBefore'),
        balance_after=data.get('balanceAfter')
    )
    
    db.session.add(log)
    db.session.commit()
    return jsonify(log.to_dict()), 201

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

