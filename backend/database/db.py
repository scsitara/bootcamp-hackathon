import logging
from datetime import date
from pymongo import MongoClient
from pymongo.collection import Collection

from .config import Config

logger = logging.getLogger(__name__)


def _today() -> str:
    return date.today().strftime("%Y-%m-%d")


class MenuItemsDB:
    def __init__(self, config: Config) -> None:
        self.client = MongoClient(config.mongo_uri)
        self.collection: Collection = self.client[config.db_name]["menu_items"]
        try:
            self.collection.create_index([("name", 1), ("menu_date", 1)], unique=True)
        except Exception as exc:
            logger.warning("Could not create Mongo index at startup: %s", exc)

    def insert_items(self, items: list[dict]) -> int:
        """Upsert menu items by (name, menu_date). Returns count of newly inserted docs."""
        if not items:
            return 0

        inserted = 0
        updated = 0
        for item in items:
            result = self.collection.update_one(
                {"name": item["name"], "menu_date": item["menu_date"]},
                {"$set": item},
                upsert=True,
            )
            if result.upserted_id is not None:
                inserted += 1
            elif result.modified_count:
                updated += 1

        logger.info(
            "Processed %d items — %d newly inserted, %d updated, %d unchanged",
            len(items),
            inserted,
            updated,
            len(items) - inserted - updated,
        )
        return inserted

    def find_by_name(self, name: str, menu_date: str | None = None) -> dict | None:
        """Find a single item by exact name, optionally filtered to a specific date.
        Pass menu_date=_today() to limit to today's menu.
        """
        query = {"name": name}
        if menu_date is not None:
            query["menu_date"] = menu_date
        return self.collection.find_one(query, {"_id": 0})

    def find_by_calories_under(self, max_calories: int, menu_date: str | None = None) -> list[dict]:
        """Return items with calories < max_calories, optionally filtered to a specific date."""
        query: dict = {"calories": {"$lt": max_calories}}
        if menu_date is not None:
            query["menu_date"] = menu_date
        return list(self.collection.find(query, {"_id": 0}))

    def find_by_tag(self, tag: str, menu_date: str | None = None) -> list[dict]:
        """Return items matching a tag (case-insensitive), optionally filtered to a specific date."""
        query: dict = {"tags": {"$regex": f"^{tag}$", "$options": "i"}}
        if menu_date is not None:
            query["menu_date"] = menu_date
        return list(self.collection.find(query, {"_id": 0}))

    def find_by_protein_over(self, min_protein: float, menu_date: str | None = None) -> list[dict]:
        """Return items with protein > min_protein, optionally filtered to a specific date."""
        query: dict = {"protein": {"$gt": min_protein}}
        if menu_date is not None:
            query["menu_date"] = menu_date
        return list(self.collection.find(query, {"_id": 0}))

    def close(self) -> None:
        self.client.close()
