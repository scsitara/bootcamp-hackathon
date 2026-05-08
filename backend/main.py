from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database.config import config
from backend.database.db import MenuItemsDB, _today

app = FastAPI()
db = MenuItemsDB(config)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This tells the backend to listen to your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Goals(BaseModel):
    proteinTarget: float
    caloriesLimit: float


class MealPreferences(BaseModel):
    # Frontend shape
    diningHall: str | None = None
    restrictions: List[str] = []
    goals: Goals | None = None

    # Legacy / alternative shape
    dietary_restrictions: List[str] = []
    protein_target: float | None = None
    calorie_limit: float | None = None
    dining_hall: str | None = None


MOCK_MENU = [
    {"name": "Grilled Chicken", "calories": 220, "protein": 35, "tags": ["halal", "high-protein"]},
    {"name": "Tofu Stir Fry", "calories": 260, "protein": 22, "tags": ["vegan", "vegetarian", "dairyFree"]},
    {"name": "Brown Rice", "calories": 210, "protein": 5, "tags": ["vegan", "vegetarian", "glutenFree"]},
    {"name": "Roasted Veggies", "calories": 120, "protein": 4, "tags": ["vegan", "vegetarian", "glutenFree", "dairyFree"]},
    {"name": "Greek Yogurt", "calories": 160, "protein": 15, "tags": ["vegetarian"]},
    {"name": "Salmon", "calories": 280, "protein": 30, "tags": ["high-protein"]},
]

def select_best_foods(foods, target_protein, max_calories):
    sorted_foods = sorted(foods, key=lambda x: x['protein'] / max(x['calories'], 1), reverse=True)
    
    plate = []
    current_protein = 0
    current_calories = 0
    
    for food in sorted_foods:
        if current_calories + food['calories'] <= max_calories:
            plate.append(food)
            current_protein += food['protein']
            current_calories += food['calories']

        if current_protein >= target_protein:
            break
            
    return plate, current_protein, current_calories

def normalize_prefs(prefs: MealPreferences):
    if prefs.goals is not None:
        protein_target = prefs.goals.proteinTarget
        calorie_limit = prefs.goals.caloriesLimit
    else:
        protein_target = prefs.protein_target
        calorie_limit = prefs.calorie_limit

    restrictions = prefs.restrictions or prefs.dietary_restrictions
    dining_hall = prefs.diningHall or prefs.dining_hall or "South Campus Dining Hall"

    if protein_target is None or calorie_limit is None:
        raise HTTPException(status_code=422, detail="Missing protein or calorie goals")

    return dining_hall, restrictions, float(protein_target), float(calorie_limit)

@app.get("/menu")
async def fetch_menu():
    try:
        items = db.find_by_protein_over(0, _today())
    except Exception:
        items = []

    if not items:
        return {"items": MOCK_MENU, "source": "mock"}

    return {"items": items}


@app.post("/generate-meal")
async def generate_meal(prefs: MealPreferences):
    dining_hall, restrictions, protein_target, calorie_limit = normalize_prefs(prefs)

    try:
        all_foods = db.find_by_protein_over(-1, _today())
    except Exception:
        all_foods = []

    if not all_foods:
        all_foods = MOCK_MENU

    filtered_foods = [
        food for food in all_foods
        if all(tag.lower() in [t.lower() for t in food.get('tags', [])] 
               for tag in restrictions)
    ]

    if not filtered_foods:
        raise HTTPException(status_code=404, detail="No foods match these restrictions")

    plate, total_p, total_c = select_best_foods(filtered_foods, protein_target, calorie_limit)

    return {
        "meal": plate,
        "totals": {
            "protein": total_p,
            "calories": total_c,
        },
        "meta": {
            "diningHall": dining_hall,
            "usedRestrictions": restrictions,
            "dataSource": "db" if all_foods else "mock",
        },
    }
