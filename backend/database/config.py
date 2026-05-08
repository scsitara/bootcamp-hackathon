from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")


class Config:
    def __init__(self):
        self.mongo_uri = os.getenv("mongo_uri", "mongodb://localhost:27017")
        self.db_name = os.getenv("db_name", "dining_menu")


config = Config()
