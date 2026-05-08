import './InputFormPage.css'

// Static options used to render dietary restriction checkboxes.
// This keeps the JSX clean and makes it easy to add/remove options later.
const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'halal', label: 'Halal' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'nut-free', label: 'Nut-Free' },
]

function InputFormPage() {
  return (
    // Outer page wrapper (full-screen background + centered card)
    <main className="input-page">
      {/* Main form container card */}
      <section className="input-card">
        {/* Title area */}
        <p className="eyebrow">MealMatch UMD</p>
        <h1>Build your personalized dining hall plate</h1>
        <p className="subtitle">
          Select restrictions, set your nutrition goals, and choose a dining hall.
        </p>

        {/* Commit 1: layout-only form (state and submit logic added in later commits) */}
        <form className="goal-form" aria-label="Meal planner form">
          {/* Dietary restriction checkboxes */}
          <fieldset className="form-section">
            <legend>Dietary restrictions</legend>
            <div className="checkbox-grid">
              {/* Render one checkbox item per entry in dietaryOptions */}
              {dietaryOptions.map((option) => (
                <label key={option.id} className="checkbox-item" htmlFor={option.id}>
                  <input id={option.id} name="dietaryRestrictions" type="checkbox" />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Numeric goals the user wants to hit */}
          <fieldset className="form-section nutrition-goals">
            <legend>Nutrition goals</legend>
            <label htmlFor="protein-target">
              Protein target (g)
              <input id="protein-target" name="proteinTarget" type="number" placeholder="30" min="0" />
            </label>

            <label htmlFor="calorie-target">
              Calorie target (kcal)
              <input id="calorie-target" name="calorieTarget" type="number" placeholder="600" min="0" />
            </label>
          </fieldset>

          {/* Dining hall selector for the menu source */}
          <fieldset className="form-section">
            <legend>Dining hall</legend>
            <label htmlFor="dining-hall">Select location</label>
            <select id="dining-hall" name="diningHall" defaultValue="">
              <option value="" disabled>
                Choose a dining hall
              </option>
              <option value="yahentamitsi">Yahentamitsi Dining Hall</option>
              <option value="251north">251 North Dining Hall</option>
              <option value="southcampus">South Campus Dining Hall</option>
            </select>
          </fieldset>

          {/* Submit action (hooked to backend in a later commit) */}
          <button type="submit" className="primary-btn">
            Generate My Plate
          </button>
        </form>
      </section>
    </main>
  )
}

export default InputFormPage
