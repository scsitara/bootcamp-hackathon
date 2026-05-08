import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")


def _clean(value: str) -> str:
    # Handles accidental smart quotes copied from chat/docs.
    return value.strip().strip('"').strip("“").strip("”")


def _clean_db_name(value: str) -> str:
    cleaned = _clean(value)
    return cleaned.replace(" ", "_")


class Config:
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI") or os.getenv("mongo_uri")
        db_name = os.getenv("DB_NAME") or os.getenv("db_name")

        if not mongo_uri:
            raise ValueError("MONGO_URI is not set. Add it to backend/database/.env")
        if not db_name:
            raise ValueError("DB_NAME is not set. Add it to backend/database/.env")

        self.mongo_uri = _clean(mongo_uri)
        self.db_name = _clean_db_name(db_name)


config = Config()
