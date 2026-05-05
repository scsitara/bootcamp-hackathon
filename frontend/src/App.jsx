import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ResultsPage from './pages/ResultsPage'
import SmartPlateInputPage from './pages/SmartPlateInputPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SmartPlateInputPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
