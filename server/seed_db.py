"""
Script to seed the database from db.json
Run this after creating the database to populate initial data
"""
import json
import sys
import os
from datetime import datetime
from app import app
from db import db
from models import *

def parse_datetime(dt_str):
    """Parse ISO datetime string"""
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except:
        return None

def seed_database():
    """Load data from db.json and populate database"""
    # Read db.json
    db_json_path = os.path.join(os.path.dirname(__file__), '..', 'db.json')
    if not os.path.exists(db_json_path):
        print(f"Error: db.json not found at {db_json_path}")
        return
    
    with open(db_json_path, 'r') as f:
        data = json.load(f)
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # Seed Users
        print("Seeding users...")
        for user_data in data.get('users', []):
            user = User(
                id=user_data['id'],
                name=user_data['name'],
                email=user_data['email'],
                password=user_data['password'],  # Store as-is for now
                role=user_data['role']
            )
            db.session.add(user)
        
        # Seed Writers
        print("Seeding writers...")
        for writer_data in data.get('writers', []):
            writer = Writer(
                id=writer_data['id'],
                email=writer_data['email'],
                name=writer_data['name'],
                phone=writer_data.get('phone'),
                status=writer_data.get('status', 'active'),
                role=writer_data.get('role', 'writer'),
                national_id=writer_data.get('nationalId'),
                date_of_birth=writer_data.get('dateOfBirth'),
                gender=writer_data.get('gender'),
                address=json.dumps(writer_data.get('address')) if writer_data.get('address') else None,
                education=json.dumps(writer_data.get('education')) if writer_data.get('education') else None,
                experience=json.dumps(writer_data.get('experience')) if writer_data.get('experience') else None,
                specializations=json.dumps(writer_data.get('specializations', [])),
                languages=json.dumps(writer_data.get('languages', [])),
                timezone=writer_data.get('timezone'),
                country=writer_data.get('country'),
                rating=writer_data.get('rating', 0.0),
                total_reviews=writer_data.get('totalReviews', 0),
                completed_orders=writer_data.get('completedOrders', 0),
                total_earnings=writer_data.get('totalEarnings', 0.0),
                success_rate=writer_data.get('successRate', 0.0),
                max_concurrent_orders=writer_data.get('maxConcurrentOrders', 3),
                preferred_payment_method=writer_data.get('preferredPaymentMethod'),
                payment_details=json.dumps(writer_data.get('paymentDetails')) if writer_data.get('paymentDetails') else None,
                bio=writer_data.get('bio'),
                documents=json.dumps(writer_data.get('documents', [])),
                email_notifications=writer_data.get('emailNotifications', True),
                sms_notifications=writer_data.get('smsNotifications', True),
                whatsapp_notifications=writer_data.get('whatsappNotifications', True),
                is_email_verified=writer_data.get('isEmailVerified', False),
                is_phone_verified=writer_data.get('isPhoneVerified', False),
                is_document_verified=writer_data.get('isDocumentVerified', False),
                created_at=parse_datetime(writer_data.get('createdAt')),
                last_active_at=parse_datetime(writer_data.get('lastActiveAt')),
                application_submitted_at=parse_datetime(writer_data.get('applicationSubmittedAt')),
                application_reviewed_at=parse_datetime(writer_data.get('applicationReviewedAt')),
                application_reviewed_by=writer_data.get('applicationReviewedBy')
            )
            db.session.add(writer)
        
        # Seed Orders
        print("Seeding orders...")
        for order_data in data.get('orders', []):
            order = Order(
                id=order_data['id'],
                title=order_data['title'],
                description=order_data.get('description'),
                subject=order_data.get('subject'),
                discipline=order_data.get('discipline'),
                paper_type=order_data.get('paperType'),
                pages=order_data.get('pages'),
                words=order_data.get('words'),
                format=order_data.get('format'),
                price=order_data.get('price'),
                price_kes=order_data.get('priceKES'),
                cpp=order_data.get('cpp'),
                total_price_kes=order_data.get('totalPriceKES'),
                deadline=parse_datetime(order_data.get('deadline')),
                status=order_data.get('status', 'Available'),
                client_id=order_data.get('clientId'),
                client_name=order_data.get('clientName'),
                client_email=order_data.get('clientEmail'),
                client_phone=order_data.get('clientPhone'),
                requirements=order_data.get('requirements'),
                writer_id=order_data.get('writerId'),
                assigned_writer=order_data.get('assignedWriter'),
                assigned_at=parse_datetime(order_data.get('assignedAt')),
                started_at=parse_datetime(order_data.get('startedAt')),
                submitted_at=parse_datetime(order_data.get('submittedAt')),
                completed_at=parse_datetime(order_data.get('completedAt')),
                attachments=json.dumps(order_data.get('attachments', [])),
                revision_requests=json.dumps(order_data.get('revisionRequests', [])),
                reviews=json.dumps(order_data.get('reviews', [])),
                client_messages=json.dumps(order_data.get('clientMessages', [])),
                admin_messages=json.dumps(order_data.get('adminMessages', [])),
                last_admin_edit=json.dumps(order_data.get('lastAdminEdit')) if order_data.get('lastAdminEdit') else None,
                created_at=parse_datetime(order_data.get('createdAt')),
                updated_at=parse_datetime(order_data.get('updatedAt'))
            )
            db.session.add(order)
        
        # Seed POD Orders
        print("Seeding POD orders...")
        for pod_data in data.get('podOrders', []):
            pod_order = PODOrder(
                id=pod_data['id'],
                title=pod_data['title'],
                description=pod_data.get('description'),
                subject=pod_data.get('subject'),
                discipline=pod_data.get('discipline'),
                paper_type=pod_data.get('paperType'),
                pages=pod_data.get('pages'),
                words=pod_data.get('words'),
                format=pod_data.get('format'),
                price=pod_data.get('price'),
                price_kes=pod_data.get('priceKES'),
                cpp=pod_data.get('cpp'),
                deadline=parse_datetime(pod_data.get('deadline')),
                deadline_hours=pod_data.get('deadlineHours'),
                status=pod_data.get('status', 'Available'),
                writer_id=pod_data.get('writerId'),
                assigned_writer=pod_data.get('assignedWriter'),
                pod_amount=pod_data.get('podAmount'),
                client_messages=json.dumps(pod_data.get('clientMessages', [])),
                uploaded_files=json.dumps(pod_data.get('uploadedFiles', [])),
                created_at=parse_datetime(pod_data.get('createdAt')),
                updated_at=parse_datetime(pod_data.get('updatedAt'))
            )
            db.session.add(pod_order)
        
        # Seed Reviews
        print("Seeding reviews...")
        for review_data in data.get('reviews', []):
            review = Review(
                id=review_data['id'],
                order_id=review_data.get('orderId'),
                writer_id=review_data.get('writerId'),
                writer_name=review_data.get('writerName'),
                client_id=review_data.get('clientId'),
                client_name=review_data.get('clientName'),
                rating=review_data.get('rating'),
                comment=review_data.get('comment'),
                categories=json.dumps(review_data.get('categories', [])),
                status=review_data.get('status', 'pending'),
                is_verified=review_data.get('isVerified', False),
                order_title=review_data.get('orderTitle'),
                order_pages=review_data.get('orderPages'),
                order_value=review_data.get('orderValue'),
                created_at=parse_datetime(review_data.get('createdAt')),
                updated_at=parse_datetime(review_data.get('updatedAt'))
            )
            db.session.add(review)
        
        # Seed Financial Data
        financial = data.get('financial', {})
        
        print("Seeding invoices...")
        for invoice_data in financial.get('invoices', []):
            invoice = Invoice(
                id=invoice_data['id'],
                order_id=invoice_data.get('orderId'),
                order_title=invoice_data.get('orderTitle'),
                writer_id=invoice_data.get('writerId'),
                writer_name=invoice_data.get('writerName'),
                amount=invoice_data.get('amount'),
                currency=invoice_data.get('currency', 'KES'),
                status=invoice_data.get('status', 'pending'),
                type=invoice_data.get('type'),
                order_pages=invoice_data.get('orderPages'),
                payment_method=invoice_data.get('paymentMethod'),
                created_at=parse_datetime(invoice_data.get('createdAt'))
            )
            db.session.add(invoice)
        
        print("Seeding platform funds...")
        for fund_data in financial.get('platformFunds', []):
            fund = PlatformFunds(
                id=fund_data['id'],
                amount=fund_data.get('amount'),
                currency=fund_data.get('currency', 'KES'),
                source=fund_data.get('source'),
                added_by=fund_data.get('addedBy'),
                reference=fund_data.get('reference'),
                notes=fund_data.get('notes'),
                status=fund_data.get('status', 'confirmed'),
                added_at=parse_datetime(fund_data.get('addedAt'))
            )
            db.session.add(fund)
        
        # Commit all changes
        db.session.commit()
        print("✅ Database seeded successfully!")

if __name__ == '__main__':
    seed_database()

