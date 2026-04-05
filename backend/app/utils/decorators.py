from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def role_required(*allowed_roles):
    """
    Decorator to protect endpoints by role.
    Requires a valid JWT token.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get("role")

                if user_role not in allowed_roles:
                    return jsonify({"msg": f"Missing required role. Allowed: {', '.join(allowed_roles)}"}), 403

                return fn(*args, **kwargs)
            except Exception as e:
                # Re-raise standard exceptions to allow Flask to return 500
                from flask_jwt_extended.exceptions import JWTExtendedException
                import jwt
                if isinstance(e, (JWTExtendedException, jwt.PyJWTError)):
                    return jsonify({"msg": "Missing or invalid token"}), 401
                raise e
        return decorator
    return wrapper
