import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userService from '../services/userService'
import LoadingPage from './LoadingPage'

export interface ProfileUser {
  id: string
  username: string
  email: string
  type: string
  linkedin: string
  helpText: string
  aoeList: string[]
  gradYear: number
  status: string
  role: 'admin' | 'user'
}

function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [error, setError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await userService.getMe()
        setUser(response.user)
      } catch {
        setError('We could not load your profile. Please sign in again.')
      }
    }

    void loadUser()
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await userService.logout()
      navigate('/')
    } catch {
      setError('We could not sign you out. Please try again.')
      setIsLoggingOut(false)
    }
  }

  if (error) {
    return (
      <main className="profile-page profile-state">
        <span className="profile-state-icon">!</span>
        <h1>Something went sideways</h1>
        <p>{error}</p>
        <button
          className="profile-primary-button"
          onClick={() => navigate('/')}
        >
          Back to sign in
        </button>
      </main>
    )
  }

  if (!user) {
    return <LoadingPage />
  }

  const memberType = user.type === 'mentor' ? 'Mentor' : 'Mentee'
  const profileInitial = user.username.slice(0, 1).toUpperCase()

  return (
    <main className="profile-page">
      <div className="profile-toolbar">
        <button
          className="profile-logout-button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {profileInitial}
        </div>
        <div className="profile-heading">
          <div className="profile-eyebrow">
            {user.role === 'admin' && (
              <span className="profile-role">Admin</span>
            )}
          </div>
          <h1>{user.username}</h1>
          <p>{memberType} in the STL Mentorship Program</p>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-card">
          <div className="profile-card-heading">
            <span className="profile-card-kicker">The essentials</span>
            <h2>About you</h2>
          </div>
          <dl className="profile-details">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </dd>
            </div>
            <div>
              <dt>Graduation year</dt>
              <dd>{user.gradYear}</dd>
            </div>
            <div>
              <dt>Program role</dt>
              <dd>{memberType}</dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd>
                {user.linkedin ? (
                  <a href={user.linkedin} target="_blank" rel="noreferrer">
                    View profile <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="profile-muted">Not added</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="profile-card profile-card--accent">
          <div className="profile-card-heading">
            <span className="profile-card-kicker">Your mentorship</span>
            <h2>
              {user.type === 'mentor'
                ? 'Areas of expertise'
                : 'What you’re looking for'}
            </h2>
          </div>

          {user.type === 'mentor' ? (
            user.aoeList.length > 0 ? (
              <ul className="profile-chips">
                {user.aoeList.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            ) : (
              <p className="profile-empty">No areas of expertise added yet.</p>
            )
          ) : (
            <p className="profile-help-text">
              {user.helpText ||
                'You have not added what you would like help with yet.'}
            </p>
          )}
        </section>
      </div>

      <footer className="profile-footer">
        <p>Member #{user.id}</p>
        <p>STL Mentorship Program</p>
      </footer>
    </main>
  )
}

export default ProfilePage
