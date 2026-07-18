import { Link } from 'react-router-dom'

function PageNotFound() {
  return (
    <main className="profile-page profile-state">
      <span className="profile-state-icon" aria-hidden="true">
        ?
      </span>
      <h1>Page not found</h1>
      <p>The page you requested does not exist or may have moved.</p>
      <Link className="profile-primary-button" to="/">
        Return home
      </Link>
    </main>
  )
}

export default PageNotFound
