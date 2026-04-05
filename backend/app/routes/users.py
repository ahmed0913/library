from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.utils.decorators import role_required
from flask_jwt_extended import get_jwt_identity

users_bp = Blueprint("users", __name__)

@users_bp.route("", methods=["GET"])
@role_required("admin")
def get_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    pagination = User.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "users": [u.to_dict() for u in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    }), 200

@users_bp.route("", methods=["POST"])
@role_required("admin")
def create_user():
    data = request.json
    
    if User.query.filter_by(username=data.get("username")).first():
        return jsonify({"msg": "Username already exists"}), 400
        
    hashed_password = generate_password_hash(data.get("password"))
    
    new_user = User(
        name=data.get("name"),
        username=data.get("username"),
        password=hashed_password,
        role=data.get("role", "user")
    )
    
    db.session.add(new_user)
    
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="USER_CREATED", user_id=current_user_id, description=f"Created user {new_user.username}")
    db.session.add(log)
    
    db.session.commit()
    
    return jsonify({"msg": "User created", "user": new_user.to_dict()}), 201

@users_bp.route("/<int:id>", methods=["PUT"])
@role_required("admin")
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.json
    
    if "name" in data:
        user.name = data["name"]
    if "role" in data:
        user.role = data["role"]
    if "password" in data and data["password"].strip():
        user.password = generate_password_hash(data["password"])
        
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="USER_UPDATED", user_id=current_user_id, description=f"Updated user ID {user.id}")
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "User updated", "user": user.to_dict()}), 200

@users_bp.route("/<int:id>", methods=["DELETE"])
@role_required("admin")
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="USER_DELETED", user_id=current_user_id, description=f"Deleted user ID {id}")
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "User deleted"}), 200
