import { NavLink } from 'react-router-dom'

interface AppNavProps {
  isAuthenticated: boolean
  isAdmin: boolean
}

function AppNav({ isAuthenticated, isAdmin }: AppNavProps) {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <NavLink to="/" className="app-nav-brand">
        <img src="/favicon.svg" alt="" aria-hidden="true" />
        <span>
          <strong>STL</strong>
          <small>Mentorship</small>
        </span>
      </NavLink>
      <div className="app-nav-actions">
        {isAuthenticated ? (
          <>
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
