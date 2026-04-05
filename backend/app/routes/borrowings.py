from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models.borrowing import Borrowing
from app.models.book import Book
from app.models.user import User
from app.models.notification import Notification
from app.models.activity_log import ActivityLog
from app.utils.decorators import role_required
from app.utils.helpers import calculate_fine

borrowings_bp = Blueprint("borrowings", __name__)

@borrowings_bp.route("", methods=["GET"])
@jwt_required()
def get_borrowings():
    claims = get_jwt()
    current_role = claims.get("role")
    current_user_id = int(get_jwt_identity())
    
    query = Borrowing.query
    
    if current_role == "user":
        query = query.filter_by(user_id=current_user_id)
        
    borrowings = query.order_by(Borrowing.borrow_date.desc()).all()
    return jsonify([b.to_dict() for b in borrowings]), 200

@borrowings_bp.route("", methods=["POST"])
@jwt_required()
def borrow_book():
    current_user_id = int(get_jwt_identity())
    data = request.json
    book_id = data.get("book_id")
    
    if not book_id:
        return jsonify({"msg": "book_id is required"}), 400
        
    # Check max borrowings limit
    active_borrowings_count = Borrowing.query.filter_by(user_id=current_user_id, status="borrowed").count()
    if active_borrowings_count >= 3:
        # Notify user they reached limit
        notif = Notification(user_id=current_user_id, title="Borrowing Limit Reached", message="You cannot borrow more than 3 books at a time.")
        db.session.add(notif)
        db.session.commit()
        return jsonify({"msg": "You can only borrow up to 3 books at a time"}), 400
        
    # Check overdue books
    overdue_books = Borrowing.query.filter_by(user_id=current_user_id, status="overdue").first()
    if overdue_books:
        return jsonify({"msg": "You have overdue books, cannot borrow."}), 400
        
    # Check book availability
    book = Book.query.get_or_404(book_id)
    if book.available_copies <= 0:
        return jsonify({"msg": "No copies available"}), 400
        
    # Process borrowing
    book.available_copies -= 1
    borrow_date = datetime.utcnow().date()
    due_date = borrow_date + timedelta(days=90) # Rule: 90 days max
    
    borrowing = Borrowing(
        user_id=current_user_id,
        book_id=book_id,
        borrow_date=borrow_date,
        due_date=due_date
    )
    db.session.add(borrowing)
    
    # Log activity
    log = ActivityLog(action_type="BORROW", user_id=current_user_id, description=f"Borrowed book ID {book.id}")
    db.session.add(log)
    
    db.session.commit()
    
    return jsonify({"msg": "Book borrowed successfully", "borrowing": borrowing.to_dict()}), 201

@borrowings_bp.route("/<int:id>/return", methods=["PUT"])
@role_required("admin", "librarian")
def return_book(id):
    borrowing = Borrowing.query.get_or_404(id)
    
    if borrowing.status in ["returned"]:
        return jsonify({"msg": "Book already returned"}), 400
        
    return_date = datetime.utcnow().date()
    borrowing.return_date = return_date
    
    # Calculate fine using helper
    fine = calculate_fine(borrowing.book.price, borrowing.due_date, return_date)
    borrowing.fine_amount = fine
    
    borrowing.status = "returned"
    
    book = Book.query.get(borrowing.book_id)
    book.available_copies += 1
    
    if fine > 0:
        notif = Notification(user_id=borrowing.user_id, title="Fine Applied", message=f"A fine of {fine} EGP has been applied for overdue book return.")
        db.session.add(notif)
        
    log = ActivityLog(action_type="RETURN", user_id=int(get_jwt_identity()), description=f"Marked book ID {book.id} as returned by User ID {borrowing.user_id}")
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Book returned successfully", "fine_amount": float(fine)}), 200
