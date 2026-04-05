from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.notification import Notification

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200

@notifications_bp.route("/<int:id>/read", methods=["PUT"])
@jwt_required()
def read_notification(id):
    user_id = get_jwt_identity()
    notif = Notification.query.filter_by(id=id, user_id=user_id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({"msg": "Notification marked as read"}), 200

@notifications_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def read_all_notifications():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"msg": "All notifications marked as read"}), 200
