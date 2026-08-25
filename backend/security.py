from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import jwt
from flask import current_app, g, jsonify, request

from models import User, db


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def make_token(user: User) -> str:
    hours = current_app.config.get("JWT_EXPIRES_HOURS", 12)
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "client_slug": user.client_slug,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")


def _bearer_token():
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[7:].strip() or None
    return None


def current_user_from_token():
    token = _bearer_token()
    if not token:
        return None, ({"error": "Missing Authorization bearer token"}, 401)
    try:
        payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None, ({"error": "Token expired"}, 401)
    except jwt.InvalidTokenError:
        return None, ({"error": "Invalid token"}, 401)

    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        return None, ({"error": "Invalid token"}, 401)

    user = db.session.get(User, user_id)
    if user is None:
        return None, ({"error": "Invalid token"}, 401)
    return user, None


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user, err = current_user_from_token()
        if err:
            body, status = err
            return jsonify(body), status
        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper


def require_role(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = g.current_user
            if user.role not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
