from datetime import datetime
from app.extensions import db


class Book(db.Model):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    image_path = db.Column(db.String(500), nullable=True)
    total_copies = db.Column(db.Integer, nullable=False, default=1)
    available_copies = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    category = db.relationship("Category", back_populates="books")
    borrowings = db.relationship("Borrowing", back_populates="book", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "description": self.description,
            "category_id": self.category_id,
            "category": self.category.to_dict() if self.category else None,
            "price": float(self.price),
            "image_path": self.image_path,
            "total_copies": self.total_copies,
            "available_copies": self.available_copies,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
