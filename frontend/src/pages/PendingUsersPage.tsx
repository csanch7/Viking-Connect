import userService from '../services/userService'
import { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import LoadingPage from '../components/LoadingPage'
import { useNavigate } from 'react-router-dom'
import PendingUserCard from '../components/admin/PendingUserCard'
import type { PendingUser } from '../types/pendingUser'

function PendingUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await userService.checkSession()

        if (!response.admin) {
          setIsUnauthorized(true)
          return
        }

        setUsers(await adminService.pendingUsers())
      } catch {
        setError('We could not load pending users. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    void checkSession()
  }, [])

  async function denyUser(userId: string) {
    try {
      await adminService.denyUser(userId)
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      )
      setMessage('User denied')
      setError('')
    } catch {
      setError('We could not deny this user. Please try again.')
    }
  }

  async function approveUser(userId: string) {
    try {
      await adminService.approveUser(userId)
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      )
      setMessage('User approved')
      setError('')
    } catch {
      setError('We could not approve this user. Please try again.')
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  if (isUnauthorized) {
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

      {error && (
        <div className="admin-message" role="alert">
          {error}
        </div>
      )}

      {users.length > 0 ? (
        <section className="pending-user-list" aria-label="Pending users">
          {users.map((user: PendingUser) => (
            <PendingUserCard
              key={user.id}
              user={user}
              onApprove={approveUser}
              onDeny={denyUser}
            />
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
