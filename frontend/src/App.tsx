import { Routes, Route, useLocation } from 'react-router-dom'
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()
  const showAppNav =
    location.pathname === '/dashboard' ||
    location.pathname === '/profile' ||
    location.pathname === '/admin' ||
    location.pathname === '/admin/pending-users' ||
    location.pathname.startsWith('/mentor/')

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await userService.checkSession()
        setIsAuthenticated(Boolean(response.authenticated))
        setIsAdmin(Boolean(response.admin))
      } catch {
        setIsAuthenticated(false)
        setIsAdmin(false)
      }
    }

    void checkSession()
  }, [location.pathname])

  return (
    <>
      {isAuthenticated && showAppNav && <AppNav isAdmin={isAdmin} />}
      <Routes>
        <Route
          path="*"
          element={<HomePage isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/"
          element={<HomePage isAuthenticated={isAuthenticated} />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/pending-users" element={<PendingUsersPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mentor/:id" element={<MentorPage />} />
      </Routes>
    </>
  )
}

export default App
