import { NavLink } from 'react-router-dom'

interface AppNavProps {
  isAdmin: boolean
}

function AppNav({ isAdmin }: AppNavProps) {
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

export default AppNav
