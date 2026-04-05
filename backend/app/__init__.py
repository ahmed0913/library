"""Flask application factory."""

import os
from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Ensure upload directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Initialise extensions
    db.init_app(app)
    jwt.init_app(app)

    # CORS — allow React dev server
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Serve uploaded images statically
    from flask import send_from_directory

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.users import users_bp
    from .routes.categories import categories_bp
    from .routes.books import books_bp
    from .routes.borrowings import borrowings_bp
    from .routes.notifications import notifications_bp
    from .routes.dashboard import dashboard_bp
    from .routes.activity_logs import activity_logs_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(books_bp, url_prefix="/api/books")
    app.register_blueprint(borrowings_bp, url_prefix="/api/borrowings")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(activity_logs_bp, url_prefix="/api/activity-logs")

    # Create tables if they don't exist (dev convenience)
    with app.app_context():
        db.create_all()

    return app
