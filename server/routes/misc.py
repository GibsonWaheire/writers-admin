from flask import Blueprint, request, jsonify
from db import db
import json as json_lib

bp = Blueprint('misc', __name__, url_prefix='/api')

# These endpoints return empty arrays for now since they're not in the database models yet
@bp.route('/writerInvites', methods=['GET'])
def get_writer_invites():
    return jsonify([]), 200

@bp.route('/writerActivities', methods=['GET'])
def get_writer_activities():
    return jsonify([]), 200

@bp.route('/assignmentHistory', methods=['GET'])
def get_assignment_history():
    return jsonify([]), 200

@bp.route('/podOrders', methods=['GET'])
def get_pod_orders_alt():
    # Alias for pod-orders endpoint
    from models import PODOrder
    status = request.args.get('status')
    writer_id = request.args.get('writerId')
    
    query = PODOrder.query
    
    if status:
        query = query.filter_by(status=status)
    if writer_id:
        query = query.filter_by(writer_id=writer_id)
    
    orders = query.all()
    return jsonify([order.to_dict() for order in orders]), 200

