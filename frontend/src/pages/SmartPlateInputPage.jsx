import { useState } from 'react'
import './SmartPlateInputPage.css'

const dietaryPreferenceCards = [
  {
    key: 'vegetarian',
    title: 'Veg',
    description: 'No meat, fish or poultry',
    icon: '🥦',
    tone: 'green',
  },
  {
    key: 'vegan',
    title: 'Vegan',
    description: 'No animal products at all',
    icon: '🌿',
    tone: 'green',
  },
  {
    key: 'halal',
    title: 'Halal',
    description: 'Halal certified ingredients',
    icon: '🕌',
    tone: 'gold',
  },
  {
    key: 'nutAllergy',
    title: 'Nuts',
    description: 'Does not contain nuts',
    icon: '🥜',
    tone: 'rose',
  },
  {
    key: 'dairyFree',
    title: 'Dairy-Free',
    description: 'No milk or dairy products',
    icon: '🥛',
    tone: 'blue',
  },
  {
    key: 'glutenFree',
    title: 'Gluten-Free',
    description: 'Gluten friendly',
    icon: '🌾',
    tone: 'lavender',
  },
]

const sidebarNavItems = [
  { key: 'plan', label: 'Plan My Plate', icon: '🍽️', active: true },
  { key: 'menu', label: 'Today’s Menu', icon: '📋' },
  { key: 'generator', label: 'Meal Generator', icon: '✨' },
  { key: 'analytics', label: 'Nutrition Tips', icon: '📊' },
  { key: 'halls', label: 'Dining Halls', icon: '🏛️' },
  { key: 'about', label: 'About', icon: 'ℹ️' },
]

function SmartPlateInputPage() {
  // --- Commit 2: State management ---
  const [restrictions, setRestrictions] = useState([])          // array of active dietary restriction keys
  const [proteinTarget, setProteinTarget] = useState(30)        // protein goal in grams
  const [caloriesLimit, setCaloriesLimit] = useState(700)       // calorie limit in kcal
  const [diningHall, setDiningHall] = useState('South Campus Dining Hall') // selected dining hall
  const [error, setError] = useState('')                        // validation error message

  // Toggle a dietary restriction on or off.
  // Uses functional setState so we always read the latest array.
  const toggleRestriction = (restriction) => {
    setRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((item) => item !== restriction)  // remove if already selected
        : [...prev, restriction],                       // add if not yet selected
    )
  }

  // Update proteinTarget; clamps value between 0 and 200.
  const handleProteinChange = (event) => {
    const value = Math.min(200, Math.max(0, Number(event.target.value)))
    setProteinTarget(value)
    if (value > 0) setError('')  // clear error when user enters a valid value
  }

  // Update caloriesLimit; clamps value between 0 and 3000.
  const handleCaloriesChange = (event) => {
    const value = Math.min(3000, Math.max(0, Number(event.target.value)))
    setCaloriesLimit(value)
    if (value > 0) setError('')  // clear error when user enters a valid value
  }

  // Update the selected dining hall.
  const handleDiningHallChange = (event) => {
    setDiningHall(event.target.value)
    if (event.target.value) setError('')  // clear error when a hall is chosen
  }

  // Build the payload object that will be sent to the backend in Commit 3.
  const buildMealRequestPayload = () => ({
    diningHall,
    restrictions,
    goals: {
      proteinTarget,
      caloriesLimit,
    },
  })

  // Validate form before preparing the payload.
  // Returns true if all fields are valid, false and sets an error message otherwise.
  const validateForm = () => {
    if (!diningHall) {
      setError('Please select a dining hall.')
      return false
    }
    if (proteinTarget <= 0) {
      setError('Protein target must be greater than 0.')
      return false
    }
    if (caloriesLimit <= 0) {
      setError('Calorie limit must be greater than 0.')
      return false
    }
    return true
  }

  // Handle form submit — Commit 2 only logs the payload.
  // Backend call will be wired in Commit 3.
  const handleCreatePlate = (event) => {
    event.preventDefault()  // prevent page reload

    if (!validateForm()) return  // stop if validation fails

    const payload = buildMealRequestPayload()
    console.log('Prepared payload for backend:', payload)  // Commit 3 will POST this
  }

  return (
    <div className="sp-page-shell">
      <div className="sp-dashboard">
        <aside className="sp-sidebar" aria-label="Primary navigation">
          <div className="sp-logo-block">
            <div className="sp-logo-m">M</div>
            <div>
              <p className="sp-logo-title">SMART PLATE</p>
              <p className="sp-logo-subtitle">UMD DINING</p>
            </div>
          </div>

          <nav>
            <ul className="sp-nav-list">
              {sidebarNavItems.map((item) => (
                <li key={item.key}>
                  <button type="button" className={`sp-nav-item ${item.active ? 'active' : ''}`}>
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sp-sidebar-promo">
            <p className="sp-promo-title">FEAR THE TURTLE.</p>
            <p className="sp-promo-copy">Fuel smart. Eat better. Perform your best.</p>
            <div className="sp-turtle" aria-hidden="true">
              🐢
            </div>
          </div>
        </aside>

        <main className="sp-main-content">
          <div className="sp-top-row">
            <span className="sp-badge">⚡ Hackathon Project</span>
            <p className="sp-user">Smart Plate UMD Dining</p>
          </div>

          <section className="sp-hero">
            <h1 className="sp-title">
              BUILD YOUR <span>PERFECT</span> PLATE
            </h1>
            <p className="sp-subtitle">
              Tell us your preferences and goals — we’ll route you to the{' '}
              <strong>best meal options</strong> in our dining halls.
            </p>
          </section>

          <form className="sp-content-grid" onSubmit={handleCreatePlate}>
            <div className="sp-left-stack">
              <section className="sp-section">
                <div className="sp-section-head">
                  <h2>1. Choose Your Dietary Preferences</h2>
                  <p>Tap a card to select</p>
                </div>

                <div className="sp-preference-grid">
                  {dietaryPreferenceCards.map((card) => {
                    const selected = restrictions.includes(card.key)

                    return (
                      <button
                        type="button"
                        key={card.key}
                        className={`sp-pref-card ${card.tone} ${selected ? 'selected' : ''}`}
                        onClick={() => toggleRestriction(card.key)}
                        aria-pressed={selected}
                      >
                        <span className="sp-pref-check" aria-hidden="true">
                          {selected ? '✓' : ''}
                        </span>
                        <div className="sp-pref-icon" aria-hidden="true">
                          {card.icon}
                        </div>
                        <div className="sp-pref-text">
                          <h3>{card.title}</h3>
                          <p>{card.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <p className="sp-helper">🛡️ Your selections are used only to generate this meal suggestion.</p>
              </section>

              <section className="sp-section">
                <h2>2. Set Your Goals & Preferences</h2>

                <div className="sp-goals-grid">
                  <article className="sp-goal-card">
                    <div className="sp-goal-head">
                      <span className="sp-goal-icon red" aria-hidden="true">
                        🏋️
                      </span>
                      <h3>Protein Goal</h3>
                    </div>
                    <div className="sp-goal-value-row">
                      <strong>{proteinTarget}</strong>
                      <span>g</span>
                    </div>
                    <input
                      type="number"
                      value={proteinTarget}
                      min="0"
                      max="200"
                      onChange={handleProteinChange}
                      aria-label="Protein target in grams"
                      className="sp-number-input"
                    />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={proteinTarget}
                      onChange={handleProteinChange}
                      aria-label="Protein target slider"
                      className="sp-slider protein"
                    />
                    <div className="sp-goal-scale">
                      <span>0g</span>
                      <span>200g</span>
                    </div>
                  </article>

                  <article className="sp-goal-card">
                    <div className="sp-goal-head">
                      <span className="sp-goal-icon gold" aria-hidden="true">
                        🔥
                      </span>
                      <h3>Calories Limit</h3>
                    </div>
                    <div className="sp-goal-value-row">
                      <strong>{caloriesLimit}</strong>
                      <span>kcal</span>
                    </div>
                    <input
                      type="number"
                      value={caloriesLimit}
                      min="0"
                      max="3000"
                      onChange={handleCaloriesChange}
                      aria-label="Calories limit in kcal"
                      className="sp-number-input"
                    />
                    <input
                      type="range"
                      min="0"
                      max="3000"
                      value={caloriesLimit}
                      onChange={handleCaloriesChange}
                      aria-label="Calories limit slider"
                      className="sp-slider calories"
                    />
                    <div className="sp-goal-scale">
                      <span>0</span>
                      <span>3000</span>
                    </div>
                  </article>

                  <article className="sp-goal-card">
                    <div className="sp-goal-head">
                      <span className="sp-goal-icon black" aria-hidden="true">
                        🏛️
                      </span>
                      <h3>Dining Hall</h3>
                    </div>
                    <label htmlFor="diningHall" className="sp-select-label">
                      <span className="sr-only">Select dining hall</span>
                      <select
                        id="diningHall"
                        value={diningHall}
                        onChange={handleDiningHallChange}
                      >
                        <option value="South Campus Dining Hall">South Campus Dining Hall</option>
                        <option value="Yahentamitsi">Yahentamitsi</option>
                        <option value="251 North">251 North</option>
                      </select>
                    </label>
                    <p className="sp-open-text">Open now • 7m walk</p>
                    <p className="sp-hall-list">Yahentamitsi • 251 North</p>
                  </article>
                </div>
              </section>

              <section className="sp-cta-wrap">
                {/* Show validation error message if form is invalid */}
                {error ? <p className="form-error">{error}</p> : null}

                <button type="submit" className="sp-cta-btn">
                  <span className="sp-cta-left">
                    <span className="sp-m-badge">M</span>
                    <span>CREATE MY PLATE</span>
                  </span>
                  <span aria-hidden="true">→</span>
                </button>

                <p className="sp-footnote">Let’s build something great. Go Terps!</p>
              </section>
            </div>

            <aside className="sp-right-stack" aria-label="What happens next">
              <div className="sp-bowl-placeholder" aria-hidden="true">
                🥗
              </div>

              <div className="sp-next-card">
                <p className="sp-next-icon" aria-hidden="true">
                  📍
                </p>
                <h3>What’s Next?</h3>
                <p>
                  We’ll find the best matching meals across your selected dining halls and route you to
                  your perfect plate!
                </p>
              </div>
            </aside>
          </form>
        </main>
      </div>
    </div>
  )
}

export default SmartPlateInputPage
