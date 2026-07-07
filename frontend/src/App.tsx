import { NavLink, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import RegisterForm from './templates/RegisterForm.tsx'
import './App.css'
import VerificationPage from './templates/VerificationPage.tsx'
import ProfilePage from './templates/ProfilePage.tsx'
import AdminPage from './templates/AdminPage.tsx'
import PendingUsersPage from './templates/PendingUsersPage.tsx'
import DashboardPage from './templates/DashboardPage.tsx'
import MentorPage from './templates/MentorPage.tsx'
import userService from './services/userService.ts'
import LoginPage from './templates/LoginPage.tsx'
import HomePage from './templates/HomePage.tsx'

function AppNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <NavLink to="/dashboard" className="app-nav-brand">
        <img src="/favicon.svg" alt="" aria-hidden="true" />
        <span>
          <strong>STL</strong>
          <small>Mentorship</small>
        </span>
      </NavLink>
      <div className="app-nav-actions">
        <NavLink to="/dashboard" className="app-nav-button">
          Dashboard
        </NavLink>
        <NavLink to="/profile" className="app-nav-button">
          Profile
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className="app-nav-button">
            Admin
          </NavLink>
        )}
      </div>
    </nav>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()
  const showAppNav =
    location.pathname === '/dashboard' ||
    location.pathname === '/profile' ||
    location.pathname === '/admin' ||
    location.pathname === '/admin/pending-users' ||
    location.pathname.startsWith('/user/')

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
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/pending-users" element={<PendingUsersPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/user/:id" element={<MentorPage />} />
      </Routes>
    </>
  )
}

export default App
