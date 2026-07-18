import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './styles/app.css'
import AppNav from './components/AppNav'
import VerificationPage from './pages/VerificationPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import PendingUsersPage from './pages/PendingUsersPage'
import DashboardPage from './pages/DashboardPage'
import MentorPage from './pages/MentorPage'
import userService from './services/userService'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import PageNotFound from './pages/PageNotFound'
import LoadingPage from './components/LoadingPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const location = useLocation()
  const showAppNav =
    location.pathname === '/dashboard' ||
    location.pathname === '/profile' ||
    location.pathname === '/admin' ||
    location.pathname === '/admin/pending-users' ||
    location.pathname.startsWith('/mentor/')

  useEffect(() => {
    async function checkSession() {
      setIsCheckingSession(true)
      try {
        const response = await userService.checkSession()
        setIsAuthenticated(Boolean(response.authenticated))
        setIsAdmin(Boolean(response.admin))
      } catch {
        setIsAuthenticated(false)
        setIsAdmin(false)
      } finally {
        setIsCheckingSession(false)
      }
    }

    void checkSession()
  }, [location.pathname])

  function protectedPage(element: React.ReactNode, adminOnly = false) {
    if (isCheckingSession) {
      return <LoadingPage />
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (adminOnly && !isAdmin) {
      return <Navigate to="/dashboard" replace />
    }

    return element
  }

  return (
    <>
      {isAuthenticated && showAppNav && <AppNav isAdmin={isAdmin} />}
      <Routes>
        <Route path="*" element={<PageNotFound />} />
        <Route
          path="/"
          element={<HomePage isAuthenticated={isAuthenticated} />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/profile" element={protectedPage(<ProfilePage />)} />
        <Route path="/admin" element={protectedPage(<AdminPage />, true)} />
        <Route
          path="/admin/pending-users"
          element={protectedPage(<PendingUsersPage />, true)}
        />
        <Route path="/dashboard" element={protectedPage(<DashboardPage />)} />
        <Route path="/mentor/:id" element={protectedPage(<MentorPage />)} />
      </Routes>
    </>
  )
}

export default App
