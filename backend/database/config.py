from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")


DEFAULT_MONGO_URI = "mongodb+srv://joshiahana2025_db_user:aUVNzRWXqt0Bap5j@cluster0.8kpodxx.mongodb.net/?appName=Cluster0"
DEFAULT_DB_NAME = "dining_menu"


def _clean(value: str) -> str:
    # Handles accidental smart quotes copied from chat/docs.
    return value.strip().strip('"').strip("“").strip("”")


def _clean_db_name(value: str) -> str:
    cleaned = _clean(value)
    return cleaned.replace(" ", "_")


class Config:
    def __init__(self):
        self.mongo_uri = _clean(os.getenv("mongo_uri", DEFAULT_MONGO_URI))
        self.db_name = _clean_db_name(os.getenv("db_name", DEFAULT_DB_NAME))


config = Config()
