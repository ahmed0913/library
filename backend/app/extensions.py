"""Shared Flask extension instances.

Created here to avoid circular imports — imported by models, routes, etc.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()
