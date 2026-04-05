from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app.models.activity_log import ActivityLog
from app.utils.decorators import role_required

activity_logs_bp = Blueprint("activity_logs", __name__)

@activity_logs_bp.route("", methods=["GET"])
@role_required("admin", "librarian")
def get_logs():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    
    pagination = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "logs": [log.to_dict() for log in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    }), 200
