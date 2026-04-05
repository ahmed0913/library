import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models.book import Book
from app.models.category import Category
from app.models.activity_log import ActivityLog
from app.utils.decorators import role_required
from flask_jwt_extended import get_jwt_identity

books_bp = Blueprint("books", __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@books_bp.route("", methods=["GET"])
@jwt_required()
def get_books():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    search = request.args.get("search", "")
    author = request.args.get("author", "")
    category_id = request.args.get("category_id", type=int)
    
    query = Book.query
    
    if search:
        query = query.filter(Book.title.ilike(f"%{search}%"))
    if author:
        query = query.filter(Book.author.ilike(f"%{author}%"))
    if category_id:
        query = query.filter(Book.category_id == category_id)
        
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "books": [b.to_dict() for b in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    }), 200

@books_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_book(id):
    book = Book.query.get_or_404(id)
    return jsonify(book.to_dict()), 200

@books_bp.route("", methods=["POST"])
@role_required("admin", "librarian")
def create_book():
    data = request.form
    
    category = Category.query.get(data.get("category_id"))
    if not category:
        return jsonify({"msg": "Invalid category_id"}), 400
        
    image_path = None
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            image_path = f"/uploads/{filename}"

    book = Book(
        title=data.get("title"),
        author=data.get("author"),
        description=data.get("description"),
        category_id=data.get("category_id"),
        price=data.get("price", 0),
        total_copies=data.get("total_copies", 1),
        available_copies=data.get("total_copies", 1),
        image_path=image_path
    )
    
    db.session.add(book)
    
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="BOOK_CREATED", user_id=current_user_id, description=f"Added book '{book.title}'")
    db.session.add(log)
    
    db.session.commit()
    
    return jsonify({"msg": "Book created", "book": book.to_dict()}), 201

@books_bp.route("/<int:id>", methods=["PUT"])
@role_required("admin", "librarian")
def update_book(id):
    book = Book.query.get_or_404(id)
    data = request.form
    
    if "title" in data: book.title = data["title"]
    if "author" in data: book.author = data["author"]
    if "description" in data: book.description = data["description"]
    if "category_id" in data: book.category_id = data["category_id"]
    if "price" in data: book.price = data["price"]
    
    if "total_copies" in data:
        diff = int(data["total_copies"]) - book.total_copies
        book.total_copies = int(data["total_copies"])
        book.available_copies += diff
    
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            book.image_path = f"/uploads/{filename}"
            
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="BOOK_UPDATED", user_id=current_user_id, description=f"Updated book ID {id}")
    db.session.add(log)
            
    db.session.commit()
    return jsonify({"msg": "Book updated", "book": book.to_dict()}), 200

@books_bp.route("/<int:id>", methods=["DELETE"])
@role_required("admin", "librarian")
def delete_book(id):
    book = Book.query.get_or_404(id)
    db.session.delete(book)
    
    current_user_id = get_jwt_identity()
    log = ActivityLog(action_type="BOOK_DELETED", user_id=current_user_id, description=f"Deleted book ID {id}")
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Book deleted"}), 200
