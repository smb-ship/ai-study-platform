import os
from datetime import timedelta

class Config:

    SECRET_KEY = "super-secret-key-ai-study-platform-2026"

    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "ai-study-platform-jwt-secret-key-2026-long"

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)