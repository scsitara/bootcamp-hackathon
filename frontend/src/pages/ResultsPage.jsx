import { useLocation, useNavigate } from 'react-router-dom'

function ResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const meal = location.state?.meal
  const preferences = location.state?.preferences

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f4f6f9',
        padding: '1rem',
      }}
    >
      <section
        style={{
          width: 'min(880px, 100%)',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e4e8ee',
          boxShadow: '0 12px 30px rgba(10, 18, 30, 0.1)',
          padding: '1.25rem',
        }}
      >
        <h1 style={{ marginTop: 0 }}>Results</h1>
        <p style={{ color: '#4d5663' }}>
          This is a temporary results page for routing. You can replace it with your full plate
          visualization in the next commit.
        </p>

        <h2>Submitted Preferences</h2>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#f8fafc',
            border: '1px solid #e5e9f0',
            borderRadius: '10px',
            padding: '0.75rem',
          }}
        >
          {JSON.stringify(preferences ?? {}, null, 2)}
        </pre>

        <h2>Meal Response</h2>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#f8fafc',
            border: '1px solid #e5e9f0',
            borderRadius: '10px',
            padding: '0.75rem',
          }}
        >
          {JSON.stringify(meal ?? {}, null, 2)}
        </pre>

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            border: 0,
            borderRadius: '10px',
            background: '#e21833',
            color: '#fff',
            fontWeight: 700,
            padding: '0.65rem 1rem',
            cursor: 'pointer',
          }}
        >
          Back to Planner
        </button>
      </section>
    </main>
  )
}

export default ResultsPage
