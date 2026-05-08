import { useLocation, useNavigate } from 'react-router-dom'

// Placeholder results page — receives mealData and preferences via React Router state.
// The full plate visualization will be built by Sitara in her commits.
function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const { mealData, preferences } = location.state || {}
  console.log('Received from input page:', location.state)

  return (
    <main style={{ padding: '2rem', fontFamily: 'inherit' }}>
      <h1>Results Page</h1>
      <p>Meal data was passed here successfully. Plate visualization coming soon!</p>

      {preferences && (
        <>
          <h2>Your Preferences</h2>
          <pre
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {JSON.stringify(preferences, null, 2)}
          </pre>
        </>
      )}

      {mealData && (
        <>
          <h2>Generated Meal</h2>
          <pre
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {JSON.stringify(mealData, null, 2)}
          </pre>
        </>
      )}

      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          marginTop: '1rem',
          border: 0,
          borderRadius: '10px',
          background: '#e21833',
          color: '#fff',
          fontWeight: 700,
          padding: '0.7rem 1.2rem',
          cursor: 'pointer',
        }}
      >
        ← Back to Planner
      </button>
    </main>
  )
}

export default ResultsPage
