from fastapi import FastAPI, HTTPException, Body
from typing import List, Annotated
from pydantic import BaseModel
from db import get_menu_items  # Importing from Ahana's database logic

app = FastAPI()

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
async def fetch_menu(dining_hall: str):
    """Retrieves menu data from the database[cite: 3508]."""
    menu = await get_menu_items(dining_hall)
    if not menu:
        raise HTTPException(status_code=404, detail="Dining hall menu not found") [cite: 2098]
    return menu

@app.post("/generate-meal")
async def generate_meal(prefs: MealPreferences):
    """The main algorithm route[cite: 3509]."""
    # 1. Fetch data from DB
    all_foods = await get_menu_items(prefs.dining_hall)
    
    # 2. Filter out invalid foods based on dietary restrictions[cite: 3436, 3510].
    # Only keep foods that have ALL the tags the user requested.
    filtered_foods = [
        food for food in all_foods 
        if all(tag in food.get('tags', []) for tag in prefs.dietary_restrictions)
    ]
    
    if not filtered_foods:
        raise HTTPException(status_code=404, detail="No foods match these restrictions") [cite: 2189]

    # 3. Run the Smart Plate logic[cite: 3512].
    plate, total_p, total_c = select_best_foods(
        filtered_foods, 
        prefs.protein_target, 
        prefs.calorie_limit
    )

    # 4. Return clean JSON for the Frontend (Sitara) to visualize[cite: 3517].
    return {
        "plate": plate,
        "total_protein": total_p,
        "total_calories": total_c
    }