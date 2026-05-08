import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './ResultsPage.css'

const fallbackPreferences = {
  dietary_restrictions: ['vegetarian'],
  protein_target: 57,
  calorie_limit: 700,
  dining_hall: 'South Campus Dining Hall',
}

const fallbackGeneratedMeal = {
  meal: [
    {
      name: 'Greek Yogurt',
      calories: 160,
      protein: 15,
      tags: ['vegetarian'],
    },
    {
      name: 'Tofu Stir Fry',
      calories: 260,
      protein: 22,
      tags: ['vegan', 'vegetarian', 'dairyFree'],
    },
    {
      name: 'Roasted Veggies',
      calories: 120,
      protein: 4,
      tags: ['vegan', 'vegetarian', 'glutenFree', 'dairyFree'],
    },
  ],
  totals: {
    protein: 41,
    calories: 540,
  },
  meta: {
    diningHall: 'South Campus Dining Hall',
    usedRestrictions: ['vegetarian'],
    dataSource: 'db',
  },
}

const mealImageMap = {
  'Greek Yogurt':
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
  'Tofu Stir Fry':
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  'Roasted Veggies':
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'Grilled Chicken':
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
}

const categoryImageMap = {
  chicken: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
  tofu: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
  veggie: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  rice: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
  pasta: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
  fish: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
}

const tagLabelMap = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  dairyFree: 'Dairy-Free',
  glutenFree: 'Gluten-Free',
}

function toDisplayRestriction(restrictions) {
  if (!restrictions?.length) return 'None selected'
  return restrictions
    .map((tag) => tagLabelMap[tag] || tag)
    .join(', ')
}

function TagChip({ tag }) {
  const styleClass = `tag-${tag}`
  const label = tagLabelMap[tag] || tag
  return <span className={`tag-chip ${styleClass}`}>{label}</span>
}

function SummaryCard({ icon, iconClass, label, value, valueClass }) {
  return (
    <article className="results-summary-card">
      <div className={`results-summary-icon ${iconClass}`}>{icon}</div>
      <div>
        <p className="results-summary-label">{label}</p>
        <p className={`results-summary-value ${valueClass}`}>{value}</p>
      </div>
    </article>
  )
}

function getMealImageCandidates(item) {
  const lower = item.name.toLowerCase()

  let inferredCategoryImage = null
  if (lower.includes('chicken')) inferredCategoryImage = categoryImageMap.chicken
  else if (lower.includes('tofu')) inferredCategoryImage = categoryImageMap.tofu
  else if (lower.includes('yogurt')) inferredCategoryImage = categoryImageMap.yogurt
  else if (lower.includes('veggie') || lower.includes('vegetable')) inferredCategoryImage = categoryImageMap.veggie
  else if (lower.includes('salad')) inferredCategoryImage = categoryImageMap.salad
  else if (lower.includes('rice')) inferredCategoryImage = categoryImageMap.rice
  else if (lower.includes('pasta')) inferredCategoryImage = categoryImageMap.pasta
  else if (lower.includes('fish') || lower.includes('salmon')) inferredCategoryImage = categoryImageMap.fish

  return [
    mealImageMap[item.name],
    inferredCategoryImage,
  ].filter(Boolean)
}

function MealThumbnail({ item }) {
  const [candidateIndex, setCandidateIndex] = useState(0)
  const candidates = useMemo(() => getMealImageCandidates(item), [item])

  useEffect(() => {
    setCandidateIndex(0)
  }, [item.name])

  const src = candidates[candidateIndex]

  if (!src) {
    return <div className="meal-thumb-fallback">🍽️</div>
  }

  return (
    <img
      className="meal-thumb"
      src={src}
      alt={item.name}
      loading="lazy"
      onError={() => setCandidateIndex((prev) => prev + 1)}
    />
  )
}

function MealCard({ item }) {
  return (
    <article className="meal-card">
      <MealThumbnail item={item} />
      <div className="meal-main">
        <h3>{item.name}</h3>
        <div className="meal-tags">
          {item.tags?.map((tag) => (
            <TagChip key={`${item.name}-${tag}`} tag={tag} />
          ))}
        </div>
      </div>
      <div className="meal-nutrition">
        <p>{item.calories} calories</p>
        <strong>{item.protein}g protein</strong>
      </div>
    </article>
  )
}

function ProgressCard({ title, icon, accent, current, goal, unit, remainingLabel }) {
  const percent = Math.max(0, Math.min(100, Math.round((current / Math.max(goal, 1)) * 100)))
  return (
    <article className="progress-card">
      <div className="progress-top">
        <div className={`progress-icon ${accent}`}>{icon}</div>
        <p>{title}</p>
        <span>{percent}%</span>
      </div>
      <p className="progress-value">
        {current} / {goal}{unit}
      </p>
      <div className="progress-track">
        <div className={`progress-fill ${accent}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-remaining">{remainingLabel}</p>
    </article>
  )
}

function MealTotalsCard({ protein, calories }) {
  return (
    <article className="meal-totals-card">
      <h3>Meal Totals</h3>
      <p>
        <strong>{protein}g</strong> protein
      </p>
      <p>
        <strong>{calories}</strong> calories
      </p>
    </article>
  )
}

function getMealEmoji(name) {
  const lower = name.toLowerCase()
  if (lower.includes('yogurt')) return '🫐'
  if (lower.includes('tofu')) return '🥢'
  if (lower.includes('veggie') || lower.includes('vegetable')) return '🥕'
  if (lower.includes('chicken')) return '🍗'
  if (lower.includes('rice')) return '🍚'
  return '🍽️'
}

function normalizeMealData(rawMealData) {
  const mealItems = rawMealData?.meal || rawMealData?.plate || []

  const proteinFromItems = mealItems.reduce((sum, item) => sum + (Number(item.protein) || 0), 0)
  const caloriesFromItems = mealItems.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)

  const totals = rawMealData?.totals
    ? {
        protein: Number(rawMealData.totals.protein) || proteinFromItems,
        calories: Number(rawMealData.totals.calories) || caloriesFromItems,
      }
    : {
        protein: Number(rawMealData?.total_protein) || proteinFromItems,
        calories: Number(rawMealData?.total_calories) || caloriesFromItems,
      }

  return {
    meal: mealItems,
    totals,
    meta: rawMealData?.meta || {},
  }
}

function PlatePreview({ meal }) {
  const plateItems = meal.slice(0, 4)

  return (
    <article className="plate-card">
      <h3>🍽️ Your Plate</h3>
      <div className="plate-shell">
        <div
          className="plate-grid"
          style={{ gridTemplateColumns: `repeat(${plateItems.length > 1 ? 2 : 1}, minmax(0, 1fr))` }}
        >
          {plateItems.map((item, index) => (
            <div key={item.name} className={`plate-food tone-${index % 4}`}>
              <span>{getMealEmoji(item.name)}</span>
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      </div>
      <ul>
        {meal.map((item) => (
          <li key={item.name}>{item.name}</li>
        ))}
      </ul>
    </article>
  )
}

function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const rawPreferences = location.state?.preferences || fallbackPreferences
  const routeMealData = location.state?.mealData || location.state?.generatedMeal
  const rawMealData = routeMealData || fallbackGeneratedMeal
  const normalizedMealData = normalizeMealData(rawMealData)

  const preferences = useMemo(
    () => ({
      dietary_restrictions: rawPreferences.dietary_restrictions || rawPreferences.restrictions || [],
      protein_target: rawPreferences.protein_target || rawPreferences.goals?.proteinTarget || 57,
      calorie_limit: rawPreferences.calorie_limit || rawPreferences.goals?.caloriesLimit || 700,
      dining_hall:
        rawPreferences.dining_hall || rawPreferences.diningHall || normalizedMealData.meta?.diningHall || 'South Campus Dining Hall',
    }),
    [rawPreferences, normalizedMealData.meta],
  )

  const displayedMeals = normalizedMealData.meal
  const totals = normalizedMealData.totals

  const proteinPercent = Math.round((totals.protein / Math.max(preferences.protein_target, 1)) * 100)
  const caloriePercent = Math.round((totals.calories / Math.max(preferences.calorie_limit, 1)) * 100)

  const proteinRemaining = Math.max(preferences.protein_target - totals.protein, 0)
  const caloriesRemaining = Math.max(preferences.calorie_limit - totals.calories, 0)

  return (
    <main className="results-page">
      <header className="results-topbar">
        <div className="results-brand">
          <span>🌿</span>
          <strong>MealPlanner</strong>
        </div>
        <p className="results-success">✅ Meal planned successfully!</p>
      </header>

      <section className="results-container">
        <div className="results-title-wrap">
          <h1>
            Your Meal Plan is Ready! <span>🌿</span>
          </h1>
          <p>Here’s a delicious meal that fits your preferences and goals.</p>
        </div>

        <section className="results-summary-grid">
          <SummaryCard
            icon="🌿"
            iconClass="green"
            label="Dietary Restriction"
            value={toDisplayRestriction(preferences.dietary_restrictions)}
            valueClass="green"
          />
          <SummaryCard
            icon="🏋️"
            iconClass="red"
            label="Protein Goal"
            value={`${preferences.protein_target}g`}
            valueClass="red"
          />
          <SummaryCard
            icon="🔥"
            iconClass="orange"
            label="Calorie Limit"
            value={`${preferences.calorie_limit}`}
            valueClass="orange"
          />
          <SummaryCard
            icon="🏛️"
            iconClass="purple"
            label="Dining Hall"
            value={preferences.dining_hall}
            valueClass="purple"
          />
        </section>

        <section className="results-main-grid">
          <div className="results-left-column">
            <section className="section-card">
              <h2>🍴 Your Meals</h2>
              <div className="meal-list">
                {displayedMeals.map((item, index) => (
                  <MealCard key={`${item.name}-${index}`} item={item} />
                ))}
              </div>
            </section>

            <section className="section-card">
              <h2>📈 Progress Toward Goals</h2>
              <div className="progress-grid">
                <ProgressCard
                  title="Protein"
                  icon="💪"
                  accent="red"
                  current={totals.protein}
                  goal={preferences.protein_target}
                  unit="g"
                  remainingLabel={`${proteinRemaining}g remaining to reach your goal`}
                />
                <ProgressCard
                  title="Calories"
                  icon="🔥"
                  accent="orange"
                  current={totals.calories}
                  goal={preferences.calorie_limit}
                  unit=""
                  remainingLabel={`${caloriesRemaining} calories remaining`}
                />
                <MealTotalsCard protein={totals.protein} calories={totals.calories} />
              </div>

              <p className="progress-inline-note">
                Protein: {proteinPercent}% • Calories: {caloriePercent}%
              </p>
            </section>
          </div>

          <div className="results-right-column">
            <PlatePreview meal={displayedMeals} />
          </div>
        </section>

        <button className="results-back-btn" type="button" onClick={() => navigate('/')}>
          ← Back to Planner
        </button>

        <p className="results-footer-note">
          ✅ All meals match your preferences and are sourced from {preferences.dining_hall}.
        </p>
      </section>
    </main>
  )
}

export default ResultsPage
