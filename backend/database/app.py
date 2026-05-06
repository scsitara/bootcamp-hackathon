from config import Config
from scraper import Scraper
from db import MenuItemsDB
from datetime import date

def today() -> str:
    return date.today().strftime("%Y-%m-%d")

def main():
    config = Config()
    scraper = Scraper(config)
    db = MenuItemsDB(config)

    try:
        items = scraper.fetch()
        inserted = db.insert_items(items)
        print(f"Fetched {len(items)} items, {inserted} newly inserted.")

        result = db.find_by_protein_over(10, today())
        print(result)
    finally:
        db.close()

   

if __name__ == "__main__":
    main()
