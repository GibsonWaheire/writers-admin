from flask import Blueprint, request, jsonify
from models import Review
from app import db
import json as json_lib

bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@bp.route('', methods=['GET'])
def get_reviews():
    writer_id = request.args.get('writerId')
    order_id = request.args.get('orderId')
    
    query = Review.query
    
    if writer_id:
        query = query.filter_by(writer_id=writer_id)
    if order_id:
        query = query.filter_by(order_id=order_id)
    
    reviews = query.all()
    return jsonify([review.to_dict() for review in reviews]), 200

@bp.route('/<review_id>', methods=['GET'])
def get_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    return jsonify(review.to_dict()), 200

@bp.route('', methods=['POST'])
def create_review():
    data = request.get_json()
    import uuid
    
    review = Review(
        id=data.get('id', str(uuid.uuid4())),
        order_id=data.get('orderId'),
        writer_id=data.get('writerId'),
        writer_name=data.get('writerName'),
        client_id=data.get('clientId'),
        client_name=data.get('clientName'),
        rating=data.get('rating'),
        comment=data.get('comment'),
        categories=json_lib.dumps(data.get('categories', [])),
        status=data.get('status', 'pending'),
        is_verified=data.get('isVerified', False),
        order_title=data.get('orderTitle'),
        order_pages=data.get('orderPages'),
        order_value=data.get('orderValue')
    )
    
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201

