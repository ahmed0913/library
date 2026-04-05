from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models.category import Category
from app.models.activity_log import ActivityLog
from app.utils.decorators import role_required
from flask_jwt_extended import get_jwt_identity

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("", methods=["GET"])
@jwt_required()
def get_categories():
    categories = Category.query.all()
    return jsonify([c.to_dict() for c in categories]), 200

@categories_bp.route("", methods=["POST"])
@role_required("admin")
def create_category():
    data = request.json
    
    if Category.query.filter_by(name=data.get("name")).first():
        return jsonify({"msg": "Category already exists"}), 400
        
    category = Category(
        name=data.get("name"),
        description=data.get("description")
    )
    
    db.session.add(category)
    
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="CATEGORY_CREATED", user_id=current_user_id, description=f"Created category '{category.name}'")
    db.session.add(log)
    
    db.session.commit()
    
    return jsonify({"msg": "Category created", "category": category.to_dict()}), 201

@categories_bp.route("/<int:id>", methods=["PUT"])
@role_required("admin")
def update_category(id):
    category = Category.query.get_or_404(id)
    data = request.json
    
    if "name" in data:
        category.name = data["name"]
    if "description" in data:
        category.description = data["description"]
        
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="CATEGORY_UPDATED", user_id=current_user_id, description=f"Updated category ID {id}")
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Category updated", "category": category.to_dict()}), 200

@categories_bp.route("/<int:id>", methods=["DELETE"])
@role_required("admin")
def delete_category(id):
    category = Category.query.get_or_404(id)
    db.session.delete(category)
    
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="CATEGORY_DELETED", user_id=current_user_id, description=f"Deleted category ID {id}")
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Category deleted"}), 200
