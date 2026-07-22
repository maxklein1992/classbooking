import { Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import TrainingsPage from './pages/TrainingsPage'
import TrainingDetailPage from './pages/TrainingDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyBookingsPage from './pages/MyBookingsPage'
import TrainerDashboardPage from './pages/TrainerDashboardPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import SearchResultsPage from './pages/SearchResultsPage'

export default function App() {
  const { t } = useTranslation()
  return (
    <div className="app">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trainingen" element={<TrainingsPage />} />
          <Route path="/zoeken" element={<SearchResultsPage />} />
          <Route path="/over-ons" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/trainingen/:id" element={<TrainingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/mijn-boekingen"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer"
            element={
              <ProtectedRoute requireTrainer>
                <TrainerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>{t('common.footer')}</span>
      </footer>
    </div>
  )
}
