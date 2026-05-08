import json
import logging
from datetime import date

import requests

from config import Config

logger = logging.getLogger(__name__)

BASE_URL = "https://apiv4.dineoncampus.com"
LOCATION_ID = "61f9d7c8a9f13a15d7c1a25e"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
}


class Scraper:
    """Fetches menu data from the dineoncampus.com API."""

    def __init__(self, config: Config) -> None:
        self.config = config

    def fetch(self) -> list[dict]:
        """Fetch all menu items across every period for today."""
        today = date.today().strftime("%Y-%m-%d")

        try:
            periods = self.fetch_periods(today)
            if not periods:
                logger.warning("No periods returned for %s — falling back to mock data", today)
                return None

            all_items: list[dict] = []
            for period in periods:
                period_id = period.get("id")
                period_name = period.get("name", "")
                if not period_id:
                    continue
                items = self.fetch_menu(today, period_id, period_name)
                for item in items:
                    item["menu_date"] = today
                all_items.extend(items)

            return all_items

        except requests.exceptions.RequestException as exc:
            logger.warning("Network error during fetch (%s) — falling back to mock data", exc)
        except (ValueError, KeyError, TypeError) as exc:
            logger.warning("Parse error during fetch (%s) — falling back to mock data", exc)

        return None


    def fetch_periods(self, today: str) -> list[dict]:
        """Breakfast, Lunch, Dinner, Late Night"""
        url = f"{BASE_URL}/locations/{LOCATION_ID}/periods/?date={today}"
        response = requests.get(url, timeout=10, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        return data.get("periods", [])

    def fetch_menu(self, today: str, period_id: str, period_name: str) -> list[dict]:
        """Get the actual menu for each period, breakfast, lunch etc."""
        url = f"{BASE_URL}/locations/{LOCATION_ID}/menu?date={today}&period={period_id}"
        response = requests.get(url, timeout=10, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        return self.parse_menu(data, period_name)

    def parse_menu(self, data: dict, period_name: str) -> list[dict]:
        """parse the response from the api and format into json for storing in db"""
        items: list[dict] = []

        period = data.get("period")
        if not isinstance(period, dict):
            return items

        for category in period.get("categories", []):
            if not isinstance(category, dict):
                continue
            for item in category.get("items", []):
                if isinstance(item, dict):
                    items.append(self.transform_item(item, period_name))

        return items

    def transform_item(self, item: dict, period_name: str) -> dict:
        """transform to {name, calories, protein, tags} format."""
        # Pull protein value from the nutrients list
        protein = None
        for nutrient in item.get("nutrients", []):
            if nutrient.get("name") == "Protein (g)":
                try:
                    protein = float(nutrient["valueNumeric"])
                except (ValueError, TypeError):
                    protein = None
                break

        # Build tags from filter names 
        tags: list[str] = []
        for f in item.get("filters", []):
            if isinstance(f, dict) and f.get("icon"):
                tag = f.get("name", "").strip()
                if tag:
                    tags.append(tag)

        return {
            "name": item.get("name"),
            "calories": item.get("calories"),
            "protein": protein,
            "tags": tags,
            "meal_type": period_name.lower(),
        }

