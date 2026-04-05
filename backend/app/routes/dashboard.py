from flask import Blueprint, jsonify
from sqlalchemy import func

from app.models.book import Book
from app.models.user import User
from app.models.borrowing import Borrowing
from app.models.activity_log import ActivityLog
from app.utils.decorators import role_required
from app.extensions import db

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("", methods=["GET"])
@role_required("admin", "librarian")
def get_dashboard():
    total_books = Book.query.count()
    total_users = User.query.count()
    borrowed_count = Borrowing.query.filter_by(status="borrowed").count()
    overdue_count = Borrowing.query.filter_by(status="overdue").count()
    
    # Most borrowed books
    most_borrowed = db.session.query(
        Book.title, func.count(Borrowing.id).label('count')
    ).join(Borrowing).group_by(Book.id).order_by(func.count(Borrowing.id).desc()).limit(5).all()
    
    recent_logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(5).all()
    
    return jsonify({
        "stats": {
            "total_books": total_books,
            "total_users": total_users,
            "borrowed_books": borrowed_count,
            "overdue_books": overdue_count
        },
        "most_borrowed": [{"title": m[0], "count": m[1]} for m in most_borrowed],
        "recent_activity": [log.to_dict() for log in recent_logs]
    }), 200
