import userService from '../services/userService'
import { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import LoadingPage from './LoadingPage'
import { useNavigate } from 'react-router-dom'

interface pendingUser {
  id: string
  username: string
  email: string
  linkedin: string
  type: string
  helpText: string
  aoeList: string[]
  gradYear: number
  role: string
}

function PendingUsersPage() {
  const [users, setUsers] = useState<pendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(false)
  const [message, setMessage] = useState('')

  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      
      const response = await userService.checkSession()
      if (!response.admin) {
        setLoading(false)
        setStatus(true)
        return
      }
      setLoading(false)
      setUsers(await adminService.pendingUsers())
      
    }

    void checkSession()
  }, [])

  async function denyUser(userId: string) {
    await adminService.denyUser(userId)
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    )
    setMessage('User denied')
  }

  async function approveUser(userId: string) {
    await adminService.approveUser(userId)
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    )
    setMessage('User approved')
  }

  if (loading) {
    return <LoadingPage />
  }

  if (status === true) {
    return (
      <main className="admin-page admin-state">
        <span className="admin-state-icon">!</span>
        <h1>You are not allowed here</h1>
        <p>This area is reserved for program administrators.</p>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <section className="admin-hero" aria-labelledby="pending-title">
        <p className="admin-kicker">Admin workspace</p>
        <h1 id="pending-title">Pending users</h1>
        <button
          className="admin-back-link"
          type="button"
          onClick={() => navigate('/admin')}
        >
          <span aria-hidden="true">←</span>
          Back to admin page
        </button>

        <p>
          Review registration details before adding new members to the
          mentorship program.
        </p>
      </section>

      {message && (
        <div className="admin-message" role="status">
          {message}
        </div>
      )}

      {users.length > 0 ? (
        <section className="pending-user-list" aria-label="Pending users">
          {users.map((user: pendingUser) => (
            <article className="pending-user-card" key={user.id}>
              <div className="pending-user-header">
                <div className="pending-user-avatar" aria-hidden="true">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <span className="pending-user-status">Pending review</span>
                  <h2>{user.username}</h2>
                  <p>{user.email}</p>
                </div>
              </div>

              <dl className="pending-user-details">
                <div>
                  <dt>Program role</dt>
                  <dd>{user.type}</dd>
                </div>
                <div>
                  <dt>Graduation year</dt>
                  <dd>{user.gradYear}</dd>
                </div>
                <div>
                  <dt>LinkedIn</dt>
                  <dd>
                    <a href={user.linkedin} target="_blank" rel="noreferrer">
                      {user.linkedin}
                    </a>
                  </dd>
                </div>
                <div className="pending-user-detail-wide">
                  <dt>
                    {user.type === 'mentor'
                      ? 'Areas of expertise'
                      : 'Requested support'}
                  </dt>
                  <dd>
                    {user.type === 'mentor'
                      ? user.aoeList.join(', ') || 'No areas listed'
                      : user.helpText || 'No details provided'}
                  </dd>
                </div>
              </dl>

              <div className="pending-user-actions">
                <button
                  className="pending-user-deny"
                  onClick={() => denyUser(user.id)}
                >
                  Deny
                </button>
                <button
                  className="pending-user-approve"
                  onClick={() => approveUser(user.id)}
                >
                  Approve
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="admin-empty" aria-live="polite">
          <h2>No pending users</h2>
          <p>Everyone in the registration queue has been reviewed.</p>
        </section>
      )}
    </main>
  )
}

export default PendingUsersPage
