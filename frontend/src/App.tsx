import { Routes, Route, useLocation } from 'react-router-dom'
import './styles/public.css'
import './styles/directory.css'
import './styles/member.css'
import './styles/responsive.css'
import './styles/refresh.css'
import './styles/memberProfile.css'
import AppNav from './components/AppNav'
import VerificationPage from './pages/VerificationPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import PendingUsersPage from './pages/PendingUsersPage'
import DashboardPage from './pages/DashboardPage'
import MentorPage from './pages/MentorPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PageNotFound from './pages/PageNotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'

function App() {
  const { authenticated, admin } = useAuth()
  const location = useLocation()
  const showAppNav =
    location.pathname === '/' ||
    (authenticated &&
      (location.pathname === '/dashboard' ||
        location.pathname === '/profile' ||
        location.pathname === '/admin' ||
        location.pathname === '/admin/pending-users' ||
        location.pathname.startsWith('/mentor/')))

  return (
    <>
      {showAppNav && <AppNav isAuthenticated={authenticated} isAdmin={admin} />}
      <Routes>
        <Route path="*" element={<PageNotFound />} />
        <Route
          path="/"
          element={<HomePage isAuthenticated={authenticated} />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending-users"
          element={
            <ProtectedRoute adminOnly>
              <PendingUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/:id"
          element={
            <ProtectedRoute>
              <MentorPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
