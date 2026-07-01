import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userService from '../services/userService'

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
      <main >
        <span >!</span>
        <h1>Something went sideways</h1>
        <p>{error}</p>
        <button
          
          onClick={() => navigate('/')}
        >
          Back to sign in
        </button>
      </main>
    )
  }

  if (!user) {
    return (
      <main >
        <span  />
        <p>Gathering your profile…</p>
      </main>
    )
  }

  const memberType = user.type === 'mentor' ? 'Mentor' : 'Mentee'

  return (
    <main >
      <nav>
        <button onClick={() => navigate('/')}>
          <span >STL</span>
          <span>Mentorship</span>
        </button>
        <button
          
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </nav>

      <section >
        <div >
          <div >
            <span >
              {user.status}
            </span>
            {user.role === 'admin' && (
              <span >Admin</span>
            )}
          </div>
          <h1>{user.username}</h1>
          <p>{memberType} in the STL Mentorship Program</p>
        </div>
      </section>

      <div >
        <section >
          <div >
            <span >The essentials</span>
            <h2>About you</h2>
          </div>
          <dl >
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
                    View profile <span >↗</span>
                  </a>
                ) : (
                  <span >Not added</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section >
          <div >
            <span >Your mentorship</span>
            <h2>
              {user.type === 'mentor'
                ? 'Areas of expertise'
                : 'What you’re looking for'}
            </h2>
          </div>

          {user.type === 'mentor' ? (
            user.aoeList.length > 0 ? (
              <ul>
                {user.aoeList.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            ) : (
              <p>No areas of expertise added yet.</p>
            )
          ) : (
            <p>
              {user.helpText ||
                'You have not added what you would like help with yet.'}
            </p>
          )}
        </section>
      </div>

      <footer>
        <p>Member #{user.id}</p>
        <p>STL Mentorship Program</p>
      </footer>
    </main>
  )
}

export default ProfilePage
