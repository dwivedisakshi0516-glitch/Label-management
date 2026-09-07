import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

def _load_local_env_value(name: str) -> str:
    if os.getenv("VERCEL"):
        return ""

    try:
        with open(".env", "r", encoding="utf-8") as env_file:
            for line in env_file:
                raw_line = line.strip()
                if not raw_line or raw_line.startswith("#") or "=" not in raw_line:
                    continue
                key, value = raw_line.split("=", 1)
                if key.strip() == name:
                    return value.strip()
    except OSError:
        return ""

    return ""

def _env_str(name: str, default: str) -> str:
    value = os.getenv(name) or _load_local_env_value(name)
    if value in ("", None):
        return default
    return value.strip().strip('"').strip("'").removeprefix(">")

def _env_first(names: List[str], default: str) -> str:
    for name in names:
        value = _env_str(name, "")
        if value:
            return value
    return default

def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value in ("", None):
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

class Settings:
    PROJECT_NAME: str = "RIT Label Precision Suite"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = _env_str("SECRET_KEY", "rit-secret-key-super-secure-jwt-token-2026-label-precision-suite")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = _env_int("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7)
    
    MONGODB_URL: str = _env_first(["MONGODB_URL", "MONGODB_URI", "MONGO_URI"], "mongodb://localhost:27017")
    DATABASE_NAME: str = _env_first(["DATABASE_NAME", "MONGO_DATABASE", "DB_NAME"], "rit_label_db")
    
    DEFAULT_ADMIN_EMAIL: str = _env_str("DEFAULT_ADMIN_EMAIL", "ramaIT@yopmail.com")
    DEFAULT_ADMIN_PASSWORD: str = _env_str("DEFAULT_ADMIN_PASSWORD", "")
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
