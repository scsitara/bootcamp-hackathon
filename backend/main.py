from fastapi import FastAPI, HTTPException
from typing import List
from pydantic import BaseModel
from backend.database.db import MenuItemsDB, _today  # Importing from the nested backend package
from backend.database.config import config

# Create the database object
db = MenuItemsDB(config)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This tells the backend to listen to your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Request Body Model ---
# Following the "Request Body" slide: BaseModel tells FastAPI the format of incoming data[cite: 2059].
class MealPreferences(BaseModel):
    dietary_restrictions: List[str]  # e.g., ["vegetarian", "vegan"]
    protein_target: float
    calorie_limit: float
    dining_hall: str

# --- 2. Smart Plate Generator Logic ---
# This is the core logic requested in your work split[cite: 3501, 3511].
def select_best_foods(foods, target_protein, max_calories):
    # Sort by protein density (protein per calorie) to maximize protein efficiently.
    sorted_foods = sorted(foods, key=lambda x: x['protein'] / max(x['calories'], 1), reverse=True)
    
    plate = []
    current_protein = 0
    current_calories = 0
    
    for food in sorted_foods:
        # Check if adding this food keeps us under the calorie limit[cite: 3438].
        if current_calories + food['calories'] <= max_calories:
            plate.append(food)
            current_protein += food['protein']
            current_calories += food['calories']
        
        # Stop once the protein goal is reached[cite: 3438].
        if current_protein >= target_protein:
            break
            
    return plate, current_protein, current_calories

# --- 3. Endpoints ---

@app.get("/menu")
async def fetch_menu():
    # Use her method find_by_protein_over with 0 to get everything
    # We use _today() from her db.py to get the current date
    items = db.find_by_protein_over(0, _today())
    
    if not items:
        # Use HTTPException as shown in your bootcamp slides
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No menu items found for today")
    
    return {"items": items}

@app.post("/generate-meal")
async def generate_meal(prefs: MealPreferences):
    """The main algorithm route."""
    # 1. Fetch data from DB using Ahana's class method 
    # We use protein > -1 to get all available items for today 
    all_foods = db.find_by_protein_over(-1, _today())
    
    if not all_foods:
        raise HTTPException(status_code=404, detail="No menu data found for today") [cite: 1, 2]
    
    # 2. Filter out invalid foods based on dietary restrictions 
    filtered_foods = [
        food for food in all_foods 
        if all(tag.lower() in [t.lower() for t in food.get('tags', [])] 
               for tag in prefs.dietary_restrictions)
    ]
    
    if not filtered_foods:
        raise HTTPException(status_code=404, detail="No foods match these restrictions") [cite: 1, 2]

    # 3. Run the Smart Plate logic 
    plate, total_p, total_c = select_best_foods(
        filtered_foods, 
        prefs.protein_target, 
        prefs.calorie_limit
    )

    # 4. Return clean JSON for Sitara 
    return {
        "plate": plate,
        "total_protein": total_p,
        "total_calories": total_c
    }
