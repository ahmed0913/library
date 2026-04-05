from app import create_app
from app.extensions import db
from app.models.user import User
from werkzeug.security import generate_password_hash

app = create_app()

def seed_admin():
    with app.app_context():
        admin = User.query.filter_by(username="admin").first()
        if not admin:
            admin = User(
                name="System Admin",
                username="admin",
                password=generate_password_hash("admin123"),
                role="admin"
            )
            db.session.add(admin)
            db.session.commit()
            print("Seeded default admin user: admin / admin123")

        # Seed categories
        from app.models.category import Category
        if Category.query.count() == 0:
            cats = ["Fiction", "Science", "Technology", "History", "Literature"]
            for c in cats:
                db.session.add(Category(name=c, description=f"{c} books section"))
            db.session.commit()
            print("Seeded default categories.")

if __name__ == "__main__":
    seed_admin()
