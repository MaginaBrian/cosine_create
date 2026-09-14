import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(exist_ok=True)

LOCAL_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
DEFAULT_SITE_ORIGINS = [
    "https://cosinecreate.com",
    "https://www.cosinecreate.com",
]


def database_uri():
    url = os.environ.get("DATABASE_URL", f"sqlite:///{INSTANCE_DIR / 'cosine.db'}")
    if url.startswith("mysql://"):
        url = "mysql+pymysql://" + url[len("mysql://") :]
    return url


def cors_origins():
    origins = list(LOCAL_CORS_ORIGINS)
    extra = os.environ.get("CORS_ORIGINS", "").strip()
    parts = [part.strip() for part in extra.split(",") if part.strip()] if extra else DEFAULT_SITE_ORIGINS
    for origin in parts:
        if origin not in origins:
            origins.append(origin)
    return origins


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-development")
    JWT_SECRET = os.environ.get("JWT_SECRET", os.environ.get("SECRET_KEY", "change-me-jwt-in-development"))
    SQLALCHEMY_DATABASE_URI = database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRES_HOURS = int(os.environ.get("JWT_EXPIRES_HOURS", "12"))
    CORS_ORIGINS = cors_origins()
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "").strip()
    MAIL_PORT = int(os.environ.get("MAIL_PORT", "587"))
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "")
    MAIL_FROM = os.environ.get("MAIL_FROM", "hello@cosinecreate.com")
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() != "false"
