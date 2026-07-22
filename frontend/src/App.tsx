import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
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
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ProfilePage from './pages/ProfilePage'

// Trainers worden op "/" doorgestuurd naar hun dashboard; anderen zien de
// homepagina. Tijdens het laden van de auth-status niets tonen om
// redirect-flikkering te voorkomen.
function HomeRoute() {
  const { isTrainer, loading } = useAuth()
  if (loading) return null
  return isTrainer ? <Navigate to="/trainer" replace /> : <HomePage />
}

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/trainingen" element={<TrainingsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
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
            path="/profiel"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
      <Footer />
    </div>
  )
}
