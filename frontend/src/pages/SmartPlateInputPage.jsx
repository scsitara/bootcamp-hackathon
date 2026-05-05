import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './SmartPlateInputPage.css'

const dietaryPreferenceCards = [
  {
    key: 'veg',
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
    key: 'nut-free',
    title: 'Nuts',
    description: 'Does not contain nuts',
    icon: '🥜',
    tone: 'rose',
  },
  {
    key: 'dairy',
    title: 'Dairy',
    description: 'Includes milk and dairy',
    icon: '🥛',
    tone: 'blue',
  },
  {
    key: 'gluten',
    title: 'Gluten',
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
  const navigate = useNavigate()

  // Required state for the hackathon input flow.
  const [restrictions, setRestrictions] = useState([])
  const [proteinTarget, setProteinTarget] = useState(80)
  const [caloriesLimit, setCaloriesLimit] = useState(700)
  const [diningHall, setDiningHall] = useState('South Campus Dining Hall')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleRestriction = (restrictionKey) => {
    setRestrictions((prev) =>
      prev.includes(restrictionKey)
        ? prev.filter((item) => item !== restrictionKey)
        : [...prev, restrictionKey],
    )
  }

  const handleCreatePlate = async (event) => {
    event.preventDefault()

    const payload = {
      diningHall,
      restrictions,
      proteinTarget,
      caloriesLimit,
    }

    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/generate-meal', payload)
      const data = response.data

      // Route to results page with backend response + original user preferences.
      navigate('/results', { state: { meal: data, preferences: payload } })
    } catch (requestError) {
      setError('We could not generate a plate right now. Please try again in a moment.')
      console.error('Failed to generate meal:', requestError)
    } finally {
      setLoading(false)
    }
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
                      type="range"
                      min="20"
                      max="150"
                      value={proteinTarget}
                      onChange={(event) => setProteinTarget(Number(event.target.value))}
                      aria-label="Protein target in grams"
                      className="sp-slider protein"
                    />
                    <div className="sp-goal-scale">
                      <span>20g</span>
                      <span>150g+</span>
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
                      type="range"
                      min="300"
                      max="1500"
                      value={caloriesLimit}
                      onChange={(event) => setCaloriesLimit(Number(event.target.value))}
                      aria-label="Calories limit in kcal"
                      className="sp-slider calories"
                    />
                    <div className="sp-goal-scale">
                      <span>300</span>
                      <span>1500+</span>
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
                        onChange={(event) => setDiningHall(event.target.value)}
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
                {error ? <p className="sp-error">{error}</p> : null}

                <button type="submit" className="sp-cta-btn" disabled={loading}>
                  <span className="sp-cta-left">
                    <span className="sp-m-badge">M</span>
                    <span>{loading ? 'CREATING YOUR PLATE...' : 'CREATE MY PLATE'}</span>
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
