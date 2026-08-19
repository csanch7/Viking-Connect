import { NavLink, useNavigate } from 'react-router-dom'
import userService from '../services/userService'
import { useAuth } from '../auth/useAuth'

interface AppNavProps {
  isAuthenticated: boolean
  isAdmin: boolean
}

function AppNav({ isAuthenticated, isAdmin }: AppNavProps) {
  const navigate = useNavigate()
  const { markSignedOut } = useAuth()
  async function handleLogout() {
    await userService.logout()
    markSignedOut()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <NavLink to="/" className="app-nav-brand">
        <img src="/favicon.svg" alt="" aria-hidden="true" />
        <span>
          <small>Viking</small>
          <strong>Connect</strong>
        </span>
      </NavLink>
      <div className="app-nav-actions">
        {isAuthenticated ? (
          <>
            {isAdmin && (
              <NavLink to="/admin" className="app-nav-button">
                Admin
              </NavLink>
            )}
            <NavLink to="/directory" className="app-nav-button">
              Directory
            </NavLink>
            <NavLink to="/profile" className="app-nav-button">
              Profile
            </NavLink>
            <button onClick={() => handleLogout()} className="app-nav-button">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="app-nav-button">
              Sign in
            </NavLink>
            <NavLink
              to="/register"
              className="app-nav-button app-nav-button--primary"
            >
              Join the network
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

export default AppNav
