from datetime import datetime
from app.extensions import db


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    action_type = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.Text, nullable=True)

    # Relationships
    user = db.relationship("User", back_populates="activity_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "action_type": self.action_type,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "description": self.description,
        }
