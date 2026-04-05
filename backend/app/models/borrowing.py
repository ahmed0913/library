from app.extensions import db


class Borrowing(db.Model):
    __tablename__ = "borrowings"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    borrow_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="borrowed")
    fine_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)

    # Relationships
    user = db.relationship("User", back_populates="borrowings")
    book = db.relationship("Book", back_populates="borrowings")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user": {"name": self.user.name, "username": self.user.username} if self.user else None,
            "book_id": self.book_id,
            "book": {"title": self.book.title, "author": self.book.author, "price": float(self.book.price)} if self.book else None,
            "borrow_date": self.borrow_date.isoformat() if self.borrow_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "return_date": self.return_date.isoformat() if self.return_date else None,
            "status": self.status,
            "fine_amount": float(self.fine_amount),
        }
