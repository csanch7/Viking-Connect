import { NavLink } from 'react-router-dom'

interface AppNavProps {
  isAuthenticated: boolean
  isAdmin: boolean
  isMentee: boolean
}

function AppNav({ isAuthenticated, isAdmin, isMentee }: AppNavProps) {
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
            {(isAdmin || isMentee) && (
              <NavLink to="/mentees/directory" className="app-nav-button">
                Mentees
              </NavLink>
            )}
            <NavLink to="/directory" className="app-nav-button">
              Mentors
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
