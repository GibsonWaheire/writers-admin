from datetime import datetime
import json
from db import db

# User Model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'writer' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

# Writer Model
class Writer(db.Model):
    __tablename__ = 'writers'
    
    id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(200), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(50))
    status = db.Column(db.String(50), default='active')
    role = db.Column(db.String(20), default='writer')
    national_id = db.Column(db.String(50))
    date_of_birth = db.Column(db.String(20))
    gender = db.Column(db.String(20))
    address = db.Column(db.Text)  # JSON string
    education = db.Column(db.Text)  # JSON string
    experience = db.Column(db.Text)  # JSON string
    specializations = db.Column(db.Text)  # JSON array string
    languages = db.Column(db.Text)  # JSON array string
    timezone = db.Column(db.String(100))
    country = db.Column(db.String(100))
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    completed_orders = db.Column(db.Integer, default=0)
    total_earnings = db.Column(db.Float, default=0.0)
    success_rate = db.Column(db.Float, default=0.0)
    max_concurrent_orders = db.Column(db.Integer, default=3)
    preferred_payment_method = db.Column(db.String(50))
    payment_details = db.Column(db.Text)  # JSON string
    bio = db.Column(db.Text)
    documents = db.Column(db.Text)  # JSON array string
    email_notifications = db.Column(db.Boolean, default=True)
    sms_notifications = db.Column(db.Boolean, default=True)
    whatsapp_notifications = db.Column(db.Boolean, default=True)
    is_email_verified = db.Column(db.Boolean, default=False)
    is_phone_verified = db.Column(db.Boolean, default=False)
    is_document_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active_at = db.Column(db.DateTime)
    application_submitted_at = db.Column(db.DateTime)
    application_reviewed_at = db.Column(db.DateTime)
    application_reviewed_by = db.Column(db.String(50))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'status': self.status,
            'role': self.role,
            'nationalId': self.national_id,
            'dateOfBirth': self.date_of_birth,
            'gender': self.gender,
            'address': json.loads(self.address) if self.address else None,
            'education': json.loads(self.education) if self.education else None,
            'experience': json.loads(self.experience) if self.experience else None,
            'specializations': json.loads(self.specializations) if self.specializations else [],
            'languages': json.loads(self.languages) if self.languages else [],
            'timezone': self.timezone,
            'country': self.country,
            'rating': self.rating,
            'totalReviews': self.total_reviews,
            'completedOrders': self.completed_orders,
            'totalEarnings': self.total_earnings,
            'successRate': self.success_rate,
            'maxConcurrentOrders': self.max_concurrent_orders,
            'preferredPaymentMethod': self.preferred_payment_method,
            'paymentDetails': json.loads(self.payment_details) if self.payment_details else None,
            'bio': self.bio,
            'documents': json.loads(self.documents) if self.documents else [],
            'emailNotifications': self.email_notifications,
            'smsNotifications': self.sms_notifications,
            'whatsappNotifications': self.whatsapp_notifications,
            'isEmailVerified': self.is_email_verified,
            'isPhoneVerified': self.is_phone_verified,
            'isDocumentVerified': self.is_document_verified,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastActiveAt': self.last_active_at.isoformat() if self.last_active_at else None,
            'applicationSubmittedAt': self.application_submitted_at.isoformat() if self.application_submitted_at else None,
            'applicationReviewedAt': self.application_reviewed_at.isoformat() if self.application_reviewed_at else None,
            'applicationReviewedBy': self.application_reviewed_by
        }

# Order Model
class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.String(50), primary_key=True)
    order_number = db.Column(db.String(4), unique=True)  # 4-character order number (e.g., A001, B002)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    subject = db.Column(db.String(200))
    discipline = db.Column(db.String(200))
    paper_type = db.Column(db.String(100))
    pages = db.Column(db.Integer)
    words = db.Column(db.Integer)
    format = db.Column(db.String(50))
    price = db.Column(db.Float)
    price_kes = db.Column(db.Float)
    cpp = db.Column(db.Float)
    total_price_kes = db.Column(db.Float)
    deadline = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='Available')
    client_id = db.Column(db.String(50))
    client_name = db.Column(db.String(200))
    client_email = db.Column(db.String(200))
    client_phone = db.Column(db.String(50))
    requirements = db.Column(db.Text)
    writer_id = db.Column(db.String(50))
    assigned_writer = db.Column(db.String(200))
    assigned_at = db.Column(db.DateTime)
    assigned_by = db.Column(db.String(50))  # 'admin' or 'writer'
    picked_by = db.Column(db.String(50))  # 'admin' or 'writer'
    requires_confirmation = db.Column(db.Boolean, default=False)
    confirmed_at = db.Column(db.DateTime)
    confirmed_by = db.Column(db.String(50))
    assignment_notes = db.Column(db.Text)
    assignment_priority = db.Column(db.String(20))  # 'low', 'medium', 'high', 'urgent'
    assignment_deadline = db.Column(db.DateTime)
    started_at = db.Column(db.DateTime)
    submitted_at = db.Column(db.DateTime)
    submitted_to_admin_at = db.Column(db.DateTime)
    submission_notes = db.Column(db.Text)
    files_uploaded_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    attachments = db.Column(db.Text)  # JSON array string (for requirements/instructions)
    original_files = db.Column(db.Text)  # JSON array string - Original submission files
    revision_files = db.Column(db.Text)  # JSON array string - Revision submission files
    revision_requests = db.Column(db.Text)  # JSON array string
    revision_explanation = db.Column(db.Text)  # Admin's explanation for revision
    revision_score = db.Column(db.Integer, default=10)  # Starts at 10, reduces with each revision
    revision_count = db.Column(db.Integer, default=0)
    revision_submitted_at = db.Column(db.DateTime)
    revision_response_notes = db.Column(db.Text)  # Writer's notes on revision submission
    reviews = db.Column(db.Text)  # JSON array string
    client_messages = db.Column(db.Text)  # JSON array string
    admin_messages = db.Column(db.Text)  # JSON array string
    admin_review_notes = db.Column(db.Text)
    admin_reviewed_at = db.Column(db.DateTime)
    admin_reviewed_by = db.Column(db.String(50))
    last_admin_edit = db.Column(db.Text)  # JSON string
    # Reassignment tracking
    reassignment_reason = db.Column(db.Text)
    reassigned_at = db.Column(db.DateTime)
    reassigned_by = db.Column(db.String(50))
    original_writer_id = db.Column(db.String(50))
    made_available_at = db.Column(db.DateTime)
    made_available_by = db.Column(db.String(50))
    # Fine tracking
    fine_amount = db.Column(db.Float, default=0)
    fine_reason = db.Column(db.Text)
    fine_history = db.Column(db.Text)  # JSON array string
    # Bidding system - multiple writers can bid on same order
    bids = db.Column(db.Text)  # JSON array string - Array of bid objects
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'orderNumber': self.order_number,
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'discipline': self.discipline,
            'paperType': self.paper_type,
            'pages': self.pages,
            'words': self.words,
            'format': self.format,
            'price': self.price,
            'priceKES': self.price_kes,
            'cpp': self.cpp,
            'totalPriceKES': self.total_price_kes,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'status': self.status,
            'clientId': self.client_id,
            'clientName': self.client_name,
            'clientEmail': self.client_email,
            'clientPhone': self.client_phone,
            'requirements': self.requirements,
            'writerId': self.writer_id,
            'assignedWriter': self.assigned_writer,
            'assignedAt': self.assigned_at.isoformat() if self.assigned_at else None,
            'assignedBy': self.assigned_by,
            'pickedBy': self.picked_by,
            'requiresConfirmation': self.requires_confirmation if self.requires_confirmation is not None else False,
            'confirmedAt': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'confirmedBy': self.confirmed_by,
            'assignmentNotes': self.assignment_notes,
            'assignmentPriority': self.assignment_priority,
            'assignmentDeadline': self.assignment_deadline.isoformat() if self.assignment_deadline else None,
            'startedAt': self.started_at.isoformat() if self.started_at else None,
            'submittedAt': self.submitted_at.isoformat() if self.submitted_at else None,
            'submittedToAdminAt': self.submitted_to_admin_at.isoformat() if self.submitted_to_admin_at else None,
            'submissionNotes': self.submission_notes,
            'filesUploadedAt': self.files_uploaded_at.isoformat() if self.files_uploaded_at else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
            'approvedAt': self.completed_at.isoformat() if self.completed_at and self.status == 'Completed' else None,
            'revisionExplanation': self.revision_explanation,
            'revisionScore': self.revision_score,
            'revisionCount': self.revision_count,
            'revisionSubmittedAt': self.revision_submitted_at.isoformat() if self.revision_submitted_at else None,
            'revisionResponseNotes': self.revision_response_notes,
            'adminReviewNotes': self.admin_review_notes,
            'adminReviewedAt': self.admin_reviewed_at.isoformat() if self.admin_reviewed_at else None,
            'adminReviewedBy': self.admin_reviewed_by,
            'reassignmentReason': self.reassignment_reason,
            'reassignedAt': self.reassigned_at.isoformat() if self.reassigned_at else None,
            'reassignedBy': self.reassigned_by,
            'originalWriterId': self.original_writer_id,
            'madeAvailableAt': self.made_available_at.isoformat() if self.made_available_at else None,
            'madeAvailableBy': self.made_available_by,
            'fineAmount': self.fine_amount if self.fine_amount else 0,
            'fineReason': self.fine_reason,
            'fineHistory': json.loads(self.fine_history) if self.fine_history else [],
            'attachments': json.loads(self.attachments) if self.attachments else [],
            'originalFiles': json.loads(self.original_files) if self.original_files else [],
            'revisionFiles': json.loads(self.revision_files) if self.revision_files else [],
            'uploadedFiles': json.loads(self.original_files) if self.original_files else [],  # For backward compatibility, show original files
            'revisionRequests': json.loads(self.revision_requests) if self.revision_requests else [],
            'reviews': json.loads(self.reviews) if self.reviews else [],
            'clientMessages': json.loads(self.client_messages) if self.client_messages else [],
            'adminMessages': json.loads(self.admin_messages) if self.admin_messages else [],
            'lastAdminEdit': json.loads(self.last_admin_edit) if self.last_admin_edit else None,
            'bids': json.loads(self.bids) if self.bids else [],
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

# Order Activity Model - Tracks all actions on orders
class OrderActivity(db.Model):
    __tablename__ = 'order_activities'
    
    id = db.Column(db.String(50), primary_key=True)
    order_id = db.Column(db.String(50), db.ForeignKey('orders.id'), nullable=False)
    order_number = db.Column(db.String(4))  # For quick reference
    action_type = db.Column(db.String(50), nullable=False)  # pick, assign, submit, approve, reject, reassign, etc.
    action_by = db.Column(db.String(50), nullable=False)  # User ID who performed the action
    action_by_name = db.Column(db.String(200))  # Name of person who performed action
    action_by_role = db.Column(db.String(20))  # 'writer' or 'admin'
    old_status = db.Column(db.String(50))
    new_status = db.Column(db.String(50))
    description = db.Column(db.Text)  # Description of the action
    action_metadata = db.Column(db.Text)  # JSON string for additional data (renamed from metadata to avoid SQLAlchemy conflict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'orderId': self.order_id,
            'orderNumber': self.order_number,
            'actionType': self.action_type,
            'actionBy': self.action_by,
            'actionByName': self.action_by_name,
            'actionByRole': self.action_by_role,
            'oldStatus': self.old_status,
            'newStatus': self.new_status,
            'description': self.description,
            'metadata': json.loads(self.action_metadata) if self.action_metadata else {},
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

# POD Order Model
class PODOrder(db.Model):
    __tablename__ = 'pod_orders'
    
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    subject = db.Column(db.String(200))
    discipline = db.Column(db.String(200))
    paper_type = db.Column(db.String(100))
    pages = db.Column(db.Integer)
    words = db.Column(db.Integer)
    format = db.Column(db.String(50))
    price = db.Column(db.Float)
    price_kes = db.Column(db.Float)
    cpp = db.Column(db.Float)
    deadline = db.Column(db.DateTime)
    deadline_hours = db.Column(db.Integer)
    status = db.Column(db.String(50), default='Available')
    writer_id = db.Column(db.String(50))
    assigned_writer = db.Column(db.String(200))
    pod_amount = db.Column(db.Float)
    delivery_date = db.Column(db.DateTime)
    payment_received_at = db.Column(db.DateTime)
    delivery_notes = db.Column(db.Text)
    client_signature = db.Column(db.Text)
    admin_review_notes = db.Column(db.Text)
    admin_reviewed_at = db.Column(db.DateTime)
    admin_reviewed_by = db.Column(db.String(50))
    revision_notes = db.Column(db.Text)
    revision_requested_at = db.Column(db.DateTime)
    revision_requested_by = db.Column(db.String(50))
    revision_count = db.Column(db.Integer, default=0)
    client_messages = db.Column(db.Text)  # JSON array string
    uploaded_files = db.Column(db.Text)  # JSON array string
    additional_instructions = db.Column(db.Text)
    is_overdue = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'discipline': self.discipline,
            'paperType': self.paper_type,
            'pages': self.pages,
            'words': self.words,
            'format': self.format,
            'price': self.price,
            'priceKES': self.price_kes,
            'cpp': self.cpp,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'deadlineHours': self.deadline_hours,
            'status': self.status,
            'writerId': self.writer_id,
            'assignedWriter': self.assigned_writer,
            'podAmount': self.pod_amount,
            'deliveryDate': self.delivery_date.isoformat() if self.delivery_date else None,
            'paymentReceivedAt': self.payment_received_at.isoformat() if self.payment_received_at else None,
            'deliveryNotes': self.delivery_notes,
            'clientSignature': self.client_signature,
            'adminReviewNotes': self.admin_review_notes,
            'adminReviewedAt': self.admin_reviewed_at.isoformat() if self.admin_reviewed_at else None,
            'adminReviewedBy': self.admin_reviewed_by,
            'revisionNotes': self.revision_notes,
            'revisionRequestedAt': self.revision_requested_at.isoformat() if self.revision_requested_at else None,
            'revisionRequestedBy': self.revision_requested_by,
            'revisionCount': self.revision_count,
            'clientMessages': json.loads(self.client_messages) if self.client_messages else [],
            'uploadedFiles': json.loads(self.uploaded_files) if self.uploaded_files else [],
            'additionalInstructions': self.additional_instructions,
            'isOverdue': self.is_overdue,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

# Review Model
class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.String(50), primary_key=True)
    order_id = db.Column(db.String(50))
    writer_id = db.Column(db.String(50))
    writer_name = db.Column(db.String(200))
    client_id = db.Column(db.String(50))
    client_name = db.Column(db.String(200))
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    categories = db.Column(db.Text)  # JSON array string
    status = db.Column(db.String(50), default='pending')
    is_verified = db.Column(db.Boolean, default=False)
    admin_notes = db.Column(db.Text)
    order_title = db.Column(db.String(500))
    order_pages = db.Column(db.Integer)
    order_value = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'orderId': self.order_id,
            'writerId': self.writer_id,
            'writerName': self.writer_name,
            'clientId': self.client_id,
            'clientName': self.client_name,
            'rating': self.rating,
            'comment': self.comment,
            'categories': json.loads(self.categories) if self.categories else [],
            'status': self.status,
            'isVerified': self.is_verified,
            'adminNotes': self.admin_notes,
            'orderTitle': self.order_title,
            'orderPages': self.order_pages,
            'orderValue': self.order_value,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

# Financial Models
class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.String(50), primary_key=True)
    order_id = db.Column(db.String(50))
    order_title = db.Column(db.String(500))
    writer_id = db.Column(db.String(50))
    writer_name = db.Column(db.String(200))
    amount = db.Column(db.Float)
    currency = db.Column(db.String(10), default='KES')
    status = db.Column(db.String(50), default='pending')
    type = db.Column(db.String(50))
    order_pages = db.Column(db.Integer)
    order_deadline = db.Column(db.DateTime)
    order_completed_at = db.Column(db.DateTime)
    approved_at = db.Column(db.DateTime)
    paid_at = db.Column(db.DateTime)
    approved_by = db.Column(db.String(50))
    payment_method = db.Column(db.String(50))
    payment_reference = db.Column(db.String(200))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'orderId': self.order_id,
            'orderTitle': self.order_title,
            'writerId': self.writer_id,
            'writerName': self.writer_name,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'type': self.type,
            'orderPages': self.order_pages,
            'orderDeadline': self.order_deadline.isoformat() if self.order_deadline else None,
            'orderCompletedAt': self.order_completed_at.isoformat() if self.order_completed_at else None,
            'approvedAt': self.approved_at.isoformat() if self.approved_at else None,
            'paidAt': self.paid_at.isoformat() if self.paid_at else None,
            'approvedBy': self.approved_by,
            'paymentMethod': self.payment_method,
            'paymentReference': self.payment_reference,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Fine(db.Model):
    __tablename__ = 'fines'
    
    id = db.Column(db.String(50), primary_key=True)
    order_id = db.Column(db.String(50))
    writer_id = db.Column(db.String(50))
    writer_name = db.Column(db.String(200))
    amount = db.Column(db.Float)
    currency = db.Column(db.String(10), default='KES')
    reason = db.Column(db.String(200))
    type = db.Column(db.String(50))
    status = db.Column(db.String(50), default='pending')
    order_title = db.Column(db.String(500))
    notes = db.Column(db.Text)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    applied_by = db.Column(db.String(50))
    waived_at = db.Column(db.DateTime)
    waived_by = db.Column(db.String(50))
    waived_reason = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'orderId': self.order_id,
            'writerId': self.writer_id,
            'writerName': self.writer_name,
            'amount': self.amount,
            'currency': self.currency,
            'reason': self.reason,
            'type': self.type,
            'status': self.status,
            'orderTitle': self.order_title,
            'notes': self.notes,
            'appliedAt': self.applied_at.isoformat() if self.applied_at else None,
            'appliedBy': self.applied_by,
            'waivedAt': self.waived_at.isoformat() if self.waived_at else None,
            'waivedBy': self.waived_by,
            'waivedReason': self.waived_reason
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.String(50), primary_key=True)
    writer_id = db.Column(db.String(50))
    writer_name = db.Column(db.String(200))
    amount = db.Column(db.Float)
    currency = db.Column(db.String(10), default='KES')
    type = db.Column(db.String(50))
    status = db.Column(db.String(50), default='pending')
    method = db.Column(db.String(50))
    reference = db.Column(db.String(200))
    related_order_id = db.Column(db.String(50))
    related_invoice_id = db.Column(db.String(50))
    notes = db.Column(db.Text)
    processed_by = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'writerId': self.writer_id,
            'writerName': self.writer_name,
            'amount': self.amount,
            'currency': self.currency,
            'type': self.type,
            'status': self.status,
            'method': self.method,
            'reference': self.reference,
            'relatedOrderId': self.related_order_id,
            'relatedInvoiceId': self.related_invoice_id,
            'notes': self.notes,
            'processedBy': self.processed_by,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'processedAt': self.processed_at.isoformat() if self.processed_at else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None
        }

class ClientPayment(db.Model):
    __tablename__ = 'client_payments'
    
    id = db.Column(db.String(50), primary_key=True)
    order_id = db.Column(db.String(50))
    order_title = db.Column(db.String(500))
    client_id = db.Column(db.String(50))
    client_name = db.Column(db.String(200))
    amount = db.Column(db.Float)
    currency = db.Column(db.String(10))
    status = db.Column(db.String(50), default='pending')
    method = db.Column(db.String(50))
    reference = db.Column(db.String(200))
    notes = db.Column(db.Text)
    received_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'orderId': self.order_id,
            'orderTitle': self.order_title,
            'clientId': self.client_id,
            'clientName': self.client_name,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'method': self.method,
            'reference': self.reference,
            'notes': self.notes,
            'receivedAt': self.received_at.isoformat() if self.received_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class PlatformFunds(db.Model):
    __tablename__ = 'platform_funds'
    
    id = db.Column(db.String(50), primary_key=True)
    amount = db.Column(db.Float)
    currency = db.Column(db.String(10), default='KES')
    source = db.Column(db.String(50))
    added_by = db.Column(db.String(50))
    reference = db.Column(db.String(200))
    notes = db.Column(db.Text)
    status = db.Column(db.String(50), default='pending')
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'currency': self.currency,
            'source': self.source,
            'addedBy': self.added_by,
            'reference': self.reference,
            'notes': self.notes,
            'status': self.status,
            'addedAt': self.added_at.isoformat() if self.added_at else None
        }

class WithdrawalRequest(db.Model):
    __tablename__ = 'withdrawal_requests'
    
    id = db.Column(db.String(50), primary_key=True)
    writer_id = db.Column(db.String(50))
    writer_name = db.Column(db.String(200))
    amount = db.Column(db.Float)
    currency = db.Column(db.String(10), default='KES')
    status = db.Column(db.String(50), default='pending')
    method = db.Column(db.String(50))
    account_details = db.Column(db.Text)  # JSON string
    approved_by = db.Column(db.String(50))
    approved_at = db.Column(db.DateTime)
    rejected_by = db.Column(db.String(50))
    rejected_at = db.Column(db.DateTime)
    rejection_reason = db.Column(db.Text)
    paid_by = db.Column(db.String(50))
    paid_at = db.Column(db.DateTime)
    payment_reference = db.Column(db.String(200))
    invoice_id = db.Column(db.String(50))
    notes = db.Column(db.Text)
    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'writerId': self.writer_id,
            'writerName': self.writer_name,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'method': self.method,
            'accountDetails': json.loads(self.account_details) if self.account_details else {},
            'approvedBy': self.approved_by,
            'approvedAt': self.approved_at.isoformat() if self.approved_at else None,
            'rejectedBy': self.rejected_by,
            'rejectedAt': self.rejected_at.isoformat() if self.rejected_at else None,
            'rejectionReason': self.rejection_reason,
            'paidBy': self.paid_by,
            'paidAt': self.paid_at.isoformat() if self.paid_at else None,
            'paymentReference': self.payment_reference,
            'invoiceId': self.invoice_id,
            'notes': self.notes,
            'requestedAt': self.requested_at.isoformat() if self.requested_at else None
        }

class TransactionLog(db.Model):
    __tablename__ = 'transaction_logs'
    
    id = db.Column(db.String(50), primary_key=True)
    type = db.Column(db.String(50))
    amount = db.Column(db.Float)
    currency = db.Column(db.String(10), default='KES')
    description = db.Column(db.Text)
    performed_by = db.Column(db.String(50))
    related_entity_id = db.Column(db.String(50))
    balance_before = db.Column(db.Float)
    balance_after = db.Column(db.Float)
    performed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'amount': self.amount,
            'currency': self.currency,
            'description': self.description,
            'performedBy': self.performed_by,
            'relatedEntityId': self.related_entity_id,
            'balanceBefore': self.balance_before,
            'balanceAfter': self.balance_after,
            'performedAt': self.performed_at.isoformat() if self.performed_at else None
        }

# Notification Models
class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50))
    type = db.Column(db.String(50))
    title = db.Column(db.String(200))
    message = db.Column(db.Text)
    related_entity_id = db.Column(db.String(50))
    related_entity_type = db.Column(db.String(50))
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'relatedEntityId': self.related_entity_id,
            'relatedEntityType': self.related_entity_type,
            'isRead': self.is_read,
            'readAt': self.read_at.isoformat() if self.read_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.String(50), primary_key=True)
    sender_id = db.Column(db.String(50))
    sender_name = db.Column(db.String(200))
    sender_role = db.Column(db.String(20))
    recipient_id = db.Column(db.String(50))
    recipient_name = db.Column(db.String(200))
    recipient_role = db.Column(db.String(20))
    subject = db.Column(db.String(500))
    content = db.Column(db.Text)
    related_order_id = db.Column(db.String(50))
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'senderId': self.sender_id,
            'senderName': self.sender_name,
            'senderRole': self.sender_role,
            'recipientId': self.recipient_id,
            'recipientName': self.recipient_name,
            'recipientRole': self.recipient_role,
            'subject': self.subject,
            'content': self.content,
            'relatedOrderId': self.related_order_id,
            'isRead': self.is_read,
            'readAt': self.read_at.isoformat() if self.read_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

