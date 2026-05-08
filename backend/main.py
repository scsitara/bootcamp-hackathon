import sys
from pathlib import Path
from datetime import date
from typing import List

sys.path.insert(0, str(Path(__file__).parent / "database"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import Config
from db import MenuItemsDB


config = Config()
db = MenuItemsDB(config)

app = FastAPI()


def _today() -> str:
    return date.today().strftime("%Y-%m-%d")


items_count = db.collection.count_documents({})
sample_item = db.collection.find_one()

print("-" * 30)
print(f"DEBUG: Total items in DB: {items_count}")
print(f"DEBUG: Sample item data: {sample_item}")
print("-" * 30)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Goals(BaseModel):
    proteinTarget: float
    caloriesLimit: float

class MealPreferences(BaseModel):
    diningHall: str | None = None
    restrictions: List[str] = []
    goals: Goals | None = None
    dietary_restrictions: List[str] = []
    protein_target: float | None = None
    calorie_limit: float | None = None
    dining_hall: str | None = None


def select_best_foods(foods, target_protein, max_calories):
    sorted_foods = sorted(
        foods,
        key=lambda x: x["protein"] / max(x["calories"], 1),
        reverse=True,
    )

    plate = []
    current_protein = 0
    current_calories = 0

    for food in sorted_foods:
        if current_calories + food["calories"] <= max_calories:
            plate.append(food)
            current_protein += food["protein"]
            current_calories += food["calories"]

        if current_protein >= target_protein:
            break

    return plate, current_protein, current_calories


def normalize_prefs(prefs: MealPreferences):
    if prefs.goals:
        protein_target = prefs.goals.proteinTarget
        calorie_limit = prefs.goals.caloriesLimit
    else:
        protein_target = prefs.protein_target
        calorie_limit = prefs.calorie_limit

    restrictions = prefs.restrictions or prefs.dietary_restrictions

    dining_hall = (
        prefs.diningHall
        or prefs.dining_hall
        or "South Campus Dining Hall"
    )

    if protein_target is None or calorie_limit is None:
        raise HTTPException(
            status_code=422,
            detail="Missing protein or calorie goals",
        )

    return (
        dining_hall,
        restrictions,
        float(protein_target),
        float(calorie_limit),
    )

@app.get("/menu")
async def fetch_menu():
    items = db.find_by_protein_over(0, _today())

    if not items:
        raise HTTPException(
            status_code=404,
            detail="No menu items found in database",
        )

    return {"items": items}

@app.post("/generate-meal")
async def generate_meal(prefs: MealPreferences):
    dining_hall, restrictions, protein_target, calorie_limit = normalize_prefs(prefs)

    all_foods = db.find_by_protein_over(-1, _today())

    if not all_foods:
        raise HTTPException(
            status_code=404,
            detail="No food items found in database",
        )

    filtered_foods = [
        food
        for food in all_foods
        if all(
            tag.lower() in [t.lower() for t in food.get("tags", [])]
            for tag in restrictions
        )
    ]

    if not filtered_foods:
        raise HTTPException(
            status_code=404,
            detail="No foods match these restrictions",
        )

    plate, total_p, total_c = select_best_foods(
        filtered_foods,
        protein_target,
        calorie_limit,
    )

    return {
        "meal": plate,
        "totals": {
            "protein": total_p,
            "calories": total_c,
        },
        "meta": {
            "diningHall": dining_hall,
            "usedRestrictions": restrictions,
            "dataSource": "database",
        },
    }